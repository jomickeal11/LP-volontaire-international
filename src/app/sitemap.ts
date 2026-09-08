import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volontaires.apticr.org"
  const languages = ["fr", "en", "de"]
  const pages = ["", "/apply", "/partners"]

  const entries: MetadataRoute.Sitemap = []

  // Add localized routes
  for (const lang of languages) {
    for (const page of pages) {
      entries.push({
        url: `${baseUrl}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1.0 : page === "/apply" ? 0.9 : 0.8,
        alternates: {
          languages: {
            fr: `${baseUrl}/fr${page}`,
            en: `${baseUrl}/en${page}`,
            de: `${baseUrl}/de${page}`,
            "x-default": `${baseUrl}/fr${page}`,
          },
        },
      })
    }
  }

  return entries
}
