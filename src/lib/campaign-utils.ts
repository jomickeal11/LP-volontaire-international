/**
 * Utilitaires UTM purs — utilisables côté client ET côté serveur.
 * Aucune directive "use server" / "use client" : ce fichier est isomorphique.
 */

// ─── Mapping canal humain → valeurs UTM techniques ───────────────────────────

export const CHANNEL_MAP: Record<
  string,
  { label: string; utmSource: string; utmMedium: string; sourceIsCustom?: boolean }
> = {
  facebook:   { label: "Facebook",        utmSource: "facebook",   utmMedium: "social" },
  instagram:  { label: "Instagram",       utmSource: "instagram",  utmMedium: "social" },
  linkedin:   { label: "LinkedIn",        utmSource: "linkedin",   utmMedium: "social" },
  google:     { label: "Google",          utmSource: "google",     utmMedium: "cpc" },
  whatsapp:   { label: "WhatsApp",        utmSource: "whatsapp",   utmMedium: "messaging" },
  newsletter: { label: "Newsletter",      utmSource: "newsletter", utmMedium: "email" },
  partner:    { label: "Site partenaire", utmSource: "",           utmMedium: "referral", sourceIsCustom: true },
  qrcode:     { label: "QR Code",        utmSource: "qrcode",     utmMedium: "offline" },
  other:      { label: "Autre",           utmSource: "",           utmMedium: "other",   sourceIsCustom: true },
}

// ─── Pages publiques proposées dans le sélecteur ─────────────────────────────

export const PUBLIC_PAGES = [
  { path: "/",                label: "Accueil" },
  { path: "/volontariat",     label: "Volontariat" },
  { path: "/apply",           label: "Candidater (formulaire)" },
  { path: "/partenaires",     label: "Partenaires" },
  { path: "/a-propos",        label: "À propos" },
  { path: "/contact",         label: "Contact" },
  { path: "/actualites",      label: "Actualités" },
  { path: "/projets",         label: "Projets" },
  { path: "/ressources",      label: "Ressources" },
  { path: "/evenements",      label: "Événements" },
  { path: "/galerie",         label: "Galerie" },
  { path: "/equipe",          label: "Équipe" },
  { path: "/devenir-membre",  label: "Devenir membre" },
  { path: "/soutenir",        label: "Soutenir APTIC-R" },
] as const

// ─── Normalisation campaign slug ──────────────────────────────────────────────

export function normalizeCampaignSlug(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les diacritiques
    .replace(/[^a-z0-9\s_-]/g, "")  // Garde lettres, chiffres, tirets, espaces
    .trim()
    .replace(/\s+/g, "_")            // Espaces → underscores
    .replace(/_+/g, "_")             // Underscores multiples → 1
    .slice(0, 100)
}

// ─── Construction de l'URL de campagne ───────────────────────────────────────

export function buildCampaignUrl({
  baseUrl,
  destinationPath,
  utmSource,
  utmMedium,
  utmCampaign,
  utmContent,
  utmTerm,
}: {
  baseUrl: string
  destinationPath: string
  utmSource: string
  utmMedium: string
  utmCampaign: string
  utmContent?: string
  utmTerm?: string
}): string {
  const base = baseUrl.replace(/\/$/, "")
  const path = destinationPath.startsWith("/") ? destinationPath : `/${destinationPath}`
  const url = new URL(`${base}${path}`)

  if (utmSource)   url.searchParams.set("utm_source",   utmSource)
  if (utmMedium)   url.searchParams.set("utm_medium",   utmMedium)
  if (utmCampaign) url.searchParams.set("utm_campaign", utmCampaign)
  if (utmContent)  url.searchParams.set("utm_content",  utmContent)
  if (utmTerm)     url.searchParams.set("utm_term",     utmTerm)

  return url.toString()
}
