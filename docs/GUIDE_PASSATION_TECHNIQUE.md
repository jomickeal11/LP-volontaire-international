# Guide de passation technique — APTIC-R

**Version du guide : 11 octobre 2026**  
Ce document décrit le dépôt tel qu'il est présent à cette date. Il aide un développeur à reprendre le projet ; il ne prouve pas que les comptes ou services externes sont déjà configurés.

## 1. Vue d'ensemble

APTIC-R est un portail de volontariat international construit avec Next.js 15 (App Router), React 19, TypeScript et PostgreSQL via Prisma. Les versions de référence sont indiquées dans `package.json`, `.mise.toml` et `pnpm-lock.yaml`.

| Emplacement | Rôle |
| --- | --- |
| `src/app/[lang]/` | Pages publiques localisées et formulaires |
| `src/app/backoffice/` | Connexion et pages du back-office |
| `src/app/api/` | Routes HTTP, stockage/téléchargement et tâches planifiées |
| `src/views/` | Vues publiques et composants du back-office |
| `src/lib/` | Prisma, authentification, autorisations, stockage, e-mails et actions serveur |
| `src/i18n/` | Traductions et contenu localisé ; les langues du projet incluent FR, EN et DE |
| `prisma/schema.prisma` | Modèles et connexion PostgreSQL |
| `prisma/migrations/` | Historique des migrations SQL Prisma |
| `scripts/` | Outils d'administration, de migration et tests ciblés |

Le déploiement applicatif est prévu sur Vercel. La présence de `vercel.json` et de `neon.ts` dans le dépôt ne confirme pas à elle seule qu'un projet Vercel ou Neon est lié, actif ou correctement configuré.

## 2. Environnement de développement local

### Prérequis

- Node.js 22 ( `.mise.toml` ) et Corepack ; pnpm 10.34.3 ( `package.json` ).
- Git et accès au dépôt.
- Une base PostgreSQL de développement, locale ou sur une branche Neon non-production.
- Pour tester le stockage : buckets et identifiants d'une branche Neon non-production.

Depuis la racine du dépôt, dans PowerShell :

```powershell
corepack enable
corepack pnpm install --frozen-lockfile
Copy-Item .env.example .env.development.local
```

Compléter `.env.development.local` avec des valeurs locales/non-production, puis lancer :

```powershell
corepack pnpm dev
```

Le site local utilise `http://localhost:3000` et le back-office `/backoffice/login`. Next.js charge `.env.development.local` en mode développement. Les fichiers `.env*` sont ignorés par Git, sauf `.env.example`. Ne jamais copier un secret réel dans `.env.example`, dans ce guide ou dans une archive partagée.

Prisma CLI doit également recevoir la variable `DATABASE_URL` dans son environnement. Vérifier, avant toute commande Prisma connectée, que cette variable pointe vers une base locale ou une branche explicitement non-production. Le schéma déclare `DATABASE_URL`; `DATABASE_URL_UNPOOLED` est un nom de configuration fourni comme aide dans `.env.example`, mais n'est pas déclaré comme datasource distinct dans `schema.prisma`. Pour migrations et opérations Prisma qui ont besoin d'une connexion directe, affecter l'endpoint direct confirmé à `DATABASE_URL` dans la session courante.

## 3. Variables d'environnement

Les noms ci-dessous proviennent de `.env.example` et des références du code. Les variables réellement requises varient selon les fonctions utilisées.

| Groupe | Variables | Utilisation / statut |
| --- | --- | --- |
| PostgreSQL | `DATABASE_URL` | Datasource Prisma et accès applicatif. En local, doit désigner une base de développement. |
| Endpoint direct | `DATABASE_URL_UNPOOLED` | Modèle fourni pour garder l'endpoint direct à portée de main. Prisma ne l'utilise pas directement dans le schéma actuel ; l'opérateur peut le placer dans `DATABASE_URL` pour les migrations après vérification de la cible. |
| Branche Neon | `NEON_BRANCH` | Présente dans `.env.example` ; aucune lecture runtime n'a été identifiée dans le code consulté. Ne remplace pas l'identification du projet et de l'endpoint dans Neon. |
| Session / liens | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` | `NEXTAUTH_SECRET` signe les sessions et doit être aléatoire. `NEXTAUTH_URL` sert de base de repli aux liens des modèles d'e-mail ; il doit correspondre à l'environnement. |
| URLs applicatives | `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_URL` | Liens e-mail, métadonnées et URL publiques. Utiliser l'URL HTTPS canonique en production. |
| Stockage objet | `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | Accès aux buckets Neon de la branche correspondante. Utiliser des identifiants différents entre développement, preview et production. |
| E-mail | `EMAIL_PROVIDER`, `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_ADMIN` | Choix du fournisseur, clé Resend, expéditeur et destinataire administratif facultatif. |
| SMTP | `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD` | Paramètres SMTP lorsque `EMAIL_PROVIDER=smtp`. Les identifiants doivent pointer vers une sandbox en développement. |
| Initialisation admin | `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD` | L'adresse et le mot de passe lus par `scripts/seed-admin.ts`. Le mot de passe n'est jamais à mettre dans Git ou dans une variable permanente Vercel. |
| Tâches planifiées | `CRON_SECRET` | Secret de protection utilisé par les deux routes cron déclarées. À définir dans les environnements où elles sont exécutées. |
| Analytics | `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_GA_ID`, `GA4_PROPERTY_ID`, `GA4_CLIENT_EMAIL`, `GA4_PRIVATE_KEY`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Configuration facultative Google Analytics/Search Console. Les données de rapport nécessitent les identifiants GA4 côté serveur. |
| Traduction | `DEEPL_API_KEY` | Facultative ; le code prévoit un comportement de repli si elle est absente. |
| Tests locaux | `TEST_BASE_URL`, `PROBE_BASE` | URLs de base optionnelles utilisées par certains scripts de vérification. |

`.env.example` contient des valeurs fictives et n'est pas une configuration prête à exécuter. Les scripts portables utilisent des variables distinctes `APTIC_SOURCE_*`, `APTIC_DEST_*` et `APTIC_TRANSFER_PASSPHRASE` : leur procédure figure dans `docs/portable-transfer.md`.

## 4. Prisma et migrations

Le schéma se trouve dans `prisma/schema.prisma` et déclare PostgreSQL avec `DATABASE_URL`. Les migrations sont versionnées sous `prisma/migrations/` et s'appliquent dans l'ordre des dossiers par Prisma.

Après avoir configuré une base isolée et confirmé sa cible dans le tableau de bord du fournisseur :

```powershell
corepack pnpm exec prisma validate
corepack pnpm exec prisma generate
corepack pnpm exec prisma migrate status
```

Pour appliquer les migrations en attente sur cette base confirmée :

```powershell
corepack pnpm exec prisma migrate deploy
corepack pnpm exec prisma migrate status
```

`migrate deploy` applique les migrations existantes ; il ne crée pas de nouvelle migration. Ne pas utiliser `prisma db push`, `migrate reset` ou `migrate dev` sur une base de production. Ne jamais appliquer de migration en production avant validation de la cible et de la sauvegarde/restauration.

Le `postinstall` de `package.json` lance `prisma generate`. En cas d'erreur Windows `EPERM`, fermer normalement les outils qui verrouillent Prisma, puis relancer `corepack pnpm exec prisma generate` ; ne pas supprimer de fichiers de données ni interrompre brutalement un processus.

## 5. Neon et stockage objet

L'application utilise PostgreSQL Neon et l'adaptateur `files-sdk/neon` dans `src/lib/storage.ts` :

- `documents` contient les documents privés de candidatures, partenariats et propositions ; leur accès passe par les routes protégées.
- `media` contient les médias et ressources rendus publics par l'application.

Les noms des buckets sont codés dans `src/lib/storage.ts`. `neon.ts` déclare ces réglages sous `preview` (`documents` privé et `media` en `public_read`) ; ne pas supposer que cela configure automatiquement chaque branche ou la production. Créer/activer le stockage et vérifier les droits des buckets dans le projet/branche Neon concernés. Les clés S3 doivent être propres à cette branche et ajoutées dans l'environnement correspondant.

L'application peut démarrer sans fournisseur e-mail, mais les fonctionnalités de stockage nécessitent la base et le stockage configurés pour être testées. Le simple fait d'avoir des variables présentes ne prouve pas que les buckets existent ni que les accès fonctionnent.

## 6. E-mails transactionnels

Le fournisseur commun est sélectionné dans `src/lib/email/index.ts` :

- `EMAIL_PROVIDER=resend` sélectionne Resend et requiert `RESEND_API_KEY`.
- `EMAIL_PROVIDER=smtp` sélectionne SMTP et requiert `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER` et `MAIL_PASSWORD`.
- Si le choix est vide, une clé Resend présente sélectionne Resend ; sinon le code sélectionne SMTP.

Le modèle `.env.example` choisit `resend` avec une clé vide : les envois échoueront tant qu'une clé n'est pas fournie. Les valeurs de repli SMTP dans le code ne remplacent pas les identifiants réels de la sandbox ou du serveur SMTP choisi.

`MAIL_FROM` définit l'expéditeur. En production, son domaine doit être vérifié chez le fournisseur choisi. Une clé absente ou une erreur du provider doit être traitée comme un échec, pas comme un envoi réussi. Les parcours d'invitation, de confirmation d'adresse, de réinitialisation et de newsletter ne sont pas réputés opérationnels tant qu'ils n'ont pas été vérifiés avec le fournisseur, le domaine et une adresse de contrôle.

Ne pas exécuter `scripts/test-mailtrap.ts`, `scripts/send-single-preview-email.ts` ni aucune action d'envoi vers une adresse réelle sans avoir confirmé les valeurs de l'environnement et utilisé une boîte de test contrôlée. Aucun envoi réel n'est validé par ce guide.

## 7. Back-office, rôles et premier compte

L'authentification est basée sur le compte `Utilisateur`, un cookie de session signé, et une vérification serveur de l'état du compte, du rôle et de la version de session. Les contrôles d'accès serveur sont centralisés dans `src/lib/admin-permissions.ts` et les actions/routes/page sensibles conservent leurs propres gardes serveur. Le masquage du menu ne constitue pas une autorisation.

Les rôles actuels sont :

| Rôle | Portée générale |
| --- | --- |
| `SUPER_ADMIN` | Accès complet, y compris comptes administrateurs, suppressions définitives autorisées et envoi effectif des campagnes. |
| `CONTENT_ADMIN` | Contenus éditoriaux, médias et préparation des campagnes ; pas de traitement des dossiers ni d'envoi de campagne. |
| `REQUEST_MANAGER` | Consultation/traitement des dossiers autorisés, documents associés, exports autorisés et contacts ; pas de gestion éditoriale ni de suppression définitive. |

Les anciennes chaînes de rôle (`SUPERADMIN`, `ADMIN`, `CONTENT_MANAGER`, `COORDINATOR`) sont temporairement normalisées par `normalizeAdminRole()` dans `src/lib/admin-permissions.ts`. La migration `20261011140000_admin_roles_invitations` ajoute les champs/invitations mais ne réécrit pas les rôles historiques ; ne pas convertir ni supprimer les anciens comptes sans une procédure explicite.

La page de gestion des comptes est `/backoffice/administrateurs` et est réservée au rôle super-administrateur. Pour le premier compte, `scripts/seed-admin.ts` exige `ADMIN_INITIAL_PASSWORD`, utilise `ADMIN_EMAIL` (ou une adresse par défaut dans le script) et effectue un **upsert** : si l'adresse existe, le mot de passe est remplacé et le rôle est fixé à `SUPERADMIN` (ancienne chaîne reconnue par la compatibilité actuelle). Le script charge dotenv depuis `.env` et ne charge pas automatiquement `.env.development.local` ; les variables du processus/shell doivent être fournies explicitement. Ce script est donc une opération de base réelle, à ne lancer qu'après avoir vérifié deux fois `DATABASE_URL` et choisi l'environnement voulu.

Commande prévue avec Node 22 prenant en charge `--experimental-strip-types` :

```powershell
corepack pnpm exec node --experimental-strip-types scripts/seed-admin.ts
```

Avant de l'exécuter, définir temporairement `DATABASE_URL`, `ADMIN_EMAIL` et `ADMIN_INITIAL_PASSWORD` dans une session sécurisée. Vérifier que l'adresse n'existe pas déjà si son mot de passe ne doit pas être remplacé. Ne pas mettre le mot de passe dans l'historique, `.env.example`, le dépôt ou Vercel. Après l'initialisation, confirmer la connexion et retirer les valeurs temporaires de la session.

## 8. Tests, vérifications et build

Les commandes déclarées dans `package.json` sont :

```powershell
corepack pnpm test:security
corepack pnpm test:portable-transfer
corepack pnpm exec tsc --noEmit
corepack pnpm exec prisma validate
corepack pnpm build
```

`test:security` exécute le test d'assainissement des e-mails. `test:portable-transfer` couvre localement le chiffrement, l'intégrité du conteneur, les clés d'objets et le manifeste ; il ne se connecte ni à Neon ni à un bucket. D'autres tests ciblés `scripts/*.test.mjs` existent. Les scripts ne sont pas tous encapsulés dans les scripts npm/pnpm ; exécuter uniquement les suites pertinentes en lisant leur portée, certains scripts du dépôt pouvant toucher des services configurés.

`tsc --noEmit` exclut `scripts/` selon `tsconfig.json`. `pnpm build` lance Next.js et Prisma peut être généré par `postinstall`. Le build peut charger des variables de production présentes localement : vérifier l'environnement avant de le lancer. Les commandes présentes dans le guide sont des procédures ; elles ne sont pas réputées passées sur le poste du repreneur. Le test unitaire portable a été exécuté pendant la préparation précédente et a réussi ; il ne remplace pas un test de bout en bout.

## 9. Déploiement Vercel

1. Créer ou sélectionner les comptes institutionnels GitHub, Vercel et Neon et donner l'accès au repreneur. Vérifier le dépôt distant et le projet Vercel dans leurs tableaux de bord ; le dépôt local seul ne prouve pas le rattachement.
2. Relier le dépôt au bon projet Vercel, configurer le runtime Node 22 et les variables séparément pour Production, Preview et Development.
3. Utiliser une base et un stockage non-production en Preview. N'ajouter les secrets de production qu'à l'environnement Production.
4. Vérifier dans Vercel que le domaine est relié et que le certificat HTTPS est actif avant d'activer les parcours par e-mail.
5. Examiner les journaux du déploiement et effectuer les vérifications de pages, authentification, rôles, formulaires et fichiers avec des données contrôlées.

`vercel.json` déclare deux tâches hebdomadaires : `/api/cron/cleanup-email-logs` à 03:00 UTC le dimanche et `/api/cron/cleanup-analytics-events` à 04:00 UTC le dimanche. Les routes exigent `CRON_SECRET`. Leur exécution effective, les quotas de l'offre Vercel et la présence de la Firewall doivent être confirmées dans le tableau de bord ; le dépôt ne les prouve pas.

Le dépôt courant ne contient pas de workflow GitHub Actions sous `.github/workflows`. Le déploiement Vercel via Git et l'exécution des migrations sont deux opérations distinctes. Vérifier la configuration réelle du projet avant le premier déploiement et ne pas supposer qu'une migration sera automatiquement appliquée par Vercel.

## 10. Procédure de livraison des migrations

Sur chaque environnement, confirmer d'abord le projet, la branche et la base dans le tableau de bord du fournisseur, puis injecter l'endpoint attendu dans `DATABASE_URL` uniquement pour la session Prisma. Sur un environnement isolé :

```powershell
corepack pnpm exec prisma migrate status
corepack pnpm exec prisma migrate deploy
corepack pnpm exec prisma migrate status
```

Sur la production, la personne responsable doit confirmer la cible Neon et la sauvegarde avant `migrate deploy`, puis relire l'état final. Ne jamais utiliser une URL provenant d'un `.env` non identifié. Ne jamais faire `db push` pour contourner une migration manquante. Ne lancer aucune migration de production depuis une session de développement.

## 11. Sauvegarde et restauration portable

La procédure complète pour exporter une base et les objets `documents`/`media`, chiffrer le paquet, créer les buckets de destination, restaurer et vérifier les références est dans **[docs/portable-transfer.md](docs/portable-transfer.md)**. Elle utilise des paramètres `APTIC_SOURCE_*`, `APTIC_DEST_*` et une phrase de chiffrement ; aucun projet Neon destination connu à l'avance n'est nécessaire.

Les scripts de transfert sont manuels, pas une sauvegarde quotidienne automatisée. Le test unitaire local ne valide pas une archive réelle. **Un export autorisé puis une restauration de test dans un nouveau projet/environnement isolé restent à effectuer** avant de considérer cette procédure comme validée pour une livraison de données. La restauration réelle n'a pas été exécutée pendant la préparation de ce guide.

## 12. État de confirmation à la passation

| Élément | Ce que le dépôt confirme | À confirmer par le repreneur |
| --- | --- | --- |
| Application | Stack, commandes pnpm, routes, modèles Prisma et scripts présents | Installation, build et comportement dans son environnement |
| Prisma | Historique des migrations versionné | État effectif de la base cible avant tout déploiement |
| Neon | Adaptateur de base et buckets attendu par le code | Projet/branche, buckets, permissions, identifiants et quotas |
| E-mail | Providers Resend et SMTP implémentés | Clés, domaine d'expédition, provider actif et envoi vers boîte de contrôle |
| Vercel | Fichier cron présent, application Next.js | Lien Git, variables par environnement, Firewall, offre et exécution cron |
| Transfert | Scripts et tests unitaires locaux présents | Export réel autorisé et restauration intégrale testée en environnement isolé |
| Premier administrateur | Script d'upsert présent | Cible DB, adresse prévue, mot de passe temporaire et connexion vérifiée |

Ce guide ne signale aucune configuration externe comme opérationnelle sans vérification dans le compte correspondant. Il ne documente pas de secrets et n'autorise pas à réutiliser ceux du précédent propriétaire.
