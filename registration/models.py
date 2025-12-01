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
    creation_source = models.PositiveSmallIntegerField(choices=registration_enums.Grade,
                                                       default=registration_enums.Grade.PS,
                                                       verbose_name="Source de création")
    grade = models.PositiveIntegerField(choices=Grade.choices, verbose_name="Grade", default=Grade.PS)

    class Meta:
        app_label = "registration"
        verbose_name = "Élève"
        verbose_name_plural = "Élèves"



class RegistrationSupervisor(models.Model):
    user = models.OneToOneField(User, verbose_name="User", on_delete=models.CASCADE)
    firstname = models.CharField(max_length=100, verbose_name="Prénom")
    lastname = models.CharField(max_length=100, verbose_name="Nom")

    class Meta:
        app_label = "registration"
        verbose_name = "Gestionnaire des inscriptions"
        verbose_name_plural = "Gestionnaires des inscriptions"



class RegistrationFile(models.Model):
    parameters = models.JSONField(verbose_name="Parametres", default=dict, editable=True, blank=True)



# TODO Join tables







