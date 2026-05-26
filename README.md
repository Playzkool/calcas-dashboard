# Calcas Dashboard — Calandreta Castanet Tolosan

Tableau de bord de gestion des inscriptions scolaires.

- **Backend** : Django + Django REST Framework (Python)
- **Frontend** : React + TypeScript + Vite + MUI

---

## Prérequis

- Python 3.12+
- Node.js 20+

---

## Installation

### Backend

```bash
cd calcas-dashboard          # racine du projet Django
python -m venv .venv
source .venv/bin/activate    # Windows : .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
```

### Frontend

```bash
cd apps_js/calcas-dashboard
npm install
```

---

## Lancer en développement

### Backend (port 8000)

```bash
source .venv/bin/activate
python manage.py runserver
```

### Frontend (port 5173)

```bash
cd apps_js/calcas-dashboard
npm run dev
```

Le frontend est accessible sur `http://localhost:5173`. Les appels `/api/*` sont
proxifiés automatiquement vers Django (`http://127.0.0.1:8000`).

---

## Données de démonstration

### Générer les données

```bash
python manage.py generate_demo_data
```

Crée :

- 1 gestionnaire des inscriptions
- 10 représentants légaux
- 16 élèves répartis sur tous les niveaux (PS → CM2)
- 16 dossiers d'inscription pour la campagne de l'année en cours

### Supprimer toutes les données

```bash
python manage.py 0_wipe_data
```

### Identifiants de démonstration

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| Gestionnaire des inscriptions | `demo_supervisor` | `TestRegistration1` |
| Représentant légal | `sophie.bonnet_demo` | `TestParent123` |
| Représentant légal | `pierre.fabre_demo` | `TestParent123` |
| Représentant légal | `marie.dupuy_demo` | `TestParent123` |
| Représentant légal | `jean.martin_demo` | `TestParent123` |

Tous les comptes représentants légaux partagent le mot de passe `TestParent123`.
La liste complète des comptes créés est visible dans
`registration/management/commands/generate_demo_data.py`.

---

## Rôles

| Rôle | Page d'accueil |
|---|---|
| **Représentant légal** | Formulaire d'inscription (pour déposer le dossier d'un enfant) |
| **Gestionnaire des inscriptions** | Liste de toutes les inscriptions de l'année en cours |

---

## Fonctionnalités

### Représentant légal

- **Dépôt d'un dossier d'inscription** : formulaire multi-sections (informations de l'élève, situation familiale, fiche sanitaire, autorisations, documents joints, charte).
- **Mon compte** : consultation et mise à jour du profil personnel (coordonnées, téléphones, autorité parentale, accompagnement piscine, etc.).
- **Co-représentant** : association d'un second représentant légal à un enfant (par adresse e-mail).

### Gestionnaire des inscriptions

#### Liste des inscriptions (`/inscriptions`)

Tableau récapitulatif de toutes les inscriptions de l'année en cours, avec pour chaque dossier :

- **Indicateur de complétion** : barre de progression colorée (vert ≥ 80 %, orange ≥ 50 %, rouge < 50 %) calculée sur 16 critères — informations de l'élève, documents joints, fiche sanitaire, autorisations, charte, et profil des représentants légaux.
- **Téléchargement du dossier** (icône ↓) : génère et télécharge une archive `.zip` contenant :
  - `recap.html` — récapitulatif complet et imprimable de l'inscription (identique à la vue détail), avec CSS embarqué, utilisable directement dans un navigateur ou convertible en PDF via l'impression.
  - `documents/` — tous les fichiers joints au dossier (certificat de naissance, carnet de santé, attestation d'assurance, jugement de divorce le cas échéant, attestation(s) natation des représentants légaux).
- **Clic sur une ligne** → vue détail complète du dossier.

#### Vue détail d'un dossier

Accessible en cliquant sur une ligne de la liste. Affiche l'intégralité du dossier organisée en sections :

| Section | Contenu |
|---|---|
| **Informations de l'élève** | Prénom, nom, date et lieu de naissance, nationalité, adresse, niveau |
| **Situation familiale** | Statut marital, nombre de frères et sœurs |
| **Fiche sanitaire** | Autorisation SAMU, médecin traitant, allergies, antécédents médicaux, contacts d'urgence |
| **Autorisations** | Sortie pédagogique, droit à l'image, charte, personnes autorisées à récupérer l'enfant |
| **Documents joints** | Liens vers les fichiers uploadés, ou mention « non fourni » |
| **Représentants légaux** | Fiche complète de chaque représentant (coordonnées, téléphones, profession, autorité parentale, accompagnement piscine) |

Un bouton **← Retour** permet de revenir à la liste.

#### Gestion des représentants légaux (`/représentants légaux`)

- Liste de tous les comptes représentants légaux avec date de création.
- Création d'un nouveau compte représentant légal par adresse e-mail.

---

## API REST

Tous les endpoints sont préfixés `/api/`.

| Méthode | Endpoint | Rôle requis | Description |
|---|---|---|---|
| `POST` | `login/` | — | Authentification |
| `POST` | `logout/` | Authentifié | Déconnexion |
| `GET` | `me/` | Authentifié | Profil de l'utilisateur connecté |
| `GET` | `registrations/` | Gestionnaire | Liste des inscriptions (année en cours) avec complétion |
| `POST` | `registrations/` | Représentant légal | Créer un dossier d'inscription |
| `GET` | `registrations/<id>/` | Gestionnaire | Détail complet d'un dossier (élève + représentants légaux) |
| `GET` | `registrations/<id>/download/` | Gestionnaire | Télécharger le dossier au format `.zip` |
| `GET` | `my-registrations/` | Représentant légal | Mes dossiers d'inscription |
| `GET` | `legal-representatives/` | Gestionnaire | Liste des représentants légaux |
| `POST` | `legal-representatives/` | Gestionnaire | Créer un compte représentant légal |
| `GET` | `co-representative/` | Représentant légal | Co-représentant(s) associé(s) à mes enfants |
| `POST` | `co-representative/` | Représentant légal | Associer un co-représentant à un enfant |
| `GET` | `my-profile/` | Représentant légal | Mon profil |
| `PATCH` | `my-profile/` | Représentant légal | Mettre à jour mon profil |

---

## Structure du projet

```
calcas-dashboard/
├── project/                  # Configuration Django (settings, urls)
├── registration/             # Application principale
│   ├── models.py             # LegalRepresentative, Pupil, RegistrationFile, …
│   ├── registration_enums.py # Grade, FamilySituation
│   └── management/commands/  # generate_demo_data, 0_wipe_data
├── rest_api/                 # API REST
│   ├── serializers.py        # Sérialisation / validation
│   ├── views.py              # Vues API
│   ├── urls.py               # Routes
│   └── html_export.py        # Génération du récapitulatif HTML
└── apps_js/calcas-dashboard/ # Frontend React
    └── src/
        ├── components/       # Composants UI
        ├── store/            # State management Redux
        └── types.ts          # Types TypeScript partagés
```
