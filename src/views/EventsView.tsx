"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import { getHeaderMode, ROUTES } from "@/lib/pageLayout"
import Footer from "@/components/Footer"
import EventImagePlaceholder from "@/components/EventImagePlaceholder"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import {
  EVENT_CATEGORIES,
  formatEventDate,
  formatEventTime,
  isEventUpcoming,
  resolveEventCategoryLabel,
  type EventCategory,
  type PublicEvent,
} from "@/lib/events"

interface EventsViewProps {
  lang: Language
  events: PublicEvent[]
}

const BG_HERO = "#F7F8FA"
const BG_ALT = "#F7F8FA"

const CATEGORY_ORDER = EVENT_CATEGORIES

type FilterValue = "ALL" | EventCategory

const I18N = {
  FR: {
    eyebrow: "ÉVÉNEMENTS & FORMATIONS",
    title: "Nos rendez-vous,\nateliers et formations.",
    subtitle:
      "Découvrez les événements, formations, ateliers, conférences et hackathons organisés par l'APTIC-R pour former, fédérer et professionnaliser les acteurs du numérique rural.",
    filterAll: "Tous",
    filterLabels: {
      TRAINING: "Formations",
      WORKSHOP: "Ateliers",
      CONFERENCE: "Conférences",
      HACKATHON: "Hackathons",
      CEREMONY: "Cérémonies",
    },
    categoryLabels: {
      TRAINING: "Formation",
      WORKSHOP: "Atelier",
      CONFERENCE: "Conférence",
      HACKATHON: "Hackathon",
      CEREMONY: "Cérémonie",
    },
    upcomingLabel: "À VENIR",
    pastLabel: "ÉVÉNEMENTS PASSÉS",
    onlineLabel: "En ligne",
    detailsBtn: "Voir la fiche",
    registerBtn: "Demander à participer",
    fullLabel: "Complet",
    closedLabel: "Demandes fermées",
    remainingLabel: "places restantes",
    spotsLabel: "places",
    loading: "Chargement des événements...",
    emptyPreTitle: "AUCUN RENDEZ-VOUS",
    emptyTitle:
      "Aucun événement n'est disponible dans cette langue pour le moment. Écrivez-nous pour être informé de nos prochaines sessions.",
    emptyAction: "Nous contacter",
    pastEmptyHidden: true,
    listTitle: "Tous les événements",
  },
  EN: {
    eyebrow: "EVENTS & TRAINING",
    title: "Our gatherings,\nworkshops and training sessions.",
    subtitle:
      "Discover the events, training sessions, workshops, conferences and hackathons organised by APTIC-R to train, unite and professionalise rural digital actors.",
    filterAll: "All",
    filterLabels: {
      TRAINING: "Trainings",
      WORKSHOP: "Workshops",
      CONFERENCE: "Conferences",
      HACKATHON: "Hackathons",
      CEREMONY: "Ceremonies",
    },
    categoryLabels: {
      TRAINING: "Training",
      WORKSHOP: "Workshop",
      CONFERENCE: "Conference",
      HACKATHON: "Hackathon",
      CEREMONY: "Ceremony",
    },
    upcomingLabel: "UPCOMING",
    pastLabel: "PAST EVENTS",
    onlineLabel: "Online",
    detailsBtn: "View details",
    registerBtn: "Request to participate",
    fullLabel: "Full",
    closedLabel: "Requests closed",
    remainingLabel: "spots left",
    spotsLabel: "spots",
    loading: "Loading events...",
    emptyPreTitle: "NO EVENTS SCHEDULED",
    emptyTitle:
      "No event is currently available in this language. Contact us to be informed about our upcoming sessions.",
    emptyAction: "Contact us",
    pastEmptyHidden: true,
    listTitle: "All events",
  },
  DE: {
    eyebrow: "VERANSTALTUNGEN & SCHULUNGEN",
    title: "Unsere Termine,\nWorkshops und Schulungen.",
    subtitle:
      "Entdecken Sie die Veranstaltungen, Schulungen, Workshops, Konferenzen und Hackathons von APTIC-R, um Akteurinnen und Akteure des digitalen ländlichen Raums auszubilden und zu vernetzen.",
    filterAll: "Alle",
    filterLabels: {
      TRAINING: "Schulungen",
      WORKSHOP: "Workshops",
      CONFERENCE: "Konferenzen",
      HACKATHON: "Hackathons",
      CEREMONY: "Zeremonien",
    },
    categoryLabels: {
      TRAINING: "Schulung",
      WORKSHOP: "Workshop",
      CONFERENCE: "Konferenz",
      HACKATHON: "Hackathon",
      CEREMONY: "Zeremonie",
    },
    upcomingLabel: "KOMMEND",
    pastLabel: "VERGANGENE VERANSTALTUNGEN",
    onlineLabel: "Online",
    detailsBtn: "Details ansehen",
    registerBtn: "Teilnahme anfragen",
    fullLabel: "Ausgebucht",
    closedLabel: "Anfragen geschlossen",
    remainingLabel: "freie Plätze",
    spotsLabel: "Plätze",
    loading: "Veranstaltungen werden geladen...",
    emptyPreTitle: "KEIN TERMIN VORHANDEN",
    emptyTitle:
      "Derzeit ist in dieser Sprache keine Veranstaltung verfügbar. Kontaktieren Sie uns, um über unsere nächsten Termine informiert zu werden.",
    emptyAction: "Kontakt",
    pastEmptyHidden: true,
    listTitle: "Alle Veranstaltungen",
  },
}

/* ─── Sous-composants ────────────────────────────────────────────────────────── */
function eventCategoryLabel(event: PublicEvent, lang: "FR" | "EN" | "DE"): string {
  return resolveEventCategoryLabel(event, I18N[lang].categoryLabels)
}

function EventMeta({ event, lang }: { event: PublicEvent; lang: "FR" | "EN" | "DE" }) {
  const t = I18N[lang]
  const date = formatEventDate(event.startDate, lang)
  const time = formatEventTime(event.startDate)
  const location = event.location?.trim()

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-[13px] text-slate-500 font-medium">
      {date && (
        <span className="inline-flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0 text-[#003366]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3M3.5 9.5h17M5 5h14a1.5 1.5 0 011.5 1.5v12A1.5 1.5 0 0119 20H5a1.5 1.5 0 01-1.5-1.5v-12A1.5 1.5 0 015 5z" />
          </svg>
          <span className="whitespace-nowrap">{date}</span>
        </span>
      )}
      {time && (
        <span className="inline-flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 shrink-0 text-[#003366]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 7v5l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="whitespace-nowrap">{time}</span>
        </span>
      )}
      {!event.isOnline && location && (
        <span className="inline-flex items-center gap-1.5 min-w-0">
          <svg className="w-3.5 h-3.5 shrink-0 text-[#003366]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
            <circle cx="12" cy="10" r="2.5" fill="none" strokeWidth={1.8} />
          </svg>
          <span className="truncate">{location}</span>
        </span>
      )}
      {event.isOnline && (
        <span className="inline-flex items-center gap-1.5 text-[#28A745] font-bold">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 0c2.5 2.2 2.5 15.8 0 18M3.5 9h17M3.5 15h17" />
          </svg>
          <span className="whitespace-nowrap">{t.onlineLabel}</span>
        </span>
      )}
    </div>
  )
}

function EventCard({ event, lang }: { event: PublicEvent; lang: "FR" | "EN" | "DE" }) {
  const t = I18N[lang]
  const title = event.title
  const description = event.description
  const href = `/${lang.toLowerCase()}/evenements/${event.slug}`
  // Le compteur vient du serveur (`getEventCapacityStatsMap`) : aucune valeur
  // n'est recalculée dans le navigateur, et seule la validation consomme une
  // place.
  const participation = event.participation
  const remaining = participation?.remainingPlaces ?? null
  const remainingLabel =
    !participation?.hasCapacityLimit || remaining === null
      ? null
      : `${remaining} ${t.remainingLabel}`

  return (
    <article className="group flex flex-col bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow">
{/* EVENT VISUAL : toujours présent et toujours 16/9. Avec un visuel on
          l'affiche en contain (jamais de crop) ; sans visuel on retombe sur le
          placeholder institutionnel APTIC-R. Le contenu démarre donc au même
          niveau sur toutes les cartes de la grille. */}
      <div className="w-full aspect-[16/9] shrink-0 bg-[#F7F8FA] overflow-hidden">
        {event.featuredImage ? (
          <img src={event.featuredImage} alt={title} loading="lazy" decoding="async" className="w-full h-full object-contain" />
        ) : (
          <EventImagePlaceholder lang={lang} />
        )}
      </div>

      <div className="p-5 sm:p-6 flex flex-col flex-1 min-w-0">
        <span className="text-[11px] uppercase tracking-wider font-bold text-[#003366] mb-2">
          {eventCategoryLabel(event, lang)}
        </span>

        <h3 className="text-lg sm:text-xl font-bold text-[#003366] leading-snug mb-3 group-hover:text-[#007BFF] transition-colors line-clamp-2">
          <Link href={href}>{title}</Link>
        </h3>

        <div className="mb-4">
          <EventMeta event={event} lang={lang} />
        </div>

        {description && (
          <p className="text-sm text-[#5E6B76] leading-relaxed mb-5 line-clamp-3 whitespace-pre-line">
            {description}
          </p>
        )}

        <div className="mt-auto pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <Link
            href={href}
            className="inline-flex items-center text-xs sm:text-sm font-bold text-[#007BFF] group-hover:text-[#003366] transition-colors"
          >
            {t.detailsBtn} <span className="ml-1.5 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          {participation?.cta === "request" && (
            // « Voir la fiche » ouvre la page telle quelle (lecture).
            // « Demander à participer » vise l'ancre #participation : la fiche
            // s'ouvre ET le formulaire de demande est déjà déployé, sans second
            // clic. L'ancre reste partageable et le clic sur la carte ne change
            // pas le lien « Voir la fiche ».
            <Link
              href={`${href}#participation`}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#007BFF]/10 text-[#007BFF] hover:bg-[#007BFF]/20 transition-colors"
            >
              {t.registerBtn}
            </Link>
          )}
          {participation?.cta === "full" && (
            <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-200 text-slate-500">
              {t.fullLabel}
            </span>
          )}
          {participation?.cta === "closed" && (
            <span className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-400">
              {t.closedLabel}
            </span>
          )}
          {remainingLabel && (
            <span className="ml-auto text-[11px] font-semibold text-slate-400 whitespace-nowrap">
              {remainingLabel}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export default function EventsView({ lang, events }: EventsViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const safeLang = (["FR", "EN", "DE"].includes(lang) ? lang : "FR") as "FR" | "EN" | "DE"
  const t = I18N[safeLang]
  const [filter, setFilter] = useState<FilterValue>("ALL")

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, safeLang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${safeLang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const { upcoming, past } = useMemo(() => {
    const now = Date.now()
    const filtered =
      filter === "ALL" ? events : events.filter((e) => e.category === filter)
    return {
      upcoming: filtered.filter((e) => isEventUpcoming(e.startDate, now)),
      past: filtered.filter((e) => !isEventUpcoming(e.startDate, now)).reverse(),
    }
  }, [events, filter])

  const hasAny = upcoming.length > 0 || past.length > 0

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <PageHeader mode={getHeaderMode(ROUTES.eventsList)} lang={safeLang} setLang={handleSetLang} currentPage="events" navigate={navigate} />

      <main className="flex-1">
        {/* ── 1. Hero (#F7F8FA) ── */}
        <section
          className="px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-10 sm:pb-12 border-b border-slate-200/80"
          style={{ backgroundColor: BG_HERO }}
        >
          <div className="max-w-[1260px] mx-auto">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#28A745]"></span>
              <span className="text-[#28A745] font-bold tracking-widest text-xs uppercase">
                {t.eyebrow}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#003366] tracking-tight mb-3 whitespace-pre-line leading-tight">
              {t.title}
            </h1>

            <p className="text-base sm:text-lg text-[#5E6B76] max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </section>

        {/* ── 2. Filtres éditoriaux (soulignement, sans carte colorée) ── */}
        {hasAny && (
          <section className="border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 sticky top-16 lg:top-20 z-20 bg-white/95 backdrop-blur-md">
            <div className="max-w-[1260px] mx-auto flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
              {(["ALL", ...CATEGORY_ORDER] as FilterValue[]).map((value) => {
                const isActive = filter === value
                const label = value === "ALL" ? t.filterAll : t.filterLabels[value]
                return (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    aria-pressed={isActive}
                    className={`py-3.5 text-xs sm:text-sm font-bold tracking-wide transition-all whitespace-nowrap shrink-0 border-b-2 ${
                      isActive
                        ? "border-[#003366] text-[#003366]"
                        : "border-transparent text-[#5E6B76] hover:text-[#003366]"
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* ── 3. Liste éditoriale ── */}
        <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-[1260px] mx-auto w-full">
          {!hasAny ? (
            /* ── État vide éditorial ── */
            <div
              className="rounded-2xl p-8 sm:p-12 border border-[#E5EAF0] text-center shadow-2xs my-4 max-w-2xl mx-auto"
              style={{ backgroundColor: BG_ALT }}
            >
              <span className="text-xs font-bold tracking-widest text-[#003366] uppercase block mb-2">
                {t.emptyPreTitle}
              </span>
              <p className="text-base sm:text-lg text-[#5E6B76] mb-6 leading-relaxed">
                {t.emptyTitle}
              </p>
              <Link
                href={getPageUrl("contact", safeLang)}
                className="inline-flex items-center text-sm font-bold text-[#007BFF] hover:text-[#003366] transition-colors"
              >
                {t.emptyAction} <span className="ml-1.5 font-bold">→</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-14">
              {/* ── 3.1 Prochains rendez-vous ── */}
              {upcoming.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#003366]">
                      {t.upcomingLabel}
                    </span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {upcoming.map((event) => (
                      <EventCard key={event.id} event={event} lang={safeLang} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── 3.2 Archives ── */}
              {past.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {t.pastLabel}
                    </span>
                    <div className="h-px bg-slate-200 flex-1" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {past.map((event) => (
                      <EventCard key={event.id} event={event} lang={safeLang} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer lang={safeLang} navigate={navigate} />
    </div>
  )
}
