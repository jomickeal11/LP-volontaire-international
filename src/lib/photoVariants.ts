/**
 * Variantes optimisées (AVIF / WebP) des photos statiques de `public/`.
 *
 * Reprend exactement le modèle déjà en production et validé par Lighthouse sur
 * `/fr/volontariat` (`src/views/Home.tsx`) : un `<picture>` propose l'AVIF puis le
 * WebP, et conserve l'image d'origine en `src` de l'<img> comme fallback.
 *
 * Les dimensions declarées proviennent des fichiers sources (ffprobe) : elles
 * permettent au navigateur de réserver la place avant le chargement, ce qui
 * supprime le décalage de mise en page sans changer le rendu visuel (les classes
 * `w-full h-full object-cover` continuent de dimensionner l'affichage).
 *
 * Les sources originales ne sont jamais supprimées.
 */

export interface PhotoVariant {
  avif: string
  webp: string
  width: number
  height: number
}

const PHOTO_VARIANTS: Record<string, PhotoVariant> = {
  // Hero de la page d'accueil institutionnelle — mesuré à 1 021 Ko en JPEG.
  "/hero-aptic-official.jpg": {
    avif: "/hero-aptic-official.avif",
    webp: "/hero-aptic-official.webp",
    width: 1376,
    height: 768,
  },
  // 992 Ko -> 233 Ko (référence existante, déjà utilisée par /fr/volontariat).
  "/hero-volunteer-collab.jpg": {
    avif: "/hero-volunteer-collab.avif",
    webp: "/hero-volunteer-collab.webp",
    width: 1376,
    height: 768,
  },
  // 1 009 Ko -> 254 Ko
  "/togo-volunteer.jpg": {
    avif: "/togo-volunteer.avif",
    webp: "/togo-volunteer.webp",
    width: 1024,
    height: 1024,
  },
  // 883 Ko -> 43 Ko (canal alpha vérifié entièrement opaque, conversion sans perte visible)
  "/photo-ancrage-togo.png": {
    avif: "/photo-ancrage-togo.avif",
    webp: "/photo-ancrage-togo.webp",
    width: 1024,
    height: 449,
  },
  // 404 Ko -> 68 Ko
  "/photo-projet-phare.jpg": {
    avif: "/photo-projet-phare.avif",
    webp: "/photo-projet-phare.webp",
    width: 1024,
    height: 858,
  },
  // 290 Ko -> 75 Ko
  "/photo-recit-documentaire.jpg": {
    avif: "/photo-recit-documentaire.avif",
    webp: "/photo-recit-documentaire.webp",
    width: 1024,
    height: 420,
  },
  // 358 Ko -> 190 Ko (variantes préexistantes)
  "/meeting-org.jpg": {
    avif: "/meeting-org.avif",
    webp: "/meeting-org.webp",
    width: 1013,
    height: 1013,
  },
}

/**
 * Retourne les variantes optimisées si le chemin pointe vers une photo statique
 * connue, sinon `undefined` (le composant rend alors un `<img>` simple).
 * Les chemins inconnus — notamment les téléversements administrateur
 * (`/uploads/...`) et les images définies en base — restent inchangés.
 */
export function getPhotoVariant(src: string | null | undefined): PhotoVariant | undefined {
  if (!src) return undefined
  return PHOTO_VARIANTS[src.split("?")[0]]
}