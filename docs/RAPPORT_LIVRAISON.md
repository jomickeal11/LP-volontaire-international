# Rapport de livraison — APTIC-R

**État documentaire au 11 octobre 2026**
Ce rapport décrit les éléments présents dans le dépôt et les vérifications dont les résultats sont disponibles. Il ne vaut pas confirmation d’un déploiement ni de la configuration des services externes.

## 1. Périmètre livré

Le dépôt contient un portail APTIC-R multilingue (français, anglais et allemand) et un back-office destiné à administrer les contenus et les demandes. Les fonctionnalités présentes comprennent notamment :

- les formulaires publics de candidature, partenariat, proposition de projet, adhésion, participation à un événement et contact ;
- la gestion éditoriale des articles, projets, événements, ressources, médias, albums, témoignages et pages disponibles ;
- le traitement des dossiers, avec rôles `SUPER_ADMIN`, `CONTENT_ADMIN` et `REQUEST_MANAGER` et contrôles côté serveur ;
- la gestion des abonnés et des campagnes newsletter, incluant brouillons, aperçu, envoi de test et parcours d’envoi réel prévu dans le code ;
- l’authentification du back-office, les invitations et les parcours de récupération/changement de compte.

La présence d’une fonctionnalité dans le code ne confirme pas qu’elle est raccordée à des services externes ni validée en production. Les réserves connues sont détaillées plus bas.

## 2. Technologies et architecture

| Élément | Technologie / rôle |
| --- | --- |
| Application | Next.js 15, App Router, React 19 et TypeScript |
| Données | PostgreSQL et Prisma ORM, avec migrations versionnées |
| Stockage de fichiers | Neon Object Storage compatible S3, buckets `documents` et `media` |
| E-mails | Fournisseurs Resend ou SMTP sélectionnables par configuration |
| Déploiement prévu | Vercel ; le dépôt contient aussi `vercel.json` pour des tâches planifiées |
| Outils de développement | Node.js 22 et pnpm (versions précisées dans les fichiers du projet) |

L’application, la base, le stockage objet et le fournisseur d’e-mails nécessitent chacun une configuration propre à l’environnement. Les fichiers du dépôt ne prouvent pas que les comptes ou services correspondants sont actifs.

## 3. Documents remis

- [Guide technique de passation](GUIDE_PASSATION_TECHNIQUE.md) : installation, configuration, Prisma, services, rôles, déploiement et initialisation du premier administrateur.
- [Guide d’utilisation du back-office](GUIDE_UTILISATION_BACKOFFICE.md) : parcours d’administration et recommandations à destination des utilisateurs.
- [Transfert portable de la base et des fichiers](portable-transfer.md) : procédure manuelle de création et de restauration d’une archive complète.
- `README.md` et `.env.example` : démarrage du projet et modèle de configuration sans secrets.

Les guides distinguent les procédures documentées des opérations effectivement réalisées.

## 4. Vérifications et tests

### Tests automatisés attestés

Les résultats déjà consignés pour la préparation du transfert portable indiquent :

- `corepack pnpm test:portable-transfer` : **4 tests réussis sur 4**. Ils couvrent le chiffrement authentifié, le rejet d’une phrase incorrecte ou d’une archive altérée, les clés d’objets et le manifeste d’intégrité ;
- `node --check` sur les scripts de transfert : syntaxe validée ;
- `git diff --check` : aucune erreur d’espacement signalée dans la vérification rapportée.

Ces tests sont locaux et n’utilisent ni base, ni bucket, ni archive de données réelles. Ils ne démontrent pas qu’une restauration complète fonctionne sur Neon. Aucun test général, build complet ou parcours navigateur n’est déclaré réussi dans ce rapport sans résultat attesté.

### Vérifications en environnement réel

Les éléments suivants restent **non vérifiés** : déploiement et configuration Vercel, état des migrations sur la base de livraison, envoi/réception d’e-mails, téléversement et téléchargement sur les buckets de l’environnement cible, export d’une archive réelle et restauration complète sur une nouvelle base Neon. Aucune sauvegarde ou restauration réelle n’est déclarée effectuée.

## 5. Accès et configurations à fournir ou finaliser

Le responsable de l’association ou la personne technique devra organiser, sous contrôle de l’association :

- les accès institutionnels au dépôt GitHub et au projet Vercel ;
- le projet et la branche Neon destinés à chaque environnement, avec les variables de connexion gérées hors du dépôt ;
- les buckets et identifiants S3 correspondants, avec `documents` privé et la politique d’accès appropriée pour `media` ;
- le domaine, son DNS et le HTTPS ;
- le choix du fournisseur e-mail (Resend ou SMTP), ses identifiants, l’adresse d’expédition et la validation du domaine ;
- les secrets d’environnement requis, dont les secrets de session et de tâches planifiées, fournis au moyen d’un gestionnaire adapté ;
- le compte du premier super-administrateur et les comptes nominatifs des personnes autorisées.

Ne pas inscrire de secrets dans Git, dans les guides ou dans les échanges ordinaires. Les variables doivent être configurées séparément pour développement, aperçu et production. Les intégrations facultatives (par exemple analytics ou traduction) ne sont à activer que si l’association les utilise.

## 6. Réserves connues

- **E-mails :** les parcours sont présents dans le code, mais le fournisseur, les identifiants, le domaine d’expédition et la délivrabilité doivent être configurés puis testés avec une boîte de contrôle. L’envoi réel aux abonnés n’est pas validé ici.
- **Newsletter :** l’envoi de test envoie un véritable message à l’adresse saisie ; le lancement d’une campagne contacte les abonnés éligibles. Le bouton ZIP d’export des abonnés n’est pas fiable dans la version décrite par le guide d’utilisation : ne pas utiliser le fichier produit comme une archive ZIP exploitable.
- **Base et fichiers :** la procédure de transfert portable et ses tests unitaires sont documentés, mais l’export d’une archive réelle et sa restauration dans une nouvelle base Neon isolée restent à effectuer et à contrôler avant passation de données.
- **Stockage objet :** la présence de l’intégration ne confirme ni l’existence des buckets sur la branche cible ni les permissions effectives. Des essais contrôlés de lecture et d’écriture sont nécessaires avant ouverture du service.
- **Tâches planifiées et Firewall :** les définitions présentes dans le dépôt ne confirment pas leur activation ni leur comportement dans le tableau de bord Vercel. À vérifier dans le compte propriétaire.

## 7. Recommandations de prise en main et de maintenance

1. Transférer la propriété des comptes et du dépôt à des adresses institutionnelles, puis créer des comptes individuels avec le rôle minimal nécessaire.
2. Configurer d’abord un environnement isolé ; confirmer la cible avant toute migration ou opération de données.
3. Tester les parcours de formulaires et le traitement dans le back-office avec des données de contrôle, puis vérifier les e-mails avec une boîte dédiée.
4. Avant toute livraison de données, réaliser une archive chiffrée hors du dépôt et exécuter une restauration complète dans un environnement isolé. Conserver séparément l’archive et sa phrase de chiffrement.
5. Vérifier périodiquement les mises à jour, journaux d’erreurs, tâches planifiées, accès administrateurs, permissions de stockage et capacité à restaurer.
6. Limiter les exports et téléchargements de dossiers confidentiels au besoin métier ; protéger et supprimer les copies temporaires.

## 8. Checklist de remise

- [ ] Les accès GitHub, Vercel et Neon sont détenus par l’association et le repreneur est ajouté.
- [ ] Les environnements, domaines et variables sont configurés sans partager les secrets dans le dépôt.
- [ ] Les migrations sont contrôlées puis appliquées à la base cible selon une procédure validée.
- [ ] Les buckets et leurs permissions sont vérifiés avec des fichiers de test non personnels.
- [ ] Le fournisseur e-mail et le domaine d’expédition sont configurés ; les parcours sont testés sur une boîte de contrôle.
- [ ] Les rôles et comptes nominatifs sont vérifiés avec les personnes responsables.
- [ ] Une archive portable réelle est créée après autorisation et une restauration est validée sur un environnement isolé.
- [ ] Le défaut d’export newsletter ZIP est pris en compte avant tout usage de cette fonction.
- [ ] Les responsables ont reçu les guides technique et utilisateur ainsi que les consignes de sauvegarde et de sécurité.

## Éléments restant à confirmer

La remise opérationnelle dépend encore de la confirmation des accès et configurations externes, des essais contrôlés de stockage et d’e-mail, de la vérification de la base cible et d’un test de restauration à partir d’une archive réelle. L’export newsletter ZIP doit être corrigé ou explicitement laissé inutilisé avant de s’y fier.

## 9. Responsive et compatibilité multi-écrans

L’inspection statique a recensé **82 fichiers `page.tsx`**. Aucun test visuel en navigateur n’a été effectué dans le cadre de l’audit. Trois risques ont été identifiés dans le code : le titre de la bannière partenaires sur mobile, l’utilisation des tableaux du back-office sur les petits écrans et la hauteur du menu mobile. Ce sont des risques détectés dans le code, et non des défauts confirmés visuellement. Les autres pages et composants n’ont pas tous été vérifiés visuellement.

La vérification complète du responsive sur téléphone, tablette et ordinateur reste à effectuer. Le détail des constats et les tailles de référence figurent dans le [rapport d’audit responsive](AUDIT_RESPONSIVE.md) ; les six dimensions qui y sont listées n’ont pas été testées visuellement.
