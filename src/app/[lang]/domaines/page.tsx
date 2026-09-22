import React from "react"
import type { Metadata } from "next"
import DomainsView from "@/views/DomainsView"
import { getDomaines } from "@/lib/cms-actions"
import type { Language } from "@/types"

interface PageProps {
  params: Promise<{ lang: string }>
}

export const revalidate = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"

  const titles: Record<string, string> = {
    FR: "Nos Domaines d'Action — Pôles d'intervention | APTIC-R",
    EN: "Our Action Domains — Intervention Programs | APTIC-R",
    DE: "Unsere Handlungsfelder — Schwerpunkte | APTIC-R",
  }

  const descriptions: Record<string, string> = {
    FR: "Découvrez les 6 domaines d'intervention prioritaires de l'APTIC-R : inclusion numérique, jeunesse, cybersécurité, agriculture durable, données citoyennes et fablabs ruraux.",
    EN: "Explore the 6 priority action domains of APTIC-R: digital inclusion, youth, cybersecurity, sustainable agriculture, open data, and rural community fablabs.",
    DE: "Entdecken Sie die 6 Schwerpunktbereiche von APTIC-R: digitale Inklusion, Jugend, Cybersicherheit, nachhaltige Landwirtschaft, offene Daten und ländliche FabLabs.",
  }

  return {
    title: titles[upperLang] || titles.FR,
    description: descriptions[upperLang] || descriptions.FR,
    alternates: {
      canonical: `/${upperLang.toLowerCase()}/domaines`,
      languages: {
        fr: "/fr/domaines",
        en: "/en/domaines",
        de: "/de/domaines",
      },
    },
  }
}

export default async function DomainsPage({ params }: PageProps) {
  const { lang } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"

  const domaines = await getDomaines({ activeOnly: true })

  return <DomainsView lang={upperLang} initialDomaines={domaines} />
}
