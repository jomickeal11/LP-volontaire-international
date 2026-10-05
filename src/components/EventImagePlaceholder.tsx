import Image from "next/image"
import type { Language } from "@/types"

/* Libellé discret sous le logo : repris de la mention de section de la page
   Événements, décliné dans les 3 langues du portail. Défini ici pour que le
   placeholder reste autonome et réutilisable partout. */
const LABELS: Record<string, string> = {
  FR: "Événements & Formations",
  EN: "Events & Training",
  DE: "Veranstaltungen & Schulungen",
}

/**
 * Placeholder institutionnel APTIC-R pour la zone visuelle 16:9 d'un événement
 * lorsqu'aucun visuel n'a été fourni par l'administrateur.
 *
 * Principes :
 * - purement décoratif, ce n'est PAS une image d'événement : le titre de la
 *   carte porte déjà l'information, le logo est donc une image sans texte
 *   alternatif ;
 * - aucune URL n'est enregistrée en base, `featuredImage` reste vide ;
 * - rigoureusement identique pour toutes les catégories (aucun contenu
 *   inventé, aucune photo, aucune illustration spécifique) ;
 * - occupe exactement la même boîte que l'image réelle (16/9, largeur pleine)
 *   afin que le contenu démarre au même niveau sur toutes les cartes.
 */
export default function EventImagePlaceholder({ lang }: { lang: Language | string }) {
  const label = LABELS[String(lang).toUpperCase()] ?? LABELS.FR
  return (
    <div
      data-event-placeholder="true"
      className="relative w-full h-full bg-[#003366] flex items-center justify-center overflow-hidden"
    >
      {/* Motif institutionnel très léger : anneaux évoquant l'emblème APTIC-R
          et filets horizontaux. Purement décoratif, en blanc à 7%. */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-[0.07]"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 160 90"
      >
        <g fill="none" stroke="#ffffff" strokeWidth="0.4">
          <circle cx="80" cy="45" r="24" />
          <circle cx="80" cy="45" r="36" />
          <circle cx="80" cy="45" r="48" />
          <path d="M0 45 H160" />
          <path d="M0 18 H160" />
          <path d="M0 72 H160" />
        </g>
      </svg>

      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        {/* Symbole blanc officiel : réservé aux fonds bleu foncé institutionnels
            (cf. AGENTS.md). Aucun nouveau logo n'est créé. */}
        <Image
          src="/logo-aptic-symbol-white.png"
          alt=""
          width={292}
          height={312}
          className="h-10 sm:h-12 w-auto opacity-90"
        />
        <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.16em] text-white/60 leading-tight max-w-[90%]">
          {label}
        </span>
      </div>
    </div>
  )
}