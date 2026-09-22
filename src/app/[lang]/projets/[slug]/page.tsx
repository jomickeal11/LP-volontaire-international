import React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import ProjectDetailView from "@/views/ProjectDetailView"
import { getProjectBySlug } from "@/lib/cms-actions"
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
      ? project.titleEn || project.titleFr
      : upperLang === "DE"
      ? project.titleDe || project.titleFr
      : project.titleFr

  const desc =
    upperLang === "EN"
      ? project.summaryEn || project.summaryFr
      : upperLang === "DE"
      ? project.summaryDe || project.summaryFr
      : project.summaryFr

  return {
    title: `${title} — Projet de terrain | APTIC-R`,
    description: desc ? desc.slice(0, 160) : `Découvrez le projet ${title} de l'APTIC-R.`,
    alternates: {
      canonical: `/${upperLang.toLowerCase()}/projets/${project.slug || slug}`,
      languages: {
        fr: `/fr/projets/${project.slug || slug}`,
        en: `/en/projets/${project.slug || slug}`,
        de: `/de/projets/${project.slug || slug}`,
      },
    },
    openGraph: {
      title: `${title} — APTIC-R`,
      description: desc ? desc.slice(0, 160) : undefined,
      images: project.featuredImage ? [{ url: project.featuredImage }] : undefined,
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
