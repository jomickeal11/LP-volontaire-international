import type { Metadata } from "next"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://volontaires.apticr.org"

interface LocalizedMeta {
  title: string
  description: string
  ogTitle: string
  ogDesc: string
}

const metaByLang: Record<string, LocalizedMeta> = {
  fr: {
    title: "Postuler — Volontariat International au Togo (6–12 mois) | APTIC-R",
    description:
      "Formulaire officiel de candidature pour les missions de volontariat international d'APTIC-R à Agbélouvé, Togo. Projets en numérique rural, agroécologie et co-création.",
    ogTitle: "Candidature Volontariat International Togo — APTIC-R",
    ogDesc: "Rejoignez l'équipe APTIC-R à Agbélouvé pour une mission de 6 à 12 mois au cœur des communautés rurales.",
  },
  en: {
    title: "Apply — International Volunteer Missions in Togo (6–12 months) | APTIC-R",
    description:
      "Official application form for APTIC-R international volunteer missions in Agbélouvé, Togo. Projects in rural digital tech, agroecology, and co-creation.",
    ogTitle: "Apply for International Volunteering in Togo — APTIC-R",
    ogDesc: "Join APTIC-R in Agbélouvé for a 6–12 month mission working directly with rural communities in West Africa.",
  },
  de: {
    title: "Bewerbung — Internationaler Freiwilligendienst in Togo (6–12 Monate) | APTIC-R",
    description:
      "Offizielles Bewerbungsformular für internationale Freiwilligeneinsätze bei APTIC-R in Agbélouvé, Togo. Projekte in digitaler Technologie und ländlicher Entwicklung.",
    ogTitle: "Bewerbung Freiwilligendienst Togo — APTIC-R",
    ogDesc: "6–12 Monate ehrenamtlicher Einsatz in Agbélouvé, Togo. Co-Kreation und digitale Werkzeuge für ländliche Gemeinschaften.",
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
    alternates: {
      canonical: `/${currentLang}/apply`,
      languages: {
        fr: "/fr/apply",
        en: "/en/apply",
        de: "/de/apply",
        "x-default": "/fr/apply",
      },
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDesc,
      url: `${baseUrl}/${currentLang}/apply`,
      siteName: "APTIC-R International Volunteers",
      locale: currentLang === "fr" ? "fr_FR" : currentLang === "de" ? "de_DE" : "en_US",
      alternateLocale: currentLang === "fr" ? ["en_US", "de_DE"] : currentLang === "de" ? ["fr_FR", "en_US"] : ["fr_FR", "de_DE"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.ogTitle,
      description: meta.ogDesc,
    },
  }
}

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
