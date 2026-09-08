# APTIC-R — International Volunteers
## Spécifications Techniques, Architecture & Feuille de Route de Développement

---

## 1. Synthèse du Cahier des Charges & Vision Stratégique

### 1.1 Contexte & Enjeux
**APTIC-R** (*Association pour la Promotion des TIC en milieu Rural au Togo*), basée à **Agbélouvé (Région Maritime, Togo)**, lance son portail officiel de volontariat international pour des missions de **6 à 12 mois**.

Le portail a un double objectif stratégique :
1. **Recruter des volontaires qualifiés** (étudiants, diplômés, jeunes professionnels d'Europe : Allemagne, France, Belgique, etc.) dans 4 domaines clés : *Numérique/IT*, *Agriculture & Agronomie*, *Créatif & Communication*, *Ingénierie & Prototypage low-tech*.
2. **Établir des partenariats institutionnels** avec des organismes européens d'envoi de volontaires (*France Volontaires*, *weltwärts*, *Corps Européen de Solidarité*, *SCI*, Universités, ONG).

### 1.2 Parcours Utilisateurs Cibles
- **Parcours Volontaire** :
  $$\text{Découvrir APTIC-R} \longrightarrow \text{Comprendre la Mission} \longrightarrow \text{Se projeter à Agbélouvé} \longrightarrow \text{Être rassuré (Support)} \longrightarrow \text{Vérifier son éligibilité} \longrightarrow \text{Postuler (Formulaire multi-étapes)} \longrightarrow \text{Suivi & Entretien}$$
- **Parcours Organisation Partenaire** :
  $$\text{Découvrir APTIC-R} \longrightarrow \text{Évaluer la fiabilité & l'impact} \longrightarrow \text{Consulter les cadres de coopération} \longrightarrow \text{Soumettre une demande de partenariat}$$

---

## 2. Principe Méthodologique Fondamental

### 2.1 Approche Découplée & Itérative (vs Effet Tunnel)

```
       CADRAGE TECHNIQUE (Phase 0)
                  │
                  ▼
       ARCHITECTURE GLOBALE & MODÈLES DE DONNÉES
                  │
         ┌────────┴────────┐
         ▼                 ▼
   DESIGN SYSTEM        SCHÉMA BDD & API
      (Figma)              (Prisma / Postgres)
         │                 │
         └────────┬────────┘
                  ▼
      PREMIER PARCOURS VERTICAL FONCTIONNEL
                  │
                  ▼
       FRONTEND PUBLIC & I18N (FR/EN/DE)
                  │
                  ▼
       FORMULAIRES AVEC STOCKAGE DE DOCUMENTS
                  │
                  ▼
       BACK-OFFICE & WORKFLOW DES CANDIDATURES
                  │
                  ▼
       ANALYTICS, SÉCURITÉ & DÉPLOIEMENT PROD
```

### 2.2 Le Premier Parcours Vertical (Vertical Slice)
Dès les premiers jours, l'objectif prioritaire est de valider le flux de bout en bout :
$$\text{Landing Page (Hero/CTA)} \longrightarrow \text{Formulaire Candidat (Submit)} \longrightarrow \text{API / Server Action} \longrightarrow \text{PostgreSQL (Prisma)} \longrightarrow \text{Back-office Admin (Affichage immédiat)}$$

---

## 3. Architecture Technique Recommandée

### 3.1 Stack Technologique

| Couche | Technologie | Justification |
| :--- | :--- | :--- |
| **Framework Fullstack** | **Next.js 15 (App Router)** | Rendu hybride (SSG/ISR pour la vitrine, SSR pour l'admin), SEO optimal, Server Actions performantes. |
| **Langage** | **TypeScript 5** | Typage strict de bout en bout (modèles, formulaires, API, i18n). |
| **Styles & UI** | **Tailwind CSS v4** | Respect strict du design system 90/10, performance CSS native, responsive sans overhead. |
| **Base de données** | **PostgreSQL (ex. Supabase / Neon / RDS)** | Fiabilité relationnelle, support JSONB pour métadonnées flexibles, intégrité référentielle. |
| **ORM** | **Prisma ORM** | Schémas déclaratifs, migrations versionnées, typage automatique client TypeScript. |
| **Authentification** | **Auth.js (NextAuth v5)** | Sécurisation robuste du back-office (sessions JWT chiffrées, RBAC admin). |
| **Stockage Fichiers** | **AWS S3 / Supabase Storage / UploadThing** | Stockage sécurisé des CV, lettres de motivation et portfolios avec URLs signées temporaires. |
| **Validation** | **Zod + React Hook Form** | Validation synchrone côté client et asynchrone stricte côté serveur. |
| **Internationalisation** | **next-intl ou sous-routage `/fr`, `/en`, `/de`** | Routage localisé, balises `hreflang` pour le SEO, dictionnaire de traductions vérifié. |
| **Emails Transactionnels** | **Resend / Postmark / SendGrid** | Confirmation automatique aux candidats et alertes à l'équipe APTIC-R. |

---

## 4. Schéma de Base de Données (Prisma Schema)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum CandidateStatus {
  NOUVEAU
  REVISION
  SELECTIONNE
  ENTRETIEN
  CHOISI
  VALIDATION_PARTENAIRES
  PREPARATION
  ARRIVE
  COMPLETE
  REFUSE
  ARCHIVE
}

enum EducationLevel {
  BAC
  BAC_PLUS_2_3
  MASTER_BAC_PLUS_5
  DOCTORAT
  AUTRE
}

enum ExperienceDuration {
  LESS_THAN_1_YEAR
  ONE_TO_TWO_YEARS
  TWO_TO_FIVE_YEARS
  FIVE_PLUS_YEARS
}

enum MissionDuration {
  SIX_MONTHS
  NINE_MONTHS
  TWELVE_MONTHS
}

enum LanguageCode {
  FR
  EN
  DE
}

// ─── CANDIDATURES VOLONTAIRES ────────────────────────────────────────────────
model Candidate {
  id              String             @id @default(cuid())
  referenceNumber String             @unique // Ex: APTIC-2025-001
  status          CandidateStatus    @default(NOUVEAU)
  lang            LanguageCode       @default(EN)
  
  // Informations personnelles
  firstName       String
  lastName        String
  email           String
  phone           String?
  country         String
  city            String?
  dateOfBirth     DateTime
  
  // Profil & Compétences
  education       String?
  fieldOfStudy    String?
  profession      String?
  experienceLevel ExperienceDuration?
  digitalSkillLevel String?
  skills          CandidateSkill[]
  
  // Disponibilité
  desiredArrival  DateTime?
  duration        MissionDuration    @default(SIX_MONTHS)
  
  // Motivation & Expérience
  motivationText  String             @db.Text
  projectExpText  String?            @db.Text
  
  // Source & Consentement
  sourceChannel   String?
  consentData     Boolean            @default(false)
  
  // Documents attachés
  documents       Document[]
  
  // Suivi interne
  notes           AdminNote[]
  assignedToId    String?
  assignedTo      User?              @relation("AssignedCandidate", fields: [assignedToId], references: [id])
  
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt

  @@index([status])
  @@index([email])
  @@index([country])
}

model Skill {
  id         String           @id @default(cuid())
  slug       String           @unique
  nameFr     String
  nameEn     String
  nameDe     String
  category   String           // IT, AGRICULTURE, CREATIVE, ENGINEERING
  candidates CandidateSkill[]
}

model CandidateSkill {
  candidateId String
  skillId     String
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  skill       Skill     @relation(fields: [skillId], references: [id], onDelete: Cascade)

  @@id([candidateId, skillId])
}

model Document {
  id          String    @id @default(cuid())
  candidateId String
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  type        String    // CV, COVER_LETTER, PORTFOLIO, PASSPORT, VISA
  fileName    String
  fileUrl     String
  fileSize    Int
  mimeType    String
  createdAt   DateTime  @default(now())
}

// ─── DEMANDES DE PARTENARIAT ORGANISATIONS ────────────────────────────────────
model PartnerRequest {
  id               String       @id @default(cuid())
  orgName          String
  country          String
  website          String?
  contactPerson    String
  email            String
  orgType          String
  volunteerCount   String?
  targetCountries  String?
  programme        String?
  message          String       @db.Text
  docFileUrl       String?
  consent          Boolean      @default(false)
  status           String       @default("PENDING") // PENDING, CONTACTED, PARTNER, ARCHIVED
  
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
}

// ─── UTILISATEURS & BACK-OFFICE ───────────────────────────────────────────────
model User {
  id                 String      @id @default(cuid())
  name               String
  email              String      @unique
  passwordHash       String
  role               String      @default("ADMIN") // SUPERADMIN, ADMIN, REVIEWER
  assignedCandidates Candidate[] @relation("AssignedCandidate")
  notes              AdminNote[]
  createdAt          DateTime    @default(now())
  updatedAt          DateTime    @updatedAt
}

model AdminNote {
  id          String    @id @default(cuid())
  candidateId String
  candidate   Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  authorId    String
  author      User      @relation(fields: [authorId], references: [id])
  content     String    @db.Text
  createdAt   DateTime  @default(now())
}

// ─── ANALYTICS & EVENEMENTS ──────────────────────────────────────────────────
model AnalyticsEvent {
  id        String   @id @default(cuid())
  name      String   // apply_now_click, application_started, application_submitted, etc.
  lang      String?
  country   String?
  source    String?
  metadata  Json?
  createdAt DateTime @default(now())

  @@index([name])
  @@index([createdAt])
}
```

---

## 5. Workflow Détaillé des Candidatures (9 Étapes)

```
  [ 01. NOUVEAU ] ─── Réception du formulaire + email automatique de confirmation
         │
         ▼
  [ 02. RÉVISION ] ─── Examen des critères d'éligibilité, CV et compétences
         │
         ▼
  [ 03. SÉLECTIONNÉ ] ─── Validation préliminaire par l'équipe de coordination
         │
         ▼
  [ 04. ENTRETIEN ] ─── Entretien vidéo (motivation, adéquation, questions)
         │
         ▼
  [ 05. CHOISI ] ─── Candidat retenu pour la mission
         │
         ▼
  [ 06. VALIDATION DES PARTENAIRES ] ─── Accord organisme d'envoi (weltwärts, FV, etc.)
         │
         ▼
  [ 07. PRÉPARATION ] ─── Visa, vaccins, billet d'avion, briefing pré-départ
         │
         ▼
  [ 08. ARRIVÉ ] ─── Accueil à Lomé/Agbélouvé & intégration locale
         │
         ▼
  [ 09. COMPLÉTÉ ] ─── Mission accomplie (6-12 mois) & bilan de mission
```

---

## 6. Plan d'Exécution en 11 Phases & État d'Avancement Réel

### Synthèse Globale

| Phase | Intitulé | Statut | Avancement | Priorité de finalisation |
| :--- | :--- | :---: | :---: | :---: |
| **Phase 0** | Cadrage technique & Architecture | ✅ Validé | **100%** | — |
| **Phase 1** | Design System & Direction Artistique | ✅ Validé | **100%** | — |
| **Phase 2** | Initialisation technique (Next.js 15, Prisma, Tailwind v4) | ✅ Validé | **100%** | — |
| **Phase 3** | Site public & Landing Page (18 sections + SEO + OpenGraph) | ✅ Validé | **100%** | — |
| **Phase 4** | Multilingue international (FR / EN / DE + `hreflang`) | ✅ Validé | **100%** | — |
| **Phase 5** | Formulaire Candidature (9 étapes) & Backend | 🟨 Fonctionnel | **85%** | Haute |
| **Phase 6** | Espace Partenariats Organisations | 🟨 Fonctionnel | **85%** | Haute |
| **Phase 7** | Back-office Administrateur (KPI, Listes, Fiches) | ✅ Fonctionnel | **90%** | Moyenne |
| **Phase 8** | Workflow Candidatures (9 statuts, Notes, Historique) | 🟨 En cours | **75%** | Moyenne |
| **Phase 9** | Analytics & Télémétrie | 🟨 Partiel | **60%** | Moyenne |
| **Phase 10** | Mails transactionnels, Stockage Cloud S3 & Déploiement Prod | 🟥 À faire | **20%** | Haute |

---

### Détail par Phase : Réalisé vs Ce qui manque pour 100%

#### Phase 0 — Cadrage technique (100% ✅)
- [x] Spécifications fonctionnelles et techniques détaillées.
- [x] Arborescence des routes (`/`, `/apply`, `/partners`, `/admin/*`, `/[lang]/*`).
- [x] Matrice des rôles et permissions.
- [x] Schéma relationnel PostgreSQL et entités Prisma.
- [x] Spécification du workflow à 9 statuts.

#### Phase 1 — Figma / Design System (100% ✅)
- [x] Palette chromatique institutionnelle (`#174F7A`, `#35A85A`, fond `#F5F7F9`).
- [x] Typographies institutionnelles sans emoji.
- [x] États UI complets (Hover, Focus, Disabled, Error, Loading).
- [x] Responsive complet (Desktop, Tablette, Mobile).

#### Phase 2 — Initialisation du projet (100% ✅)
- [x] Next.js 15 (App Router) + TypeScript + Tailwind CSS v4.
- [x] Configuration Prisma ORM + PostgreSQL opérationnel.
- [x] Structure modulaire du projet (`app/`, `components/`, `lib/`, `views/`).

#### Phase 3 — Site public & Landing Page (100% ✅)
- [x] Les 18 sections du cahier des charges intégrées et dynamiques.
- [x] Coordonnées officielles intégrées (Tél, Email, Facebook, LinkedIn, Instagram).
- [x] SEO & Réseaux sociaux : Balises OpenGraph & Twitter Cards dynamiques.
- [x] Fichiers `robots.txt` et `sitemap.xml` dynamiques multilingues.

#### Phase 4 — Multilingue (100% ✅)
- [x] Traductions intégrales en Français (FR), Anglais (EN) et Allemand (DE).
- [x] Sélecteur de langue interactif et persistant.
- [x] Balises SEO canoniques `<link rel="alternate" hreflang="...">` (FR, EN, DE, x-default).

#### Phase 5 — Backend & Candidature (85% 🟨)
- [x] Formulaire multi-étapes (9 étapes) interactif avec barre de progression.
- [x] Validation stricte Zod côté client et côté serveur.
- [x] Génération de la référence unique (`APTIC-YYYY-XXXX`).
- [x] Téléversement des fichiers (CV, lettre) et contrôle des formats.
- [x] Enregistrement transactionnel en base de données relationnelle.
- **Ce qui manque pour 100% :**
  - [ ] **Mails transactionnels réels** : Envoi automatique de l'email de confirmation au candidat et de l'alerte à l'équipe APTIC-R.
  - [ ] **Stockage Cloud (S3 / Supabase Storage)** : Migration du stockage disque local `/uploads` vers un bucket d'objets persistant pour la production.

#### Phase 6 — Partenariats Organisations (85% 🟨)
- [x] Page `/partners` dédiée avec présentation des cadres de coopération.
- [x] Formulaire complet pour organisations avec validation Zod.
- [x] Enregistrement en base (`PartnerRequest`) et affichage dans le back-office admin.
- **Ce qui manque pour 100% :**
  - [ ] **Mails transactionnels réels** : Confirmation automatique à l'organisme et alerte email aux coordinateurs APTIC-R.

#### Phase 7 — Back-office Administrateur (90% ✅)
- [x] Authentification sécurisée administrateur.
- [x] Dashboard avec indicateurs clés (KPIs) en temps réel.
- [x] Vue "Candidatures" : tableau de tous les postulants avec filtres et recherche.
- [x] Vue "Candidats" : vue ciblée sur les volontaires retenus/sélectionnés.
- [x] Vue "Partenaires" & "Demandes de partenariat" avec fiches détaillées.
- [x] Fiche candidat détaillée avec historique des statuts et ajout de notes internes.
- **Ce qui manque pour 100% :**
  - [ ] **Export CSV / Excel** : Bouton d'export de la liste des candidatures et candidats filtrés.

#### Phase 8 — Workflow des Candidatures (75% 🟨)
- [x] Transition d'état parmi les 9 statuts officiels.
- [x] Historique chronologique complet des changements de statut (audit trail).
- [x] Ajout et suivi des notes internes par candidat.
- **Ce qui manque pour 100% :**
  - [ ] **Emails automatiques sur changement de statut** (ex: notification d'invitation à l'entretien vidéo).
  - [ ] **Assignation d'un dossier** à un coordinateur spécifique de l'équipe (champ `assignedToId`).

#### Phase 9 — Analytics & Télémétrie (60% 🟨)
- [x] Page dashboard Analytics avec graphiques de répartition.
- [x] Modèle de données Prisma `AnalyticsEvent`.
- **Ce qui manque pour 100% :**
  - [ ] **Télémétrie en temps réel** : Capture effective des clics (`apply_now_click`, abandon d'étapes dans le formulaire) branchée à la base.

#### Phase 10 — Déploiement Production & Sécurité (20% 🟥)
- [x] Configuration des en-têtes HTTP de sécurité et sanitization des données.
- **Ce qui manque pour 100% :**
  - [ ] Clés API du service d'emails (Resend / SendGrid / Postmark).
  - [ ] Hébergement de la base PostgreSQL en ligne (Supabase / Neon).
  - [ ] Déploiement Cloud de l'application (Vercel / VPS) avec nom de domaine officiel et certificat SSL.

