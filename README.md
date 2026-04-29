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