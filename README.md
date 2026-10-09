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

## Production sur Vercel

Configure séparément les environnements **Production**, **Preview** et **Development** dans les paramètres Vercel. Les variables de production doivent être ajoutées comme secrets dans Vercel, jamais commitées dans le dépôt. Après une modification des variables, crée un nouveau déploiement.

Les tâches planifiées de `vercel.json` appellent les routes de purge des journaux d'e-mails et des événements analytiques. Elles exigent un `CRON_SECRET` fort, identique dans l'environnement Vercel Production.

## Organisation du code

- `src/app/[lang]/` : pages publiques localisées
- `src/app/backoffice/` : espace d'administration
- `src/app/api/` : routes API
- `src/views/` : vues de l'application et du back-office
- `src/lib/` : accès aux données, authentification, actions et services partagés
- `src/lib/email/` : templates, service d'envoi et providers SMTP/Resend
- `prisma/` : schéma et historique des migrations
- `scripts/` : outils d'administration, de migration, de seed et de test
