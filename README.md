# APTIC-R - Portail du volontariat international

Site public et espace de gestion d'APTIC-R, construit avec Next.js. Le site présente les activités de l'association, recueille les candidatures et demandes de partenariat, et fournit un back-office pour gérer les contenus et les dossiers.

## Stack

- Next.js 15, React 19 et TypeScript
- PostgreSQL via Prisma
- Neon pour les bases et le stockage objet
- Déploiement sur Vercel

## Prérequis

- Node.js 22 (voir `.mise.toml`)
- Corepack et pnpm 10
- Une branche Neon dédiée au développement, distincte de la production

## Développement local

```powershell
corepack enable
corepack pnpm install
corepack pnpm dev
```

Next.js charge `.env.development.local` en développement avant `.env`. Configure ce fichier local avec une URL `DATABASE_URL` vers une branche Neon non-production, `NEON_BRANCH`, un `NEXTAUTH_SECRET` local aléatoire et `NEXTAUTH_URL=http://localhost:3000`. Ne copie jamais les credentials de production dans un fichier de développement. `.env.example` est un modèle à valeurs fictives, pas une configuration exécutable.

L'application est disponible sur `http://localhost:3000`; les routes publiques ajoutent le préfixe de langue. Le back-office est accessible à `/backoffice/login`.

### E-mails

Tous les envois de l'application passent par le provider commun dans `src/lib/email`.

- `EMAIL_PROVIDER=smtp` force SMTP, par exemple vers Mailtrap Sandbox.
- `EMAIL_PROVIDER=resend` force Resend et nécessite `RESEND_API_KEY`.
- Si `EMAIL_PROVIDER` est vide, Resend est choisi quand `RESEND_API_KEY` est renseignée; sinon l'application utilise SMTP.

En production, configure Resend dans les variables Vercel et utilise un `MAIL_FROM` provenant d'un domaine vérifié chez Resend. En développement, utilise Mailtrap ou une clé Resend propre au développement. Ne déclenche pas de test d'envoi vers de vrais destinataires sans vérifier le provider actif.

## Vérifications

```powershell
corepack pnpm exec tsc --noEmit
corepack pnpm test:security
corepack pnpm build
```

Le script `postinstall` lance `prisma generate`. Avant tout build local, vérifie l'environnement effectif : Next.js peut charger `.env.production` pendant `next build`. Si ce fichier contient des credentials de production, injecte une configuration de build non-production ou ne lance pas le build local. Ne lance pas de migration ni de seed avant d'avoir vérifié explicitement la branche ciblée.

## Base de données

Le schéma est défini dans `prisma/schema.prisma`. Il utilise `DATABASE_URL`; aucun `DIRECT_URL` n'est déclaré actuellement. Toute migration doit d'abord être vérifiée sur une branche Neon non-production. Les fichiers d'environnement contenant des secrets sont ignorés par Git.

## Passation et mise en production

Cette procédure décrit le déploiement de l'état actuel du dépôt. Elle ne configure aucun service externe à votre place. Les comptes GitHub, Vercel, Neon, le domaine et, si nécessaire, Resend doivent appartenir à l'association et être accessibles à la personne qui reprend le projet.

### 1. Préparer les services

1. Donner à la personne qui reprend le site l'accès au dépôt GitHub et au projet Vercel. Relier le dépôt au bon projet Vercel et choisir la branche Git de production.
2. Dans Neon, identifier explicitement le projet et la branche de production. Garder les branches **Development**, **Preview** et **Production** séparées ; ne jamais utiliser les identifiants de production en local ou en Preview.
3. Activer le stockage objet Neon pour la branche concernée et créer les deux buckets attendus par le code : `documents` (documents privés) et `media` (fichiers destinés à être servis publiquement). Les noms sont définis dans `src/lib/storage.ts`.
4. Choisir le domaine public, le relier à Vercel et attendre que le certificat HTTPS soit actif avant d'envoyer des liens d'invitation ou de réinitialisation.
5. **Transfert/restauration :** le dépôt fournit des scripts pour créer un paquet portable chiffré de la base et des buckets `documents`/`media`, puis le restaurer dans un nouveau projet Neon. La procédure est dans [docs/portable-transfer.md](docs/portable-transfer.md). Elle est manuelle et n'a pas été exécutée sur les données réelles ; elle ne remplace pas une sauvegarde quotidienne automatisée.

### 2. Configurer les variables Vercel

Créer des variables distinctes pour **Production**, **Preview** et **Development** dans les paramètres du projet Vercel. Ne jamais copier les valeurs de production dans GitHub, `.env.example` ou un fichier partagé. Après un changement de variable, redéployer le projet.

Pour **Production**, prévoir au minimum :

| Variable | Valeur à fournir |
| --- | --- |
| `DATABASE_URL` | URL de connexion Neon pour l'application. Utiliser l'endpoint avec pooler recommandé pour les connexions de l'application serverless. |
| `DATABASE_URL_UNPOOLED` | Endpoint direct de la branche Neon de production ; il sert aux migrations Prisma. |
| `NEON_BRANCH` | Nom/identifiant de la branche de production, utile aux outils Neon. |
| `NEXTAUTH_SECRET` | Secret aléatoire long et unique pour les sessions. |
| `NEXTAUTH_URL` | URL HTTPS canonique du site déployé. |
| `NEXT_PUBLIC_SITE_URL` | Même URL HTTPS publique ; les liens d'e-mail et les URL canoniques s'appuient dessus. |
| `NEXT_PUBLIC_APP_URL` | URL HTTPS publique de l'application, utilisée comme repli par les modèles d'e-mail. |
| `AWS_ENDPOINT_URL_S3`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` | Identifiants/endpoints S3 compatibles fournis par Neon pour le stockage de la branche de production. Ne pas réutiliser ceux d'une autre branche. |
| `CRON_SECRET` | Secret aléatoire distinct, utilisé pour protéger les tâches planifiées. |

Pour l'envoi d'e-mails, ajouter `EMAIL_PROVIDER=resend`, `RESEND_API_KEY` et `MAIL_FROM`. `MAIL_FROM` doit appartenir à un domaine validé chez Resend. `MAIL_ADMIN` est facultatif et définit l'adresse de réception des notifications administratives. Si vous choisissez SMTP, définir `EMAIL_PROVIDER=smtp` et renseigner `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER` et `MAIL_PASSWORD` à la place.

`NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_GA_ID`, `GA4_PROPERTY_ID`, `GA4_CLIENT_EMAIL`, `GA4_PRIVATE_KEY`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` et `DEEPL_API_KEY` sont optionnelles selon les services utilisés. Les noms et commentaires figurent dans `.env.example`. Une clé d'e-mail absente ou un domaine d'expédition non validé signifie que les parcours d'e-mail ne sont pas prêts ; ne lancer aucun envoi de newsletter réel pour tester la configuration.

Pour **Preview**, utiliser une base et des identifiants de stockage Neon non-production. Ne jamais y ajouter la base, les clés de stockage ou les identifiants Resend de production. Laisser le fournisseur d'e-mails non configuré ou utiliser une boîte de test contrôlée. Pour **Development**, copier `.env.example` vers `.env.development.local` et compléter uniquement avec des identifiants de développement.

### 3. Vérifier le projet Vercel et déployer

- Framework : **Next.js** ; répertoire racine : racine du dépôt ; version Node : **22** (voir `.mise.toml`). Utiliser `pnpm`/Corepack et le `pnpm-lock.yaml` du dépôt.
- La commande de build est `pnpm build` (ou la commande Next.js équivalente configurée automatiquement par Vercel). Le `postinstall` du dépôt exécute `prisma generate` ; le build ne doit pas appliquer les migrations.
- Il n'y a pas de workflow GitHub Actions qui déploie ou migre la base. Le déploiement applicatif est déclenché par le branchement Git/Vercel ; les migrations sont une étape distincte et explicite ci-dessous.
- Vérifier dans le tableau de bord Vercel que la règle Firewall de limitation de débit sur `/api/newsletter/unsubscribe` est présente dans **le bon projet**, activée et dans le bon environnement. La règle existe dans la configuration partagée précédemment, mais son déclenchement réel doit être vérifié sur un déploiement Preview avant la production. Ne pas la recréer si elle est déjà active.
- `vercel.json` définit deux tâches hebdomadaires de nettoyage (`/api/cron/cleanup-email-logs` et `/api/cron/cleanup-analytics-events`). Elles nécessitent `CRON_SECRET` en Production. Vérifier dans Vercel que les tâches sont disponibles sur l'offre du projet et consulter leurs journaux après le déploiement.

Avant la première mise en ligne, exécuter depuis le commit qui sera livré :

```powershell
corepack pnpm install --frozen-lockfile
corepack pnpm exec prisma validate
corepack pnpm exec tsc --noEmit
corepack pnpm test:security
corepack pnpm build
```

### 4. Appliquer les migrations de production

Les fichiers SQL sous `prisma/migrations/` sont la seule source de migration. Ils seront appliqués dans leur ordre par `prisma migrate deploy`. **Ne pas utiliser `prisma db push`, `migrate reset` ou `migrate dev` sur la production.** Ne jamais lancer une migration avant d'avoir vérifié dans Neon que la cible est bien la branche de production attendue et distincte des autres branches. Faire/valider une sauvegarde avant cette étape.

Installer la CLI Vercel si elle n'est pas déjà présente, se connecter puis relier le dossier au bon projet (`vercel login`, puis `vercel link`). Procédure depuis Windows PowerShell :

```powershell
vercel env pull .env.production.local --environment=production
$production = @{}
Get-Content -LiteralPath '.env.production.local' -Encoding utf8 | ForEach-Object {
  if ($_ -match '^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
    $production[$matches[1]] = $matches[2].Trim().Trim('"').Trim("'")
  }
}
if (-not $production['DATABASE_URL_UNPOOLED']) { throw 'DATABASE_URL_UNPOOLED absent des variables Production.' }
$env:DATABASE_URL = $production['DATABASE_URL_UNPOOLED']
corepack pnpm exec prisma migrate status
```

Lire la sortie `migrate status` et confirmer une nouvelle fois la cible Neon (branche et endpoint), sans afficher/copier l'URL. Si elle est correcte et si la sauvegarde est vérifiée, appliquer les migrations :

```powershell
corepack pnpm exec prisma migrate deploy
corepack pnpm exec prisma migrate status
```

Après la commande, vérifier que Prisma annonce le schéma à jour. Le fichier `.env.production.local` contient des secrets : il est ignoré par Git, ne doit jamais être partagé et doit être retiré du poste de travail après l'opération. Cette étape est une action de production ; elle doit être exécutée et validée par la personne responsable du service.

### 5. Créer le premier compte administrateur

La page d'invitation ne crée pas le premier super-administrateur : elle est réservée aux comptes `SUPER_ADMIN`. Le dépôt contient `scripts/seed-admin.ts` pour l'initialisation ponctuelle. Après les migrations, fournir temporairement `DATABASE_URL` (avec l'endpoint direct confirmé), `ADMIN_EMAIL` et un mot de passe fort via l'environnement du terminal, puis lancer avec Node 22 ou supérieur :

```powershell
corepack pnpm exec node --experimental-strip-types scripts/seed-admin.ts
```

Ce script fait un `upsert` : si `ADMIN_EMAIL` existe déjà, il remplace son mot de passe et lui attribue le rôle super-administrateur. Choisir une adresse dédiée, vérifier qu'elle n'existe pas déjà, et ne jamais exécuter le script à chaque déploiement. Ne pas enregistrer le mot de passe initial comme variable Vercel permanente. Une fois connecté, inviter les autres administrateurs depuis `/backoffice/administrateurs` et retirer les valeurs temporaires du terminal.

### 6. Vérifications après déploiement

Avec le domaine HTTPS actif et un compte de test autorisé :

1. Vérifier le chargement des pages publiques dans les langues proposées et le responsive.
2. Vérifier la connexion au back-office, les rôles et l'accès direct aux pages sensibles.
3. Tester une candidature et un dossier de test de bout en bout : création, affichage/traitement au back-office et lecture autorisée de ses documents. Vérifier aussi un upload média dans `media`.
4. Vérifier les e-mails transactionnels uniquement vers des adresses de contrôle après validation Resend/SMTP, du domaine d'expédition et des liens construits avec le domaine de production.
5. Tester la désinscription sur une adresse de contrôle et déclencher la règle Firewall uniquement en Preview avec des requêtes répétées contrôlées.
6. Vérifier les journaux Vercel, les tâches planifiées et l'absence d'erreurs Prisma ou de stockage.
7. Ne pas envoyer de campagne aux abonnés avant d'avoir validé un envoi de test, la désinscription et la liste d'éligibilité avec consentement vérifiable.

Un rollback Vercel restaure le code, pas le schéma de la base. Toute stratégie de retour arrière des données doit être préparée séparément ; ne pas annuler manuellement une migration déjà appliquée sans procédure dédiée.

## Organisation du code

- `src/app/[lang]/` : pages publiques localisées
- `src/app/backoffice/` : espace d'administration
- `src/app/api/` : routes API
- `src/views/` : vues de l'application et du back-office
- `src/lib/` : accès aux données, authentification, actions et services partagés
- `src/lib/email/` : templates, service d'envoi et providers SMTP/Resend
- `prisma/` : schéma et historique des migrations
- `scripts/` : outils d'administration, de migration, de seed et de test
