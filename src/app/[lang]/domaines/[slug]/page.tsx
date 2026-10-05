import React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import DomainDetailView from "@/views/DomainDetailView"
import { getDomaineBySlug, getDomaines, getDomaineAvailableLanguages } from "@/lib/cms-actions"
import { getSiteUrl, localeCode, DEFAULT_OG_IMAGE } from "@/lib/seo"
import type { Language } from "@/types"

interface PageProps {
  params: Promise<{ lang: string; slug: string }>
}

export const revalidate = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"

  const domaine = await getDomaineBySlug(slug, upperLang)
  if (!domaine || !domaine.active) {
    return {
      title: "Domaine d'action | APTIC-R",
      description: "Pôle d'intervention de l'organisation APTIC-R.",
    }
  }

  const title =
    upperLang === "EN"
      ? domaine.nameEn ?? ""
      : upperLang === "DE"
      ? domaine.nameDe ?? ""
      : domaine.nameFr

  const desc =
    upperLang === "EN"
      ? domaine.descEn ?? ""
      : upperLang === "DE"
      ? domaine.descDe ?? ""
      : domaine.descFr

  const domaineSlug = domaine.slug || slug
  const l = upperLang.toLowerCase()

  // hreflang strict : uniquement les langues où le domaine est réellement servi.
  const available = await getDomaineAvailableLanguages(domaineSlug)
  const languages: Record<string, string> = {}
  for (const availableLang of available) {
    languages[availableLang.toLowerCase()] = `/${availableLang.toLowerCase()}/domaines/${domaineSlug}`
  }
  const defaultLang = available.includes("FR") ? "fr" : available[0]?.toLowerCase() ?? l
  languages["x-default"] = `/${defaultLang}/domaines/${domaineSlug}`

  const description = desc ? desc.slice(0, 160) : undefined
  const canonical = `/${l}/domaines/${domaineSlug}`

  return {
    title: `${title} | APTIC-R`,
    description: description ?? `Découvrez le pôle ${title} de l'APTIC-R.`,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: `${title} — APTIC-R`,
      description,
      url: `${getSiteUrl()}${canonical}`,
      siteName: "APTIC-R",
      locale: localeCode(upperLang),
      type: "website",
      // Le modèle Domaine ne dispose d'aucun champ image : on réutilise
      // l'image de repli globale du site plutôt que d'en fabriquer une.
      images: [{ url: DEFAULT_OG_IMAGE }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — APTIC-R`,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
  }
}

export default async function DomainDetailPage({ params }: PageProps) {
  const { lang, slug } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"

  const domaine = await getDomaineBySlug(slug, upperLang)

  if (!domaine || !domaine.active) {
    notFound()
  }

  const allDomaines = await getDomaines({ activeOnly: true, lang: upperLang })

  return (
    <DomainDetailView
      domaine={domaine}
      allDomaines={allDomaines}
      lang={upperLang}
    />
  )
}
