import secrets
from datetime import date

from django.contrib.auth.models import User
from rest_framework import serializers

from registration.models import LegalRepresentative, Pupil, PupilLegalRepresentative, RegistrationCampaign, RegistrationFile
from registration.registration_enums import Grade


# ── File-type validators (magic-byte detection) ───────────────────────────────

def _detect_mime(file_obj) -> str | None:
    try:
        file_obj.seek(0)
        header = file_obj.read(12)
        file_obj.seek(0)
    except Exception:
        return None
    if header[:4] == b'\x25\x50\x44\x46':
        return 'application/pdf'
    if header[:3] == b'\xff\xd8\xff':
        return 'image/jpeg'
    if header[:4] == b'\x89\x50\x4e\x47':
        return 'image/png'
    if header[:4] == b'\x52\x49\x46\x46' and header[8:12] == b'\x57\x45\x42\x50':
        return 'image/webp'
    return None


def validate_document_file(file):
    """Accept PDF, JPEG, PNG or WEBP — checked by magic bytes, not extension."""
    allowed = {'application/pdf', 'image/jpeg', 'image/png', 'image/webp'}
    if file and _detect_mime(file) not in allowed:
        raise serializers.ValidationError(
            "Format non autorisé. Utilisez PDF, JPEG, PNG ou WEBP."
        )
    return file


def validate_image_file(file):
    """Accept JPEG, PNG or WEBP only — checked by magic bytes, not extension."""
    allowed = {'image/jpeg', 'image/png', 'image/webp'}
    if file and _detect_mime(file) not in allowed:
        raise serializers.ValidationError(
            "Format non autorisé. Utilisez JPEG, PNG ou WEBP."
        )
    return file


class LegalRepresentativeDetailSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    pool_attestation_url = serializers.SerializerMethodField()

    class Meta:
        model = LegalRepresentative
        fields = [
            "id", "email", "username",
            "firstname", "lastname", "birth_date",
            "address", "phone_home", "phone_mobile", "phone_work",
            "profession", "has_parental_authority", "insurance_reference",
            "coordinates_sharing_authorized",
            "pool_accompaniment", "pool_attestation_url",
        ]

    def get_pool_attestation_url(self, obj):
        if not obj.pool_attestation:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.pool_attestation.url) if request else obj.pool_attestation.url


class RegistrationDetailSerializer(serializers.ModelSerializer):
    # Pupil fields
    firstname = serializers.CharField(source="pupil.firstname")
    lastname = serializers.CharField(source="pupil.lastname")
    birth_date = serializers.DateField(source="pupil.birth_date")
    birth_place = serializers.CharField(source="pupil.birth_place")
    postal_code = serializers.CharField(source="pupil.postal_code")
    nationality = serializers.CharField(source="pupil.nationality")
    address = serializers.CharField(source="pupil.address")
    grade = serializers.IntegerField(source="pupil.grade")
    grade_label = serializers.SerializerMethodField()
    family_situation = serializers.CharField(source="pupil.family_situation")
    siblings_brothers = serializers.IntegerField(source="pupil.siblings_brothers")
    siblings_sisters = serializers.IntegerField(source="pupil.siblings_sisters")
    siblings_names = serializers.CharField(source="pupil.siblings_names")

    # Document URLs
    document_url = serializers.SerializerMethodField()
    vaccination_document_url = serializers.SerializerMethodField()
    insurance_document_url = serializers.SerializerMethodField()
    divorce_judgment_url = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()

    # Legal representatives
    legal_representatives = serializers.SerializerMethodField()

    class Meta:
        model = RegistrationFile
        fields = [
            "id",
            # Pupil
            "firstname", "lastname", "birth_date", "birth_place",
            "postal_code", "nationality", "address", "grade", "grade_label",
            "family_situation", "siblings_brothers", "siblings_sisters", "siblings_names",
            # Documents
            "document_url", "vaccination_document_url",
            "insurance_document_url", "divorce_judgment_url", "photo_url",
            # Fiche sanitaire
            "other_vaccines", "diseases_history", "samu_authorized",
            "emergency_contacts", "allergies_info",
            # Autorisations
            "school_trips_authorized", "doctor_name_phone",
            "image_rights_authorized",
            "authorized_pickup_persons",
            # Charte
            "charter_accepted",
            # Statut
            "is_closed",
            # Legal representatives
            "legal_representatives",
        ]

    def get_grade_label(self, obj):
        return obj.pupil.get_grade_display()

    def _build_url(self, obj, field_name):
        field_file = getattr(obj, field_name)
        if not field_file:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(field_file.url) if request else field_file.url

    def get_document_url(self, obj):
        return self._build_url(obj, "document")

    def get_vaccination_document_url(self, obj):
        return self._build_url(obj, "vaccination_document")

    def get_insurance_document_url(self, obj):
        return self._build_url(obj, "insurance_document")

    def get_divorce_judgment_url(self, obj):
        return self._build_url(obj, "divorce_judgment")

    def get_photo_url(self, obj):
        return self._build_url(obj, "photo")

    def to_representation(self, instance):
        data = super().to_representation(instance)
        for n in range(2, 11):
            data[f"document_{n}_url"] = self._build_url(instance, f"document_{n}")
        return data

    def get_legal_representatives(self, obj):
        plrs = (
            PupilLegalRepresentative.objects
            .filter(pupil=obj.pupil)
            .select_related("legal_representative__user")
        )
        lrs = [plr.legal_representative for plr in plrs]
        return LegalRepresentativeDetailSerializer(
            lrs, many=True, context=self.context
        ).data


class RegistrationFileCreateSerializer(serializers.Serializer):
    # Child info
    firstname = serializers.CharField(max_length=100)
    lastname = serializers.CharField(max_length=100)
    birth_date = serializers.DateField()
    birth_place = serializers.CharField(max_length=200, required=False, allow_blank=True)
    postal_code = serializers.CharField(max_length=10, required=False, allow_blank=True)
    nationality = serializers.CharField(max_length=100, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    grade = serializers.IntegerField()

    # Family situation
    family_situation = serializers.ChoiceField(
        choices=["married_or_cohabiting", "divorced_or_separated", "single_parent"],
        required=False, allow_null=True
    )
    siblings_brothers = serializers.IntegerField(min_value=0, required=False, allow_null=True)
    siblings_sisters = serializers.IntegerField(min_value=0, required=False, allow_null=True)
    siblings_names = serializers.CharField(max_length=500, required=False, allow_blank=True)

    # Documents (file uploads)
    document = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_2 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_3 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_4 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_5 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_6 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_7 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_8 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_9 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_10 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    vaccination_document = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    insurance_document = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    divorce_judgment = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    photo = serializers.FileField(required=False, allow_null=True, validators=[validate_image_file])

    # Fiche sanitaire
    other_vaccines = serializers.CharField(required=False, allow_blank=True)
    diseases_history = serializers.JSONField(required=False, default=dict)
    samu_authorized = serializers.BooleanField(required=False, allow_null=True)
    emergency_contacts = serializers.JSONField(required=False, default=list)
    allergies_info = serializers.CharField(required=False, allow_blank=True)

    # Autorisation sortie pédagogique
    school_trips_authorized = serializers.BooleanField(required=False, allow_null=True)
    doctor_name_phone = serializers.CharField(max_length=200, required=False, allow_blank=True)

    # Droit à l'image
    image_rights_authorized = serializers.BooleanField(required=False, allow_null=True)

    # Personnes autorisées à venir chercher l'enfant
    authorized_pickup_persons = serializers.JSONField(required=False, default=list)

    # Charte
    charter_accepted = serializers.BooleanField(required=False, default=False)

    def validate_grade(self, value):
        valid = [g.value for g in Grade]
        if value not in valid:
            raise serializers.ValidationError(f"Grade invalide. Valeurs acceptées : {valid}")
        return value

    def create(self, validated_data):
        legal_representative = validated_data.pop("legal_representative", None)

        pupil_fields = [
            "firstname", "lastname", "birth_date", "birth_place", "postal_code",
            "nationality", "address", "grade", "family_situation",
            "siblings_brothers", "siblings_sisters", "siblings_names",
        ]
        pupil_data = {k: validated_data.pop(k) for k in pupil_fields if k in validated_data}
        pupil = Pupil.objects.create(**pupil_data)

        if legal_representative:
            PupilLegalRepresentative.objects.create(pupil=pupil, legal_representative=legal_representative)
            existing_pupil_ids = (
                PupilLegalRepresentative.objects
                .filter(legal_representative=legal_representative)
                .exclude(pupil=pupil)
                .values_list("pupil_id", flat=True)
            )
            if existing_pupil_ids:
                co_rep_ids = list(
                    PupilLegalRepresentative.objects
                    .filter(pupil_id__in=existing_pupil_ids)
                    .exclude(legal_representative=legal_representative)
                    .values_list("legal_representative_id", flat=True)
                    .distinct()
                )
                if len(co_rep_ids) == 1:
                    co_rep = LegalRepresentative.objects.get(id=co_rep_ids[0])
                    PupilLegalRepresentative.objects.create(pupil=pupil, legal_representative=co_rep)

        today = date.today()
        campaign, _ = RegistrationCampaign.objects.get_or_create(year=date(today.year, 9, 1))
        return RegistrationFile.objects.create(
            pupil=pupil,
            campaign=campaign,
            **{k: v for k, v in validated_data.items() if v is not None or k in [
                "samu_authorized", "school_trips_authorized", "image_rights_authorized", "charter_accepted"
            ]},
        )


class RegistrationListItemSerializer(serializers.ModelSerializer):
    firstname = serializers.CharField(source="pupil.firstname")
    lastname = serializers.CharField(source="pupil.lastname")
    birth_date = serializers.DateField(source="pupil.birth_date")
    grade = serializers.IntegerField(source="pupil.grade")
    grade_label = serializers.SerializerMethodField()
    completion_pct = serializers.SerializerMethodField()
    document_url = serializers.SerializerMethodField()

    class Meta:
        model = RegistrationFile
        fields = [
            "id", "firstname", "lastname", "birth_date", "grade", "grade_label",
            "completion_pct", "document_url", "is_closed",
        ]

    def get_grade_label(self, obj):
        return obj.pupil.get_grade_display()

    def get_document_url(self, obj):
        if not obj.document:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.document.url) if request else obj.document.url

    def get_completion_pct(self, obj):
        """
        16 equally-weighted criteria (each = 6.25 %).
        Requires pupil__pupillegalrepresentative_set__legal_representative to be prefetched.
        """
        pupil = obj.pupil
        criteria = [
            # Pupil info
            bool(pupil.birth_place),
            bool(pupil.nationality),
            bool(pupil.address),
            bool(pupil.family_situation),
            # Documents
            bool(obj.document),
            bool(obj.vaccination_document),
            bool(obj.insurance_document),
            # Fiche sanitaire
            obj.samu_authorized is not None,
            bool(obj.emergency_contacts),
            bool(obj.doctor_name_phone),
            # Autorisations
            obj.school_trips_authorized is not None,
            obj.image_rights_authorized is not None,
            bool(obj.authorized_pickup_persons),
            obj.charter_accepted is True,
            # Legal representative profile
            any(
                (plr.legal_representative.firstname and plr.legal_representative.lastname)
                for plr in pupil.pupillegalrepresentative_set.all()
            ),
            any(
                (plr.legal_representative.phone_mobile
                 or plr.legal_representative.phone_home
                 or plr.legal_representative.phone_work)
                for plr in pupil.pupillegalrepresentative_set.all()
            ),
        ]
        return round(sum(criteria) * 100 / len(criteria))


class RegistrationFileUpdateSerializer(serializers.Serializer):
    # Pupil info (all optional for PATCH)
    firstname = serializers.CharField(max_length=100, required=False)
    lastname = serializers.CharField(max_length=100, required=False)
    birth_date = serializers.DateField(required=False)
    birth_place = serializers.CharField(max_length=200, required=False, allow_blank=True)
    postal_code = serializers.CharField(max_length=10, required=False, allow_blank=True)
    nationality = serializers.CharField(max_length=100, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    grade = serializers.IntegerField(required=False)
    family_situation = serializers.ChoiceField(
        choices=["married_or_cohabiting", "divorced_or_separated", "single_parent"],
        required=False, allow_null=True,
    )
    siblings_brothers = serializers.IntegerField(min_value=0, required=False, allow_null=True)
    siblings_sisters = serializers.IntegerField(min_value=0, required=False, allow_null=True)
    siblings_names = serializers.CharField(max_length=500, required=False, allow_blank=True)

    # Documents
    document = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_2 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_3 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_4 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_5 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_6 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_7 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_8 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_9 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    document_10 = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    vaccination_document = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    insurance_document = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    divorce_judgment = serializers.FileField(required=False, allow_null=True, validators=[validate_document_file])
    photo = serializers.FileField(required=False, allow_null=True, validators=[validate_image_file])

    # Fiche sanitaire
    other_vaccines = serializers.CharField(required=False, allow_blank=True)
    diseases_history = serializers.JSONField(required=False)
    samu_authorized = serializers.BooleanField(required=False, allow_null=True)
    emergency_contacts = serializers.JSONField(required=False)
    allergies_info = serializers.CharField(required=False, allow_blank=True)

    # Autorisations
    school_trips_authorized = serializers.BooleanField(required=False, allow_null=True)
    doctor_name_phone = serializers.CharField(max_length=200, required=False, allow_blank=True)
    image_rights_authorized = serializers.BooleanField(required=False, allow_null=True)
    authorized_pickup_persons = serializers.JSONField(required=False)

    # Charte
    charter_accepted = serializers.BooleanField(required=False)

    def validate_grade(self, value):
        valid = [g.value for g in Grade]
        if value not in valid:
            raise serializers.ValidationError(f"Grade invalide. Valeurs acceptées : {valid}")
        return value

    def update(self, instance, validated_data):
        pupil_fields = [
            "firstname", "lastname", "birth_date", "birth_place", "postal_code",
            "nationality", "address", "grade", "family_situation",
            "siblings_brothers", "siblings_sisters", "siblings_names",
        ]
        pupil = instance.pupil
        pupil_dirty = False
        for field in pupil_fields:
            if field in validated_data:
                setattr(pupil, field, validated_data.pop(field))
                pupil_dirty = True
        if pupil_dirty:
            pupil.save()

        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        return instance


class LegalRepresentativeListItemSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")
    email = serializers.EmailField(source="user.email")

    class Meta:
        model = LegalRepresentative
        fields = ["id", "username", "email", "date_creation"]


class LegalRepresentativeCreateSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Un compte avec cet email existe déjà.")
        return value

    def create(self, validated_data):
        email = validated_data["email"]
        user = User.objects.create_user(
            username=email,
            email=email,
            password=secrets.token_urlsafe(32),
        )
        return LegalRepresentative.objects.create(user=user)


class LegalRepresentativeProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)

    pool_attestation = serializers.FileField(
        required=False, allow_null=True, validators=[validate_document_file]
    )

    class Meta:
        model = LegalRepresentative
        fields = [
            "email",
            "firstname",
            "lastname",
            "birth_date",
            "address",
            "phone_home",
            "phone_mobile",
            "phone_work",
            "profession",
            "has_parental_authority",
            "insurance_reference",
            "coordinates_sharing_authorized",
            "pool_accompaniment",
            "pool_attestation",
        ]
        read_only_fields = ["email"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        if data.get("pool_attestation") and request:
            data["pool_attestation"] = request.build_absolute_uri(instance.pool_attestation.url)
        return data