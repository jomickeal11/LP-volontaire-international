import React from "react"
import type { Metadata } from "next"
import DomainsView from "@/views/DomainsView"
import { getDomaines } from "@/lib/cms-actions"
import { getSiteUrl } from "@/lib/seo"
import type { Language } from "@/types"

interface PageProps {
  params: Promise<{ lang: string }>
}

export const revalidate = 60

const TITLES: Record<string, string> = {
  FR: "Nos Domaines d'Action | Pôles d'intervention | APTIC-R",
  EN: "Our Action Domains | Intervention Programs | APTIC-R",
  DE: "Unsere Handlungsfelder | Schwerpunkte | APTIC-R",
}

const DESCRIPTIONS: Record<string, string> = {
  FR: "Découvrez les 6 domaines d'intervention prioritaires de l'APTIC-R : inclusion numérique, jeunesse, cybersécurité, agriculture durable, données citoyennes et fablabs ruraux.",
  EN: "Explore the 6 priority action domains of APTIC-R: digital inclusion, youth, cybersecurity, sustainable agriculture, open data, and rural community fablabs.",
  DE: "Entdecken Sie die 6 Schwerpunktbereiche von APTIC-R: digitale Inklusion, Jugend, Cybersicherheit, nachhaltige Landwirtschaft, offene Daten und ländliche FabLabs.",
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"
  const l = upperLang.toLowerCase()
  const canonical = `/${l}/domaines`

  return {
    title: TITLES[upperLang] || TITLES.FR,
    description: DESCRIPTIONS[upperLang] || DESCRIPTIONS.FR,
    alternates: {
      canonical,
      languages: {
        fr: "/fr/domaines",
        en: "/en/domaines",
        de: "/de/domaines",
        "x-default": "/fr/domaines",
      },
    },
    openGraph: {
      title: TITLES[upperLang] || TITLES.FR,
      description: DESCRIPTIONS[upperLang] || DESCRIPTIONS.FR,
      url: `${getSiteUrl()}${canonical}`,
      siteName: "APTIC-R",
      locale: l === "fr" ? "fr_FR" : l === "de" ? "de_DE" : "en_US",
      type: "website",
      images: [{ url: "/hero_volunteer_collab.jpg" }],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLES[upperLang] || TITLES.FR,
      description: DESCRIPTIONS[upperLang] || DESCRIPTIONS.FR,
      images: ["/hero_volunteer_collab.jpg"],
    },
  }
}

export default async function DomainsPage({ params }: PageProps) {
  const { lang } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"

  const domaines = await getDomaines({ activeOnly: true, lang: upperLang })

  return <DomainsView lang={upperLang} initialDomaines={domaines} />
}
