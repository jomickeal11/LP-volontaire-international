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
    title: "Partenariats — Organismes d'Envoi de Volontaires Européens | APTIC-R Togo",
    description:
      "Construisez un partenariat durable avec APTIC-R à Agbélouvé, Togo. Accueil et encadrement de volontaires européens (weltwärts, France Volontaires, CES, universités).",
    ogTitle: "Partenariats Européens de Volontariat au Togo — APTIC-R",
    ogDesc: "Développez des missions de 6 à 12 mois à fort impact pour vos volontaires au Togo.",
  },
  en: {
    title: "Partnerships — European Volunteer Sending Organizations | APTIC-R Togo",
    description:
      "Build a long-term partnership with APTIC-R in Agbélouvé, Togo. Structured hosting and mentoring for European volunteers (weltwärts, France Volontaires, ESC, universities).",
    ogTitle: "European Volunteer Partnerships in Togo — APTIC-R",
    ogDesc: "Develop 6–12 month high-impact volunteer missions alongside rural communities in Togo.",
  },
  de: {
    title: "Partnerschaften — Europäische Entsendeorganisationen | APTIC-R Togo",
    description:
      "Bauen Sie eine nachhaltige Partnerschaft mit APTIC-R in Agbélouvé, Togo auf. Strukturierte Einsätze und Begleitung für europäische Freiwillige (weltwärts, FV, ESK).",
    ogTitle: "Freiwilligenpartnerschaften in Togo — APTIC-R",
    ogDesc: "Entwickeln Sie 6- bis 12-monatige bedeutungsvolle Einsätze für Ihre Freiwilligen in Westafrika.",
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
      canonical: `/${currentLang}/partners`,
      languages: {
        fr: "/fr/partners",
        en: "/en/partners",
        de: "/de/partners",
        "x-default": "/fr/partners",
      },
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDesc,
      url: `${baseUrl}/${currentLang}/partners`,
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

export default function PartnersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
