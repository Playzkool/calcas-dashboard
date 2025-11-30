from django.db import models

class Grade(models.TextChoices):
    PS = "PS", "petite section"