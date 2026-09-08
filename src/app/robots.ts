import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volontaires.apticr.org"

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/fr", "/en", "/de", "/fr/*", "/en/*", "/de/*"],
        disallow: ["/admin", "/admin/*", "/*/admin/*", "/api/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
