# Transfert portable APTIC-R

Cette procédure crée un paquet autonome pour transférer les données APTIC-R vers un projet Neon qui n'existe pas encore. Elle inclut un dump PostgreSQL au format custom, les objets des buckets `documents` et `media` sous leurs clés exactes, leurs types MIME, tailles, métadonnées personnalisées exposées par le SDK et empreintes SHA-256, ainsi qu'un manifeste. Le paquet `.apticr` est chiffré avec AES-256-GCM et une clé dérivée par scrypt. Les scripts ne sont pas un service de sauvegarde récurrent.

## Sécurité et limites

- Le paquet contient des données personnelles et des documents confidentiels. Le conserver sur un support chiffré, hors du dépôt Git, avec accès limité. Transmettre la phrase de chiffrement par un canal séparé.
- Le dump et les objets existent temporairement en clair pendant les scripts. `--workdir` doit désigner un dossier déjà créé sur un volume chiffré (par exemple BitLocker), hors du dépôt. Le nettoyage automatique n'est pas un effacement sécurisé des blocs d'un SSD.
- Ne pas utiliser une connexion poolée pour `pg_dump`/`pg_restore`. Les variables de connexion et clés ne sont jamais incluses dans le manifeste ou le paquet et ne doivent pas être copiées dans les commandes ou journaux partagés.
- Le dump contient le schéma et les données de la base, mais pas les rôles globaux PostgreSQL, leurs mots de passe ni leurs droits. Le propriétaire de la nouvelle base devient propriétaire des objets restaurés (`--no-owner --no-acl`). Les extensions doivent être disponibles avec les versions requises sur la destination ; le script les contrôle avant restauration.
- Le stockage objet et les réglages propres à Neon (création des buckets, droits, clés S3, branches et autres services) ne sont pas restaurés par PostgreSQL. Le code déclare les buckets `documents` privés et `media` en lecture publique dans `neon.ts` pour les déploiements preview ; vérifier les réglages de production attendus avant réouverture.
- La base et les buckets ne forment pas une transaction distribuée. Avant un export, placer l'application en maintenance ou suspendre les écritures et uploads. Le script compare l'inventaire des objets avant et après leur lecture, mais ne peut pas figer simultanément PostgreSQL et Neon Object Storage.
- Les références de `DocumentCandidature`, `DocumentPartenaire` et `DocumentPropositionProjet`, ainsi que les chemins `/uploads/...` trouvés dans les colonnes textuelles, sont contrôlés après restauration. Toute référence absente bloque le feu vert de remise en service. La validation des références existant dans le code est spécifique à ces modèles et formats de clés.
- L'archive ne contient aucune URL de connexion, clé d'accès ou secret. Elle contient cependant des clés d'objets, tailles, types, sommes de contrôle, une étiquette de source et des empreintes non réversibles des identités de la base et de l'endpoint de stockage. La restauration refuse ces deux empreintes si elles correspondent à la source.

## Prérequis

Installer Node.js 22+, les dépendances du projet (`corepack pnpm install --frozen-lockfile`) et les outils PostgreSQL `pg_dump`, `pg_restore`, `psql` ainsi que `tar`. Vérifier leurs versions localement. L'export source exige un endpoint Neon direct et des identifiants S3 en lecture sur les deux buckets. La restauration nécessite un nouveau projet/branche Neon, un endpoint direct, et des identifiants de stockage autorisant l'écriture et la lecture.

Créer à l'avance un dossier temporaire sur un volume chiffré et un dossier distinct pour le fichier final, tous deux hors du dépôt. Ne jamais faire pointer les commandes vers un dossier du projet. Choisir une phrase de chiffrement aléatoire d'au moins 20 octets et la conserver séparément.

## Créer l'archive après autorisation explicite

L'opérateur responsable doit obtenir une autorisation explicite avant tout export de production. Le script refuse l'étiquette `production` sans `--allow-production-export`, exige une confirmation identique du libellé, refuse d'écraser un fichier, demande un endpoint Neon direct et vérifie les variables nécessaires avant de démarrer.

Dans une session PowerShell privée, définir les variables depuis un gestionnaire de secrets ou les saisir sans les inscrire dans l'historique partagé :

```powershell
$env:APTIC_TRANSFER_PASSPHRASE = '<phrase longue conservée séparément>'
$env:APTIC_SOURCE_DATABASE_URL = '<endpoint direct de la base source>'
$env:APTIC_SOURCE_AWS_ENDPOINT_URL_S3 = '<endpoint S3 de la branche source>'
$env:APTIC_SOURCE_AWS_ACCESS_KEY_ID = '<clé source>'
$env:APTIC_SOURCE_AWS_SECRET_ACCESS_KEY = '<secret source>'
$env:APTIC_SOURCE_AWS_REGION = '<région source>'
```

Puis remplacer les chemins par les chemins réels des volumes chiffrés :

```powershell
node scripts/create-portable-transfer.mjs `
  --source-label production `
  --confirm-source-label production `
  --allow-production-export `
  --workdir 'D:\APTIC-R-temp-chiffre' `
  --output 'E:\transfert-securise\apticr-complet.apticr'
```

Pour une source non-production, utiliser une étiquette explicite telle que `development`, confirmer exactement cette étiquette et omettre `--allow-production-export`. Le script exporte PostgreSQL, liste et télécharge tous les objets des deux buckets, vérifie que l'inventaire n'a pas changé, calcule le manifeste, chiffre l'archive, puis la déchiffre et valide localement son contenu. Aucune de ces opérations n'a été lancée dans le cadre de la préparation du code.

Le résultat affiche seulement les volumes et nombres d'objets, jamais les clés, URLs ou secrets. Conserver le fichier `.apticr` et la phrase séparément. Après copie vérifiée sur le support de conservation, supprimer le paquet local et les variables temporaires selon la politique de sécurité de l'organisation.

## Restaurer dans un nouveau projet Neon

1. Créer un nouveau projet Neon et une branche dédiée. Préparer une base vide avec son endpoint **direct**. Activer le stockage objet sur cette branche et créer les buckets `documents` (privé) et `media` (lecture publique si cette politique est toujours souhaitée). Récupérer les nouvelles clés S3 propres à cette branche. Ne réutiliser aucune clé du projet source.
2. Vérifier manuellement le nom du projet, de la branche, de l'hôte et de la base dans Neon. Les deux buckets et la base cible doivent être vides. Créer un dossier temporaire sur un volume chiffré, hors dépôt.
3. Définir les variables `APTIC_TRANSFER_PASSPHRASE`, `APTIC_DEST_DATABASE_URL`, `APTIC_DEST_AWS_ENDPOINT_URL_S3`, `APTIC_DEST_AWS_ACCESS_KEY_ID`, `APTIC_DEST_AWS_SECRET_ACCESS_KEY` et `APTIC_DEST_AWS_REGION` avec les valeurs de destination. Ne jamais les committer.
4. Lancer la commande ci-dessous uniquement après confirmation indépendante que la destination est bien le nouveau projet et qu'elle peut être remplie :

```powershell
node scripts/restore-portable-transfer.mjs `
  --bundle 'E:\transfert-securise\apticr-complet.apticr' `
  --workdir 'D:\APTIC-R-temp-chiffre' `
  --confirm-destination-host '<hôte Neon direct exact>' `
  --confirm-destination-database '<nom exact de la base>' `
  --confirm-empty-database RESTORE-INTO-EMPTY-DATABASE
```

Le script refuse une source identique, une base non vide, des buckets non vides, des extensions indisponibles, un manifeste ou contenu incohérent. Il vérifie les fichiers avant écriture, chaque objet après transfert, l'inventaire final des buckets et les références en base. Les écritures d'objets précèdent la restauration SQL ; si une erreur survient, le script ne supprime rien. Abandonner cette destination partiellement remplie et recommencer sur de nouveaux buckets et une base vide plutôt que de réutiliser un état incomplet.

5. Avant de connecter l'application, vérifier le résultat de `pg_restore`, exécuter `corepack pnpm exec prisma migrate status` avec la nouvelle base, puis `corepack pnpm exec prisma generate`. Ne pas utiliser `prisma db push`. Vérifier les extensions, les contenus publics et les documents privés avec des comptes de test autorisés, et contrôler l'inventaire des objets contre le manifeste.
6. Configurer les variables de l'application avec les nouvelles valeurs de destination. Vérifier les buckets et permissions dans le tableau de bord Neon, puis effectuer les tests fonctionnels isolés. Ne reconnecter Vercel au nouveau projet qu'après validation de la base, des fichiers, de l'authentification et des documents.

La restauration ne configure pas les comptes, domaines, fournisseur d'e-mail, DNS, variables Vercel, plan Neon, pare-feu, tâches planifiées ou autres intégrations externes. Régénérer les identifiants et secrets applicatifs plutôt que de transférer ceux d'un ancien environnement.

## Vérifications locales sans données réelles

```powershell
corepack pnpm test:portable-transfer
node --check scripts/portable-transfer-lib.mjs
node --check scripts/create-portable-transfer.mjs
node --check scripts/restore-portable-transfer.mjs
git diff --check
```

Ces tests couvrent le chiffrement authentifié, la détection d'une phrase incorrecte et d'une archive altérée, les clés d'objets et le manifeste. Ils ne valident pas une connexion Neon, un export de données réelles ni une restauration complète ; un test de restauration isolé avec un paquet réel reste une étape obligatoire avant mise en service.
