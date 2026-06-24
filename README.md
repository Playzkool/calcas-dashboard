# Calcas Dashboard — Calandreta Castanet Tolosan

Tableau de bord de gestion des inscriptions scolaires.

- **Backend** : Django + Django REST Framework (Python)
- **Frontend** : React + TypeScript + Vite + MUI

---

## Démarrage rapide (Docker — recommandé)

### Prérequis

- Docker Desktop 4.x+

### Lancement

```bash
cp .env.example .env
# Éditer .env : POSTGRES_PASSWORD, SECRET_KEY et les variables EMAIL (voir ci-dessous)
docker compose up --build
```

> **Important** : le fichier `.env` contient des secrets — il est exclu du dépôt git via `.gitignore`. Ne le commitez jamais.

L'application est accessible sur **`http://localhost`**.

### Générer une SECRET_KEY sécurisée

```bash
python -c "import secrets; print(secrets.token_urlsafe(50))"
```

### Données de démonstration

```bash
docker compose exec backend python manage.py generate_demo_data
```

---

## Développement local (sans Docker)

### Prérequis

- Python 3.12+
- Node.js 20+
- PostgreSQL 16+ (ou Docker pour la BDD uniquement)
- Redis 7+ (ou Docker — voir astuce ci-dessous)

### Backend

```bash
cd calcas-dashboard          # racine du projet Django
python -m venv .venv
source .venv/bin/activate    # Windows : .venv\Scripts\activate
pip install -r requirements.txt

# Variables d'environnement requises
export SECRET_KEY="dev-secret-key"
export DEBUG=True
export ALLOWED_HOSTS=localhost,127.0.0.1
export POSTGRES_DB=calcas
export POSTGRES_USER=calcas
export POSTGRES_PASSWORD=calcas
export POSTGRES_HOST=localhost
export REDIS_URL=redis://localhost:6379/0

python manage.py migrate
python manage.py runserver
```

> **Astuce** : lancer PostgreSQL et Redis dans Docker pour le dev local :
> ```bash
> docker compose up db redis
> ```

### Frontend

```bash
cd apps_js/calcas-dashboard
npm install
npm run dev
```

Le frontend est accessible sur `http://localhost:5173`. Les appels `/api/*` sont
proxifiés automatiquement vers Django (`http://127.0.0.1:8000`).

---

## Variables d'environnement

Le fichier `.env` (à créer depuis `.env.example`) est lu par `docker compose`.

| Variable | Description | Exemple |
|---|---|---|
| `REDIS_URL` | URL de connexion Redis (cache rate-limiting) | `redis://redis:6379/0` (Docker) / `redis://localhost:6379/0` (local) |
| `POSTGRES_DB` | Nom de la base | `calcas` |
| `POSTGRES_USER` | Utilisateur PostgreSQL | `calcas` |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL | chaîne aléatoire |
| `POSTGRES_HOST` | Hôte PostgreSQL | `db` (Docker) / `localhost` (local) |
| `POSTGRES_PORT` | Port PostgreSQL | `5432` |
| `SECRET_KEY` | Clé secrète Django | chaîne aléatoire 50+ caractères |
| `DEBUG` | Mode debug | `False` (prod) / `True` (dev) |
| `ALLOWED_HOSTS` | Hôtes autorisés (virgule) | `mon-domaine.fr,www.mon-domaine.fr` |
| `CSRF_TRUSTED_ORIGINS` | Origines CSRF (virgule) | `https://mon-domaine.fr` |
| `EMAIL_BACKEND` | Backend d'envoi email | `django.core.mail.backends.smtp.EmailBackend` |
| `DEFAULT_FROM_EMAIL` | Adresse expéditeur | `no-reply@mon-domaine.fr` |
| `EMAIL_HOST` | Serveur SMTP | `smtp.mon-domaine.fr` |
| `EMAIL_PORT` | Port SMTP | `587` (TLS) / `465` (SSL) |
| `EMAIL_HOST_USER` | Identifiant SMTP | `no-reply@mon-domaine.fr` |
| `EMAIL_HOST_PASSWORD` | Mot de passe SMTP | chaîne aléatoire |
| `EMAIL_USE_TLS` | STARTTLS | `True` (port 587) |
| `EMAIL_USE_SSL` | SSL natif | `False` (utiliser TLS ou SSL, pas les deux) |

> Les variables email sont nécessaires pour que la fonctionnalité **"Mot de passe oublié"** envoie réellement un e-mail. En développement, laisser `EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend` suffit (l'email s'affiche dans les logs).

---

## Données de démonstration

### Générer les données

```bash
# Docker
docker compose exec backend python manage.py generate_demo_data

# Local
python manage.py generate_demo_data
```

Crée :

- 1 gestionnaire des inscriptions
- 10 représentants légaux
- 16 élèves répartis sur tous les niveaux (PS → CM2)
- 16 dossiers d'inscription pour la campagne de l'année en cours

### Supprimer toutes les données

```bash
# Docker
docker compose exec backend python manage.py 0_wipe_data

# Local
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
La liste complète est visible dans `registration/management/commands/generate_demo_data.py`.

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
- **Modification d'un dossier** : tant que le dossier n'est pas clôturé par le gestionnaire, le représentant peut le modifier. Une jauge de complétion indique l'avancement.
- **Consultation d'un dossier clôturé** : vue lecture seule du dossier complet.
- **Mon compte** : consultation et mise à jour du profil personnel (coordonnées, téléphones, autorité parentale, accompagnement piscine, etc.).
- **Co-représentant** : association d'un second représentant légal à un enfant (par adresse e-mail).

### Gestionnaire des inscriptions

#### Liste des inscriptions

Tableau récapitulatif de toutes les inscriptions de l'année en cours, avec pour chaque dossier :

- **Statut** : chip « En cours » ou « Clôturé ».
- **Indicateur de complétion** : barre de progression colorée (vert ≥ 80 %, orange ≥ 50 %, rouge < 50 %) calculée sur 16 critères — informations de l'élève, documents joints, fiche sanitaire, autorisations, charte, et profil des représentants légaux.
- **Téléchargement du dossier** (icône ↓) : génère une archive `.zip` contenant :
  - `recap.html` — récapitulatif complet et imprimable.
  - `documents/` — tous les fichiers joints.
- **Clic sur une ligne** → vue détail complète du dossier.

#### Vue détail d'un dossier

Affiche l'intégralité du dossier organisée en sections :

| Section | Contenu |
|---|---|
| **Informations de l'élève** | Prénom, nom, date et lieu de naissance, nationalité, adresse, niveau |
| **Situation familiale** | Statut marital, nombre de frères et sœurs |
| **Fiche sanitaire** | Autorisation SAMU, médecin traitant, allergies, antécédents médicaux, contacts d'urgence |
| **Autorisations** | Sortie pédagogique, droit à l'image, charte, personnes autorisées à récupérer l'enfant |
| **Documents joints** | Liens vers les fichiers uploadés, ou mention « non fourni » |
| **Représentants légaux** | Fiche complète de chaque représentant (coordonnées, téléphones, profession, autorité parentale, accompagnement piscine) |

Le bouton **Clôturer / Rouvrir le dossier** (avec confirmation) verrouille ou déverrouille la possibilité pour le représentant légal de modifier le dossier.

#### Gestion des représentants légaux

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
| `GET` | `registrations/` | Gestionnaire | Liste des inscriptions (année en cours) avec complétion et statut |
| `POST` | `registrations/` | Représentant légal | Créer un dossier d'inscription |
| `GET` | `registrations/<id>/` | Gestionnaire / Représentant légal (ses propres dossiers) | Détail complet d'un dossier |
| `PATCH` | `registrations/<id>/` | Gestionnaire (`is_closed`) / Représentant légal (dossier non clôturé) | Modifier ou clôturer un dossier |
| `GET` | `registrations/<id>/download/` | Gestionnaire | Télécharger le dossier au format `.zip` |
| `GET` | `my-registrations/` | Représentant légal | Mes dossiers (avec complétion et statut de clôture) |
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
├── Dockerfile                # Image backend (Python + gunicorn)
├── entrypoint.sh             # migrate + collectstatic + gunicorn
├── docker-compose.yml        # Orchestration (db, backend, frontend/nginx)
├── .env.example              # Template des variables d'environnement
├── requirements.txt          # Dépendances Python
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
    ├── Dockerfile            # Build Vite multi-stage → nginx
    ├── nginx.conf            # Reverse-proxy + serving SPA
    └── src/
        ├── components/       # Composants UI
        ├── store/            # State management Redux
        └── types.ts          # Types TypeScript partagés
```
