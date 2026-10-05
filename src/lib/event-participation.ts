/**
 * DEMANDE DE PARTICIPATION — source de vérité unique du compteur de places.
 *
 * Règle métier APTIC-R, appliquée partout :
 *   DEMANDE ≠ INSCRIPTION VALIDÉE
 *   places restantes = capacité − demandes APPROVED
 *
 * `Evenement.maxParticipants` est la capacité MAXIMALE saisie par
 * l'administrateur : elle n'est jamais décrémentée, jamais modifiée par une
 * demande ni par une validation. Une demande PENDING ne consomme donc
 * rigoureusement aucune place, et une validation CANCELLED en libère une
 * automatiquement, puisque le compteur se recalcule.
 *
 * Toute l'interface (page publique, back-office) doit consommer
 * `getEventCapacityStats()` : aucun composant ne recalcule ces nombres.
 */

import prisma from "./prisma"
import type { ParticipationRequestStatus } from "@prisma/client"

/** Compteurs bruts d'un événement, par statut. */
export interface EventRequestCounts {
  PENDING: number
  APPROVED: number
  REJECTED: number
  CANCELLED: number
}

/** Vue unique des compteurs, consommée par le public et le back-office. */
export interface EventCapacityStats {
  /** Capacité maximale saisie par l'administrateur ; null = illimité. */
  capacity: number | null
  /** Seules les demandes APPROVED consomment une place. */
  validatedParticipants: number
  pendingRequests: number
  rejectedRequests: number
  cancelledRequests: number
  totalRequests: number
  /**
   * Demandes jamais consultées par un administrateur.
   *
   * Compteur rigoureusement distinct de `pendingRequests` : une demande peut
   * être lue et rester en attente, et une demande non lue est déjà en attente.
   */
  unreadRequests: number
  /** null quand l'événement n'a pas de limite de places : aucun compteur à afficher. */
  remainingPlaces: number | null
  hasCapacityLimit: boolean
  /** true seulement si une capacité est fixée ET toutes les places sont validées. */
  isFull: boolean
}

export const EMPTY_REQUEST_COUNTS: EventRequestCounts = {
  PENDING: 0,
  APPROVED: 0,
  REJECTED: 0,
  CANCELLED: 0,
}

function toPositiveInt(value: number | null | undefined): number | null {
  if (value == null) return null
  const parsed = Math.trunc(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

/**
 * Calcul pur et unique du compteur. Isolé de toute base de données pour être
 * testable et pour garantir que toutes les interfaces obtiennent le même
 * résultat à partir des mêmes compteurs.
 */
export function deriveCapacityStats(
  rawCapacity: number | null | undefined,
  counts: Partial<EventRequestCounts> = EMPTY_REQUEST_COUNTS,
  unreadRequests = 0
): EventCapacityStats {
  const capacity = toPositiveInt(rawCapacity)

  const validatedParticipants = Math.max(0, counts.APPROVED ?? 0)
  const pendingRequests = Math.max(0, counts.PENDING ?? 0)
  const rejectedRequests = Math.max(0, counts.REJECTED ?? 0)
  const cancelledRequests = Math.max(0, counts.CANCELLED ?? 0)

  const hasCapacityLimit = capacity !== null
  const remainingPlaces = hasCapacityLimit
    ? Math.max((capacity as number) - validatedParticipants, 0)
    : null

  return {
    capacity,
    validatedParticipants,
    pendingRequests,
    rejectedRequests,
    cancelledRequests,
    totalRequests:
      validatedParticipants + pendingRequests + rejectedRequests + cancelledRequests,
    unreadRequests: Math.max(0, unreadRequests),
    remainingPlaces,
    hasCapacityLimit,
    isFull: hasCapacityLimit && (remainingPlaces as number) === 0,
  }
}

/** Regroupe un `groupBy` Prisma en compteurs par statut. */
export function countsFromGroupBy(
  rows: { status: string; _count: { _all: number } }[]
): EventRequestCounts {
  const counts: EventRequestCounts = { ...EMPTY_REQUEST_COUNTS }
  for (const row of rows) {
    if (row.status in counts) {
      counts[row.status as keyof EventRequestCounts] = row._count._all
    }
  }
  return counts
}

/**
 * Compteurs de participation d'un événement.
 *
 * Ne lève jamais : en cas d'échec, renvoie une capacité à zéro demande afin que
 * l'interface affiche « aucune place consommée » plutôt qu'un compteur faux.
 */
export async function getEventCapacityStats(eventId: string): Promise<EventCapacityStats> {
  try {
    const [event, grouped, unread] = await Promise.all([
      prisma.evenement.findUnique({
        where: { id: eventId },
        select: { maxParticipants: true },
      }),
      prisma.demandeParticipation.groupBy({
        by: ["status"],
        where: { eventId },
        _count: { _all: true },
      }),
      prisma.demandeParticipation.count({
        where: { eventId, readAt: null },
      }),
    ])

    return deriveCapacityStats(
      event?.maxParticipants ?? null,
      countsFromGroupBy(grouped as any),
      unread
    )
  } catch (error) {
    console.error("[event-participation] Échec du calcul de capacité:", error)
    return deriveCapacityStats(null, EMPTY_REQUEST_COUNTS)
  }
}

/**
 * Variante groupée pour les listes (accueil, calendrier) : une seule requête
 * pour tous les événements, sans requête par fiche.
 */
export async function getEventCapacityStatsMap(
  eventIds: string[]
): Promise<Record<string, EventCapacityStats>> {
  const uniqueIds = [...new Set(eventIds.filter(Boolean))]
  if (uniqueIds.length === 0) return {}

  try {
    const [events, grouped, unreadRows] = await Promise.all([
      prisma.evenement.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true, maxParticipants: true },
      }),
      prisma.demandeParticipation.groupBy({
        by: ["eventId", "status"],
        where: { eventId: { in: uniqueIds } },
        _count: { _all: true },
      }),
      prisma.demandeParticipation.groupBy({
        by: ["eventId"],
        where: { eventId: { in: uniqueIds }, readAt: null },
        _count: { _all: true },
      }),
    ])

    const countsByEvent: Record<string, EventRequestCounts> = {}
    for (const row of grouped as { eventId: string; status: string; _count: { _all: number } }[]) {
      const bucket = (countsByEvent[row.eventId] ??= { ...EMPTY_REQUEST_COUNTS })
      if (row.status in bucket) {
        bucket[row.status as keyof EventRequestCounts] += row._count._all
      }
    }

    const unreadByEvent: Record<string, number> = {}
    for (const row of unreadRows as { eventId: string; _count: { _all: number } }[]) {
      unreadByEvent[row.eventId] = row._count._all
    }

    const result: Record<string, EventCapacityStats> = {}
    for (const event of events) {
      result[event.id] = deriveCapacityStats(
        event.maxParticipants,
        countsByEvent[event.id] ?? EMPTY_REQUEST_COUNTS,
        unreadByEvent[event.id] ?? 0
      )
    }
    return result
  } catch (error) {
    console.error("[event-participation] Échec du calcul groupé de capacité:", error)
    return {}
  }
}

/**
 * Nombre de demandes jamais consultées, par événement, et total global.
 *
 * Alimente l'indicateur discret du back-office. Ne lève jamais : en cas d'échec,
 * l'indicateur reste à zéro plutôt que d'afficher un chiffre faux.
 */
export async function getUnreadParticipationCounts(eventIds?: string[]): Promise<{
  total: number
  byEvent: Record<string, number>
}> {
  try {
    const rows = await prisma.demandeParticipation.groupBy({
      by: ["eventId"],
      where: {
        readAt: null,
        ...(eventIds && eventIds.length > 0 ? { eventId: { in: eventIds } } : {}),
      },
      _count: { _all: true },
    })

    const byEvent: Record<string, number> = {}
    let total = 0
    for (const row of rows as { eventId: string; _count: { _all: number } }[]) {
      byEvent[row.eventId] = row._count._all
      total += row._count._all
    }
    return { total, byEvent }
  } catch (error) {
    console.error("[event-participation] Échec du comptage des demandes non lues:", error)
    return { total: 0, byEvent: {} }
  }
}

/**
 * Décide si une nouvelle demande peut être déposée.
 * Applique la règle anti-spam : une PENDING ou une APPROVED existante pour la
 * même adresse sur le même événement bloque une nouvelle demande. REJECTED et
 * CANCELLED laissent la porte ouverte, l'historique restant conservé.
 *
 * Conservé pour compatibilité : la règle complète (email OU téléphone) est
 * appliquée par `findBlockingActiveRequest`.
 */
export function canSubmitNewRequest(existingStatuses: ParticipationRequestStatus[]): {
  allowed: boolean
  reason?: "PENDING_EXISTS" | "ALREADY_APPROVED"
} {
  const statuses = new Set(existingStatuses)

  if (statuses.has("APPROVED")) return { allowed: false, reason: "ALREADY_APPROVED" }
  if (statuses.has("PENDING")) return { allowed: false, reason: "PENDING_EXISTS" }
  return { allowed: true }
}

/** Normalise une adresse pour les comparaisons anti-doublon. */
export function normalizeParticipationEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Séparateurs de présentation d'un numéro : espaces (y compris insécables),
 * points, tirets, parenthèses, barres.
 *
 * Source unique, partagée avec la construction des liens WhatsApp : deux
 * expressions concurrentes finiraient par diverger.
 */
export const PARTICIPATION_PHONE_NOISE = /[\s  .()\-–—/\\]/g

/**
 * Normalise un numéro POUR COMPARAISON uniquement.
 *
 * - séparateurs retirés (espaces, parenthèses, tirets, points) ;
 * - le préfixe international est conservé tel quel : « +228 90 12 34 56 » et
 *   « +22890123456 » donnent le même résultat ;
 * - un numéro national sans `+` n'est jamais complété par un code pays deviné :
 *   il reste tel quel et ne correspondra donc pas à sa version internationale.
 *   Guetter « +228 90… » et « 90… » comme identiques reviendrait à inventer que
 *   le second est togolais, donc à bloquer ou laisser passer à tort.
 *
 * La valeur enregistrée dans la base n'est jamais modifiée par cette fonction :
 * elle sert uniquement à la comparaison.
 */
export function normalizeParticipationPhone(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  const hasPlus = trimmed.startsWith("+")
  const digits = trimmed.replace(PARTICIPATION_PHONE_NOISE, "").replace(/\D/g, "")
  if (!digits) return null

  return hasPlus ? `+${digits}` : digits
}

/** Statuts qui constituent une demande active et bloquent une nouvelle demande. */
export const ACTIVE_PARTICIPATION_STATUSES = ["PENDING", "APPROVED"] as const

export type ActiveParticipationStatus = (typeof ACTIVE_PARTICIPATION_STATUSES)[number]

/** Ligne minimale nécessaire au contrôle anti-doublon. */
export interface ActiveRequestIdentity {
  email: string
  phone: string
  status: ParticipationRequestStatus
}

export type DuplicateReason = "ALREADY_APPROVED" | "ALREADY_PENDING"

export type DuplicateCheck =
  | { blocked: false }
  | { blocked: true; reason: DuplicateReason; matchedBy: "EMAIL" | "PHONE" }

/**
 * Règle métier : un candidat peut/dpourt S'INSCRIRE à plusieurs événements, mais
 * pour UN MÊME événement il ne peut avoir qu'une seule demande active.
 *
 * Une demande est bloquante si elle est PENDING ou APPROVED, et si l'email
 * normalisé OU le téléphone normalisé correspond. Un seul des deux suffit :
 * changer de numéro ne permet pas de contourner la règle, changer d'adresse
 * non plus. Le nom n'entre volontairement pas dans le critère : deux personnes
 * peuvent porter le même nom.
 *
 * REJECTED et CANCELLED ne bloquent rien : une nouvelle demande est possible et
 * l'ancienne reste conservée dans l'historique.
 *
 * Fonction pure : elle est testable sans base et sert aux deux points de
 * contrôle du service (avant transaction, puis sous verrou).
 */
export function findBlockingActiveRequest(
  activeRequests: ActiveRequestIdentity[],
  candidate: { email: string; phone: string }
): DuplicateCheck {
  const email = normalizeParticipationEmail(candidate.email)
  const phone = normalizeParticipationPhone(candidate.phone)

  let pendingByEmail = false
  let pendingByPhone = false
  let approved = false
  let approvedBy: "EMAIL" | "PHONE" | null = null

  for (const row of activeRequests) {
    // Une demande REJECTED ou CANCELLED n'est pas « active » : elle est ignorée,
    // même si elle porte les mêmes coordonnées.
    if (row.status !== "PENDING" && row.status !== "APPROVED") continue

    const sameEmail = email !== "" && normalizeParticipationEmail(row.email) === email
    const samePhone = phone !== null && normalizeParticipationPhone(row.phone) === phone
    if (!sameEmail && !samePhone) continue

    if (row.status === "APPROVED") {
      // L'APPROVED l'emporte toujours : c'est elle qui définit le message
      // affiché au candidat (« participation déjà confirmée »).
      if (!approved) {
        approved = true
        approvedBy = sameEmail ? "EMAIL" : "PHONE"
      }
      continue
    }

    if (sameEmail) pendingByEmail = true
    if (samePhone) pendingByPhone = true
  }

  if (approved) {
    return { blocked: true, reason: "ALREADY_APPROVED", matchedBy: approvedBy ?? "EMAIL" }
  }
  if (pendingByEmail || pendingByPhone) {
    return {
      blocked: true,
      reason: "ALREADY_PENDING",
      matchedBy: pendingByEmail ? "EMAIL" : "PHONE",
    }
  }
  return { blocked: false }
}
