import datetime

from django.contrib.auth.models import User
from django.core.management import BaseCommand

from registration.models import RegistrationSupervisor, LegalRepresentative, Pupil, PupilLegalRepresentative


class Command(BaseCommand):
  help = 'Création de données de test'

  def handle(self, *args, **options):
      print(self.help)
      # 1) Create a RegistrationSupervisor login : demo_registration_supervisor  password : TestRegistration1
      user = User.objects.create_user(username='demo_registration_supervisor', email='', password='TestRegistration1')
      registration_supervisor = RegistrationSupervisor.objects.create(user=user, firstname='registration', lastname='supervisor')
      # 2) Create legal representative and pupil
      # login : demo_parent_user | password : TestParentUser123
      user_parent = User.objects.create_user(username='demo_parent_user', email='', password='TestParentUser123')
      parent = LegalRepresentative.objects.create(user=user_parent)

      # kiddo
      child = Pupil.objects.create(firstname='Pupil', lastname='Pupil', birth_date=datetime.date.fromtimestamp(19888000000))

      # create relationship legal representative / pupil
      PupilLegalRepresentative.objects.create(pupil=child, legal_representative=parent)





