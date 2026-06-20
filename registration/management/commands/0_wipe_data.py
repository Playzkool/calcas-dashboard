from django.contrib.auth.models import User
from django.core.management import BaseCommand

from registration.models import (
    LegalRepresentative,
    Pupil,
    PupilLegalRepresentative,
    RegistrationCampaign,
    RegistrationFile,
    RegistrationSupervisor,
)


class Command(BaseCommand):
    help = "Effacement de toutes les données"

    def handle(self, *args, **options):
        RegistrationFile.objects.all().delete()
        RegistrationCampaign.objects.all().delete()
        PupilLegalRepresentative.objects.all().delete()
        Pupil.objects.all().delete()
        LegalRepresentative.objects.all().delete()
        RegistrationSupervisor.objects.all().delete()
        User.objects.all().delete()
        self.stdout.write(self.style.SUCCESS("Toutes les données ont été supprimées."))


