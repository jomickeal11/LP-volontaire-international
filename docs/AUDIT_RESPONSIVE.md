# Audit responsive — APTIC-R

**Périmètre : inspection statique du dépôt, 11 octobre 2026**
Cet audit ne modifie pas l’application. Aucun navigateur automatisé ou outil de capture de pages n’est disponible dans l’environnement de travail : les tailles de référence n’ont donc pas été testées visuellement. Un constat « détecté dans le code » décrit un risque directement lisible dans les styles, pas un défaut reproduit à l’écran.

## Synthèse

- **82 fichiers `page.tsx` recensés** : 32 pages publiques sous `[lang]`, 18 entrées back-office sous `[lang]` (compatibilité/localisation) et 32 pages back-office hors de ce segment. Ce nombre compte les modules de page, pas les URLs générées pour chaque langue ou chaque paramètre dynamique.
- **Routes réellement testées visuellement : 0.** Les dimensions 320 × 568, 375 × 812, 430 × 932, 768 × 1024, 1366 × 768 et 1920 × 1080 n’ont pas pu être ouvertes dans un navigateur.
- **Aucun problème n’est confirmé visuellement.** Trois risques responsive sont détectés dans le code ; ils nécessitent une vérification d’écran avant d’être qualifiés de défauts reproduits.

### Site public

Le site partage des layouts localisés, un en-tête, un pied de page et des vues pour les pages de contenu et les formulaires. Plusieurs vues emploient des colonnes adaptatives et des images cadrées. Un risque notable de texte de bannière non repliable concerne la vue de présentation des partenaires. Le menu mobile est borné et défilable, mais son comportement avec la hauteur dynamique des navigateurs mobiles reste à contrôler.

### Back-office

Le layout utilise une barre latérale fixe sur grand écran, un panneau superposé sur petit écran et une zone de navigation défilable. Les tableaux de plusieurs listes gardent une largeur minimale importante et se parcourent horizontalement sur les écrans étroits. Le code prévoit des limites de hauteur et du défilement pour plusieurs modales ; leur confort tactile et leur hauteur réelle ne sont pas vérifiés.

## Problèmes et risques détectés

| Priorité / gravité | Page ou route | Composant concerné | Taille concernée | Constat et preuve dans le code | Vérification | Correction recommandée |
| --- | --- | --- | --- | --- | --- | --- |
| 1 — Élevée | `/[lang]/partners` et `/[lang]/partenaires` | `src/views/PartnerLandingView.tsx` (bannière) | 320, 375 et 430 px ; règle active sous 640 px | La deuxième ligne du titre reçoit `whitespace-nowrap` jusqu’au breakpoint `sm` (ligne 763) alors que son texte est fourni par les paramètres de contenu (lignes 598–600). Le conteneur de la vue applique `overflow-x-hidden` (ligne 698). Un texte long en FR/EN/DE peut donc dépasser la largeur disponible et être coupé plutôt que revenir à la ligne. | Détecté dans le code ; longueur réelle des valeurs de contenu et rendu non vérifiés. | Autoriser le retour à la ligne sur mobile ou borner explicitement cette ligne ; vérifier les trois langues aux trois largeurs mobiles. |
| 2 — Moyenne | Listes `/backoffice/applications`, `/backoffice/candidates`, `/backoffice/partners/requests`, `/backoffice/partners`, `/backoffice/project-proposals`, `/backoffice/albums`, `/backoffice/medias`, `/backoffice/analytics` et `/backoffice/administrateurs` | Tableaux des vues admin | 320, 375, 430 px ; certains également à 768 px | Les tableaux ont des `min-width` de 680 à 900 px et sont placés dans des conteneurs `overflow-x-auto` (par ex. `AdminApplications.tsx:389`, `AdminCandidates.tsx:322`, `AdminPartnerRequests.tsx:346`, `AdminPartners.tsx:275`). Le défilement horizontal est donc prévu, mais les colonnes et actions ne sont pas présentées en format compact sur mobile. | Détecté dans le code ; visibilité des commandes, gestes de défilement et lisibilité non vérifiés. | Tester le défilement horizontal et l’accès aux actions. Si l’usage est pénible, prévoir une présentation en cartes pour les petites largeurs, en gardant le tableau sur ordinateur. |
| 3 — Faible | Toutes les pages publiques avec l’en-tête | `src/components/Header.tsx` (menu mobile/tablette) | 320 × 568, 375 × 812, 430 × 932 | Le panneau possède une largeur plafonnée et `overflow-y-auto`, mais sa hauteur maximale repose sur `100vh` (`Header.tsx:388`). Contrairement aux règles de modale de `globals.css`, il n’emploie pas `100dvh`. Avec la barre d’adresse mobile, la hauteur visible peut différer du viewport CSS utilisé. | Risque détecté dans le code ; aucune coupure ou impossibilité de naviguer reproduite. | Ouvrir le menu aux trois tailles mobiles, parcourir tous ses liens jusqu’en bas ; si une partie est masquée, borner le panneau avec la hauteur dynamique du viewport. |

Le tableau horizontal constitue un compromis déjà encadré par un conteneur défilable : l’inspection seule ne permet pas de le déclarer inutilisable ou cassé. Aucun niveau critique n’est attribué faute de défaut empêchant l’usage reproduit.

## Éléments structurels contrôlés dans le code

- **Routes publiques recensées** sous `src/app/[lang]/` : accueil, actualités et détail d’article, projets et détail, domaines et détail, événements et détail, ressources, galerie, équipe, pages institutionnelles, contact, candidature, adhésion, proposition de projet, demande partenaire, pages partenaires, soutien et recherche. Les variantes `/search`, `/suche` et `/recherche`, ainsi que `/partners` et `/partenaires`, sont présentes.
- **Routes de back-office recensées** : connexion, invitation, confirmation d’adresse, réinitialisation du mot de passe, tableau de bord, statistiques/analytics, candidatures et détail, candidats, partenariats et demandes/détail, propositions de projets, adhésions, membres, messages, articles, projets, domaines, événements, ressources, médias, albums, témoignages, newsletter et campagnes, paramètres, compte et administrateurs.
- **En-tête public** : menu mobile sous forme de panneau positionné, largeur limitée par le viewport et défilement vertical activé (`src/components/Header.tsx`).
- **Back-office** : navigation latérale en overlay sous `lg`, nav interne défilable et zone de contenu avec `overflow-x-hidden` (`src/views/admin/AdminLayout.tsx`). Cette dernière règle peut masquer un débordement enfant ; elle ne constitue pas une preuve que chaque page tient dans la largeur.
- **Modales** : les styles globaux fournissent une classe `.modal-viewport-fit` basée sur `100vh` puis `100dvh` (`src/app/globals.css`) et certaines vues l’utilisent. D’autres modales ont leurs propres limites `max-h-[90vh]` ou `max-h-[92vh]` ; elles ne sont pas toutes couvertes par cette classe.
- **Langues** : les composants utilisent des valeurs FR/EN/DE ou des textes de contenu configurés. La comparaison visuelle des longueurs de traduction et des contenus enregistrés n’a pas été faite.

## Pages et composants non vérifiés

**Toutes les pages n’ont pas été testées visuellement**, aux six tailles ou avec les trois langues. Sont notamment à vérifier dans un navigateur :

- les pages d’accueil, listes et détails publics, notamment articles, projets, événements, domaines, ressources, albums et pages institutionnelles ;
- les formulaires de candidature, partenariat, proposition de projet, adhésion, participation, contact et désinscription ;
- les états de navigation du menu public, ses sous-menus et le sélecteur de langue ;
- les pages de connexion, invitation, confirmation, récupération de compte et toutes les pages du back-office ;
- les tableaux, filtres, éditeurs de contenu, formulaires de création, aperçus, confirmations et fenêtres modales ;
- les contenus réels configurés en français, anglais et allemand, notamment les titres longs, adresses e-mail, noms et libellés d’action.

Le pied de page partagé, les états ouverts de chaque menu, les retours d’erreur, les téléversements et les cas où les contenus sont très longs n’ont pas été parcourus en conditions réelles.

## Ordre conseillé pour la vérification visuelle

1. Contrôler le titre de la bannière partenaires aux largeurs 320, 375 et 430 px dans chacune des langues configurées.
2. Parcourir les tableaux et leurs actions sur mobile et tablette, puis vérifier leur utilisation au clavier et au toucher.
3. Ouvrir le menu public et les modales sur mobile, faire défiler leurs contenus jusqu’en bas et vérifier qu’ils restent accessibles.
4. Parcourir les pages publiques et administratives restantes aux six dimensions de référence ; documenter seulement les défauts reproduits.
5. Refaire les contrôles à 1366 et 1920 px pour repérer une éventuelle régression de mise en page sur ordinateur.

## Limites

Ce rapport est fondé sur le recensement des fichiers de routes et une inspection statique ciblée des layouts et motifs de classes responsive. L’application n’a pas été lancée pour cet audit ; aucune capture, mesure de débordement DOM, navigation réelle ou comparaison de rendu FR/EN/DE n’a été effectuée. Les observations doivent être reproduites avant de planifier une correction comme anomalie confirmée.
