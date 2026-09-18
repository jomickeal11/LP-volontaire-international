import React from "react"

export interface DomainIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
  className?: string
  color?: string
}

/**
 * 01. Agriculture durable
 * Icône officielle de la charte APTIC-R :
 * Double feuille stylisée / germe végétal dynamique
 */
export function AgricultureDurableIcon({
  size = 24,
  className = "",
  color = "currentColor",
  ...props
}: DomainIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Grande feuille principale */}
      <path
        d="M20.5 3.5C13.5 3.5 7 8 7 15.5C7 18 8.8 20.5 11.5 20.5C18.5 20.5 21.5 11.5 21.5 4.5C21.5 3.9 21.1 3.5 20.5 3.5Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Nervure centrale */}
      <path
        d="M7 15.5C11 15 15.5 11.5 18 7"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Petite pousse / tige inférieure gauche */}
      <path
        d="M3.5 20.5C4.5 17 6.8 14.8 9.5 14"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M3.5 20.5C6 20.5 8 18.5 8.5 16.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * 02. Innovation numérique
 * Icône officielle de la charte APTIC-R :
 * Constellation réseau / 3 nœuds interconnectés (reprend le motif du logo APTIC-R)
 */
export function InnovationNumeriqueIcon({
  size = 24,
  className = "",
  color = "currentColor",
  ...props
}: DomainIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Lignes de maillage / connexion */}
      <line x1="6" y1="18" x2="19" y2="14" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
      <line x1="19" y1="14" x2="10" y2="5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />
      <line x1="6" y1="18" x2="10" y2="5" stroke={color} strokeWidth="1.75" strokeLinecap="round" />

      {/* Nœud 1 (Bas gauche) */}
      <circle cx="6" cy="18" r="3.25" stroke={color} strokeWidth="1.75" fill="none" />
      <circle cx="6" cy="18" r="1.25" fill={color} />

      {/* Nœud 2 (Milieu droite) */}
      <circle cx="19" cy="14" r="3.25" stroke={color} strokeWidth="1.75" fill="none" />
      <circle cx="19" cy="14" r="1.25" fill={color} />

      {/* Nœud 3 (Haut) */}
      <circle cx="10" cy="5" r="3" stroke={color} strokeWidth="1.75" fill="none" />
      <circle cx="10" cy="5" r="1.25" fill={color} />
    </svg>
  )
}

/**
 * 03. Données & intelligence
 * Icône officielle de la charte APTIC-R :
 * Cylindres de base de données superposés (Database / Stack)
 */
export function DonneesIntelligenceIcon({
  size = 24,
  className = "",
  color = "currentColor",
  ...props
}: DomainIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Disque supérieur */}
      <ellipse cx="12" cy="5.5" rx="8" ry="3" stroke={color} strokeWidth="1.75" />
      
      {/* Étage intermédiaire */}
      <path
        d="M4 5.5V11.5C4 13.16 7.58 14.5 12 14.5C16.42 14.5 20 13.16 20 11.5V5.5"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      
      {/* Étage inférieur */}
      <path
        d="M4 11.5V17.5C4 19.16 7.58 20.5 12 20.5C16.42 20.5 20 19.16 20 17.5V11.5"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * 04. Cybersécurité
 * Icône officielle de la charte APTIC-R :
 * Bouclier de protection avec coche de validation interne (Shield Check)
 */
export function CybersecuriteIcon({
  size = 24,
  className = "",
  color = "currentColor",
  ...props
}: DomainIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Contour du bouclier */}
      <path
        d="M12 2.5L4.5 5.5V11C4.5 16.5 7.7 20.8 12 22C16.3 20.8 19.5 16.5 19.5 11V5.5L12 2.5Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Coche de validation */}
      <path
        d="M8.5 11.5L10.75 14L15.5 9"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * 05. Jeunesse & inclusion
 * Icône officielle de la charte APTIC-R :
 * Groupe de personnes / communauté inclusive (Users / Team)
 */
export function JeunesseInclusionIcon({
  size = 24,
  className = "",
  color = "currentColor",
  ...props
}: DomainIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Tête centrale (personnage principal) */}
      <circle cx="12" cy="7" r="3" stroke={color} strokeWidth="1.75" />
      {/* Corps central */}
      <path
        d="M6 19.5C6 16.2 8.7 13.5 12 13.5C15.3 13.5 18 16.2 18 19.5"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Silhouette gauche */}
      <path
        d="M4.5 7.5C4.5 8.9 4.1 10 3 10.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="5" cy="7" r="2" stroke={color} strokeWidth="1.5" />
      <path
        d="M2 18.5C2 16.2 3.5 14.5 5.5 14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Silhouette droite */}
      <circle cx="19" cy="7" r="2" stroke={color} strokeWidth="1.5" />
      <path
        d="M22 18.5C22 16.2 20.5 14.5 18.5 14"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * 06. Développement rural
 * Icône officielle de la charte APTIC-R :
 * Pin de localisation territoriale / Ancrage géographique (Map Pin)
 */
export function DeveloppementRuralIcon({
  size = 24,
  className = "",
  color = "currentColor",
  ...props
}: DomainIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Forme du Pin de géolocalisation */}
      <path
        d="M12 21.5C12 21.5 19 15.5 19 9.5C19 5.63 15.87 2.5 12 2.5C8.13 2.5 5 5.63 5 9.5C5 15.5 12 21.5 12 21.5Z"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Cercle central */}
      <circle cx="12" cy="9.5" r="2.75" stroke={color} strokeWidth="1.75" />
    </svg>
  )
}

/**
 * Dispatcher universel pour obtenir l'icône officielle d'un domaine par index (0 à 5)
 * ou par code identifiant.
 */
export function DomainCharterIcon({
  index,
  code,
  size = 36,
  className = "",
  color = "currentColor",
}: {
  index?: number
  code?: string
  size?: number | string
  className?: string
  color?: string
}) {
  const normCode = code?.toUpperCase()

  if (index === 0 || normCode === "AGRICULTURE" || normCode === "AGRI_LOWTECH") {
    return <AgricultureDurableIcon size={size} className={className} color={color} />
  }
  if (index === 1 || normCode === "INNOVATION" || normCode === "INCLUSION_NUMERIQUE") {
    return <InnovationNumeriqueIcon size={size} className={className} color={color} />
  }
  if (index === 2 || normCode === "DATA" || normCode === "DATA_INNOVATION" || normCode === "DONNEES") {
    return <DonneesIntelligenceIcon size={size} className={className} color={color} />
  }
  if (index === 3 || normCode === "CYBER" || normCode === "CYBERSECURITE") {
    return <CybersecuriteIcon size={size} className={className} color={color} />
  }
  if (index === 4 || normCode === "JEUNESSE" || normCode === "INCLUSION") {
    return <JeunesseInclusionIcon size={size} className={className} color={color} />
  }
  if (index === 5 || normCode === "RURAL" || normCode === "DEV_RURAL" || normCode === "TERRITOIRE") {
    return <DeveloppementRuralIcon size={size} className={className} color={color} />
  }

  return <InnovationNumeriqueIcon size={size} className={className} color={color} />
}
