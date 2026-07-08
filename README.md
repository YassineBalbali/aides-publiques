# Sujet PFE — Plateforme Digitale de Gestion des Aides Publiques

## Titre du Projet

Développement d'une plateforme web de gestion et suivi des dossiers d'aides publiques avec catalogue automatisé des dispositifs disponibles

---

## Contexte & Objectif

Concevoir et développer une solution web permettant aux organismes publics et bénéficiaires de :

- Dématérialiser la gestion des dossiers de demande d'aides publiques
- Agréger et présenter un catalogue des aides disponibles
- Simplifier le dépôt et le suivi des demandes
- Automatiser le workflow d'instruction
- Orienter les usagers vers les aides pertinentes
- Générer des rapports statistiques
- Assurer la traçabilité des décisions

---

## Niveau & Durée

- **Niveau :** Bac+3 — Licence Professionnelle / BUT Informatique
- **Domaine :** Développement Web Full-Stack, Systèmes d'Information
- **Durée :** 3–4 mois (12–16 semaines)
- **Type :** Stage de fin d'études

---

## Stack Technique

### Backend

- Python 3.11+ avec FastAPI (API REST)
- PostgreSQL 15 (base de données principale)
- SQLAlchemy (ORM)
- Alembic (migrations BDD)
- Redis (cache simple)
- Celery + Redis (tâches asynchrones basiques)

### Frontend

- React 18 avec Vite
- JavaScript / TypeScript
- TailwindCSS (styling)
- React Router (navigation)
- Axios (requêtes HTTP)
- React Hook Form (formulaires)

### Infrastructure & Outils

- Docker (conteneurisation)
- Docker Compose (orchestration locale)
- Git / GitHub (versioning)
- Postman (tests API)
- pgAdmin (gestion PostgreSQL)

### APIs Externes (Optionnel)

- API Entreprise (données SIRET basiques)
- API Géo (adresses, villes)
- API Aides-territoires (catalogue aides — si disponible)

---

## Fonctionnalités Principales

### 1. Gestion du Catalogue d'Aides ⭐ *(Module prioritaire — cœur du projet)*

- Interface administrateur pour créer/modifier des fiches aides
- Formulaire structuré :
  - Titre, description, type d'aide
  - Bénéficiaires éligibles (particuliers, entreprises, associations)
  - Montant minimum / maximum
  - Dates d'ouverture / fermeture
  - Documents requis
  - Critères d'éligibilité (texte libre)
  - Organisme financeur
  - Lien externe (site officiel)
- Catégorisation :
  - Par type (subvention, prêt, exonération, formation)
  - Par secteur (agriculture, industrie, commerce, santé…)
  - Par territoire (national, régional, départemental)
- Statut aide : active, à venir, clôturée, suspendue

### 2. Recherche et Navigation ⭐ *(Module prioritaire)*

- Page catalogue public (consultation sans connexion)
- Recherche textuelle simple (titre, description)
- Filtres multi-critères : type de bénéficiaire, type d'aide, territoire, secteur d'activité, montant, statut
- Tri : pertinence, date, montant
- Pagination des résultats
- Page détail d'une aide (toutes les informations)
- Export liste résultats (CSV, PDF basique)

### 3. Gestion des Utilisateurs

- Inscription / Connexion (email / mot de passe)
- Profils différenciés :
  - Demandeur (particulier, entreprise, association)
  - Instructeur (agent public)
  - Administrateur (gestion plateforme)
- Profil utilisateur : informations personnelles, type de bénéficiaire, secteur d'activité, localisation
- Authentification JWT
- Gestion mot de passe (réinitialisation par email)

### 4. Dépôt de Dossiers

- Formulaire de demande adapté par type d'aide
- Champs dynamiques selon l'aide sélectionnée
- Upload documents (PDF, images — limite 5–10 MB)
- Sauvegarde brouillon
- Validation côté client (champs obligatoires)
- Confirmation dépôt avec numéro de dossier
- Email notification confirmation

### 5. Suivi de Dossiers

**Espace demandeur**
- Liste mes dossiers (tableau avec statut)
- Filtres : statut, date, type d'aide
- Détail dossier : informations + documents
- Statuts : brouillon, déposé, en instruction, accepté, refusé
- Historique actions (timeline simple)
- Messagerie basique avec instructeur

**Espace instructeur**
- Liste dossiers à traiter (affectés)
- Filtres avancés
- Détail dossier avec documents téléchargeables
- Actions : accepter, refuser, demander complément
- Ajout commentaires internes
- Changement statut avec justification

### 6. Workflow Simplifié

- Étapes : Nouveau → En cours → Validé / Refusé
- Affectation manuelle dossier à instructeur
- Notifications email changement statut
- Commentaires échanges demandeur / instructeur

### 7. Tableaux de Bord

**Dashboard demandeur** — nombre de dossiers par statut, derniers dossiers déposés, aides pertinentes recommandées

**Dashboard instructeur** — nombre dossiers en attente, dossiers prioritaires (ancienneté), statistiques traitements

**Dashboard administrateur** — total aides actives, total dossiers déposés, graphiques simples (par mois, par type), liste utilisateurs inscrits

### 8. Administration

- CRUD aides (Create, Read, Update, Delete)
- CRUD utilisateurs
- Gestion affectations dossiers → instructeurs
- Paramètres plateforme (nom, logo, mentions légales)
- Export données (CSV)

### 9. Import / Export Données ⭐ *(Fonctionnalité différenciante)*

**Import CSV**
- Modèle template téléchargeable
- Import en masse d'aides depuis fichier CSV
- Validation format et données
- Rapport d'import (succès / erreurs)

**Import manuel sources web** *(Optionnel si temps)*
- Page admin avec URL
- Scraping basique d'une page HTML
- Extraction structure titre / description
- Sauvegarde comme brouillon aide

**Export données**
- Liste aides (CSV / JSON)
- Liste dossiers (CSV)
