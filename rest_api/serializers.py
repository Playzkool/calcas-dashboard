import secrets
from datetime import date

from django.contrib.auth.models import User
from rest_framework import serializers

from registration.models import LegalRepresentative, Pupil, PupilLegalRepresentative, RegistrationCampaign, RegistrationFile
from registration.registration_enums import Grade


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

    # Documents (file uploads)
    document = serializers.FileField(required=False, allow_null=True)
    vaccination_document = serializers.FileField(required=False, allow_null=True)
    insurance_document = serializers.FileField(required=False, allow_null=True)
    divorce_judgment = serializers.FileField(required=False, allow_null=True)

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
            "siblings_brothers", "siblings_sisters",
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
    document_url = serializers.SerializerMethodField()

    class Meta:
        model = RegistrationFile
        fields = ["id", "firstname", "lastname", "birth_date", "grade", "grade_label", "document_url"]

    def get_grade_label(self, obj):
        return obj.pupil.get_grade_display()

    def get_document_url(self, obj):
        if not obj.document:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(obj.document.url) if request else obj.document.url


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