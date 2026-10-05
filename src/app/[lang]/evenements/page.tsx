import React from "react"
import type { Metadata } from "next"
import EventsView from "@/views/EventsView"
import { getEvents } from "@/lib/cms-actions"
import { toPublicEvent, toPublicParticipation } from "@/lib/events"
import { getEventCapacityStatsMap } from "@/lib/event-participation"
import { getSiteUrl } from "@/lib/seo"
import type { Language } from "@/types"

interface PageProps {
  params: Promise<{ lang: string }>
}

export const revalidate = 60

const TITLES: Record<string, string> = {
  FR: "Événements & Formations | APTIC-R",
  EN: "Events & Training | APTIC-R",
  DE: "Veranstaltungen & Schulungen | APTIC-R",
}

const DESCRIPTIONS: Record<string, string> = {
  FR: "Découvrez les événements, formations, ateliers, conférences et hackathons de l'APTIC-R au Togo : rendez-vous à venir, sessions de formation et archives.",
  EN: "Discover APTIC-R events, training sessions, workshops, conferences and hackathons in Togo: upcoming gatherings, training sessions and archives.",
  DE: "Entdecken Sie Veranstaltungen, Schulungen, Workshops, Konferenzen und Hackathons von APTIC-R in Togo: kommende Termine, Schulungssitzungen und Archiv.",
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"
  const l = upperLang.toLowerCase()
  const canonical = `/${l}/evenements`

  return {
    title: TITLES[upperLang] || TITLES.FR,
    description: DESCRIPTIONS[upperLang] || DESCRIPTIONS.FR,
    alternates: {
      canonical,
      languages: {
        fr: "/fr/evenements",
        en: "/en/evenements",
        de: "/de/evenements",
        "x-default": "/fr/evenements",
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

export default async function EventsPage({ params }: PageProps) {
  const { lang } = await params
  const upperLang = (lang?.toUpperCase() as Language) || "FR"

  // Uniquement les événements publiés ET complets dans la langue demandée
  // (aucun repli automatique vers le français).
  const events = await getEvents({ lang: upperLang })

  // Projection vers la vue publique monolingue : aucune donnée FR/EN/DE
  // non demandée n'est sérialisée vers le navigateur.
  const publicEvents = events
    .map((event) => toPublicEvent(event, upperLang))
    .filter((event): event is NonNullable<typeof event> => event !== null)

  // Compteurs calculés en une seule requête pour toute la grille, puis projetés
  // par exactement la même fonction que la page de détail : il n'existe qu'un seul
  // endroit qui décide si un événement affiche « Complet » ou combien de places
  // restent. Une demande en attente n'entre jamais dans ce décompte.
  const statsByEvent = await getEventCapacityStatsMap(publicEvents.map((event) => event.id))
  for (const event of publicEvents) {
    const stats = statsByEvent[event.id]
    event.participation = toPublicParticipation({
      registrationOpen: event.registrationOpen,
      capacity: stats.capacity,
      remainingPlaces: stats.remainingPlaces,
      validatedParticipants: stats.validatedParticipants,
      pendingRequests: stats.pendingRequests,
    })
  }

  return <EventsView lang={upperLang} events={publicEvents} />
}
