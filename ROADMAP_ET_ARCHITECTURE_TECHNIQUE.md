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

## 6. Plan d'Exécution en 11 Phases

### Phase 0 — Cadrage technique (1–2 jours)
- Transformer le cahier des charges en spécifications fonctionnelles et techniques détaillées.
- Définir l'arborescence des routes (`/`, `/apply`, `/partner`, `/admin/*`, `/[lang]/*`).
- Définir la matrice des rôles et permissions (Public, Coordinateur, Admin).
- Définir le schéma relationnel PostgreSQL et les entités Prisma.
- Spécifier le workflow d'état des candidatures.
- Valider l'architecture logicielle globale.

### Phase 1 — Figma / Design System (3–5 jours)
- Valider la palette chromatique 90/10 (Blanc, Gris ardoise, Bleu institutionnel `#1B4F7C`, Vert naturel `#2E7D52`).
- Finaliser la typographie (`DM Serif Display`, `Outfit`, `JetBrains Mono`).
- Créer la bibliothèque de composants vectoriels (zéro emoji).
- Spécifier les états UI (Default, Hover, Active, Focus, Disabled, Error, Loading).
- Concevoir les déclinaisons responsive (Desktop 1920/1366, Tablette 768, Mobile 375).
- Maquetter la Landing Page, le formulaire Candidat (9 étapes), le formulaire Partenaire et le Dashboard Admin.

### Phase 2 — Initialisation du projet (1 jour)
- Scaffold Next.js 15 (App Router) + TypeScript + Tailwind CSS v4.
- Configuration Prisma ORM + connexion PostgreSQL.
- Configuration ESLint, Prettier, variables d'environnement (`.env.example`).
- Structure modulaire des répertoires (`app/`, `components/`, `lib/`, `types/`, `actions/`).

### Phase 3 — Site public & Landing Page (5–7 jours)
Développer l'ensemble des sections publiques avec direction artistique premium :
1. `Header` fixe avec sélecteur de langue et CTA Vert.
2. `Hero` immersif avec photo collaborative documentaire et titre serif.
3. `DualPath` (Volontaires vs Organisations).
4. `Why volunteer` (4 cartes blanches institutionnelles).
5. `The Challenge` (Progression Problème $\rightarrow$ Innovation $\rightarrow$ Impact).
6. `Your Mission` (5 étapes de co-création).
7. `What Could You Build?` (Projet phare + 4 projets secondaires asymétriques).
8. `Profiles Sought` (Socle visuel commun pour les 4 filières).
9. `Not an Expert` (Section qualités avec badges vectoriels).
10. `Week with APTIC-R` (Timeline 7 jours homogène).
11. `Life in Togo` (Galerie photo culturelle et humaine).
12. `Agbélouvé` (Carte, environnement et données de base).
13. `Support` (8 cartes de soutien + Tableau transparent des inclusions).
14. `Application process` (Timeline 6 étapes).
15. `Partners` (Cadres de référence européens).
16. `Testimonials` (Citations authentiques).
17. `FAQ` (Accordéon interactif).
18. `Final CTA` & `Footer` institutionnel.

### Phase 4 — Multilingue (2–3 jours)
- Intégration de la localisation FR / EN / DE.
- Routage préfixé ou détection automatique de la langue.
- Balises SEO `hreflang` et balises OpenGraph par langue.
- Adaptation fluide et responsive des libellés dans les 3 langues.

### Phase 5 — Backend & Candidature (5–7 jours)
- Formulaire multi-étapes avec validation Zod synchrone et persistante.
- Server Actions pour l'enregistrement en base de données.
- Module d'upload de fichiers (CV, lettre, portfolio) vers stockage cloud S3/Supabase avec contrôle de type MIME et taille max (10 Mo).
- Génération d'une référence unique de candidature (`APTIC-2025-XXXX`).
- Email automatique de confirmation au candidat et notification à l'équipe.

### Phase 6 — Partenariats Organisations (2–3 jours)
- Formulaire dédié pour les organisations d'envoi européennes.
- Validation Zod et enregistrement de la demande (`PartnerRequest`).
- Envoi automatique de confirmation et notification interne.

### Phase 7 — Back-office Administrateur (5–7 jours)
- Authentification sécurisée (NextAuth v5 / Auth.js) avec hash bcrypt et sessions JWT.
- Table de bord central avec KPIs en temps réel (total candidatures, réparties par statut, pays, filière).
- Tableau interactif des candidatures avec filtres avancés (statut, filière, pays, disponibilité, recherche texte).
- Fiche candidat détaillée : consultation des données, visualisation et téléchargement sécurisé des CV/lettres.
- Système d'ajout de notes internes pour l'équipe APTIC-R.
- Export des données en format CSV / Excel.

### Phase 8 — Workflow des Candidatures (2 jours)
- Système de transition d'état à 9 étapes avec audit trail (qui a changé quoi et quand).
- Déclenchement d'emails automatiques lors du changement de statut (ex: convocation à l'entretien).
- Assignation d'un candidat à un membre de l'équipe coordinatrice.

### Phase 9 — Analytics & Télémétrie (2–3 jours)
- Tracking des événements clés du funnel :
  - `apply_now_click`
  - `application_started`
  - `application_step_X_completed`
  - `application_submitted`
  - `partner_request_submitted`
  - `language_switch`
- Dashboard interne de suivi des conversions et sources d'acquisition.

### Phase 10 — SEO, Sécurité, Performance & Mise en Production (3–5 jours)
- Optimisation des performances : images WebP/AVIF avec `next/image`, minification, compression Brotli/Gzip.
- Score Google PageSpeed > 85/100 (Mobile & Desktop).
- Sécurisation : Rate limiting sur les formulaires, en-têtes HTTP sécurisés (CSP, HSTS, X-Frame-Options), protection CSRF.
- Déploiement en production (Vercel / AWS / VPS), configuration DNS, certificats SSL/HTTPS.
- Formation de l'équipe APTIC-R à la gestion quotidienne du back-office.
