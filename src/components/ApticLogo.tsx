import React from "react"
import Image from "next/image"

interface ApticLogoProps {
  className?: string
  variant?: "icon" | "full" | "horizontal" | "header" | "footer"
  size?: number
  theme?: "color" | "white"
  lang?: string
}

const TAGLINES: Record<string, string> = {
  FR: "Le numérique au service des territoires ruraux.",
  EN: "Digital technology empowering rural communities.",
  DE: "Digitale Technologien für den ländlichen Raum.",
}

/* ── Emblème officiel circulaire seul ────────────────────────────────────── */
export function ApticIcon({
  size = 40,
  className = "",
}: {
  size?: number
  className?: string
  theme?: "color" | "white"
}) {
  return (
    <Image
      src="/logo-aptic-emblem.png"
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
