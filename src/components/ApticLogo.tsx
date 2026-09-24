import React from "react"
import Image from "next/image"

interface ApticLogoProps {
  className?: string
  variant?: "icon" | "full" | "horizontal" | "header" | "footer" | "compact" | "vertical"
  size?: number
  theme?: "color" | "white"
  lang?: string
}

const TAGLINES: Record<string, string> = {
  FR: "Le numérique au service des territoires ruraux.",
  EN: "Digital technology empowering rural communities.",
  DE: "Digitale Technologien für den ländlichen Raum.",
}

/* ── Emblème officiel circulaire seul ────────────────────────────────────── *
 * Source : /logo-aptic-emblem.png (original 292×312)
 * Déclinaisons générées (carré, fond transparent) :
 *   /logo-aptic-icon-512.png — haute résolution, icône app / PWA
 *   /logo-aptic-icon-192.png — mobile / Apple touch icon
 *   /logo-aptic-icon-64.png  — favicon 64×64
 *   /logo-aptic-icon-32.png  — favicon 32×32
 * ─────────────────────────────────────────────────────────────────────────── */
export function ApticIcon({
  size = 40,
  className = "",
  srcSize = 512,
}: {
  size?: number
  className?: string
  theme?: "color" | "white"
  /** Source resolution to load: 32 | 64 | 192 | 512 (défaut). */
  srcSize?: 32 | 64 | 192 | 512
}) {
  const src =
    srcSize === 32  ? "/logo-aptic-icon-32.png"  :
    srcSize === 64  ? "/logo-aptic-icon-64.png"  :
    srcSize === 192 ? "/logo-aptic-icon-192.png" :
                     "/logo-aptic-icon-512.png"

  return (
    <Image
      src={src}
      alt="APTIC-R Emblème"
      width={size}
      height={size}
      className={`object-contain ${className}`}
      priority
    />
  )
}

/* ── Logo Complet Officiel APTIC-R ───────────────────────────────────────── */
export default function ApticLogo({
  className = "",
  variant = "header",
  theme = "color",
  lang = "FR",
}: ApticLogoProps) {
  const currentLang = (lang || "FR").toUpperCase()
  const tagline = TAGLINES[currentLang] || TAGLINES.FR

  if (variant === "icon") {
    return <ApticIcon size={40} className={className} theme={theme} />
  }

  /* ── Variante Compact ─────────────────────────────────────────────────────
   * Logo officiel complet (symbole + wordmark APTIC-R + slogan) affiché
   * en réduction proportionnelle pour le back-office :
   *   - Header administratif, sidebar, navigation
   *   - Largeur cible : ~200px desktop, ~140px mobile
   *   - Fond transparent, aucune modification des couleurs
   *   - Aucune déformation : object-contain + proportions verrouillées
   *   - Source unique : /public/logo-aptic-official-clean.png
   * ────────────────────────────────────────────────────────────────────── */
  if (variant === "compact") {
    return (
      <Image
        src="/logo-aptic-official-clean.png"
        alt={`APTIC-R — ${tagline}`}
        width={440}
        height={152}
        className={`w-[140px] sm:w-[180px] lg:w-[200px] h-auto object-contain ${className}`}
        priority
        style={{ maxWidth: "220px" }}
      />
    )
  }

  /* ── Variante Verticale ───────────────────────────────────────────────────
   * Composition verticale centrée pour la page de connexion du back-office :
   *   ┌─────────────────────┐
   *   │   [Symbole 96px]    │
   *   │      APTIC-R        │
   *   │  ──────────────     │  ← séparateur vert officiel (#28A745)
   *   │  Le numérique…      │
   *   └─────────────────────┘
   * - Fond transparent, aucun élément graphique ajouté
   * - Couleurs et typographie de la charte uniquement
   * - Aucune ombre, aucun badge, aucun gradient
   * ────────────────────────────────────────────────────────────────────── */
  if (variant === "vertical") {
    return (
      <div className={`flex flex-col items-center gap-0 ${className}`}>
        {/* Symbole officiel */}
        <Image
          src="/logo-aptic-icon-512.png"
          alt="APTIC-R"
          width={96}
          height={96}
          className="w-24 h-24 object-contain"
          priority
        />
        {/* Wordmark APTIC-R */}
        <span
          className="font-black tracking-tight leading-none mt-3 font-sans"
          style={{ color: "#003366", fontSize: "26px" }}
        >
          APTIC-R
        </span>
        {/* Séparateur vert officiel + slogan */}
        <div className="flex flex-col items-center gap-2 mt-2.5">
          <span
            className="block rounded-full"
            style={{ width: 32, height: 2.5, backgroundColor: "#28A745" }}
          />
          <span
            className="text-center font-semibold leading-snug font-sans"
            style={{ color: "#003366", fontSize: "11.5px", maxWidth: 200 }}
          >
            {tagline}
          </span>
        </div>
      </div>
    )
  }

  /* Variante pour le Footer sur fond sombre institutionnel */
  if (variant === "footer") {
    return (
      <div className={`inline-flex items-center gap-3.5 ${className}`}>
        <div className="w-12 h-12 rounded-xl bg-white p-1.5 flex items-center justify-center shrink-0 shadow-sm">
          <Image
            src="/logo-aptic-emblem.png"
            alt="APTIC-R Emblème"
            width={40}
            height={40}
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <div className="font-black text-2xl tracking-tight leading-none text-white font-sans">
            APTIC-R
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-5 h-[2px] rounded-full bg-[#28A745]" />
            <span className="text-xs font-semibold text-white/95 leading-none">
              {tagline}
            </span>
          </div>
        </div>
      </div>
    )
  }

  /* Variante horizontale autonome ou complète */
  if (variant === "horizontal" || variant === "full") {
    return (
      <Image
        src="/logo-aptic-official-clean.png"
        alt={`APTIC-R — ${tagline}`}
        width={380}
        height={132}
        className={`h-11 sm:h-12 w-auto object-contain ${className}`}
        priority
      />
    )
  }

  /* Variante Header par défaut : Emblème officiel + Typographie Montserrat ultra-lisible avec baseline sur une seule ligne */
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <div className="w-10 h-10 sm:w-11 sm:h-11 shrink-0 flex items-center justify-center">
        <Image
          src="/logo-aptic-emblem.png"
          alt="APTIC-R Emblème"
          width={44}
          height={44}
          className="w-full h-full object-contain"
          priority
        />
      </div>
      <div className="flex flex-col justify-center">
        <span
          className="font-black text-xl sm:text-2xl tracking-tight leading-none text-[#003366] font-sans"
        >
          APTIC-R
        </span>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-4 sm:w-5 h-[2.5px] rounded-full bg-[#28A745] shrink-0" />
          <span
            className="text-[11px] sm:text-xs font-semibold tracking-normal text-[#003366] leading-none whitespace-nowrap font-sans"
          >
            {tagline}
          </span>
        </div>
      </div>
    </div>
  )
}
