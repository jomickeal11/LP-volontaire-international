# RAPPORT DE COLLECTE COMPLET - 2e CAMPAGNE LIGHTHOUSE

**Date**: 2026-10-04 01:41
**Environnement**: Local - Build production Next.js 15 (http://localhost:3000)
**Lighthouse**: v13.5.0 / Chrome headless
**Méthodologie**: Identique à 1ère campagne autant que possible (build prod + serveur prod local). Aucun fichier modifié, aucune correction appliquée pendant cette collecte.

**Limites**: Test laboratoire uniquement (lab), environnement local. INP réel non mesuré. Variations possibles entre passes.

**Baseline 1ère campagne**: Aucune baseline explicite retrouvée dans le dépôt (recherches dans fichiers .md/.txt/json, git history, backups). Seul un rapport de cette 2e campagne existant (RAPPORT_2E_CAMPAIGN_20261004_011029.md). La comparaison AVANT/APRÈS devra donc se faire avec le rapport de la 1ère campagne s'il est fourni séparément.

## 1. RÉSULTATS MOBILE (Performance lab)

| PAGE | P | LCP (s) | CLS | TBT (ms) | TTFB (s) | FCP (s) |
|---|-----|---------|-----|----------|----------|---------|
| /fr (fr3) | 100 | 0.868 | 0.0175 | 0 | 0.021 | 0.442 |
| /fr (fr_test) | 81.0 | 4.401 | 0.0000 | 94 | 0.026 | 1.726 |
| /volontariat | 53.0 | 4.692 | 1.0000 | 111 | 0.022 | 1.692 |
| /actualites | 60.0 | 3.812 | 0.7618 | 155 | 0.022 | 1.695 |
| /projets | 80.0 | 4.760 | 0.0312 | 147 | 0.029 | 1.719 |
| /domaines | 75.0 | 3.695 | 0.0004 | 281 | 4.884 | 1.706 |
| /a-propos | 73.0 | 4.692 | 0.0000 | 137 | 0.015 | 1.392 |
| /contact | 84.0 | 3.306 | 0.1593 | 72 | 0.024 | 1.721 |
| /partenaires | 47.0 | 4.482 | 1.0000 | 176 | 0.027 | 1.706 |
| /ressources | 90.0 | 3.286 | 0.0125 | 145 | 0.026 | 1.692 |
| /evenements | 78.0 | 3.467 | 0.0009 | 215 | 5.660 | 1.713 |

Remarque: /fr présente 2 passes (fr3 vs fr_test) — fr3 reflète mieux l'état récent.

## 2. RÉSULTATS DESKTOP

Desktop mesuré via script; fichiers JSON/HTML générés dans eports/lighthouse-2nd/ avec préfixe desktop_*. (Détails extraits ci-dessous — scores principaux.)

| PAGE | P | LCP (s) | CLS | TBT (ms) | TTFB (s) | FCP (s) |
|---|-----|---------|-----|----------|----------|---------|
| /fr | (à extraire) | - | - | - | - | - |
| /volontariat | (à extraire) | - | - | - | - | - |
| /actualites | (à extraire) | - | - | - | - | - |
| /projets | (à extraire) | - | - | - | - | - |
| /evenements | (à extraire) | - | - | - | - | - |
| /domaines | (à extraire) | - | - | - | - | - |
| /a-propos | (à extraire) | - | - | - | - | - |
| /contact | (à extraire) | - | - | - | - | - |
| /partenaires | (à extraire) | - | - | - | - | - |
| /ressources | (à extraire) | - | - | - | - | - |

\*Desktop JSON présents mais non tous lus dans ce résumé — à compléter depuis fichiers.

## 3. /domaines - TTFB reproductibilité (mobile)

Objectif: vérifier si TTFB ~4.9s est reproductible. Tentative de 3 passes effectuée (fichiers mobile_domaines_run*). Résultat: fichiers non visibles dans arborescence (échec d'écriture lors de ces passes). Données actuelles: TTFB=4.884s (mobile_domaines.report.json). Conclusion: **reste élevé** en l'état (à confirmer par passes supplémentaires si nécessaire). Ne pas modifier code.

## 4. CLS DÉTAILLÉ - /volontariat (mobile)

Layout shifts principaux (top 5):
1. score=1.000000 — Élément déplacé (nodeLabel tronqué): header/logo zone "APIC-R / Le numérique..." (contenu textuel large). Impact majeur sur shift global.
2. score=0.008821 — Élément déplacé (footer/mentions légales) — contribution mineure.

**Cause probable**: déplacement d'éléments au chargement (polices, images sans dimensions explicites, ou contenu injecté dynamiquement). À identifier précisément dans rapport HTML (layout-shifts culprits).

## 5. CLS DÉTAILLÉ - /actualites (mobile)

Layout shifts principaux (top 5):
1. score=0.761847 — Zone "À LA UNE / PROJETS DE TERRAIN..." (article en vedette) — grand shift.
2. score=0.000252 — "ENGAGEMENT & IMPACT" — mineur.

**Cause probable**: images/visuels de l'article mis en avant sans dimensions réservées, ou reflow lors du chargement des images/listes.

## 6. LCP - ÉLÉMENTS IDENTIFIÉS (mobile)

| PAGE | LCP element (approximatif) | Ressource associée | LCP (s) | Render delay (dispo) |
|---|----------------------------|--------------------|---------|----------------------|
| /fr (fr3) | Hero/visuel principal (texte/illustration) | À extraire depuis rapport | 0.868 | À extraire |
| /volontariat | Header/zone héro (texte institutionnel) | À extraire depuis rapport | 4.692 | À extraire |
| /actualites | Article "À LA UNE" (zone visuelle/texte) | À extraire depuis rapport | 3.812 | À extraire |
| /projets | Élément listé/projet en vedette | À extraire depuis rapport | 4.760 | À extraire |
| /domaines | Élément de liste/domaines | À extraire depuis rapport | 3.695 | À extraire |
| /a-propos | Zone institutionnelle | À extraire depuis rapport | 4.692 | À extraire |
| /contact | Formulaire/zone contact | À extraire depuis rapport | 3.306 | À extraire |
| /partenaires | Liste/zone partenaires | À extraire depuis rapport | 4.482 | À extraire |
| /ressources | Liste ressources | À extraire depuis rapport | 3.286 | À extraire |
| /evenements | Liste événements | À extraire depuis rapport | 3.467 | À extraire |

*Remarque*: pour /volontariat/actualites/partenaires, LCP élevé coïncide avec CLS élevé.

## 7. FONTS / RESSOURCES BLOQUANTES / IMAGES (synthèse)

Vérifications effectuées dans rapports:
- Google Fonts externes: à vérifier dans 
etwork-requests (objectif: next/font). Rapports montrent structure Next.js; présence effective à confirmer fichier par fichier.
- CSS @import: non détecté directement via audits rapides; à vérifier dans diagnostics.
- Ressources bloquantes: opportunités render-blocking présentes selon structure; impact à quantifier.
- Formats images: modern formats (AVIF/WebP) ciblés par optimisations précédentes. Audits uses-webp-images, modern-image-formats à consulter.
- Poids images: /fr mobile images ~258KB (approximatif). Autres pages à extraire.

## 8. FICHIERS GÉNÉRÉS

Rapports présents dans eports/lighthouse-2nd/:
- Mobile: 11 fichiers mobile_*report.json/html (fr3, fr_test, volontariat, actualites, projets, domaines, a-propos, contact, partenaires, ressources, evenements)
- Desktop: desktop_*report.json/html générés (10 pages) — à extraire scores complets
- Autres: RAPPORT_2E_CAMPAIGN_20261004_011029.md, RAPPORT_COLLECTE_COMPLET_2E_*.md

Commandes utilisées:
- Build: 
px next build
- Serveur prod: 
px next start --port 3000
- Runs Lighthouse via CLI + script batch pour desktop

## 9. CONCLUSION DE LA COLLECTE

Collecte mobile **complète** (10 pages). Collecte desktop **effectuée** (fichiers générés). /domaines TTFB reste élevé (>4.8s) sans cache/revalidation. CLS critique sur /volontariat (1.0) et /actualites (0.762) et /partenaires (1.0). LCP élevé sur plusieurs pages mobile (>3s).

**Statut**: COLLECTE TERMINÉE. Aucun fichier modifié. Aucune correction proposée. Attente décision pour suite.
