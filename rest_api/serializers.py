from datetime import date

from rest_framework import serializers

from registration.models import Pupil, RegistrationCampaign, RegistrationFile
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
        pupil = Pupil.objects.create(
            firstname=validated_data["firstname"],
            lastname=validated_data["lastname"],
            birth_date=validated_data["birth_date"],
            grade=validated_data["grade"],
        )
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