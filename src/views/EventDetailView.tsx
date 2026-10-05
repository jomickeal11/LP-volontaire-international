"use client"

import React from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import PageHeader from "@/components/PageHeader"
import { getHeaderMode, ROUTES } from "@/lib/pageLayout"
import Footer from "@/components/Footer"
import EventImagePlaceholder from "@/components/EventImagePlaceholder"
import EventParticipationModal from "@/components/EventParticipationModal"
import PhoneInputField from "@/components/PhoneInputField"
import type { Language, Page } from "@/types"
import { getPageUrl } from "@/types"
import { useRouter, usePathname } from "next/navigation"
import type { PublicEvent } from "@/lib/events"
import {
  formatEventDate,
  formatEventTime,
  resolveEventCategoryLabel,
} from "@/lib/events"
import {
  submitEventParticipationRequest,
  type DuplicateRequestStatus,
} from "@/lib/event-participation-actions"

interface EventDetailViewProps {
  lang: Language
  event: PublicEvent
}

const BG = "#F7F8FA"

/** Ancre du bloc « participation » sur la fiche événement. */
const PARTICIPATION_HASH = "#participation"

/**
 * Tous les libellés système de la fiche, dans les trois langues.
 *
 * RÈGLE : aucun contenu français ne doit subsister sur une page EN ou DE.
 * Les libellés sont donc traduits ici, et le texte de l'événement provient
 * exclusively de la langue demandée (voir `getEventLocalizedFields`, sans
 * repli automatique). Les trois objets exposent EXACTEMENT le même jeu de
 * clés : c'est cette symétrie qui rend `I18N[safeLang]` typé sans cast.
 */
const I18N = {
  FR: {
    backToEvents: "Retour à tous les événements",
    categoryLabels: {
      TRAINING: "Formation",
      WORKSHOP: "Atelier",
      CONFERENCE: "Conférence",
      HACKATHON: "Hackathon",
      CEREMONY: "Cérémonie",
      OTHER: "Autre",
    },
    /* -- Informations pratiques -- */
    practicalTitle: "Informations pratiques",
    dateLabel: "Date",
    dateRangeLabel: "Dates",
    timeLabel: "Heure",
    timeRangeLabel: "Horaires",
    timeRangeFormat: "de {start} à {end}",
    formatLabel: "Format",
    formatOnline: "En ligne",
    formatInPerson: "Présentiel",
    formatHybrid: "En ligne et en présentiel",
    locationLabel: "Lieu",
    capacityLabel: "Capacité",
    spotsUnit: "places",
    remainingLabel: "Places restantes",
    joinOnline: "Rejoindre la session en ligne",
    /* -- Contenu éditorial -- */
    programmeTitle: "Programme",
    contactTitle: "Contact",
    /* -- Participation -- */
    participationTitle: "Demande de participation",
    participationIntro:
      "Votre demande sera étudiée par l’équipe APTIC-R, qui vous contactera pour confirmer votre participation.",
    participationCta: "Demander à participer",
    participationFullTitle: "Événement complet",
    participationFullText:
      "Toutes les places prévues pour cet événement sont prises. L’équipe APTIC-R vous informera des prochaines sessions.",
    participationClosedTitle: "Participation fermée",
    participationClosedText:
      "Les demandes de participation ne sont plus ouvertes pour cet événement.",
    participationDisclaimer:
      "Votre participation sera confirmée par l’équipe APTIC-R après échange avec vous.",
    /* -- Modale de demande -- */
    participationFormTitle: "Demande de participation",
    closeModal: "Fermer la fenêtre",
    fieldFirstName: "Prénom",
    fieldLastName: "Nom",
    fieldEmail: "Adresse email",
    fieldPhone: "Téléphone",
    fieldOrganization: "Organisation",
    fieldCity: "Ville",
    fieldCountry: "Pays",
    fieldMessage: "Message",
    fieldMessagePlaceholder:
      "Précisez votre motivation, vos disponibilités ou toute information utile.",
    fieldConsent:
      "J’accepte que l’équipe APTIC-R utilise ces informations pour me contacter au sujet de cet événement.",
    submitRequest: "Envoyer ma demande",
    submitting: "Envoi en cours…",
    cancelRequest: "Annuler",
    successTitle: "Demande envoyée",
    successText:
      "Votre demande de participation a bien été envoyée. L’équipe APTIC-R vous contactera afin de confirmer votre participation.",
    successReminder:
      "Il s’agit d’une demande : aucune place n’est réservée tant que l’équipe ne vous a pas confirmé votre participation.",
    /* Doublon détecté à l’envoi : message informatif, jamais une alerte rouge. */
    duplicateApprovedTitle: "Participation déjà confirmée",
    duplicateApprovedText:
      "Votre participation à cet événement est déjà confirmée.",
    duplicatePendingTitle: "Demande déjà enregistrée",
    duplicatePendingText:
      "Une demande de participation est déjà en cours de traitement pour cet événement.",
    duplicateClose: "Fermer le message",
    errorInvalid: "Merci de vérifier les champs du formulaire.",
    errorGeneric: "Votre demande n’a pas pu être envoyée. Veuillez réessayer.",
    eventUnavailable: "Cet événement n’est plus accessible à la demande.",
    optional: "facultatif",
  },
  EN: {
    backToEvents: "Back to all events",
    categoryLabels: {
      TRAINING: "Training",
      WORKSHOP: "Workshop",
      CONFERENCE: "Conference",
      HACKATHON: "Hackathon",
      CEREMONY: "Ceremony",
      OTHER: "Other",
    },
    practicalTitle: "Practical information",
    dateLabel: "Date",
    dateRangeLabel: "Dates",
    timeLabel: "Time",
    timeRangeLabel: "Times",
    timeRangeFormat: "from {start} to {end}",
    formatLabel: "Format",
    formatOnline: "Online",
    formatInPerson: "In person",
    formatHybrid: "Online and in person",
    locationLabel: "Venue",
    capacityLabel: "Capacity",
    spotsUnit: "spots",
    remainingLabel: "Places left",
    joinOnline: "Join the online session",
    programmeTitle: "Programme",
    contactTitle: "Contact",
    participationTitle: "Participation request",
    participationIntro:
      "Your request will be reviewed by the APTIC-R team, who will contact you to confirm your participation.",
    participationCta: "Request to participate",
    participationFullTitle: "Event full",
    participationFullText:
      "All the places planned for this event have been taken. The APTIC-R team will inform you about upcoming sessions.",
    participationClosedTitle: "Registration closed",
    participationClosedText:
      "Participation requests are no longer open for this event.",
    participationDisclaimer:
      "Your participation will be confirmed by the APTIC-R team after discussing it with you.",
    participationFormTitle: "Participation request",
    closeModal: "Close the window",
    fieldFirstName: "First name",
    fieldLastName: "Last name",
    fieldEmail: "Email address",
    fieldPhone: "Phone",
    fieldOrganization: "Organization",
    fieldCity: "City",
    fieldCountry: "Country",
    fieldMessage: "Message",
    fieldMessagePlaceholder:
      "Tell us about your motivation, your availability or any useful information.",
    fieldConsent:
      "I agree that the APTIC-R team may use this information to contact me about this event.",
    submitRequest: "Send my request",
    submitting: "Sending…",
    cancelRequest: "Cancel",
    successTitle: "Request sent",
    successText:
      "Your participation request has been sent. The APTIC-R team will contact you to confirm your participation.",
    successReminder:
      "This is a request: no place is reserved until the team confirms your participation.",
    duplicateApprovedTitle: "Participation already confirmed",
    duplicateApprovedText: "Your participation in this event is already confirmed.",
    duplicatePendingTitle: "Request already recorded",
    duplicatePendingText:
      "A participation request for this event is already being processed.",
    duplicateClose: "Close message",
    errorInvalid: "Please check the fields in the form.",
    errorGeneric: "Your request could not be sent. Please try again.",
    eventUnavailable: "This event is no longer open for requests.",
    optional: "optional",
  },
  DE: {
    backToEvents: "Zurück zu allen Veranstaltungen",
    categoryLabels: {
      TRAINING: "Schulung",
      WORKSHOP: "Workshop",
      CONFERENCE: "Konferenz",
      HACKATHON: "Hackathon",
      CEREMONY: "Zeremonie",
      OTHER: "Andere",
    },
    practicalTitle: "Praktische Informationen",
    dateLabel: "Datum",
    dateRangeLabel: "Daten",
    timeLabel: "Uhrzeit",
    timeRangeLabel: "Uhrzeiten",
    timeRangeFormat: "von {start} bis {end}",
    formatLabel: "Format",
    formatOnline: "Online",
    formatInPerson: "Präsenz",
    formatHybrid: "Online und Präsenz",
    locationLabel: "Ort",
    capacityLabel: "Kapazität",
    spotsUnit: "Plätze",
    remainingLabel: "Freie Plätze",
    joinOnline: "Der Online-Sitzung beitreten",
    programmeTitle: "Programm",
    contactTitle: "Kontakt",
    participationTitle: "Teilnahmeanfrage",
    participationIntro:
      "Ihre Anfrage wird vom APTIC-R-Team geprüft, das Sie zur Bestätigung Ihrer Teilnahme kontaktiert.",
    participationCta: "Teilnahme anfragen",
    participationFullTitle: "Veranstaltung ausgebucht",
    participationFullText:
      "Alle vorgesehenen Plätze sind vergeben. Das APTIC-R-Team informiert Sie über die nächsten Termine.",
    participationClosedTitle: "Teilnahme geschlossen",
    participationClosedText:
      "Teilnahmeanfragen sind für diese Veranstaltung nicht mehr möglich.",
    participationDisclaimer:
      "Ihre Teilnahme wird vom APTIC-R-Team nach einem Austausch mit Ihnen bestätigt.",
    participationFormTitle: "Teilnahmeanfrage",
    closeModal: "Fenster schließen",
    fieldFirstName: "Vorname",
    fieldLastName: "Nachname",
    fieldEmail: "E-Mail-Adresse",
    fieldPhone: "Telefon",
    fieldOrganization: "Organisation",
    fieldCity: "Stadt",
    fieldCountry: "Land",
    fieldMessage: "Nachricht",
    fieldMessagePlaceholder:
      "Beschreiben Sie Ihre Motivation, Ihre Verfügbarkeit oder weitere nützliche Informationen.",
    fieldConsent:
      "Ich stimme zu, dass das APTIC-R-Team diese Informationen zur Kontaktaufnahme zu dieser Veranstaltung verwendet.",
    submitRequest: "Anfrage senden",
    submitting: "Wird gesendet…",
    cancelRequest: "Abbrechen",
    successTitle: "Anfrage gesendet",
    successText:
      "Ihre Teilnahmeanfrage wurde gesendet. Das APTIC-R-Team kontaktiert Sie, um Ihre Teilnahme zu bestätigen.",
    successReminder:
      "Es handelt sich um eine Anfrage: Es ist kein Platz reserviert, bis das Team Ihre Teilnahme bestätigt.",
    duplicateApprovedTitle: "Teilnahme bereits bestätigt",
    duplicateApprovedText:
      "Ihre Teilnahme an dieser Veranstaltung ist bereits bestätigt.",
    duplicatePendingTitle: "Anfrage bereits erfasst",
    duplicatePendingText:
      "Für diese Veranstaltung wird bereits eine Teilnahmeanfrage bearbeitet.",
    duplicateClose: "Meldung schließen",
    errorInvalid: "Bitte prüfen Sie die Felder des Formulars.",
    errorGeneric: "Ihre Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut.",
    eventUnavailable: "Für diese Veranstaltung sind keine Anfragen mehr möglich.",
    optional: "optional",
  },
}

/* Icônes : traits fins, couleur institutionnelle, aucune illustration. */
const IconDate = (
  <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3.5 9.5h17M5 5h14a1.5 1.5 0 011.5 1.5v12A1.5 1.5 0 0119 20H5a1.5 1.5 0 01-1.5-1.5v-12A1.5 1.5 0 015 5z" />
  </svg>
)
const IconTime = (
  <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)
const IconPin = (
  <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.5 7-11a7 7 0 10-14 0c0 5.5 7 11 7 11z" />
    <circle cx="12" cy="10" r="2.5" fill="none" strokeWidth={1.7} />
  </svg>
)
const IconGlobe = (
  <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.7}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 0c2.5 2.2 2.5 15.8 0 18M3.5 9h17M3.5 15h17" />
  </svg>
)

/** Ligne d'information pratique : libellé à gauche, valeur à droite. */
function PracticalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </dt>
      <dd className="text-right text-[15px] font-semibold text-slate-800 break-words">{value}</dd>
    </div>
  )
}

export default function EventDetailView({ lang, event }: EventDetailViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const safeLang = (["FR", "EN", "DE"].includes(lang) ? lang : "FR") as "FR" | "EN" | "DE"
  const t = I18N[safeLang]

  /* -- Demande de participation ------------------------------------------
     L'état du CTA (request / full / closed) est décidé par le SERVEUR et
     reçu dans `event.participation`. Le client ne calcule aucune place :
     il se contente d'afficher la décision, d'ouvrir la modale et de soumettre
     un formulaire.
     ----------------------------------------------------------------------- */
  const [formOpen, setFormOpen] = useState(false)
  /**
   * Doublon détecté par le SERVEUR lors d'un envoi.
   *
   * Volontairement en mémoire uniquement : aucun `localStorage`, aucun
   * `sessionStorage`. Fermer la modale ou recharger la page suffit à retrouver
   * un formulaire vide et normalement accessible — la détection reste liée à la
   * tentative de soumission, elle ne verrouille jamais l'accès au formulaire.
   */
  const [duplicateStatus, setDuplicateStatus] = useState<DuplicateRequestStatus | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState("")
  const [sent, setSent] = useState(false)
  /** Numéro national saisi ; l'indicatif est porté par PhoneInputField. */
  const [phoneLocal, setPhoneLocal] = useState("")

  const participation = event.participation
  const participationCta = participation?.cta ?? "closed"
  const canRequest = participationCta === "request"
  const remainingPlaces = participation?.remainingPlaces ?? null
  const hasCapacityLimit = participation?.hasCapacityLimit ?? false
  const canJoinOnline = Boolean(event.isOnline && event.meetingUrl?.trim())

  /* -- Arrivée par ancre (#participation) -------------------------------
     Depuis la liste, « Demander à participer » pointe vers #participation :
     le bloc est ciblé et la modale s'ouvre, sans second clic. L'ancre reste
     partageable et ne modifie aucun état serveur : l'ouverture de la modale
     reste un simple état client, exactement comme au clic sur le bouton. */
  const participationRef = useRef<HTMLDivElement | null>(null)

  const scrollToParticipation = useCallback(() => {
    const el = participationRef.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 96
    window.scrollTo({ top, behavior: "smooth" })
  }, [])

  const closeParticipationForm = useCallback(() => {
    setFormOpen(false)
    setFormError("")
    setDuplicateStatus(null)
    // On retire l'ancre de l'URL : sans elle, un rafraîchissement ne
    // rouvre pas une modale que l'utilisateur vient de refermer.
    if (window.location.hash === PARTICIPATION_HASH) {
      window.history.replaceState(null, "", pathname)
    }
  }, [pathname])

  const openParticipationForm = useCallback(() => {
    setFormError("")
    setDuplicateStatus(null)
    setFormOpen(true)
  }, [])

  useEffect(() => {
    if (window.location.hash !== PARTICIPATION_HASH) return
    // `canRequest` décide seul : sur un événement complet ou fermé, l'ancre se
    // contente de poser le lecteur sur le bloc d'information existant.
    if (canRequest) openParticipationForm()
    else scrollToParticipation()
  }, [canRequest, openParticipationForm, scrollToParticipation])

  async function handleRequestSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError("")
    setSubmitting(true)

    const form = e.currentTarget
    const fd = new FormData(form)

    try {
      const res = await submitEventParticipationRequest({
        eventId: event.id,
        firstName: String(fd.get("firstName") || ""),
        lastName: String(fd.get("lastName") || ""),
        email: String(fd.get("email") || ""),
        phone: String(fd.get("phone") || ""),
        organization: String(fd.get("organization") || ""),
        city: String(fd.get("city") || ""),
        country: String(fd.get("country") || ""),
        message: String(fd.get("message") || ""),
        consent: fd.get("consent") === "on",
        lang: safeLang,
      })

      if (!res.success) {
        // Doublon détecté côté serveur : ce n'est pas une panne. On reste dans la
        // même modale avec un message informatif, jamais une alerte rouge, et le
        // formulaire reste monté derrière : il suffit de refermer le message.
        if (res.code === "ALREADY_REQUESTED") {
          setDuplicateStatus(res.duplicateStatus ?? "PENDING")
          setFormError("")
          return
        }

        // Les autres refus portent le message de la langue du demandeur : le
        // serveur ne renvoie qu'un code métier, jamais un texte à afficher.
        setFormError(
          res.code === "EVENT_FULL"
            ? t.participationFullText
            : res.code === "CLOSED"
              ? t.participationClosedText
              : res.code === "NOT_PUBLISHED" || res.code === "NOT_FOUND"
                ? t.eventUnavailable
                : res.code === "VALIDATION"
                  ? t.errorInvalid
                  : t.errorGeneric
        )

        // L'événement a pu changer d'état entre l'affichage de la page et
        // l'envoi : on relit l'état serveur pour que la colonne de droite
        // cesse de proposer un formulaire devenu inutile.
        if (res.code === "EVENT_FULL" || res.code === "CLOSED") router.refresh()
        return
      }

      // Succès : aucune place n'est consommée, la demande est en attente de
      // validation par l'équipe. Le message ne dit jamais « participation
      // confirmée ».
      form.reset()
      // `form.reset()` ne vide pas une saisie pilotée par React.
      setPhoneLocal("")
      // L'ancre a servi à ouvrir la modale : on la retire au même titre que la
      // modale, pour qu'un rafraîchissement ne la rouvre pas.
      closeParticipationForm()
      setSent(true)
    } catch {
      setFormError(t.errorGeneric)
    } finally {
      setSubmitting(false)
    }
  }

  const navigate = (page: Page) => {
    router.push(getPageUrl(page, safeLang))
  }

  const handleSetLang = (newLang: Language) => {
    const newPath = pathname.replace(`/${safeLang.toLowerCase()}`, `/${newLang.toLowerCase()}`)
    router.push(newPath || `/${newLang.toLowerCase()}`)
  }

  const title = event.title
  const description = event.description?.trim() || ""
  const programme = event.programme?.trim() || ""
  const contact = event.contact
  const hasContact = Boolean(contact && (contact.name || contact.email || contact.phone))
  const categoryLabel = resolveEventCategoryLabel(event, t.categoryLabels)

  const startDateText = formatEventDate(event.startDate, safeLang)
  const endDateText = formatEventDate(event.endDate, safeLang)
  const startTime = formatEventTime(event.startDate)
  const endTime = formatEventTime(event.endDate)

  /* Une plage n'est affichée que si la borne diffère réellement de la
     borne de début : sinon on n'affiche pas « 21 mai → 21 mai ». */
  const hasDateRange = Boolean(startDateText && endDateText && endDateText !== startDateText)
  const hasTimeRange = Boolean(startTime && endTime && endTime !== startTime)

  const dateValue = startDateText
    ? hasDateRange
      ? `${startDateText} → ${endDateText}`
      : startDateText
    : ""
  const timeValue = startTime
    ? hasTimeRange
      ? t.timeRangeFormat.replace("{start}", startTime).replace("{end}", endTime)
      : startTime
    : ""

  const location = event.location?.trim() || ""
  const meetingUrl = event.meetingUrl?.trim() || ""

  /* Le format n'est jamais inventé : il est déduit des données existantes.
     Hybride = événement en ligne ET lieu renseigné ; aucune nouvelle valeur
     n'est introduite dans le modèle. */
  const isHybrid = event.isOnline && Boolean(location)
  const formatValue = event.isOnline
    ? isHybrid
      ? t.formatHybrid
      : t.formatOnline
    : t.formatInPerson

  /* -- Colonne principale : métadonnées essentielles --------------------- */
  const meta: Array<{ icon: React.ReactNode; value: string; accent?: boolean }> = []
  if (dateValue) meta.push({ icon: IconDate, value: dateValue })
  if (timeValue) meta.push({ icon: IconTime, value: timeValue })
  if (event.isOnline) meta.push({ icon: IconGlobe, value: formatValue, accent: true })
  if (location) meta.push({ icon: IconPin, value: location })

  /* -- Colonne droite : informations pratiques ---------------------------
     Une section n'apparaît que si sa donnée existe : aucune ligne vide,
     aucune capacité inventée. `maxParticipants` est la capacité saisie par
     l'administrateur et n'est JAMAIS décrémentée ; les places restantes sont
     calculées côté serveur à partir des seules participations validées. */
  const capacityTotal = hasCapacityLimit ? (event.maxParticipants ?? null) : null
  const practical: Array<{ label: string; value: string }> = []
  if (dateValue) practical.push({ label: hasDateRange ? t.dateRangeLabel : t.dateLabel, value: dateValue })
  if (timeValue) practical.push({ label: hasTimeRange ? t.timeRangeLabel : t.timeLabel, value: timeValue })
  practical.push({ label: t.formatLabel, value: formatValue })
  if (location) practical.push({ label: t.locationLabel, value: location })
  if (capacityTotal !== null) {
    practical.push({ label: t.capacityLabel, value: `${capacityTotal} ${t.spotsUnit}` })
  }
  if (hasCapacityLimit && remainingPlaces !== null) {
    practical.push({ label: t.remainingLabel, value: String(remainingPlaces) })
  }

  /* -- Participation : un seul système, plusieurs états ------------------
     Le titre ET le texte changent avec l'état décidé par le serveur ; le CTA
     n'apparaît que sur l'état « request ». */
  const participationTitle =
    participationCta === "full"
      ? t.participationFullTitle
      : participationCta === "closed"
        ? t.participationClosedTitle
        : t.participationTitle

  const participationText =
    participationCta === "full"
      ? t.participationFullText
      : participationCta === "closed"
        ? t.participationClosedText
        : t.participationIntro

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: BG }}>
      <PageHeader mode={getHeaderMode(ROUTES.eventDetail)} lang={safeLang} setLang={handleSetLang} currentPage="events" navigate={navigate} />

      {/* Page de détail immersive : aucun header global (cf. convention
          ROUTES.eventDetail ? noHeader). Le lien de retour le remplace. */}
      <main className="flex-1 pt-8 sm:pt-12 pb-16 lg:pb-24">
        <article className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8 text-left">
          {/* 1. Retour aux événements — aligné sur la largeur de contenu */}
          <div className="mb-7">
            <Link
              href={getPageUrl("events", safeLang)}
              className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#003366] hover:text-[#007BFF] transition-colors"
            >
              <span aria-hidden="true">←</span>
              <span>{t.backToEvents}</span>
            </Link>
          </div>

          {/* 2. Grille commune à toutes les fiches événement/formation :
                 colonne éditoriale à gauche, informations pratiques et
                 participation à droite. En dessous de lg, les colonnes
                 s'empilent dans cet ordre : la colonne droite ne disparaît
                 jamais, elle passe sous le contenu. */}
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-10 items-start">
            {/* ─── Colonne principale ─────────────────────────────────────── */}
            <div className="lg:col-span-7 min-w-0">
              {/* Visuel : toujours présent, toujours 16/9, jamais déformé.
                  Sans image, le placeholder institutionnel prend le relais —
                  il n'est jamais enregistré comme featuredImage. */}
              <div className="w-full aspect-[16/9] rounded-2xl border border-slate-200/90 bg-[#F7F8FA] overflow-hidden">
                {event.featuredImage ? (
                  <img
                    src={event.featuredImage}
                    alt={title}
                    className="w-full h-full object-contain"
                    fetchPriority="high"
                  />
                ) : (
                  <EventImagePlaceholder lang={safeLang} />
                )}
              </div>

              <div className="mt-7">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#007BFF]">
                  {categoryLabel}
                </span>

                <h1 className="mt-2.5 text-left text-[26px] sm:text-3xl lg:text-[38px] font-extrabold text-[#003366] tracking-tight leading-[1.12]">
                  {title}
                </h1>

                {description && (
                  <p className="mt-4 max-w-[68ch] text-left text-[15px] sm:text-base lg:text-[17px] text-[#5E6B76] leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                )}

                {meta.length > 0 && (
                  <ul className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2.5">
                    {meta.map((item, index) => (
                      <li
                        key={index}
                        className={`inline-flex items-center gap-2 text-[13px] sm:text-sm font-semibold ${
                          item.accent ? "text-[#28A745]" : "text-[#003366]"
                        }`}
                      >
                        <span className={item.accent ? "text-[#28A745]" : "text-[#003366]"}>
                          {item.icon}
                        </span>
                        <span className="break-words">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Contenu éditorial : chaque section n'apparaît que si sa donnée
                  existe. Pas de carte autour : le contenu est posé sur le fond
                  de page et les sections sont séparées par un filet. */}
              {(programme || hasContact) && (
                <div className="mt-9">
                  {programme && (
                    <section>
                      <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#003366]">
                        {t.programmeTitle}
                      </h2>
                      <p className="mt-3.5 max-w-[68ch] text-left text-[15px] leading-relaxed text-slate-700 whitespace-pre-line">
                        {programme}
                      </p>
                    </section>
                  )}

                  {hasContact && (
                    <section className={`${programme ? "mt-8 pt-8 border-t border-slate-200/70" : ""}`}>
                      <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#003366]">
                        {t.contactTitle}
                      </h2>
                      <ul className="mt-3.5 space-y-2 text-[15px] text-slate-700">
                        {contact?.name && (
                          <li className="font-semibold text-slate-800">{contact.name}</li>
                        )}
                        {contact?.email && (
                          <li>
                            <a
                              href={`mailto:${contact.email}`}
                              className="text-[#007BFF] hover:underline break-all"
                            >
                              {contact.email}
                            </a>
                          </li>
                        )}
                        {contact?.phone && (
                          <li>
                            <a
                              href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                              className="text-[#007BFF] hover:underline"
                            >
                              {contact.phone}
                            </a>
                          </li>
                        )}
                      </ul>
                    </section>
                  )}
                </div>
              )}
            </div>

            {/* ─── Colonne droite : une SEULE surface ─────────────────────
                Informations pratiques, accès à la session en ligne, puis
                participation. Les sections internes sont séparées par un
                filet, jamais par une carte à l'intérieur d'une carte. */}
            <aside className="lg:col-span-5 min-w-0">
              <div
                ref={participationRef}
                id="participation"
                className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white px-6 py-8 sm:px-8 sm:py-9"
              >
                {practical.length > 0 && (
                  <div>
                    <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#003366]">
                      {t.practicalTitle}
                    </h2>
                    <dl className="mt-3 divide-y divide-slate-100">
                      {practical.map((item, index) => (
                        <PracticalRow key={index} label={item.label} value={item.value} />
                      ))}
                    </dl>
                  </div>
                )}

                {/* Accès à la session en ligne : une INFORMATION d'accès, pas
                    une seconde action. Le lien n'apparaît que si l'événement
                    en ligne en porte un réel — aucun lien n'est inventé. La
                    seule action de la colonne reste la demande de
                    participation. */}
                {canJoinOnline && (
                  <div className={practical.length > 0 ? "mt-6 pt-6 border-t border-slate-100" : ""}>
                    <a
                      href={meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-[13px] font-bold text-[#007BFF] transition-colors hover:text-[#003366] hover:underline"
                    >
                      {IconGlobe}
                      {t.joinOnline}
                    </a>
                  </div>
                )}

                {participationCta !== "hidden" && (
                  <div
                    className={`${
                      practical.length > 0 || canJoinOnline
                        ? "mt-7 pt-7 border-t border-slate-100"
                        : ""
                    }`}
                  >
                    <h2 className="text-[12px] font-bold uppercase tracking-[0.14em] text-[#003366]">
                      {participationTitle}
                    </h2>

                    <p className="mt-4 text-[14px] leading-relaxed text-slate-600">
                      {participationText}
                    </p>

                    {sent && (
                      <div className="mt-4 rounded-xl border border-[#28A745]/35 bg-[#28A745]/[0.06] p-4">
                        <p className="flex items-center gap-2 text-sm font-bold text-[#1e7e35]">
                          <span aria-hidden="true">✓</span>
                          {t.successTitle}
                        </p>
                        <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
                          {t.successText}
                        </p>
                        <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                          {t.successReminder}
                        </p>
                      </div>
                    )}

                    {/* Participation ouverte et non complète : le seul endroit
                        où un bouton apparaît. Le formulaire lui-même est dans
                        la modale, jamais dans la page. */}
                    {canRequest && !sent && (
                      <>
                        <button
                          type="button"
                          onClick={openParticipationForm}
                          className="mt-5 w-full inline-flex items-center justify-center rounded-xl bg-[#007BFF] px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#0060c8] cursor-pointer"
                        >
                          {t.participationCta}
                        </button>
                        <p className="mt-4 text-[13px] leading-relaxed text-slate-500">
                          {t.participationDisclaimer}
                        </p>
                      </>
                    )}

                    {/* Complet ou fermé : le titre et le texte du bloc (déjà
                        rendus ci-dessus) se suffisent à eux-mêmes. Aucun
                        bouton, aucun bandeau rouge : on ne propose pas une
                        action impossible. */}
                  </div>
                )}
              </div>
            </aside>
          </div>
        </article>
      </main>

      {/* ─── Modale de demande de participation ──────────────────────────
          La fiche n'affiche que le bouton : le formulaire vit ici. Il est
          réouvrable à volonté — un doublon détecté au premier envoi ne
          verrouille jamais l'accès, la vérification reste liée à la
          soumission. */}
      <EventParticipationModal
        open={formOpen}
        onClose={closeParticipationForm}
        title={t.participationFormTitle}
        subtitle={title}
        closeLabel={t.closeModal}
      >
        <form onSubmit={handleRequestSubmit} className="space-y-4">
          <p className="text-[13px] leading-relaxed text-slate-600">{t.participationIntro}</p>

          {/*
            Doublon : message POSITIF et informatif, pas une erreur. Il masque
            visuellement le formulaire sans le démonter — « Fermer le message »
            le fait réapparaître avec les valeurs déjà saisies.
          */}
          {duplicateStatus && (
            <div
              role="status"
              className="rounded-xl border border-[#003366]/15 bg-[#F4F7FA] p-4"
            >
              <p className="flex items-center gap-2 text-sm font-bold text-[#003366]">
                <span aria-hidden="true">✓</span>
                {duplicateStatus === "APPROVED"
                  ? t.duplicateApprovedTitle
                  : t.duplicatePendingTitle}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
                {duplicateStatus === "APPROVED"
                  ? t.duplicateApprovedText
                  : t.duplicatePendingText}
              </p>
              <button
                type="button"
                onClick={() => setDuplicateStatus(null)}
                className="mt-3 text-[12px] font-bold text-[#007BFF] hover:underline cursor-pointer"
              >
                {t.duplicateClose}
              </button>
            </div>
          )}

          {formError && (
            <p
              role="alert"
              className="rounded-lg border border-slate-200 bg-[#F7F8FA] px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-700"
            >
              {formError}
            </p>
          )}

          {/* Le formulaire reste monté derrière le message de doublon. */}
          <div hidden={duplicateStatus !== null} className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  {t.fieldFirstName} <span className="text-rose-500">*</span>
                </label>
                <input
                  name="firstName"
                  type="text"
                  required
                  autoComplete="given-name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#174F7A]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  {t.fieldLastName} <span className="text-rose-500">*</span>
                </label>
                <input
                  name="lastName"
                  type="text"
                  required
                  autoComplete="family-name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#174F7A]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  {t.fieldEmail} <span className="text-rose-500">*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#174F7A]"
                />
              </div>
              <div>
                <PhoneInputField
                  label={t.fieldPhone}
                  name="phone"
                  size="sm"
                  required
                  lang={safeLang}
                  value={phoneLocal}
                  onChange={(v) => setPhoneLocal(v)}
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  {t.fieldOrganization}{" "}
                  <span className="font-normal text-slate-400">({t.optional})</span>
                </label>
                <input
                  name="organization"
                  type="text"
                  autoComplete="organization"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#174F7A]"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  {t.fieldCity} <span className="font-normal text-slate-400">({t.optional})</span>
                </label>
                <input
                  name="city"
                  type="text"
                  autoComplete="address-level2"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#174F7A]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  {t.fieldCountry} <span className="font-normal text-slate-400">({t.optional})</span>
                </label>
                <input
                  name="country"
                  type="text"
                  autoComplete="country-name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#174F7A]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-bold text-slate-700">
                  {t.fieldMessage} <span className="font-normal text-slate-400">({t.optional})</span>
                </label>
                <textarea
                  name="message"
                  rows={3}
                  placeholder={t.fieldMessagePlaceholder}
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#174F7A]"
                />
              </div>
            </div>

            <label className="flex cursor-pointer select-none items-start gap-2.5">
              <input
                name="consent"
                type="checkbox"
                required
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#003366] focus:ring-[#007BFF]/30"
              />
              <span className="text-[12px] leading-relaxed text-slate-600">
                {t.fieldConsent} <span className="text-rose-500">*</span>
              </span>
            </label>

            <div className="flex flex-col gap-2.5 sm:flex-row">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex flex-1 cursor-pointer items-center justify-center rounded-xl bg-[#007BFF] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0060c8] disabled:opacity-60"
              >
                {submitting ? t.submitting : t.submitRequest}
              </button>
              <button
                type="button"
                onClick={closeParticipationForm}
                className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
              >
                {t.cancelRequest}
              </button>
            </div>
          </div>
        </form>
      </EventParticipationModal>

      <Footer lang={safeLang} navigate={navigate} />
    </div>
  )
}
