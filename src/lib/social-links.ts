/**
 * Configuration centralisée des réseaux sociaux officiels d'APTIC-R.
 * 
 * Seuls les comptes officiellement vérifiés sont renseignés.
 * Tout réseau non communiqué doit rester non défini / vide.
 */

export interface SocialNetworkItem {
  id: "facebook" | "linkedin" | "instagram"
  label: string
  href: string
  iconPath: string
}

export const OFFICIAL_SOCIAL_LINKS = {
  facebook: "https://web.facebook.com/ApticRural",
  linkedin: "https://www.linkedin.com/company/le-tic-rural/",
  instagram: "https://www.instagram.com/apticr/",
} as const

export const SOCIAL_DEFINITIONS: Record<
  keyof typeof OFFICIAL_SOCIAL_LINKS,
  { label: string; iconPath: string }
> = {
  facebook: {
    label: "Facebook",
    iconPath: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
  },
  linkedin: {
    label: "LinkedIn",
    iconPath:
      "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z",
  },
  instagram: {
    label: "Instagram",
    iconPath:
      "M8 2.1A5.9 5.9 0 002.1 8v8A5.9 5.9 0 008 21.9h8A5.9 5.9 0 0021.9 16V8A5.9 5.9 0 0016 2.1H8zm0 2h8A3.9 3.9 0 0119.9 8v8A3.9 3.9 0 0116 19.9H8A3.9 3.9 0 014.1 16V8A3.9 3.9 0 018 4.1zM12 7a5 5 0 100 10A5 5 0 0012 7zm0 2a3 3 0 110 6 3 3 0 010-6zm5.2-2.5a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6z",
  },
}

/**
 * Récupère la liste des réseaux sociaux configurés.
 * Les valeurs fournies dans les paramètres CMS (site_social_*) priment sur les valeurs par défaut.
 */
export function getResolvedSocialLinks(
  customOverrides?: Record<string, string | undefined>
): SocialNetworkItem[] {
  const getHref = (key: "facebook" | "linkedin" | "instagram"): string => {
    if (!customOverrides) return OFFICIAL_SOCIAL_LINKS[key]
    const cmsVal =
      customOverrides[`site_social_${key}`] || customOverrides[key]
    if (typeof cmsVal === "string" && cmsVal.trim().length > 0) {
      return cmsVal.trim()
    }
    return OFFICIAL_SOCIAL_LINKS[key]
  }

  const items: SocialNetworkItem[] = [
    {
      id: "facebook",
      label: SOCIAL_DEFINITIONS.facebook.label,
      href: getHref("facebook"),
      iconPath: SOCIAL_DEFINITIONS.facebook.iconPath,
    },
    {
      id: "linkedin",
      label: SOCIAL_DEFINITIONS.linkedin.label,
      href: getHref("linkedin"),
      iconPath: SOCIAL_DEFINITIONS.linkedin.iconPath,
    },
    {
      id: "instagram",
      label: SOCIAL_DEFINITIONS.instagram.label,
      href: getHref("instagram"),
      iconPath: SOCIAL_DEFINITIONS.instagram.iconPath,
    },
  ]

  return items.filter((item) => Boolean(item.href))
}
