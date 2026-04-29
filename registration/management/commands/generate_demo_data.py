import datetime
import random

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
from registration.registration_enums import Grade

# Grade → birth year offset from current year
GRADE_AGE = {
    Grade.PS:  4,
    Grade.MS:  5,
    Grade.GS:  6,
    Grade.CP:  7,
    Grade.CE1: 8,
    Grade.CE2: 9,
    Grade.CM1: 10,
    Grade.CM2: 11,
}

PUPILS = [
    # (firstname, lastname, grade)
    ("Guilhem",   "Bonnet",     Grade.PS),
    ("Nòva",      "Fabre",      Grade.PS),
    ("Lola",      "Dupuy",      Grade.MS),
    ("Arnaud",    "Vidal",      Grade.MS),
    ("Clémence",  "Martin",     Grade.GS),
    ("Thibault",  "Roux",       Grade.GS),
    ("Emma",      "Bertrand",   Grade.CP),
    ("Hugo",      "Blanc",      Grade.CP),
    ("Inès",      "Garnier",    Grade.CE1),
    ("Lucas",     "Peyre",      Grade.CE1),
    ("Blandine",  "Souquet",    Grade.CE2),
    ("Mathieu",   "Lacombe",    Grade.CE2),
    ("Aurore",    "Cassagne",   Grade.CM1),
    ("Gaston",    "Delmas",     Grade.CM1),
    ("Léa",       "Escudier",   Grade.CM2),
    ("Romain",    "Auriol",     Grade.CM2),
]

PARENTS = [
    ("Sophie",   "Bonnet",   "sophie.bonnet"),
    ("Pierre",   "Fabre",    "pierre.fabre"),
    ("Marie",    "Dupuy",    "marie.dupuy"),
    ("Jean",     "Martin",   "jean.martin"),
    ("Isabelle", "Roux",     "isabelle.roux"),
    ("Thomas",   "Bertrand", "thomas.bertrand"),
    ("Claire",   "Peyre",    "claire.peyre"),
    ("Nicolas",  "Lacombe",  "nicolas.lacombe"),
    ("Virginie", "Delmas",   "virginie.delmas"),
    ("Franck",   "Auriol",   "franck.auriol"),
]

# Map each pupil lastname to a parent lastname (some parents have 2 kids)
PUPIL_PARENT = {
    "Bonnet":   "Bonnet",
    "Fabre":    "Fabre",
    "Dupuy":    "Dupuy",
    "Vidal":    "Martin",   # Vidal child → Martin parent (blended family)
    "Martin":   "Martin",
    "Roux":     "Roux",
    "Bertrand": "Bertrand",
    "Blanc":    "Bertrand", # Blanc child → Bertrand parent (blended family)
    "Garnier":  "Peyre",
    "Peyre":    "Peyre",
    "Souquet":  "Lacombe",
    "Lacombe":  "Lacombe",
    "Cassagne": "Delmas",
    "Delmas":   "Delmas",
    "Escudier": "Auriol",
    "Auriol":   "Auriol",
}


class Command(BaseCommand):
    help = "Création de données de démonstration"

    def handle(self, *args, **options):
        self.stdout.write(self.help)
        today = datetime.date.today()

        # ── Supervisor ────────────────────────────────────────────────────────
        sup_user = User.objects.create_user(
            username="demo_supervisor",
            email="supervisor@calandreta-demo.fr",
            password="TestRegistration1",
        )
        RegistrationSupervisor.objects.create(
            user=sup_user,
            firstname="Gestionnaire",
            lastname="Démo",
        )
        self.stdout.write(f"  ✓ supervisor: demo_supervisor / TestRegistration1")

        # ── Legal representatives ─────────────────────────────────────────────
        parents = {}
        for i, (firstname, lastname, username) in enumerate(PARENTS):
            user = User.objects.create_user(
                username=f"{username}_demo",
                email=f"{username}@calandreta-demo.fr",
                password="TestParent123",
            )
            parent = LegalRepresentative.objects.create(user=user)
            parents[lastname] = parent
        self.stdout.write(f"  ✓ {len(PARENTS)} représentants légaux (password: TestParent123)")

        # ── Campaign for current year ─────────────────────────────────────────
        campaign, _ = RegistrationCampaign.objects.get_or_create(
            year=datetime.date(today.year, 9, 1),
        )
        self.stdout.write(f"  ✓ campagne {today.year}")

        # ── Pupils + registration files ───────────────────────────────────────
        for firstname, lastname, grade in PUPILS:
            birth_year = today.year - GRADE_AGE[grade]
            birth_date = datetime.date(birth_year, random.randint(1, 12), random.randint(1, 28))

            pupil = Pupil.objects.create(
                firstname=firstname,
                lastname=lastname,
                birth_date=birth_date,
                grade=grade,
            )

            parent_lastname = PUPIL_PARENT[lastname]
            parent = parents[parent_lastname]
            PupilLegalRepresentative.objects.create(pupil=pupil, legal_representative=parent)

            RegistrationFile.objects.create(pupil=pupil, campaign=campaign)

        self.stdout.write(f"  ✓ {len(PUPILS)} élèves avec dossiers d'inscription")
        self.stdout.write(self.style.SUCCESS("Données de démonstration créées."))