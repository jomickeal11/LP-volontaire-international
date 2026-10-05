import type { MetadataRoute } from "next"
import { getSiteUrl } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/fr", "/en", "/de", "/fr/*", "/en/*", "/de/*"],
        disallow: [
          "/backoffice",
          "/backoffice/*",
          "/*/backoffice",
          "/*/backoffice/*",
          "/admin",
          "/admin/*",
          "/*/admin",
          "/*/admin/*",
          "/api/*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
