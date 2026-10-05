/**
 * Helpers purs du module public « Événements & Formations ».
 *
 * Conventions du CMS APTIC-R :
 * - aucune requête Prisma ici (voir `cms-actions.ts` pour les Server Actions) ;
 * - étanchéité multilingue stricte : aucun repli automatique vers le français ;
 * - la création d'un événement n'est jamais une publication : la publication
 *   est une décision explicite, langue par langue.
 */

export type EventCategory = "TRAINING" | "WORKSHOP" | "CONFERENCE" | "HACKATHON" | "CEREMONY"

export const EVENT_CATEGORIES: EventCategory[] = [
  "TRAINING",
  "WORKSHOP",
  "CONFERENCE",
  "HACKATHON",
  "CEREMONY",
]

/** Valeur technique de la catégorie personnalisée (« Autre »). */
export const OTHER_CATEGORY = "OTHER"

/** Toutes les valeurs acceptées par le champ `category`, OTHER compris. */
export const EVENT_CATEGORY_VALUES: string[] = [...EVENT_CATEGORIES, OTHER_CATEGORY]

export function isKnownEventCategory(value: string): value is EventCategory {
  return (EVENT_CATEGORIES as string[]).includes(value)
}

export type LocalizedLanguage = "FR" | "EN" | "DE"
export const EVENT_LANGUAGES: LocalizedLanguage[] = ["FR", "EN", "DE"]

export interface EventLike {
  titleFr?: string | null
  titleEn?: string | null
  titleDe?: string | null
  descriptionFr?: string | null
  descriptionEn?: string | null
  descriptionDe?: string | null
  programmeFr?: string | null
  programmeEn?: string | null
  programmeDe?: string | null
  publishedFr?: boolean | null
  publishedEn?: boolean | null
  publishedDe?: boolean | null
}

/**
 * Traductions strictes d'un événement, sans repli automatique vers le français.
 * Le programme est facultatif : chaîne vide si la langue n'en contient pas.
 */
export function getEventLocalizedFields(
  event: EventLike | null | undefined,
  lang: string
): { title: string; description: string; programme: string } {
  if (!event) return { title: "", description: "", programme: "" }
  const l = (lang || "FR").toUpperCase()
  if (l === "EN") {
    return {
      title: event.titleEn ?? "",
      description: event.descriptionEn ?? "",
      programme: event.programmeEn ?? "",
    }
  }
  if (l === "DE") {
    return {
      title: event.titleDe ?? "",
      description: event.descriptionDe ?? "",
      programme: event.programmeDe ?? "",
    }
  }
  return {
    title: event.titleFr ?? "",
    description: event.descriptionFr ?? "",
    programme: event.programmeFr ?? "",
  }
}

/** Un contenu n'est affichable dans une langue que si titre ET description y sont renseignés. */
export function isEventCompleteForLang(
  event: EventLike | null | undefined,
  lang: string
): boolean {
  if (!event) return false
  const { title, description } = getEventLocalizedFields(event, lang)
  return Boolean(title?.trim()) && Boolean(description?.trim())
}

/** L'événement a-t-il été explicitement publié dans la langue demandée ? */
export function isEventPublishedInLang(
  event: EventLike | null | undefined,
  lang: string
): boolean {
  if (!event) return false
  const l = (lang || "FR").toUpperCase()
  if (l === "EN") return event.publishedEn === true
  if (l === "DE") return event.publishedDe === true
  return event.publishedFr === true
}

/**
 * Un événement n'est visible publiquement dans une langue que s'il y est
 * publié ET complet. Les deux conditions sont vérifiées côté requête et côté
 * view-model : une publication sans traduction reste invisible.
 */
export function isPubliclyVisibleInLang(
  event: EventLike | null | undefined,
  lang: string
): boolean {
  return isEventPublishedInLang(event, lang) && isEventCompleteForLang(event, lang)
}

interface ParsedEventDate {
  year: number
  month: number
  day: number
  hasTime: boolean
  hour: number
  minute: number
}

/**
 * Lecture directe de la partie ISO de la date, sans conversion de fuseau :
 * garantit qu'un événement du 12/04 n'affiche jamais le 11/04 selon le navigateur.
 */
export function parseEventDate(value?: string | Date | null): ParsedEventDate | null {
  if (!value) return null
  const raw = typeof value === "string" ? value : value.toISOString()
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/)
  if (!match) {
    const fallback = new Date(raw)
    if (Number.isNaN(fallback.getTime())) return null
    return {
      year: fallback.getFullYear(),
      month: fallback.getMonth() + 1,
      day: fallback.getDate(),
      hasTime: false,
      hour: 0,
      minute: 0,
    }
  }
  const [, y, m, d, hh, mm] = match
  const hour = hh ? Number(hh) : 0
  const minute = mm ? Number(mm) : 0
  return {
    year: Number(y),
    month: Number(m),
    day: Number(d),
    hasTime: hour !== 0 || minute !== 0,
    hour,
    minute,
  }
}

function localeFor(lang: LocalizedLanguage) {
  return lang === "EN" ? "en-GB" : lang === "DE" ? "de-DE" : "fr-FR"
}

export function formatEventDate(
  value: string | Date | null | undefined,
  lang: LocalizedLanguage
): string {
  const parsed = parseEventDate(value)
  if (!parsed) return ""
  const formatted = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)).toLocaleDateString(
    localeFor(lang),
    { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }
  )
  return lang === "FR" ? formatted.charAt(0).toUpperCase() + formatted.slice(1) : formatted
}

/** Heure « HH:MM » — chaîne vide si l'événement n'a pas d'heure saisie. */
export function formatEventTime(value: string | Date | null | undefined): string {
  const parsed = parseEventDate(value)
  if (!parsed || !parsed.hasTime) return ""
  return `${String(parsed.hour).padStart(2, "0")}:${String(parsed.minute).padStart(2, "0")}`
}

/** Un événement reste « à venir » jusqu'à la fin de sa journée. */
export function isEventUpcoming(value: string | Date, now: number = Date.now()): boolean {
  const parsed = parseEventDate(value)
  if (!parsed) return false
  return Date.UTC(parsed.year, parsed.month - 1, parsed.day, 23, 59, 59) >= now
}

/**
 * Vue publique d'un événement : uniquement les champs nécessaires à l'affichage,
 * avec titre, description et programme DÉJÀ résolus dans la langue demandée.
 *
 * Ce view-model est construit côté serveur (`toPublicEvent`) afin qu'aucune
 * donnée FR/EN/DE non demandée ne soit sérialisée dans le payload RSC envoyé
 * au navigateur. Étanchéité multilingue garantie jusque dans la source.
 */
/**
 * Décision d'affichage du CTA de participation.
 *
 * RÈGLE : cette valeur est calculée CÔTÉ SERVEUR (`toPublicParticipation`) et
 * transmise telle quelle au navigateur. Le client n'a jamais à recalculer une
 * place disponible : il ne fait qu'afficher l'état décidé par le serveur.
 *
 * - `request` → « Demander à participer » (ouvert, et au moins une place
 *   restante, ou capacité illimitée) ;
 * - `full` → « Complet », établi UNIQUEMENT sur les participations validées ;
 * - `closed` → « Inscriptions fermées » ;
 * - `hidden` → aucune participation gérée (aucun compteur, aucune action).
 */
export type EventParticipationCta = "request" | "full" | "closed" | "hidden"

export interface PublicEventParticipation {
  /** Ouverture des demandes déclarée par l'administrateur. */
  isOpen: boolean
  hasCapacityLimit: boolean
  /** null quand l'événement n'a pas de limite : aucun compteur à afficher. */
  remainingPlaces: number | null
  validatedParticipants: number
  pendingRequests: number
  cta: EventParticipationCta
}

export function toPublicParticipation(input: {
  registrationOpen: boolean
  capacity: number | null
  remainingPlaces: number | null
  validatedParticipants: number
  pendingRequests: number
}): PublicEventParticipation {
  const hasCapacityLimit = input.capacity !== null && input.capacity > 0
  const isFull = hasCapacityLimit && input.remainingPlaces === 0

  let cta: EventParticipationCta
  if (!input.registrationOpen) cta = "closed"
  else if (isFull) cta = "full"
  else cta = "request"

  return {
    isOpen: input.registrationOpen === true,
    hasCapacityLimit,
    remainingPlaces: hasCapacityLimit ? input.remainingPlaces : null,
    validatedParticipants: input.validatedParticipants,
    // Compteur public : uniquement l'information utile « X en attente ».
    // Les refusés et annulés restent une donnée d'administration.
    pendingRequests: input.pendingRequests,
    cta,
  }
}

export interface PublicEventContact {
  name?: string
  email?: string
  phone?: string
}

export interface PublicEvent {
  id: string
  slug: string
  title: string
  description: string
  programme?: string
  category: string
  categoryOther?: string | null
  location?: string
  startDate: string
  endDate?: string | null
  isOnline: boolean
  meetingUrl?: string | null
  registrationUrl?: string | null
  registrationOpen: boolean
  maxParticipants?: number | null
  featuredImage?: string | null
  contact?: PublicEventContact
  participation?: PublicEventParticipation
}

function compact(value?: string | null): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

/**
 * Projette un enregistrement Prisma vers la vue publique monolingue.
 * Retourne null si l'événement n'est pas public dans la langue demandée.
 */
export function toPublicEvent(
  event: (EventLike & Record<string, any>) | null | undefined,
  lang: string
): PublicEvent | null {
  if (!event) return null
  if (!isPubliclyVisibleInLang(event, lang)) return null

  const { title, description, programme } = getEventLocalizedFields(event, lang)
  const contact: PublicEventContact = {}
  const contactName = compact(event.contactName)
  const contactEmail = compact(event.contactEmail)
  const contactPhone = compact(event.contactPhone)
  if (contactName) contact.name = contactName
  if (contactEmail) contact.email = contactEmail
  if (contactPhone) contact.phone = contactPhone

  return {
    id: event.id,
    slug: event.slug,
    title,
    description,
    programme: compact(programme) ?? undefined,
    category: event.category ?? "",
    categoryOther: event.category === OTHER_CATEGORY ? compact(event.categoryOther) : null,
    location: compact(event.location) ?? undefined,
    startDate:
      event.startDate instanceof Date
        ? event.startDate.toISOString()
        : String(event.startDate ?? ""),
    endDate:
      event.endDate instanceof Date ? event.endDate.toISOString() : (event.endDate ?? null),
    isOnline: Boolean(event.isOnline),
    meetingUrl: compact(event.meetingUrl),
    registrationUrl: compact(event.registrationUrl),
    registrationOpen: event.registrationOpen === true,
    maxParticipants: event.maxParticipants ?? null,
    featuredImage: compact(event.featuredImage),
    contact: Object.keys(contact).length > 0 ? contact : undefined,
    participation: event.participation,
  }
}

/**
 * Libellé de catégorie affichable : valeur libre saisie en base pour « Autre »,
 * libellé traduit pour les catégories historiques.
 *
 * Le repli de « Autre » se lit dans `translated.OTHER` : une vue qui traduit
 * ses libellés fournit donc « Autre / Other / Andere » et n'affiche jamais de
 * français sur une page EN ou DE. Les vues qui ne fournissent pas cette clé
 * conservent le repli historique.
 *
 * Ne retombe jamais sur du texte vide.
 */
export function resolveEventCategoryLabel(
  event: Pick<PublicEvent, "category" | "categoryOther">,
  translated: Record<string, string>,
  otherFallback = "Autre"
): string {
  if (event.category === OTHER_CATEGORY) {
    return event.categoryOther?.trim() || translated[OTHER_CATEGORY] || otherFallback
  }
  return translated[event.category] || event.category
}

// ─── Validation (pure, partagée entre le Back-office et les Server Actions) ──

export interface EventInput {
  titleFr?: string | null
  titleEn?: string | null
  titleDe?: string | null
  descriptionFr?: string | null
  descriptionEn?: string | null
  descriptionDe?: string | null
  programmeFr?: string | null
  programmeEn?: string | null
  programmeDe?: string | null
  category?: string | null
  categoryOther?: string | null
  location?: string | null
  startDate?: Date | string | null
  endDate?: Date | string | null
  isOnline?: boolean
  meetingUrl?: string | null
  registrationUrl?: string | null
  registrationOpen?: boolean
  maxParticipants?: number | null
  featuredImage?: string | null
  contactName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  publishedFr?: boolean
  publishedEn?: boolean
  publishedDe?: boolean
}

const LANG_NAMES: Record<LocalizedLanguage, string> = {
  FR: "français",
  EN: "anglais",
  DE: "allemand",
}

/** Langues cochées « publié » dans le formulaire. */
export function publishedLanguagesOf(input: EventInput): LocalizedLanguage[] {
  return EVENT_LANGUAGES.filter((lang) =>
    lang === "FR"
      ? input.publishedFr === true
      : lang === "EN"
        ? input.publishedEn === true
        : input.publishedDe === true
  )
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value)
}

/**
 * Contraintes minimales exigées même pour un brouillon : sans titre français
 * ni date de début, l'événement n'a ni identité (slug) ni position dans le
 * calendrier public. Tout le reste peut rester vide tant qu'il est publié.
 */
export function validateEventBasics(input: EventInput): string[] {
  const errors: string[] = []

  if (!input.titleFr?.trim()) {
    errors.push("Le titre en français est obligatoire : il génère l'adresse publique de la fiche.")
  }
  if (!input.category || !EVENT_CATEGORY_VALUES.includes(input.category)) {
    errors.push("La catégorie est obligatoire et doit figurer parmi les valeurs proposées.")
  }
  const start = toDate(input.startDate)
  if (!start) {
    errors.push("La date et l'heure de début sont obligatoires.")
  }
  const end = toDate(input.endDate)
  if (end && start && end.getTime() < start.getTime()) {
    errors.push("La date de fin ne peut pas précéder la date de début.")
  }
  if (input.maxParticipants != null && input.maxParticipants < 0) {
    errors.push("Le nombre de places ne peut pas être négatif.")
  }

  return errors
}

/**
 * publication exige, en plus des contraintes de base :
 * - le minimum français (titre, description, catégorie, date, type) ;
 * - un lieu pour un événement en présentiel, un lien pour un événement en ligne ;
 * - un lien d'inscription si les inscriptions sont ouvertes ;
 * - une précision de catégorie si la catégorie est « Autre » ;
 * - un titre ET une description pour chaque langue cochée « publié ».
 */
export function validateEventForPublication(
  input: EventInput,
  publishedLangs: LocalizedLanguage[] = publishedLanguagesOf(input)
): string[] {
  const errors = validateEventBasics(input)

  if (!input.descriptionFr?.trim()) {
    errors.push("Publication bloquée : la description en français est obligatoire.")
  }
  if (input.category === OTHER_CATEGORY && !input.categoryOther?.trim()) {
    errors.push(
      "Publication bloquée : la catégorie « Autre » exige une précision (ex. : Forum, Sensibilisation)."
    )
  }
  if (!input.isOnline && !input.location?.trim()) {
    errors.push("Publication bloquée : un événement en présentiel exige un lieu.")
  }
  if (input.isOnline && !input.meetingUrl?.trim()) {
    errors.push("Publication bloquée : un événement en ligne exige un lien de réunion.")
  }
  // Aucune URL d'inscription n'est requise : les demandes de participation sont
  // désormais reçues via le formulaire intégré, qui n'a besoin que de
  // `registrationOpen` et d'un événement publié. `registrationUrl` reste toléré
  // pour les événements existants, mais il n'est plus un préalable à la publication.
  if (input.meetingUrl?.trim() && !looksLikeUrl(input.meetingUrl.trim())) {
    errors.push("Le lien de réunion doit commencer par http:// ou https://.")
  }
  if (input.registrationUrl?.trim() && !looksLikeUrl(input.registrationUrl.trim())) {
    errors.push("Le lien d'inscription doit commencer par http:// ou https://.")
  }

  for (const lang of publishedLangs) {
    const { title, description } = getEventLocalizedFields(input, lang)
    const missing: string[] = []
    if (!title.trim()) missing.push("titre")
    if (!description.trim()) missing.push("description")
    if (missing.length > 0) {
      errors.push(
        `Publication ${LANG_NAMES[lang]} bloquée : ${missing.join(" et ")} manquante${
          missing.length > 1 ? "s" : ""
        }.`
      )
    }
  }

  return errors
}

/** Un événement n'est « publié » que s'il l'est dans au moins une langue. */
export function isEventGloballyPublished(input: EventInput): boolean {
  return publishedLanguagesOf(input).length > 0
}
