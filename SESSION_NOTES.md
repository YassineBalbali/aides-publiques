# Session de développement — Aides Publiques

**Date :** 01–03 juin 2026  
**Projet :** Plateforme de gestion des aides publiques  
**Développeur :** Yassine Belbali

---

## Résumé des travaux

### 1. Stack technique identifiée

#### Backend
| Technologie | Rôle |
|---|---|
| FastAPI | Framework HTTP REST |
| SQLAlchemy | ORM (Object-Relational Mapping) |
| PostgreSQL 15 | Base de données relationnelle |
| Alembic | Migrations BDD |
| Redis | Cache + broker Celery |
| Celery | Tâches asynchrones (emails) |
| FastAPI-Mail | Envoi d'emails |
| python-jose | JWT (authentification) |
| bcrypt | Hachage des mots de passe |
| Pydantic v2 | Validation des données |
| Groq (llama-3.1-8b-instant) | IA / LLM |

#### Frontend
| Technologie | Rôle |
|---|---|
| React 18 + Vite | Framework UI |
| TailwindCSS v4 | Styles |
| React Router v7 | Navigation |
| Axios | Client HTTP |
| React Hook Form | Formulaires |
| Chart.js | Graphiques dashboard |

#### Infrastructure
| Technologie | Rôle |
|---|---|
| Docker + Docker Compose | Orchestration |
| Nginx | Serveur frontend (production) |
| pgAdmin | Administration BDD |

---

### 2. Refactorisation MVC complète

Migration de tout le backend vers une architecture **Model / View / Controller** classique.

```
backend/app/
├── models/        ← M  — SQLAlchemy (tables BDD)
├── views/         ← V  — Pydantic (schémas entrée/sortie)
├── controllers/   ← C  — Logique métier (classes @staticmethod)
├── routes/        ← HTTP fin (dispatch vers controllers)
└── tasks/         ← Celery (emails asynchrones)
```

**Entités couvertes :**
- `Utilisateur` — inscription, login, profil, reset password, admin CRUD
- `Aide` — CRUD, import CSV, export CSV/JSON, cache Redis
- `Dossier` — CRUD, statuts, affectation, export CSV/JSON
- `Document` — upload, téléchargement, suppression
- `Message` — messagerie demandeur ↔ instructeur
- `Notification` — notifications in-app
- `IA` — suggestions, analyse de dossier, génération description
- `Chatbot` — réponses contextuelles plateforme

**Dossier supprimé :** `backend/app/api/` (routes obsolètes sans import actif)

---

### 3. Système de notifications in-app

#### Modèle `Notification` (nouveau)
```python
class Notification(Base):
    __tablename__ = "notifications"
    id            = Column(UUID, primary_key=True)
    utilisateur_id = Column(UUID, ForeignKey("utilisateurs.id"))
    type          = Column(String)          # "affectation"
    titre         = Column(String)
    contenu       = Column(Text)
    dossier_id    = Column(UUID, nullable=True)
    numero_dossier = Column(String, nullable=True)
    lu            = Column(Boolean, default=False)
    cree_le       = Column(DateTime)
```
Table créée automatiquement via `Base.metadata.create_all()`.

#### Endpoints
| Méthode | Route | Description |
|---|---|---|
| GET | `/notifications/non-lues/{utilisateur_id}` | Récupère les notifs non lues |
| PATCH | `/notifications/{notification_id}/lire` | Marque une notif comme lue |
| PATCH | `/notifications/toutes-lues/{utilisateur_id}` | Marque tout comme lu |

#### Cloche navbar (`NotificationBell`)
- Composant intégré dans `SidebarLayout.jsx`
- Fusionne messages non lus + notifications d'affectation en une seule liste
- Icônes : ✉ messages (violet), 📋 affectations (orange)
- Polling toutes les 30 secondes
- Navigation role-aware :
  - `instructeur` → `/instructeur/dossier/:id`
  - `demandeur` → `/mon-espace/dossier/:id`
  - `admin` → `/admin/dossiers`

#### Déclencheurs
| Événement | Canal |
|---|---|
| Admin affecte dossier à instructeur | Notification in-app |
| Changement de statut d'un dossier | Email (Celery) |
| Confirmation dépôt de dossier | Email (Celery) |
| Reset mot de passe | Email (Celery) |

---

### 4. Page détail dossier admin

**Fichier :** `frontend/src/pages/DetailDossierAdmin.jsx`  
**Route :** `/admin/dossier/:id`

**Fonctionnalités :**
- En-tête : numéro, date, demandeur, instructeur actuel, commentaire
- Liste des documents avec téléchargement
- Boutons de changement de statut (Accepter / Refuser / En instruction / Complément)
- **Colonne droite sticky** :
  - Carte instructeur actuel (si affecté)
  - Sélecteur d'instructeur (nom uniquement : `{prenom} {nom}`)
  - Bouton **Affecter** → `PATCH /dossiers/:id/affecter?instructeur_id=...`

**Modifications associées :**
- `EspaceAdmin.jsx` : lignes de tableau cliquables (`navigate('/admin/dossier/:id')`)
- `e.stopPropagation()` sur les boutons d'action pour éviter la navigation parasite
- `App.jsx` : ajout de la route protégée

---

### 5. Corrections et ajustements

| Problème | Correction |
|---|---|
| React 19 incompatible | Downgrade vers React 18.3.1 |
| URLs réseau Vite dans le terminal | `host: 'localhost'` dans `vite.config.ts` |
| Routes obsolètes `api/routes/` | Dossier supprimé après vérification des imports |
| Navigation cloche → page blanche | Navigation role-aware avec prop `role` |
| `main.py` référençant anciens modules | Corrigé vers `messages.router`, `documents.router` |
| Celery WinError 5 (Windows) | `--pool=solo --concurrency=1` |

---

### 6. Architecture des fichiers clés

```
aides-publiques/
├── backend/
│   └── app/
│       ├── models/
│       │   ├── utilisateur.py
│       │   ├── aide.py
│       │   ├── dossier.py
│       │   ├── document.py
│       │   ├── message.py
│       │   ├── historique.py
│       │   └── notification.py          ← nouveau
│       ├── views/
│       │   ├── utilisateur.py
│       │   ├── aide.py
│       │   ├── dossier.py
│       │   └── ia.py
│       ├── controllers/
│       │   ├── utilisateur_controller.py
│       │   ├── aide_controller.py
│       │   ├── dossier_controller.py
│       │   ├── document_controller.py
│       │   ├── message_controller.py
│       │   ├── ia_controller.py
│       │   ├── chatbot_controller.py
│       │   └── notification_controller.py ← nouveau
│       ├── routes/
│       │   ├── auth.py
│       │   ├── aides.py
│       │   ├── dossiers.py
│       │   ├── documents.py
│       │   ├── messages.py
│       │   ├── ia.py
│       │   ├── chatbot.py
│       │   └── notifications.py          ← nouveau
│       ├── tasks/
│       │   └── email_tasks.py
│       └── main.py
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── SidebarLayout.jsx         ← NotificationBell ajouté
│       │   ├── EspaceAdmin.jsx           ← rows cliquables
│       │   └── DetailDossierAdmin.jsx    ← nouveau
│       ├── components/
│       └── api.ts
├── docker-compose.yml
└── README.md                             ← cahier des charges complet
```

---

### 7. Commandes utiles

```bash
# Backend
uvicorn app.main:app --reload

# Celery (Windows)
venv\Scripts\activate
celery -A app.tasks.email_tasks worker --loglevel=info --pool=solo --concurrency=1

# Frontend
cd frontend
npm run dev

# Docker (tout démarrer)
docker-compose up -d
```
