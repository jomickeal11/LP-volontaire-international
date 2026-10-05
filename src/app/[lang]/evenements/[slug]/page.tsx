import React from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import EventDetailView from "@/views/EventDetailView"
import { getEventBySlug, getEventAvailableLanguages } from "@/lib/cms-actions"
import { getEventLocalizedFields, toPublicEvent, toPublicParticipation } from "@/lib/events"
import { getEventCapacityStats } from "@/lib/event-participation"
import { getSiteUrl, localeCode } from "@/lib/seo"
import type { Language } from "@/types"

interface PageProps {
  params: Promise<{ lang: string; slug: string }>
}

export const revalidate = 60

/**
 * Métadonnées de repli quand l'événement n'est pas public dans la langue
 * demandée. Traduites comme tous les autres libellés système : aucune page EN
 * ou DE ne doit exposer un titre français.
 */
const NOT_FOUND_METADATA: Record<Language, { title: string; description: string }> = {
  FR: {
    title: "Événement introuvable | APTIC-R",
    description:
      "L’événement demandé n’est pas disponible ou n’est pas publié dans cette langue.",
  },
  EN: {
    title: "Event not found | APTIC-R",
    description: "This event is not available or not published in this language.",
  },
  DE: {
    title: "Veranstaltung nicht gefunden | APTIC-R",
    description:
      "Diese Veranstaltung ist nicht verfügbar oder in dieser Sprache nicht veröffentlicht.",
  },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, slug } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"
  const l = upperLang.toLowerCase()

  // getEventBySlug retourne null si l'événement n'existe pas, n'est pas publié,
  // ou n'est pas complet dans la langue demandée.
  const event = await getEventBySlug(slug, upperLang)

  if (!event) {
    const fallback = NOT_FOUND_METADATA[upperLang] ?? NOT_FOUND_METADATA.FR
    return {
      title: fallback.title,
      description: fallback.description,
      robots: { index: false, follow: false },
    }
  }

  // Titre réel de l'événement dans la langue demandée — aucun repli FR
  const { title, description } = getEventLocalizedFields(event, upperLang)

  const eventSlug = event.slug
  const description160 = description ? description.slice(0, 160) : undefined

  // hreflang strict : uniquement les langues où l'événement est réellement servi.
  const available = await getEventAvailableLanguages(eventSlug)
  const languages: Record<string, string> = {}
  for (const availableLang of available) {
    languages[availableLang.toLowerCase()] = `/${availableLang.toLowerCase()}/evenements/${eventSlug}`
  }
  const defaultLang = available.includes("FR") ? "fr" : available[0]?.toLowerCase() ?? l
  languages["x-default"] = `/${defaultLang}/evenements/${eventSlug}`

  const canonical = `/${l}/evenements/${eventSlug}`

  return {
    title: `${title} | APTIC-R`,
    description: description160,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: `${title} — APTIC-R`,
      description: description160,
      url: `${getSiteUrl()}${canonical}`,
      siteName: "APTIC-R",
      locale: localeCode(upperLang),
      type: "article",
      images: event.featuredImage ? [{ url: event.featuredImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — APTIC-R`,
      description: description160,
      images: event.featuredImage ? [event.featuredImage] : undefined,
    },
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { lang, slug } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"

  const event = await getEventBySlug(slug, upperLang)
  const publicEvent = toPublicEvent(event, upperLang)

  // Véritable 404 serveur : événement inexistant, non publié,
  // ou incomplet dans la langue demandée.
  if (!publicEvent) {
    notFound()
  }

  // Compteur de places calculé CÔTÉ SERVEUR. Le navigateur ne fait que
  // renderer l'état transmis : il ne peut ni déduire ni usurper une place.
  const stats = await getEventCapacityStats(publicEvent.id)
  publicEvent.participation = toPublicParticipation({
    registrationOpen: publicEvent.registrationOpen,
    capacity: stats.capacity,
    remainingPlaces: stats.remainingPlaces,
    validatedParticipants: stats.validatedParticipants,
    pendingRequests: stats.pendingRequests,
  })

  return <EventDetailView lang={upperLang} event={publicEvent} />
}
