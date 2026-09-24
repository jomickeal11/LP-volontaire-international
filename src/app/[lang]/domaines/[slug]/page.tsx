import React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import DomainDetailView from "@/views/DomainDetailView"
import { getDomaineBySlug, getDomaines } from "@/lib/cms-actions"
import type { Language } from "@/types"

interface PageProps {
  params: Promise<{ lang: string; slug: string }>
}

export const revalidate = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"

  const domaine = await getDomaineBySlug(slug)
  if (!domaine || !domaine.active) {
    return {
      title: "Domaine d'action | APTIC-R",
      description: "Pôle d'intervention de l'organisation APTIC-R.",
    }
  }

  const title =
    upperLang === "EN"
      ? domaine.nameEn || domaine.nameFr
      : upperLang === "DE"
      ? domaine.nameDe || domaine.nameFr
      : domaine.nameFr

  const desc =
    upperLang === "EN"
      ? domaine.descEn || domaine.descFr
      : upperLang === "DE"
      ? domaine.descDe || domaine.descFr
      : domaine.descFr

  return {
    title: `${title} | APTIC-R`,
    description: desc ? desc.slice(0, 160) : `Découvrez le pôle ${title} de l'APTIC-R.`,
    alternates: {
      canonical: `/${upperLang.toLowerCase()}/domaines/${domaine.slug || slug}`,
      languages: {
        fr: `/fr/domaines/${domaine.slug || slug}`,
        en: `/en/domaines/${domaine.slug || slug}`,
        de: `/de/domaines/${domaine.slug || slug}`,
      },
    },
  }
}

export default async function DomainDetailPage({ params }: PageProps) {
  const { lang, slug } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"

  const domaine = await getDomaineBySlug(slug)

  if (!domaine || !domaine.active) {
    notFound()
  }

  const allDomaines = await getDomaines({ activeOnly: true })

  return (
    <DomainDetailView
      domaine={domaine}
      allDomaines={allDomaines}
      lang={upperLang}
    />
  )
}
