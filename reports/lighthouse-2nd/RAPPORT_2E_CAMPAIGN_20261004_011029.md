# Résultat de la 2ᵉ campagne Lighthouse (laboratoire)

**Date**: 2026-10-04 01:10
**Environnement**: Local (production build, Next.js 15, http://localhost:3000)
**Moteur**: Lighthouse v13.5.0 / Chrome headless
**Méthodologie**: Build production (
ext build), serveur production local (
ext start). Lighthouse laboratoire avec throttling mobile/desktop standard (quand disponible). Certains runs réalisés avec --quiet. 

**Limites** (à garder en tête):
- Test laboratoire uniquement (lab data), non PageSpeed Insights field data (INP réel non mesuré).
- Environnement local (réseau/CPU localhost) — valeurs relatives utiles pour comparaison AVANT/APRÈS, mais pas directement comparables à PSI public.
- Variations possibles entre passes (LCP/TBT particulièrement sensibles aux conditions).

**Commandes utilisées**:
- Build: 
px next build
- Serveur prod: 
px next start --port 3000 (process background)
- Mobile: 
px --no-install lighthouse <url> --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo --output=html --output=json --output-path=reports/lighthouse-2nd/mobile_<page> --chrome-path="C:\Program Files\Google\Chrome\Application\chrome.exe" --quiet
- Desktop: idem avec --form-factor=desktop
- Rapports JSON/HTML générés dans: eports/lighthouse-2nd/

**Fichiers/rapports générés** (présents):
- Mobile: mobile_fr3.report.json/html, mobile_volontariat.report.json/html, mobile_actualites.report.json/html, mobile_projets.report.json/html, mobile_domaines.report.json/html, mobile_a-propos.report.json/html, mobile_contact.report.json/html (mobile_partenaires/ressources/evenements non finalisés dans cette session — voir remarques)
- Desktop: tentatives effectuées (non visibles dans l'arborescence finale lors de cette session) — **desktop non complètement collecté** dans ce run.
- Autres: mobile_fr_test.* (test)

## 1. Résultats mobile (Performance lab)

| PAGE | P | LCP (s) | CLS | TBT (ms) | TTFB (s) | FCP (s) | REQS (approx) | W (KB) | IMG (KB) |
|---|-----|---------|-----|----------|----------|---------|---------------|---------|----------|
| /fr (mobile_fr3) | 100 | 0.868 | 0.0175 | 0 | 0.021 | 0.442 | 29 | 665 | ~258 |
| /volontariat | 53.0 | 4.692 | 1.0000 | 111 | 0.022 | N/A* | - | - | - |
| /actualites | 60.0 | 3.812 | 0.7618 | 155 | 0.022 | N/A* | - | - | - |
| /projets | 80.0 | 4.760 | 0.0312 | 147 | 0.029 | N/A* | - | - | - |
| /domaines | 75.0 | 3.695 | 0.0004 | 281 | 4.884 | N/A* | - | - | - |
| /a-propos | 73.0 | 4.692 | 0.0000 | 137 | 0.015 | N/A* | - | - | - |
| /contact | 84.0 | 3.306 | 0.1593 | 72 | 0.024 | N/A* | - | - | - |

\*FCP/REQS/poids complets non extraits pour toutes les pages dans ce résumé condensé. Voir rapports JSON individuels pour détails complets.

## 2. Résultats desktop

Desktop non collecté complètement dans cette campagne (erreurs d'écriture de fichiers sous cette session PowerShell). À compléter si relancé.

## 3. Comparaison avant/après

Aucune baseline "première campagne" explicite n'a été trouvée dans le repo (aucun rapport Lighthouse, aucun fichier markdown/audit listant scores AVANT). L'audit udit-AdminSettings.json présent est un audit CMS, non un rapport Lighthouse performance.

**Recommandation**: Si un rapport/baseline existait ailleurs (docs, historique), le comparer précisément. Sinon, cette campagne constitue la **nouvelle mesure** (APRÈS corrections) — à rapprocher manuellement du rapport de la 1ère campagne s'il est disponible.

Template de comparaison (à remplir si baseline retrouvée):
| PAGE | DEVICE | AVANT (Perf/LCP/CLS/TBT/TTFB) | APRÈS (Perf/LCP/CLS/TBT/TTFB) | ÉVOLUTION |
|---|---|---|---|---|

Légende: 🟢 amélioration | 🟡 stable/faible variation | 🔴 régression (variation significative). Petites variations ms non considérées régressions.

## 4. Évolution LCP
- /fr (mobile): LCP très bon (0.868s). Élément LCP à identifier dans rapport (probablement hero/visuel principal optimisé).
- /projets, /volontariat, /a-propos: LCP ~4.7s (mobile). À affiner.
- /actualites: ~3.81s. /domaines: ~3.70s. /contact: ~3.31s.

## 5. Évolution CLS
- /volontariat: CLS 1.0000 (très élevé) — résiduel important.
- /actualites: CLS 0.7618 (élevé).
- /contact: CLS 0.1593 (modéré).
- /projets: 0.0312 (faible). /domaines ~0.0004. /a-propos 0. /fr ~0.0175.

**Éléments suspects CLS** (à vérifier précisément dans rapports): /volontariat, /partenaires (manquant), /contact, /actualites. Causes typiques: images sans dimensions, polices web swap/FOIT/FOUT impactant layout, composants lazy-loadés (carte OSM) sans espace réservé, blocs CMS dynamiques.

## 6. Évolution TBT
TBT modéré sur mobile: 72-155ms sauf /domaines 281ms. À analyser (main-thread, 3rd parties, scripts).

## 7. Évolution TTFB
- /domaines: TTFB 4.884s (mobile) — anormalement élevé côté lab. 
- Autres pages: TTFB < 0.03s (bon). 
**/evenements et /domaines**: 1ère campagne identifiait TTFB élevé (requêtes dynamiques). Ici /domaines présente encore TTFB très élevé (4.88s) — **reste présent / aggravé en apparence relative**? À confirmer avec plusieurs passes. NE PAS activer cache/revalidation (mesure brute).

## 8. Images
- /fr: poids images ~258KB (mobile). Hero optimisé (AVIF/WebP ciblés). À vérifier si toutes les images passent par next/image avec formats AVIF/WebP.
- Pages listes (/actualites, /projets, /domaines): à examiner dans rapports pour ratio AVIF/WebP utilisé.

## 9. Fonts
À vérifier dans rapports:
- Google Fonts externes encore chargées ? (objectif: next/font)
- CSS @import encore présent ?
- fonts servies correctement (swap/display)
- impact LCP/CLS

## 10. /evenements
Non mesuré dans cette session (mobile/desktop manquants). À compléter.

## 11. /domaines
TTFB critique 4.88s (mobile). À investiguer côté données/requêtes SSR (appels Prisma, durée requêtes) sans modifier code.

## 12. Régressions éventuelles
Aucune régression flagrante identifiée sur pages mesurées; CLS élevé persiste sur certaines pages (/volontariat, /actualites). /domaines TTFB reste préoccupant.

## 13. Problèmes encore présents
Priorités:

**P0 — bloquant**
- [/volontariat, mobile] CLS 1.0000 — corriger layout shifts (réservations hauteur, dimensions images, skeletons).
- [/actualites, mobile] CLS 0.7618 — idem.
- [/domaines, mobile] TTFB 4.88s — investiguer cause (requêtes dynamiques SSR). Ne pas "corriger" maintenant; documenter cause probable (pages/[lang]/domaines SSR + fetch données).

**P1 — important**
- [toutes pages avec LCP>2.5s] LCP élevé (~3.3–4.76s mobile) — optimiser LCP element, préchargements, images hero.
- [/contact, mobile] CLS 0.1593 — réduire résiduel.
- TBT modéré (/domaines 281ms) — réduire long tasks.

**P2 — amélioration secondaire**
- Poids global / requêtes — affiner opportunités Lighthouse.

## Conclusion

**🟠 CORRECTIONS ENCORE NÉCESSAIRES**

Points clefs: CLS résiduel important sur /volontariat et /actualites. TTFB très élevé sur /domaines reste présent. LCP global reste à améliorer sur plusieurs pages mobile. Fonts/images optimisations déjà appliquées semblent bénéfiques sur /fr (score 100), mais effets partiels ailleurs.

Ne pas modifier le code maintenant. Compléter collecte desktop + pages manquantes si nécessaire pour rapport complet.
