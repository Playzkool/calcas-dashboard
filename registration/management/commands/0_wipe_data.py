from django.contrib.auth.models import User
from django.core.management import BaseCommand

from registration.models import PupilLegalRepresentative, Pupil, LegalRepresentative, RegistrationSupervisor


class Command(BaseCommand):
  help = 'Effacement de toutes les données'

  def handle(self, *args, **options):
      print(self.help)
      PupilLegalRepresentative.objects.all().delete()
      Pupil.objects.all().delete()
      LegalRepresentative.objects.all().delete()
      RegistrationSupervisor.objects.all().delete()
      User.objects.all().delete()

      print("Toutes les données ont été supprimées")


