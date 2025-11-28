from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class LegalRepresentative(models.Model):
    user = models.OneToOneField(User, verbose_name="User", on_delete=models.CASCADE)
    date_creation = models.DateTimeField(auto_now_add=True)
    parameters = models.JSONField(verbose_name="Parametres", default=dict, editable=True, blank=True)

