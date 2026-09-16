import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://apticr.org"
  const languages = ["fr", "en", "de"]

  // Public institutional pages with their localized paths and priorities
  const pages = [
    { path: { fr: "", en: "", de: "" }, priority: 1.0, freq: "weekly" as const },
    { path: { fr: "volontariat", en: "volunteering", de: "freiwilligendienst" }, priority: 0.95, freq: "weekly" as const },
    { path: { fr: "volontariat/postuler", en: "volunteering/apply", de: "freiwilligendienst/bewerben" }, priority: 0.9, freq: "monthly" as const },
    { path: { fr: "partenaires", en: "partners", de: "partner" }, priority: 0.85, freq: "monthly" as const },
    { path: { fr: "a-propos", en: "about", de: "ueber-uns" }, priority: 0.8, freq: "monthly" as const },
    { path: { fr: "domaines", en: "domains", de: "bereiche" }, priority: 0.8, freq: "monthly" as const },
    { path: { fr: "projets", en: "projects", de: "projekte" }, priority: 0.8, freq: "weekly" as const },
    { path: { fr: "actualites", en: "news", de: "aktuelles" }, priority: 0.8, freq: "daily" as const },
    { path: { fr: "equipe", en: "team", de: "team" }, priority: 0.6, freq: "monthly" as const },
    { path: { fr: "contact", en: "contact", de: "kontakt" }, priority: 0.7, freq: "monthly" as const },
    { path: { fr: "devenir-membre", en: "become-member", de: "mitglied-werden" }, priority: 0.75, freq: "monthly" as const },
    { path: { fr: "ressources", en: "resources", de: "ressourcen" }, priority: 0.7, freq: "weekly" as const },
    { path: { fr: "galerie", en: "gallery", de: "galerie" }, priority: 0.6, freq: "weekly" as const },
  ]

  const entries: MetadataRoute.Sitemap = []

  for (const page of pages) {
    for (const lang of languages) {
      const segment = page.path[lang as keyof typeof page.path]
      const url = segment ? `${baseUrl}/${lang}/${segment}` : `${baseUrl}/${lang}`

      entries.push({
        url,
        lastModified: new Date(),
        changeFrequency: page.freq,
        priority: page.priority,
        alternates: {
          languages: {
            fr: page.path.fr ? `${baseUrl}/fr/${page.path.fr}` : `${baseUrl}/fr`,
            en: page.path.en ? `${baseUrl}/en/${page.path.en}` : `${baseUrl}/en`,
            de: page.path.de ? `${baseUrl}/de/${page.path.de}` : `${baseUrl}/de`,
            "x-default": page.path.fr ? `${baseUrl}/fr/${page.path.fr}` : `${baseUrl}/fr`,
          },
        },
      })
    }
  }

  return entries
}
