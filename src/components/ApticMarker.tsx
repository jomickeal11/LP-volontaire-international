import React from "react"

export interface ApticMarkerProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
  /**
   * Theme variant:
   * - "default": Primary Blue #003366 with Natural Green #28A745 micro-accent
   * - "monochrome": 100% Primary Blue #003366
   * - "white": White #FFFFFF with Green #28A745 accent (for dark backgrounds)
   * - "white-mono": 100% White
   * - "accent": 100% Green #28A745
   */
  variant?: "default" | "monochrome" | "white" | "white-mono" | "accent"
}

/**
 * ApticNodeMarker
 * 
 * Nouveau marqueur graphique institutionnel officiel APTIC-R.
 * Inspiré du motif « innovation numérique & réseau » du logo officiel :
 * 3 nœuds géométriques équilibrés reliés par de fines lignes d'interconnexion.
 * 
 * - Taille recommandée : 14px à 18px (défaut 16px)
 * - Proportions harmonieuses pour les puces de liste, badges et repères textuels
 * - Conforme à la charte institutionnelle APTIC-R (#003366 & #28A745)
 */
export function ApticNodeMarker({
  size = 16,
  className = "",
  variant = "default",
  ...props
}: ApticMarkerProps) {
  // Couleurs selon la variante
  let mainColor = "#003366"
  let accentColor = "#28A745"
  let lineColor = "#003366"
  let lineOpacity = 0.55

  if (variant === "monochrome") {
    mainColor = "#003366"
    accentColor = "#003366"
    lineColor = "#003366"
    lineOpacity = 0.4
  } else if (variant === "white") {
    mainColor = "#FFFFFF"
    accentColor = "#28A745"
    lineColor = "#FFFFFF"
    lineOpacity = 0.6
  } else if (variant === "white-mono") {
    mainColor = "#FFFFFF"
    accentColor = "#FFFFFF"
    lineColor = "#FFFFFF"
    lineOpacity = 0.45
  } else if (variant === "accent") {
    mainColor = "#28A745"
    accentColor = "#28A745"
    lineColor = "#28A745"
    lineOpacity = 0.4
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 align-middle ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Lignes de maillage / interconnexion fine */}
      <line
        x1="3.5"
        y1="12"
        x2="12.5"
        y2="9.5"
        stroke={lineColor}
        strokeWidth="1.25"
        strokeOpacity={lineOpacity}
        strokeLinecap="round"
      />
      <line
        x1="12.5"
        y1="9.5"
        x2="6.5"
        y2="3.5"
        stroke={lineColor}
        strokeWidth="1.25"
        strokeOpacity={lineOpacity}
        strokeLinecap="round"
      />
      <line
        x1="3.5"
        y1="12"
        x2="6.5"
        y2="3.5"
        stroke={lineColor}
        strokeWidth="1.25"
        strokeOpacity={lineOpacity}
        strokeLinecap="round"
      />

      {/* Nœud 1 (Base inférieure gauche — Institutionnel #003366) */}
      <circle cx="3.5" cy="12" r="2" fill={mainColor} />

      {/* Nœud 2 (Pilier droit — Institutionnel #003366) */}
      <circle cx="12.5" cy="9.5" r="2.25" fill={mainColor} />

      {/* Nœud 3 (Apex supérieur — Micro-accent innovation #28A745 ou blanc) */}
      <circle cx="6.5" cy="3.5" r="1.75" fill={accentColor} />
    </svg>
  )
}

export interface ApticDashProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string
  height?: number | string
  className?: string
  /**
   * Theme variant:
   * - "default": Blue body (#003366) with Green micro-tip (#28A745)
   * - "monochrome": 100% Blue (#003366)
   * - "white": White body with Green tip
   * - "white-mono": 100% White
   */
  variant?: "default" | "monochrome" | "white" | "white-mono"
}

/**
 * ApticDash
 * 
 * Ligne graphique et séparateur visuel personnalisé institutionnel APTIC-R.
 * Remplace avantageusement le caractère brut "-" ou les tirets typographiques.
 * 
 * - Longueur standard : 20px à 28px
 * - Épaisseur fine (2px) avec coins adoucis
 * - Corps institutionnel #003366 + micro-extrémité terminale #28A745
 */
export function ApticDash({
  width = 24,
  height = 3,
  className = "",
  variant = "default",
  ...props
}: ApticDashProps) {
  let mainColor = "#003366"
  let tipColor = "#28A745"

  if (variant === "monochrome") {
    mainColor = "#003366"
    tipColor = "#003366"
  } else if (variant === "white") {
    mainColor = "#FFFFFF"
    tipColor = "#28A745"
  } else if (variant === "white-mono") {
    mainColor = "#FFFFFF"
    tipColor = "#FFFFFF"
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 3"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 align-middle ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Segment principal */}
      <rect x="0" y="0.5" width="16" height="2" rx="1" fill={mainColor} />
      {/* Micro-extrémité distinctive */}
      <rect x="18" y="0.5" width="6" height="2" rx="1" fill={tipColor} />
    </svg>
  )
}

export interface ApticEyebrowMarkerProps {
  text: string
  className?: string
  variant?: "default" | "white"
}

/**
 * ApticEyebrow
 * 
 * Composant prêt à l'emploi pour les sur-titres (eyebrows) de sections
 * institutionnelles combinant le marqueur de nœud ou le tiret graphique.
 */
export function ApticEyebrow({
  text,
  className = "",
  variant = "default",
}: ApticEyebrowMarkerProps) {
  const isWhite = variant === "white"
  return (
    <div className={`flex items-center gap-2.5 mb-3.5 ${className}`}>
      <ApticDash variant={isWhite ? "white" : "default"} width={20} />
      <span
        className={`text-xs sm:text-[13px] font-bold uppercase tracking-[0.2em] ${
          isWhite ? "text-white/90" : "text-[#003366]"
        }`}
      >
        {text}
      </span>
    </div>
  )
}

export interface ApticListItemProps {
  children: React.ReactNode
  className?: string
  markerVariant?: ApticMarkerProps["variant"]
  size?: number
}

/**
 * ApticListItem
 * 
 * Élément de liste avec le marqueur graphique réseau APTIC-R parfaitement aligné.
 */
export function ApticListItem({
  children,
  className = "",
  markerVariant = "default",
  size = 15,
}: ApticListItemProps) {
  return (
    <li className={`flex items-start gap-2.5 text-sm sm:text-base leading-relaxed ${className}`}>
      <span className="mt-1 shrink-0">
        <ApticNodeMarker size={size} variant={markerVariant} />
      </span>
      <span>{children}</span>
    </li>
  )
}

export default ApticNodeMarker
