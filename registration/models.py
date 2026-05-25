from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import User

from registration import registration_enums
from registration.registration_enums import Grade


# AKA Parent --> can acces dashboard to fill up registration file
class LegalRepresentative(models.Model):
    user = models.OneToOneField(User, verbose_name="User", on_delete=models.CASCADE)
    date_creation = models.DateTimeField(auto_now_add=True)
    parameters = models.JSONField(verbose_name="Parametres", default=dict, editable=True, blank=True)

    class Meta:
        app_label = "registration"
        verbose_name = "Représentant légal"
        verbose_name_plural = "Représentants légaux"



class Pupil(models.Model):
    firstname = models.CharField(max_length=100, verbose_name="Prénom")
    lastname = models.CharField(max_length=100, verbose_name="Nom")
    birth_date = models.DateField(verbose_name="Date de naissance")
    grade = models.PositiveIntegerField(choices=Grade.choices, default=registration_enums.Grade.PS, verbose_name="Grade")

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
    document = models.FileField(upload_to="registration_documents/", verbose_name="Document", null=True, blank=True)

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









