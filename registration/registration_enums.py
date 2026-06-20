from django.db import models

class Grade(models.IntegerChoices):
    PS = 1, "petite section"
    MS = 2, "moyenne section"
    GS = 3, "grande section"
    CP = 4, "CP"
    CE1 = 5, "CE1"
    CE2 = 6, "CE2"
    CM1 = 7, "CM1"
    CM2 = 8, "CM2"


class FamilySituation(models.TextChoices):
    MARRIED_OR_COHABITING = "married_or_cohabiting", "Mariés ou concubins"
    DIVORCED_OR_SEPARATED = "divorced_or_separated", "Divorcés ou séparés"
    SINGLE_PARENT = "single_parent", "Parent isolé"