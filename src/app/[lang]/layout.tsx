import type { Metadata, Viewport } from "next"
import "../globals.css"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volontaires.apticr.org"

interface LocalizedMeta {
  title: string
  description: string
  ogTitle: string
  ogDesc: string
  keywords: string[]
}

const metaByLang: Record<string, LocalizedMeta> = {
  fr: {
    title: "APTIC-R — Volontaires Internationaux | Agbélouvé, Togo",
    description:
      "Rejoignez l'association APTIC-R au Togo pour une mission de volontariat de 6 à 12 mois. Co-créez des solutions concrètes en numérique, agriculture durable et développement communautaire.",
    ogTitle: "Volontariat International au Togo — APTIC-R",
    ogDesc: "Innover et construire des technologies utiles avec les communautés rurales du Togo. Missions de 6 à 12 mois à Agbélouvé.",
    keywords: [
      "Volontariat Togo",
      "Bénévolat Afrique",
      "Mission humanitaire Togo",
      "APTIC-R Agbélouvé",
      "Agriculture numérique Afrique",
      "Low-tech rural",
      "Volontaire international",
    ],
  },
  en: {
    title: "APTIC-R — International Volunteers | Agbélouvé, Togo",
    description:
      "Join APTIC-R in Togo for 6–12 month international volunteer missions in digital innovation, low-tech agriculture, and rural community development.",
    ogTitle: "International Volunteers in Togo — APTIC-R",
    ogDesc: "Build meaningful technology and sustainable solutions alongside rural communities in Togo. 6–12 month missions.",
    keywords: [
      "Volunteer Togo",
      "Volunteering Africa",
      "International Volunteers Togo",
      "APTIC-R Agbélouvé",
      "Digital Agriculture",
      "Low-tech rural innovation",
      "Community development Togo",
    ],
  },
  de: {
    title: "APTIC-R — Internationale Freiwillige | Agbélouvé, Togo",
    description:
      "Engagieren Sie sich bei APTIC-R in Togo für 6–12 Monate in digitalen Innovationen, nachhaltiger Landwirtschaft und ländlicher Entwicklung.",
    ogTitle: "Internationale Freiwilligendienste in Togo — APTIC-R",
    ogDesc: "Technologie und nachhaltige Lösungen für ländliche Gemeinschaften in Togo mitgestalten. 6–12 Monate in Agbélouvé.",
    keywords: [
      "Freiwilligendienst Togo",
      "Freiwilligenarbeit Afrika",
      "weltwärts Togo",
      "APTIC-R Agbélouvé",
      "Digitale Landwirtschaft",
      "Low-Tech Innovation",
    ],
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const currentLang = (lang?.toLowerCase() in metaByLang) ? lang.toLowerCase() : "fr"
  const meta = metaByLang[currentLang]

  return {
    metadataBase: new URL(baseUrl),
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    authors: [{ name: "APTIC-R", url: baseUrl }],
    creator: "APTIC-R Agbélouvé",
    publisher: "APTIC-R",
    alternates: {
      canonical: `/${currentLang}`,
      languages: {
        fr: "/fr",
        en: "/en",
        de: "/de",
        "x-default": "/fr",
      },
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDesc,
      url: `${baseUrl}/${currentLang}`,
      siteName: "APTIC-R International Volunteers",
      images: [
        {
          url: "/hero_volunteer_collab.jpg",
          width: 1200,
          height: 630,
          alt: "Volontariat international APTIC-R à Agbélouvé, Togo",
        },
      ],
      locale: currentLang === "fr" ? "fr_FR" : currentLang === "de" ? "de_DE" : "en_US",
      alternateLocale: currentLang === "fr" ? ["en_US", "de_DE"] : currentLang === "de" ? ["fr_FR", "en_US"] : ["fr_FR", "de_DE"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.ogTitle,
      description: meta.ogDesc,
      images: ["/hero_volunteer_collab.jpg"],
    },
    icons: {
      icon: "/aptic-logo.png",
      apple: "/aptic-logo.png",
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "google-site-verification-apticr-code",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  return (
    <html lang={lang || "fr"} className="scroll-smooth">
      <body className="antialiased min-h-screen flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
        {children}
      </body>
    </html>
  )
}
