# DIAGNOSTIC CIBLÉ - CLS (Étape 1-3)

Date: 2026-10-04 04:16
Objectif: Identifier causes précises des CLS (sans modification de code)

## 1. Analyse /volontariat (CLS = 1.0000)

**Layout shifts (top 2)**
1. score=1.000000 — Élément: header/logo/zone institutionnelle "APIC-R / Le numérique..." (texte tronqué dans rapport). Rect: w=412h=920. Impact massif (shift complet).
2. score=0.008821 — Élément: pied de page/mentions "2026 APTIC-R..." (w=372h=129). Impact mineur.

**Cause technique probable**
Le shift principal de 1.0 est associé à la zone héro/header. Éléments suspects:
- Header (composant partagé) utilisé sur cette page. Hauteur non réservée avant rendu complet du contenu textuel/logo.
- Logo/slogan avec dimensions non explicites ou calculées après CSS.
- Contenu dynamique/CMS ou rendu conditionnel côté client (hydration).
- Pas d'espace réservé pour la zone héro. Lorsque le contenu s'affiche, layout se déplace.

**Composants/fichiers à inspecter (ciblés)**
- Header: probablement src/components/Header* ou utilisé dans layout. Rechercher header utilisé sur /[lang]/volontariat.
- Page: src/app/[lang]/volontariat/page.tsx, composants héro de volontariat (src/views/Volunteer* ou sections).
- Images/logo: public/logo-* — dimensions à vérifier si utilisées sans width/height explicites.

**Type de problème**: Probablement header/hauteur non réservée + contenu héro sans dimensions fixes (plutôt contenu/structure, non fonts Google externes - fonts déjà next/font).

## 2. Analyse /actualites (CLS = 0.7618)

**Layout shifts (top 2)**
1. score=0.761847 — Élément: zone "À LA UNE / PROJETS DE TERRAIN / 15 SEPTEMBRE 2026 / 3 MIN DE LECTURE / Inauguration..." (w=412h=1266). Très fort.
2. score=0.000252 — "ENGAGEMENT & IMPACT" (w=314h=16). Mineur.

**Cause technique probable**
Shift massif sur l'article mis en avant (featured). Causes typiques:
- Image/visuel de featured sans dimensions explicites (next/image requis avec width/height ou fill+container avec aspect ratio).
- Composant de carte featured charge données dynamiques et change hauteur au rendu.
- Skeleton/loading state manquant ou dimensions différentes du contenu final.
- Images responsives sans aspect-ratio CSS réservé.

**Fichiers à inspecter**
- Page actualités: src/app/[lang]/actualites/page.tsx
- Composants: cartes/articles, featured. Chercher composants liés à actualités (src/views/news*, src/components/*article*, src/components/News*).
- Images: next/image usage dans featured.

**Type de problème**: Image/featured + hauteur non réservée (plutôt rendu dynamique).

## 3. Analyse /partenaires (CLS = 1.0000)

**Layout shifts (top 2)**
1. score=1.000000 — Même élément que /volontariat (header/logo "APIC-R...") w=412h=920. Shift massif.
2. score=0.008821 — Footer mentions w=372h=129. Mineur.

**Cause technique probable**
Identique à /volontariat — déplacement lié au header/zone héro de la page Partenaires. Même composant header partagé affecté.

**Fichiers à inspecter**
- src/app/[lang]/partenaires/page.tsx, composants héro Partenaires
- Header partagé

**Type de problème**: Header/structure héro sans réservation de hauteur.

## 4. Analyse /contact (CLS = 0.1593)

**Layout shifts (top 2)**
1. score=0.159299 — "ENVOYEZ-NOUS UN MESSAGE..." (formulaire) w=380h=854. Modéré.
2. score=0.000061 — Sélecteur langue/élément mineur. Négligeable.

**Cause probable**: Formulaire ou éléments adjacents se réorganisent au chargement (peut être lié à états conditionnels ou à images/icônes sans dimensions). Moindre priorité.

## 5. Synthèse par problème

| Page | Élément responsable (principal) | CLS | Cause réelle/probable | Fichier(s) probablement concernés | Correction proposée (ciblée) |
|------|-------------------------------|-----|----------------------|--------------------------|---------------------------|
| /volontariat | Zone header/logo/slogan (héros) | 1.0000 | Hauteur non réservée avant rendu du contenu héro/header (reflow au chargement). Pas de dimensions fixes sur logo/zone; contenu peut varier légèrement. | Header partagé (src/components/Header*), src/app/[lang]/volontariat/page.tsx, composants héro volontariat | Réserver hauteur explicite à la zone héro/header (min-height/aspect ou container avec hauteur fixe relative). Ajouter width/height explicites au logo si utilisé en img pur (préférer next/image). Éviter changements de padding/margin après hydratation. |
| /actualites | Article mis en avant "À LA UNE" (featured) | 0.7618 | Image/visuel featured sans dimensions réservées + contenu dynamique. Carte change de hauteur au rendu (skeleton manquant ou dimensions différentes). | src/app/[lang]/actualites/page.tsx, composants featured/carte actualité (src/components/*News*, src/views/*News*) | Ajouter aspect-ratio ou width/height explicites sur image featured (next/image). Utiliser skeleton avec mêmes dimensions ou réserver hauteur du conteneur featured. Éviter layout shift dû au chargement de données (conteneur stable). |
| /partenaires | Zone header/logo/slogan (héros) | 1.0000 | Même cause que /volontariat — header/zone héro sans réservation de hauteur; reflow au chargement. | Header partagé, src/app/[lang]/partenaires/page.tsx, composants héro partenaires | Même approche ciblée: réserver hauteur container héro, dimensions logo explicites, stabiliser padding/margin (éviter shifts post-render). |
| /contact | Zone formulaire "ENVOYEZ-NOUS UN MESSAGE" | 0.1593 | Possible reflow formulaire (états conditionnels) — résiduel modéré. Non prioritaire vs 3 pages ci-dessus. | src/app/[lang]/contact/page.tsx, composants formulaire | À traiter séparément si nécessaire (moins critique). |

## 6. Remarques importantes (vérifiées)

- Fonts: next/font utilisé (Montserrat/JetBrains Mono), pas de Google Fonts externes. Pas d'@import Google Fonts. font-display géré.
- Pas de CSS @import bloquant autre que leaflet/tailwind (locaux).
- Pas de ressources font externes détectées dans réseau (mobile volontariat).
- Problème **n'est pas** lié aux fonts dans ces cas (shift massif vient structure/contenu).
- Focus uniquement sur CLS des 3 pages (volontariat, actualites, partenaires). TTFB/LCP non touchés.

## 7. Recommandation

Corriger **uniquement** les 3 pages ci-dessus, par petits correctifs ciblés (réservation de hauteur + dimensions explicites images/logo). Attendre validation avant toute modification.
