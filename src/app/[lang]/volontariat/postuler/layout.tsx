import type { Metadata } from "next"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://apticr.org"

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
      "Formulaire officiel de candidature pour les missions de volontariat international d'APTIC-R à Agbélouvé, Togo.",
    ogTitle: "Candidature Volontariat International Togo — APTIC-R",
    ogDesc: "Rejoignez l'équipe APTIC-R à Agbélouvé pour une mission de 6 à 12 mois.",
  },
  en: {
    title: "Apply — International Volunteer Missions in Togo (6–12 months) | APTIC-R",
    description:
      "Official application form for APTIC-R international volunteer missions in Agbélouvé, Togo.",
    ogTitle: "Apply for International Volunteering in Togo — APTIC-R",
    ogDesc: "Join APTIC-R in Agbélouvé for a 6–12 month mission working with rural communities.",
  },
  de: {
    title: "Bewerbung — Internationaler Freiwilligendienst in Togo (6–12 Monate) | APTIC-R",
    description:
      "Offizielles Bewerbungsformular für internationale Freiwilligeneinsätze bei APTIC-R in Agbélouvé, Togo.",
    ogTitle: "Bewerbung Freiwilligendienst Togo — APTIC-R",
    ogDesc: "6–12 Monate ehrenamtlicher Einsatz in Agbélouvé, Togo.",
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
      canonical: `/${currentLang}/volontariat/postuler`,
      languages: {
        fr: "/fr/volontariat/postuler",
        en: "/en/volunteering/apply",
        de: "/de/freiwilligendienst/bewerben",
        "x-default": "/fr/volontariat/postuler",
      },
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDesc,
      url: `${baseUrl}/${currentLang}/volontariat/postuler`,
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

export default function PostulerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
