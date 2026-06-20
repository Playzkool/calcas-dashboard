import os
import uuid

from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import User

from registration import registration_enums
from registration.registration_enums import FamilySituation, Grade


class UUIDUploadTo:
    """upload_to callable that renames uploaded files to a UUID v4, preserving the extension."""

    def __init__(self, subdir: str):
        self.subdir = subdir

    def __call__(self, instance, filename: str) -> str:
        ext = os.path.splitext(filename)[1].lower()
        return f"{self.subdir}/{uuid.uuid4()}{ext}"

    def deconstruct(self):
        return ("registration.models.UUIDUploadTo", [self.subdir], {})


# AKA Parent --> can acces dashboard to fill up registration file
class LegalRepresentative(models.Model):
    user = models.OneToOneField(User, verbose_name="User", on_delete=models.CASCADE)
    date_creation = models.DateTimeField(auto_now_add=True)
    parameters = models.JSONField(verbose_name="Parametres", default=dict, editable=True, blank=True)

    # Profile fields (from ENTRESENHAS FAMILHALAS)
    firstname = models.CharField(max_length=100, verbose_name="Prénom", null=True, blank=True)
    lastname = models.CharField(max_length=100, verbose_name="Nom", null=True, blank=True)
    birth_date = models.DateField(verbose_name="Date de naissance", null=True, blank=True)
    address = models.TextField(verbose_name="Adresse", null=True, blank=True)
    phone_home = models.CharField(max_length=30, verbose_name="Téléphone fixe", null=True, blank=True)
    phone_mobile = models.CharField(max_length=30, verbose_name="Téléphone portable", null=True, blank=True)
    phone_work = models.CharField(max_length=30, verbose_name="Téléphone travail", null=True, blank=True)
    profession = models.CharField(max_length=200, verbose_name="Profession", null=True, blank=True)
    has_parental_authority = models.BooleanField(verbose_name="Autorité parentale", null=True, blank=True)
    insurance_reference = models.CharField(max_length=200, verbose_name="Référence assurance", null=True, blank=True)

    # Autorisation de diffusion des coordonnées personnelles
    coordinates_sharing_authorized = models.BooleanField(
        verbose_name="Autorisation de diffusion des coordonnées",
        null=True, blank=True
    )

    # Accompagnement piscine
    pool_accompaniment = models.BooleanField(verbose_name="Accompagnement piscine", default=False)
    pool_attestation = models.FileField(
        upload_to=UUIDUploadTo("pool_attestations"),
        verbose_name="Attestation natation",
        null=True, blank=True
    )

    class Meta:
        app_label = "registration"
        verbose_name = "Représentant légal"
        verbose_name_plural = "Représentants légaux"


class Pupil(models.Model):
    firstname = models.CharField(max_length=100, verbose_name="Prénom")
    lastname = models.CharField(max_length=100, verbose_name="Nom")
    birth_date = models.DateField(verbose_name="Date de naissance")
    birth_place = models.CharField(max_length=200, verbose_name="Lieu de naissance", null=True, blank=True)
    postal_code = models.CharField(max_length=10, verbose_name="Code postal", null=True, blank=True)
    nationality = models.CharField(max_length=100, verbose_name="Nationalité", null=True, blank=True)
    address = models.TextField(verbose_name="Adresse", null=True, blank=True)
    grade = models.PositiveIntegerField(choices=Grade.choices, default=registration_enums.Grade.PS, verbose_name="Grade")

    # Situation familiale
    family_situation = models.CharField(
        max_length=30,
        choices=FamilySituation.choices,
        verbose_name="Situation familiale",
        null=True, blank=True
    )
    siblings_brothers = models.PositiveIntegerField(verbose_name="Nombre de frères", null=True, blank=True)
    siblings_sisters = models.PositiveIntegerField(verbose_name="Nombre de sœurs", null=True, blank=True)
    siblings_names = models.CharField(max_length=500, verbose_name="Prénoms des frères et sœurs", null=True, blank=True)

    class Meta:
        app_label = "registration"
        verbose_name = "Élève"
        verbose_name_plural = "Élèves"


# Person in charge for managing registration campaigns
class RegistrationSupervisor(models.Model):
    user = models.OneToOneField(User, verbose_name="User", on_delete=models.CASCADE)
    firstname = models.CharField(max_length=100, verbose_name="Prénom")
    lastname = models.CharField(max_length=100, verbose_name="Nom")

    class Meta:
        app_label = "registration"
        verbose_name = "Gestionnaire des inscriptions"
        verbose_name_plural = "Gestionnaires des inscriptions"


class RegistrationCampaign(models.Model):
    year = models.DateField(verbose_name="Année scolaire", null=False, blank=False)

    class Meta:
        app_label = "registration"
        verbose_name = "Année scolaire"
        verbose_name_plural = "Années scolaires"


class RegistrationFile(models.Model):
    campaign = models.ForeignKey(RegistrationCampaign, verbose_name="Campaign", on_delete=models.CASCADE)
    parameters = models.JSONField(verbose_name="Parametres", default=dict, editable=True, blank=True)
    pupil = models.ForeignKey(Pupil, verbose_name="Pupil", on_delete=models.CASCADE)
    document = models.FileField(upload_to=UUIDUploadTo("registration_documents"), verbose_name="Document", null=True, blank=True)
    document_2 = models.FileField(upload_to=UUIDUploadTo("registration_documents"), verbose_name="Document 2", null=True, blank=True)
    document_3 = models.FileField(upload_to=UUIDUploadTo("registration_documents"), verbose_name="Document 3", null=True, blank=True)
    document_4 = models.FileField(upload_to=UUIDUploadTo("registration_documents"), verbose_name="Document 4", null=True, blank=True)
    document_5 = models.FileField(upload_to=UUIDUploadTo("registration_documents"), verbose_name="Document 5", null=True, blank=True)
    document_6 = models.FileField(upload_to=UUIDUploadTo("registration_documents"), verbose_name="Document 6", null=True, blank=True)
    document_7 = models.FileField(upload_to=UUIDUploadTo("registration_documents"), verbose_name="Document 7", null=True, blank=True)
    document_8 = models.FileField(upload_to=UUIDUploadTo("registration_documents"), verbose_name="Document 8", null=True, blank=True)
    document_9 = models.FileField(upload_to=UUIDUploadTo("registration_documents"), verbose_name="Document 9", null=True, blank=True)
    document_10 = models.FileField(upload_to=UUIDUploadTo("registration_documents"), verbose_name="Document 10", null=True, blank=True)

    # Pièces justificatives
    vaccination_document = models.FileField(
        upload_to=UUIDUploadTo("vaccination_documents"),
        verbose_name="Carnet de santé / attestation vaccinale",
        null=True, blank=True
    )
    insurance_document = models.FileField(
        upload_to=UUIDUploadTo("insurance_documents"),
        verbose_name="Attestation d'assurance",
        null=True, blank=True
    )
    divorce_judgment = models.FileField(
        upload_to=UUIDUploadTo("divorce_judgments"),
        verbose_name="Jugement de divorce/séparation",
        null=True, blank=True
    )
    photo = models.FileField(
        upload_to=UUIDUploadTo("pupil_photos"),
        verbose_name="Photo d'identité",
        null=True, blank=True
    )

    # Fiche sanitaire de liaison
    other_vaccines = models.TextField(verbose_name="Autres vaccinations", null=True, blank=True)
    diseases_history = models.JSONField(
        verbose_name="Antécédents médicaux",
        default=dict,
        blank=True,
        help_text="Dict des maladies antérieures (angine, asthme, etc.)"
    )
    samu_authorized = models.BooleanField(
        verbose_name="Autorisation appel SAMU/pompiers",
        null=True, blank=True
    )
    emergency_contacts = models.JSONField(
        verbose_name="Personnes à prévenir en urgence",
        default=list,
        blank=True
    )
    allergies_info = models.TextField(verbose_name="Allergies / autres informations médicales", null=True, blank=True)

    # Autorisation permanente de sortie pédagogique
    school_trips_authorized = models.BooleanField(
        verbose_name="Autorisation sortie pédagogique",
        null=True, blank=True
    )
    doctor_name_phone = models.CharField(
        max_length=200,
        verbose_name="Médecin traitant (nom et numéro)",
        null=True, blank=True
    )

    # Droit à l'image
    image_rights_authorized = models.BooleanField(
        verbose_name="Droit à l'image",
        null=True, blank=True
    )

    # Liste des personnes autorisées à venir chercher l'enfant
    authorized_pickup_persons = models.JSONField(
        verbose_name="Personnes autorisées à venir chercher l'enfant",
        default=list,
        blank=True
    )

    # Charte Calandreta
    charter_accepted = models.BooleanField(
        verbose_name="Charte et règlement intérieur acceptés",
        default=False
    )

    # Clôture du dossier (empêche toute modification par le parent)
    is_closed = models.BooleanField(
        verbose_name="Dossier clôturé",
        default=False
    )

    class Meta:
        app_label = "registration"
        verbose_name = "Dossier d'inscription"
        verbose_name_plural = "Dossiers d'inscriptions"


class PupilLegalRepresentative(models.Model):
    pupil = models.ForeignKey(Pupil, verbose_name="Pupil", on_delete=models.CASCADE)
    legal_representative = models.ForeignKey(LegalRepresentative, verbose_name="Representative", on_delete=models.CASCADE)
    # TODO lien de parenté ?

    class Meta:
        app_label = "registration"
        verbose_name = "Lien de parenté"
        verbose_name_plural = "Liens de parentés"
        constraints = [
            models.UniqueConstraint(fields=["pupil", "legal_representative"], name="unique_pupil_legal_representative"),
        ]

    def save(self, *args, **kwargs):
        if not self.pk:
            if PupilLegalRepresentative.objects.filter(pupil=self.pupil).count() >= 2:
                raise ValidationError("Un élève ne peut avoir que deux représentants légaux au maximum.")
        super().save(*args, **kwargs)
