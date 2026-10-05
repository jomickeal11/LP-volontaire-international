import React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ProjectDetailView from "@/views/ProjectDetailView"
import { getProjectBySlug, getProjectAvailableLanguages } from "@/lib/cms-actions"
import { getSiteUrl, localeCode } from "@/lib/seo"
import type { Language } from "@/types"

interface PageProps {
  params: Promise<{ lang: string; slug: string }>
}

export const revalidate = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"

  const project = await getProjectBySlug(slug, upperLang)
  if (!project) {
    return {
      title: "Projet introuvable | APTIC-R",
      description: "Le projet demandé n'est pas disponible ou n'est pas publié dans cette langue.",
    }
  }

  const title =
    upperLang === "EN"
      ? project.titleEn ?? ""
      : upperLang === "DE"
      ? project.titleDe ?? ""
      : project.titleFr

  const desc =
    upperLang === "EN"
      ? project.summaryEn ?? ""
      : upperLang === "DE"
      ? project.summaryDe ?? ""
      : project.summaryFr

  const projectSlug = project.slug || slug
  const l = upperLang.toLowerCase()

  // hreflang strict : uniquement les langues où le projet est réellement servi.
  const available = await getProjectAvailableLanguages(projectSlug)
  const languages: Record<string, string> = {}
  for (const availableLang of available) {
    languages[availableLang.toLowerCase()] = `/${availableLang.toLowerCase()}/projets/${projectSlug}`
  }
  const defaultLang = available.includes("FR") ? "fr" : available[0]?.toLowerCase() ?? l
  languages["x-default"] = `/${defaultLang}/projets/${projectSlug}`

  const description = desc ? desc.slice(0, 160) : undefined
  const canonical = `/${l}/projets/${projectSlug}`

  return {
    title: `${title} | APTIC-R`,
    description: description ?? `Découvrez le projet ${title} de l'APTIC-R.`,
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
      type: "article",
      images: project.featuredImage ? [{ url: project.featuredImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — APTIC-R`,
      description,
      images: project.featuredImage ? [project.featuredImage] : undefined,
    },
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { lang, slug } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"

  // Strict CMS resolution with multilingual isolation:
  // If the project doesn't exist or isn't published for `upperLang`, returns null -> notFound()
  const project = await getProjectBySlug(slug, upperLang)

  if (!project) {
    notFound()
  }

  return <ProjectDetailView project={project} lang={upperLang} />
}
