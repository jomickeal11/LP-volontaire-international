import type { Metadata } from "next"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://apticr.org"

interface LocalizedMeta {
  title: string
  description: string
  ogTitle: string
  ogDesc: string
  keywords: string[]
}

const metaByLang: Record<string, LocalizedMeta> = {
  fr: {
    title: "Volontariat international | APTIC-R",
    description:
      "Rejoignez APTIC-R pour une mission de volontariat de 6 à 12 mois au Togo. Co-créez des solutions numériques et low-tech pour les communautés rurales d'Agbélouvé.",
    ogTitle: "Volontariat International au Togo — APTIC-R",
    ogDesc: "Innover avec les communautés rurales du Togo. Missions de 6 à 12 mois à Agbélouvé.",
    keywords: ["Volontariat Togo", "Bénévolat Afrique", "Mission humanitaire Togo", "APTIC-R Agbélouvé", "Volontaire international"],
  },
  en: {
    title: "International Volunteering | APTIC-R",
    description:
      "Join APTIC-R for 6-12 month international volunteer missions in digital innovation, low-tech agriculture, and rural community development in Togo.",
    ogTitle: "International Volunteers in Togo — APTIC-R",
    ogDesc: "Build meaningful technology alongside rural communities in Togo. 6-12 month missions.",
    keywords: ["Volunteer Togo", "Volunteering Africa", "International Volunteers Togo", "APTIC-R", "Community development"],
  },
  de: {
    title: "Freiwilligendienst | APTIC-R",
    description:
      "Engagieren Sie sich bei APTIC-R in Togo für 6-12 Monate in digitalen Innovationen, nachhaltiger Landwirtschaft und ländlicher Entwicklung.",
    ogTitle: "Internationale Freiwilligendienste in Togo — APTIC-R",
    ogDesc: "Technologie und nachhaltige Lösungen für ländliche Gemeinschaften in Togo mitgestalten.",
    keywords: ["Freiwilligendienst Togo", "Freiwilligenarbeit Afrika", "weltwärts Togo", "APTIC-R"],
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang } = await params
  const currentLang = lang?.toLowerCase() in metaByLang ? lang.toLowerCase() : "fr"
  const meta = metaByLang[currentLang]

  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: {
      canonical: `/${currentLang}/volontariat`,
      languages: {
        fr: "/fr/volontariat",
        en: "/en/volunteering",
        de: "/de/freiwilligendienst",
        "x-default": "/fr/volontariat",
      },
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDesc,
      url: `${baseUrl}/${currentLang}/volontariat`,
      siteName: "APTIC-R",
      locale: currentLang === "fr" ? "fr_FR" : currentLang === "de" ? "de_DE" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.ogTitle,
      description: meta.ogDesc,
    },
  }
}

export default function VolontariatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
