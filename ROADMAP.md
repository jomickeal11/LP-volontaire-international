# 🚀 APTIC-R — Portail de Volontariat International
## Feuille de Route & État d'Avancement du Projet

> [!NOTE]
> **Organisation :** APTIC-R (*Association pour la Promotion des TIC en milieu Rural au Togo*)  
> **Localisation :** Agbélouvé, Région Maritime, Togo  
> **Missions :** Volontariat international de 6 à 12 mois & Partenariats institutionnels  
> **Dernière mise à jour :** Septembre 2026 — **Niveau d'achèvement global : ~88%**

---

# 📊 1. Synthèse Globale de l'Avancement (~88%)

| Phase | Intitulé & Périmètre | Statut | Progression | Reste à faire |
| :---: | :--- | :---: | :---: | :--- |
| **0** | **Cadrage technique & Architecture** | 🟢 Validé | **100%** | *Rien — Validé* |
| **1** | **Design System & Charte institutionnelle** | 🟢 Validé | **100%** | *Rien — Validé* |
| **2** | **Initialisation technique (Next.js 15, Prisma, PostgreSQL)** | 🟢 Validé | **100%** | *Rien — Validé* |
| **3** | **Site public & Landing Page (18 sections + SEO)** | 🟢 Validé | **100%** | *Rien — Validé* |
| **4** | **Multilinguisme international intégral (FR · EN · DE)** | 🟢 Validé | **100%** | *Rien — Validé* |
| **5** | **Formulaire Candidature (9 étapes) & BDD** | 🟡 Très avancé | **90%** | E-mails réels de confirmation |
| **6** | **Formulaire Partenariats B2B & Espace Dédié** | 🟡 Très avancé | **90%** | E-mails réels de confirmation |
| **7** | **Back-office Administrateur (KPI, Listes, Fiches, Exports)** | 🟢 Validé | **100%** | *Rien — Validé* |
| **8** | **Workflow Candidatures (9 statuts, Notes, Historique)** | 🟡 En place | **85%** | Assignation aux coordinateurs |
| **9** | **Télémétrie & Analytics (Funnels, Événements)** | 🟢 Opérationnel | **95%** | ID flux GA4 réel en prod |
| **10**| **Mails réels, Stockage Cloud S3 & Déploiement** | 🔴 À finaliser | **25%** | Clés API SMTP/S3 + Hébergement |

---

# ✅ 2. Ce qui a été fait (100% Validé & Opérationnel)

| Pôle | Fonctionnalités validées et intégrées |
| :--- | :--- |
| 🌐 **Vitrine Publique** | • **18 sections complètes** : Présentation Agbélouvé, double parcours, défi rural, projets low-tech, profils recherchés, cadre de prise en charge, FAQ, contact officiel.<br>• **Trilinguisme complet (FR · EN · DE)** avec sous-routage `/[lang]` et balises SEO canoniques `hreflang`.<br>• **Référencement & Réseaux** : Métadonnées OpenGraph, Twitter Cards, `robots.txt` et `sitemap.xml` dynamiques.<br>• **Coordonnées réelles** : Téléphone `+228 91 20 19 90` et e-mail `aptic.rural19@gmail.com`. |
| 👤 **Parcours Candidats** | • **Formulaire multi-étapes (9 étapes)** avec indicateur de progression traduit (`PROGRESS` / `FORTSCHRITT` / `PROGRESSION`).<br>• **Sauvegarde automatique locale (brouillon)** permettant la reprise de saisie sans perte de données.<br>• **Règles métier strictes** : Français et Anglais obligatoires + seuil de 50 caractères minimum sur la motivation et les projets.<br>• **Upload sécurisé** de CV, lettre de motivation et portfolio avec streaming protégé.<br>• **Référence unique** (`CAND-2026-XXXX`) et écran de succès trilingue personnalisé. |
| 🤝 **Parcours Partenaires** | • **Espace dédié B2B** pour les organismes d'envoi européens (*weltwärts*, *France Volontaires*, *CES*, universités, ONG).<br>• **Formulaire organisation** avec téléversement de plaquette officielle et validation Zod.<br>• **Règle "Zéro faux partenaire"** : Aucun logo fictif affiché, état zéro propre et professionnel.<br>• **Référence unique** (`PART-2026-XXXX`) et écran de confirmation adapté à la langue. |
| ⚙️ **Back-Office Admin** | • **Accès sécurisé** par sessions chiffrées JWT (`admin@apticr.tg`).<br>• **Dashboard opérationnel** avec compteurs et métriques d'activité en temps réel.<br>• **Candidatures & Répertoire** : Recherche instantanée, calcul automatique de l'âge, filtres combinés (statut, pays, compétences).<br>• **Fiches détaillées** : Visualisation complète des dossiers, téléchargement des pièces jointes en streaming sécurisé, notes internes horodatées.<br>• **Exports CSV / Excel** fonctionnels sur toutes les listes. |
| 📈 **Télémétrie & Analytics** | • **Entonnoirs de conversion (Funnel)** complets pour candidats et partenaires.<br>• **Répartition des données** : Par pays d'origine, langue de navigation et canal d'acquisition.<br>• **Journal des événements** persistant en base PostgreSQL (`EvenementStatistique`). |

---

# 🎯 3. Ce qu'il reste à faire pour finir à 100%

| Chantier | Priorité | Tâches concrètes à exécuter |
| :--- | :---: | :--- |
| **1. E-mails Transactionnels Réels** | 🔴 **Haute** | ◽ Connecter un transporteur de mail (ex. **Resend** ou **Nodemailer SMTP**).<br>◽ Envoyer l'accusé de réception automatique au **candidat** (`CAND-2026-XXXX`) dans sa langue.<br>◽ Envoyer l'accusé de réception automatique à l'**organisation partenaire** (`PART-2026-XXXX`).<br>◽ Envoyer l'alerte immédiate à l'**équipe APTIC-R** (`aptic.rural19@gmail.com`) à chaque nouvelle soumission. |
| **2. Assignation des Dossiers** | 🟡 **Moyenne** | ◽ Ajouter un sélecteur de coordinateur référent dans la fiche candidat (`assignedToId`).<br>◽ Ajouter un filtre par coordinateur assigné dans la table des candidatures. |
| **3. Stockage Cloud des Fichiers** | 🔴 **Haute (Prod)** | ◽ Remplacer le stockage local `/uploads` par un bucket persistant (**Supabase Storage**, **Cloudflare R2** ou **AWS S3**) pour supporter l'hébergement cloud serverless (ex: Vercel).<br>◽ Conserver la route d'API de streaming sécurisé pour protéger les documents. |
| **4. Déploiement en Production** | 🟢 **Mise en ligne** | ◽ Héberger la base PostgreSQL en ligne (ex: **Supabase** / **Neon**).<br>◽ Déployer l'application web Next.js (sur **Vercel** ou serveur VPS avec PM2/Docker).<br>◽ Configurer le domaine officiel avec certificat SSL HTTPS.<br>◽ Renseigner l'identifiant réel Google Analytics (`NEXT_PUBLIC_GA_ID`) dans le `.env`. |

---

# 💻 4. Repères Techniques & Accès Rapides

* **Framework :** Next.js 15 (App Router, Server Actions, React 19)
* **Base de données :** PostgreSQL via Prisma ORM 6
* **Design & Styles :** Tailwind CSS v4
* **Couleurs de la charte :** Bleu Institutionnel `#174F7A` · Vert Écologique `#35A85A` · Fond `#F5F7F9`
* **Compte Admin racine :** `admin@apticr.tg` / `ChangeMe2025!`
* **Démarrage serveur local :** `npm run dev` (Port 3000)
