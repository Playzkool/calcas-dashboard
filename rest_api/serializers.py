import secrets
from datetime import date

from django.contrib.auth.models import User
from rest_framework import serializers

from registration.models import LegalRepresentative, Pupil, PupilLegalRepresentative, RegistrationCampaign, RegistrationFile
from registration.registration_enums import Grade


class RegistrationFileCreateSerializer(serializers.Serializer):
    firstname = serializers.CharField(max_length=100)
    lastname = serializers.CharField(max_length=100)
    birth_date = serializers.DateField()
    grade = serializers.IntegerField()
    document = serializers.FileField()

    def validate_grade(self, value):
        valid = [g.value for g in Grade]
        if value not in valid:
            raise serializers.ValidationError(f"Grade invalide. Valeurs acceptées : {valid}")
        return value

    def create(self, validated_data):
        legal_representative = validated_data.pop("legal_representative", None)
        pupil = Pupil.objects.create(
            firstname=validated_data["firstname"],
            lastname=validated_data["lastname"],
            birth_date=validated_data["birth_date"],
            grade=validated_data["grade"],
        )
        if legal_representative:
            PupilLegalRepresentative.objects.create(pupil=pupil, legal_representative=legal_representative)
            # If all existing pupils share exactly one co-representative, auto-link them to the new pupil.
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
            document=validated_data["document"],
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