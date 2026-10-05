/**
 * Logique métier des demandes de participation aux événements.
 *
 * Ce module ne contient QUE des règles métier et des accès base de données :
 * ni session, ni revalidation de cache, ni e-mail. Les Server Actions
 * (`event-participation-actions.ts`) l'utilisent après avoir vérifié la session
 * et les droits, puis s'occupent des effets de bord.
 *
 * Cette séparation a une raison pratique : les règles critiques — capacité,
 * unicité d'une demande, transitions de statut — sont alors testables sans
 * cookie de session ni contexte de requête.
 *
 * Règles invariantes :
 * - `maxParticipants` n'est JAMAIS modifié ;
 * - seule une demande `APPROVED` occupe une place ;
 * - `PENDING` ne consomme rien et ne verrouille rien ;
 * - annuler une participation libère la place, sans supprimer la demande ;
 * - la capacité est recalculée sous verrou de ligne, jamais avant.
 */

import prisma from "./prisma"
import {
  ACTIVE_PARTICIPATION_STATUSES,
  deriveCapacityStats,
  findBlockingActiveRequest,
  getEventCapacityStats,
  normalizeParticipationEmail,
  type DuplicateReason as DuplicateCheckReason,
  type EventCapacityStats,
} from "./event-participation"

/**
 * Motif du refus anti-doublon, réutilisé par la Server Action pour informer la
 * vue publique (message « participation déjà confirmée » ou « en cours »).
 * Source unique : la règle vit dans `event-participation.ts`.
 */
export type DuplicateReason = DuplicateCheckReason
import type { ParticipationRequestStatus } from "@prisma/client"
import type { ContactChannel } from "./event-participation-contact"

/* ───────────────────────────── Messages ───────────────────────────── */

/** Motifs de refus exposés à l'interface, pour qu'elle puisse les traduire. */
export const EVENT_FULL_ERROR =
  "Impossible de valider cette demande : l'événement est complet."
export const EVENT_ALREADY_APPROVED_ERROR =
  "Cette demande est déjà validée. Aucune place supplémentaire n'a été consommée."
/** Refus côté CANDIDAT : sa participation est déjà confirmée. */
export const EVENT_ALREADY_PENDING_ERROR =
  "Une demande de participation est déjà en cours de traitement pour cet événement."
export const EVENT_DUPLICATE_APPROVED_ERROR =
  "Votre participation à cet événement est déjà confirmée."
/**
 * Message générique de doublon, disponible pour l'interface : la détection peut
 * porter sur l'email OU sur le téléphone, et l'utilisateur n'a pas besoin de
 * connaître le détail. Les messages les plus précis ci-dessus restent
 * preferables quand la demande existante est identifiable.
 */
export const EVENT_DUPLICATE_ERROR =
  "Une demande de participation existe déjà pour cet événement avec cette adresse email ou ce numéro de téléphone."
export const EVENT_CLOSED_ERROR =
  "Les demandes de participation ne sont pas ouvertes pour cet événement."
export const EVENT_NOT_PUBLISHED_ERROR =
  "Cet événement n'est pas accessible à la demande."
export const EVENT_NOT_FOUND_ERROR = "Cet événement n'existe pas."
export const REQUEST_NOT_FOUND_ERROR = "Demande introuvable."
export const INVALID_TRANSITION_ERROR = "Seule une demande en attente peut être traitée."
export const CANCEL_INVALID_TRANSITION_ERROR =
  "Seule une participation validée peut être annulée."
export const ALREADY_APPROVED_FOR_CANCEL_ERROR =
  "Cette participation est validée : utilisez « Annuler la participation » pour libérer la place."

/* ─────────────────── Délais des transactions interactives ─────────────────── */

/**
 * Délais appliqués aux transactions interactives.
 *
 * Le délai par défaut de Prisma (5 000 ms) est trop court pour ce service : la
 * base étant hébergée sur Neon derrière PgBouncer, chaque aller-retour coûte
 * environ 400 ms dans une transaction et 1 000 ms en dehors, et l'ouverture
 * d'une transaction ajoute encore ~800 ms.
 *
 * Or ces transactions enchaînent volontairement plusieurs requêtes — verrou de
 * ligne `FOR UPDATE`, contrôle de capacité, écriture, écriture de l'historique,
 * puis commit — soit 5 à 7 s observées. Avec le délai par défaut, une
 * inscription arrivait à expiration alors que le métier était parfaitement
 * valide : le demandeur voyait « Votre demande n'a pas pu être envoyée ».
 *
 * Ces marges ne changent ni la atomicité ni les verrous : elles donnent
 * seulement à la transaction le temps d'aboutir sur un réseau lent.
 */
const INTERACTIVE_TRANSACTION = {
  /** Temps maximal d'attente pour obtenir une connexion du pool. */
  maxWait: 15_000,
  /** Durée maximale de la transaction une fois Started. */
  timeout: 30_000,
} as const

/* ─────────────────────────────── Types ─────────────────────────────── */

/** Acteur administratif, résolu par la couche appelante après vérification. */
export interface ParticipationAdmin {
  userId: string
  name: string
}

export type ServiceFailureCode =
  | "NOT_FOUND"
  | "NOT_PUBLISHED"
  | "CLOSED"
  | "ALREADY_PENDING"
  | "ALREADY_APPROVED"
  | "EVENT_FULL"
  | "INVALID_TRANSITION"
  | "NOT_APPROVED"
  | "CONFLICT"
  | "UNKNOWN"

export interface ServiceFailure {
  ok: false
  code: ServiceFailureCode
  error: string
}

export type ServiceResult<T> = ({ ok: true } & T) | ServiceFailure

/** Données d'une demande, en partie normalisées après validation Zod. */
export interface ValidatedRequestInput {
  eventId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  organization?: string | null
  city?: string | null
  country?: string | null
  message?: string | null
  lang: "FR" | "EN" | "DE"
}

/** Détail d'une demande pour le back-office. */
export interface ParticipationRequestRow {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  organization: string | null
  city: string | null
  country: string | null
  message: string | null
  lang: string
  status: ParticipationRequestStatus
  rejectionReason: string | null
  reviewedAt: string | null
  reviewedByName: string | null
  /** null tant que la demande n'a jamais été consultée par un administrateur. */
  readAt: string | null
  createdAt: string
}

/** Éléments nécessaires à un e-mail de décision, préparés côté métier. */
export interface DecisionNotification {
  id: string
  firstName: string
  lastName: string
  email: string
  eventTitle: string
  eventDate: string
  eventLocation: string | null
  lang: "FR" | "EN" | "DE"
}

/** Résultat d'une décision : compteurs, e-mail à envoyer, et slug à revalider. */
export type DecisionOutcome = ServiceResult<{
  stats: EventCapacityStats
  notification: DecisionNotification
  slug: string
}>

/**
 * Étape transactionnelle d'une décision : les compteurs sont recalculés après
 * l'écriture, donc ils sont omis ici et ajoutés par l'appelant.
 */
type DecisionTxResult =
  | { ok: true; slug: string; notification: DecisionNotification; eventId: string }
  | ServiceFailure

function fail(code: ServiceFailureCode, error: string): ServiceFailure {
  return { ok: false, code, error }
}

/* ───────────────────────── Dépôt d'une demande ───────────────────── */

/**
 * Dépose une demande de participation et la crée en `PENDING`.
 *
 * L'anti-spam est appliqué deux fois : une fois avant la transaction (cas
 * nominal, message clair) puis sous verrou de ligne (cas d'une double soumission
 * simultanée, où le contrôle doit être refait après sérialisation).
 *
 * Aucun compteur de places n'est modifié ici.
 */
export async function submitParticipationRequest(
  data: ValidatedRequestInput
): Promise<
  ServiceResult<{
    requestId: string
    stats: EventCapacityStats
    event: { slug: string; titleFr: string | null; titleEn: string | null; titleDe: string | null }
    notification: DecisionNotification
  }>
> {
  const event = await prisma.evenement.findUnique({
    where: { id: data.eventId },
    select: {
      id: true,
      slug: true,
      titleFr: true,
      titleEn: true,
      titleDe: true,
      published: true,
      registrationOpen: true,
      location: true,
      startDate: true,
    },
  })

  if (!event) return fail("NOT_FOUND", EVENT_NOT_FOUND_ERROR)
  if (!event.published) return fail("NOT_PUBLISHED", EVENT_NOT_PUBLISHED_ERROR)
  if (!event.registrationOpen) return fail("CLOSED", EVENT_CLOSED_ERROR)

  // Normalisation COMPARÉE, valeur enregistrée inchangée : l'email est déjà
  // stocké en minuscules, le téléphone conserve sa présentation d'origine.
  const email = normalizeParticipationEmail(data.email)
  const phone = data.phone.trim()

  // Contrôle 1/2 — hors transaction, pour répondre vite et sans échouer.
  // On charge les demandes ACTIVES de l'événement (bornées par la capacité de
  // l'événement) et on compare en mémoire : le téléphone est stocké libre, donc
  // « +228 90 12 34 56 » et « +22890123456 » ne se rejoignent pas en SQL.
  const existingActive = await prisma.demandeParticipation.findMany({
    where: { eventId: data.eventId, status: { in: [...ACTIVE_PARTICIPATION_STATUSES] } },
    select: { email: true, phone: true, status: true },
  })
  const firstCheck = findBlockingActiveRequest(existingActive, { email, phone })
  if (firstCheck.blocked) return failForDuplicate(firstCheck.reason)

  let requestId: string
  try {
    requestId = await prisma.$transaction(async (tx) => {
      // Verrou de ligne sur l'événement : deux envois simultanés sont sérialisés,
      // le second relit donc l'état réel et refuse de créer un doublon.
      await tx.$queryRaw`SELECT "id" FROM "Evenement" WHERE "id" = ${data.eventId} FOR UPDATE`

      // Contrôle 2/2 — refait DANS la transaction, sous verrou. C'est ce contrôle
      // qui fait foi : il referme la fenêtre entre le contrôle 1 et l'insertion.
      const concurrent = await tx.demandeParticipation.findMany({
        where: { eventId: data.eventId, status: { in: [...ACTIVE_PARTICIPATION_STATUSES] } },
        select: { email: true, phone: true, status: true },
      })
      const blocking = findBlockingActiveRequest(concurrent, { email, phone })
      if (blocking.blocked) throw new DuplicateRequestError(blocking.reason)

      const created = await tx.demandeParticipation.create({
        data: {
          eventId: data.eventId,
          firstName: data.firstName.trim(),
          lastName: data.lastName.trim(),
          email,
          phone,
          organization: data.organization?.trim() || null,
          city: data.city?.trim() || null,
          country: data.country?.trim() || null,
          message: data.message?.trim() || null,
          lang: data.lang,
          consentAt: new Date(),
          status: "PENDING",
        },
        select: { id: true },
      })

      await tx.historiqueParticipation.create({
        data: {
          requestId: created.id,
          fromStatus: null,
          toStatus: "PENDING",
          changedByName: email,
          note: "Demande déposée depuis la page publique de l'événement.",
        },
      })

      return created.id
    }, INTERACTIVE_TRANSACTION)
  } catch (error) {
    // Un doublon n'est pas une panne : c'est une réponse métier normale, à
    // distinguer d'une vraie erreur technique côté appelant.
    if (error instanceof DuplicateRequestError) return failForDuplicate(error.reason)
    throw error
  }

  return {
    ok: true,
    requestId,
    stats: await getEventCapacityStats(data.eventId),
    event: { slug: event.slug, titleFr: event.titleFr, titleEn: event.titleEn, titleDe: event.titleDe },
    notification: buildNotification({
      id: requestId,
      firstName: data.firstName,
      lastName: data.lastName,
      email,
      lang: data.lang,
      event,
    }),
  }
}

/** Doublon détecté après verrou : réponse métier, pas une panne. */
class DuplicateRequestError extends Error {
  readonly reason: DuplicateReason
  constructor(reason: DuplicateReason) {
    super("Demande en double")
    this.reason = reason
  }
}

/**
 * Réponse à une soumission refusée pour doublon.
 *
 * Le message ne divulgue rien de la demande existante : ni son statut exact, ni
 * sa date, ni ses coordonnées. Seule l'information utile est donnée — « vous
 * avez déjà une demande sur cet événement » — et le code permet à l'interface
 * de reformuler si besoin.
 */
function failForDuplicate(reason: DuplicateReason): ServiceFailure {
  return reason === "ALREADY_APPROVED"
    ? { ok: false, code: "ALREADY_APPROVED", error: EVENT_DUPLICATE_APPROVED_ERROR }
    : { ok: false, code: "ALREADY_PENDING", error: EVENT_ALREADY_PENDING_ERROR }
}

/* ─────────────────────── Décision administrative ─────────────────── */

/**
 * VALIDE une demande : seul moment où une place est consommée.
 *
 * Concurrence : la capacité est recalculée DANS la transaction, sous verrou de
 * ligne `SELECT ... FOR UPDATE` sur l'événement. Deux administrateurs validant
 * en même temps la dernière place sont sérialisés : le second reçoit «
 * l'événement est complet » au lieu de dépasser la capacité.
 *
 * Les compteurs renvoyés sont calculés APRÈS l'écriture, donc ils reflètent
 * l'état réellement affiché juste après le clic.
 */
export async function approveParticipationRequest(
  requestId: string,
  admin: ParticipationAdmin
): Promise<DecisionOutcome> {
  // Prisma signale un conflit d'écriture par P2034 : on réessaie brièvement.
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await runApproval(requestId, admin)
    } catch (error: unknown) {
      const isWriteConflict =
        typeof error === "object" && error !== null && (error as { code?: string }).code === "P2034"
      if (!isWriteConflict || attempt === 3) throw error
    }
  }
  return fail("CONFLICT", "La validation n'a pas pu aboutir. Veuillez réessayer.")
}

async function runApproval(requestId: string, admin: ParticipationAdmin): Promise<DecisionOutcome> {
  return prisma.$transaction(async (tx) => {
    const request = await tx.demandeParticipation.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        eventId: true,
        status: true,
        firstName: true,
        lastName: true,
        email: true,
        lang: true,
      },
    })
    if (!request) return fail("NOT_FOUND", REQUEST_NOT_FOUND_ERROR)

    // Verrou de ligne sur l'événement : sérialise TOUTES les validations
    // concurrentes de cet événement, pas seulement celles de cette demande.
    await tx.$queryRaw`SELECT "id" FROM "Evenement" WHERE "id" = ${request.eventId} FOR UPDATE`

    const event = await tx.evenement.findUnique({
      where: { id: request.eventId },
      select: {
        maxParticipants: true,
        slug: true,
        titleFr: true,
        titleEn: true,
        titleDe: true,
        location: true,
        startDate: true,
      },
    })
    if (!event) return fail("NOT_FOUND", EVENT_NOT_FOUND_ERROR)

    // Statut relu APRÈS le verrou : la décision porte sur l'état réel, donc
    // deux clics rapprochés sur la même demande ne consomment qu'une place.
    const current = await tx.demandeParticipation.findUnique({
      where: { id: requestId },
      select: { status: true },
    })
    const fromStatus = current?.status
    if (fromStatus === "APPROVED") {
      return fail("ALREADY_APPROVED", EVENT_ALREADY_APPROVED_ERROR)
    }
    if (fromStatus !== "PENDING") {
      return fail("INVALID_TRANSITION", INVALID_TRANSITION_ERROR)
    }

    const approvedCount = await tx.demandeParticipation.count({
      where: { eventId: request.eventId, status: "APPROVED" },
    })
    const statsBefore = deriveCapacityStats(event.maxParticipants, {
      PENDING: 0,
      APPROVED: approvedCount,
      REJECTED: 0,
      CANCELLED: 0,
    })

    if (statsBefore.isFull) {
      return fail("EVENT_FULL", EVENT_FULL_ERROR)
    }

    await tx.demandeParticipation.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: admin.userId,
        reviewedByName: admin.name,
        rejectionReason: null,
      },
    })

    await tx.historiqueParticipation.create({
      data: {
        requestId,
        fromStatus,
        toStatus: "APPROVED",
        changedById: admin.userId,
        changedByName: admin.name,
        note: "Participation validée après contact et confirmation de la personne.",
      },
    })

    // Compteurs post-écriture : ce que l'administrateur voit après son clic.
    const stats = deriveCapacityStats(event.maxParticipants, {
      PENDING: 0,
      APPROVED: approvedCount + 1,
      REJECTED: 0,
      CANCELLED: 0,
    })

    return {
      ok: true,
      stats,
      slug: event.slug,
      notification: buildNotification({
        id: request.id,
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        lang: request.lang as "FR" | "EN" | "DE",
        event,
      }),
    }
  }, INTERACTIVE_TRANSACTION)
}

/** REFUSE une demande : aucune place consommée, motif conservé. */
export async function rejectParticipationRequest(
  requestId: string,
  reason: string | null | undefined,
  admin: ParticipationAdmin
): Promise<DecisionOutcome> {
  const result = await prisma.$transaction(
    async (tx): Promise<DecisionTxResult> => {
    const request = await tx.demandeParticipation.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        eventId: true,
        status: true,
        firstName: true,
        lastName: true,
        email: true,
        lang: true,
      },
    })
    if (!request) return fail("NOT_FOUND", REQUEST_NOT_FOUND_ERROR)
    if (request.status === "APPROVED") {
      return fail("INVALID_TRANSITION", ALREADY_APPROVED_FOR_CANCEL_ERROR)
    }
    if (request.status !== "PENDING") {
      return fail("INVALID_TRANSITION", INVALID_TRANSITION_ERROR)
    }

    await tx.$queryRaw`SELECT "id" FROM "Evenement" WHERE "id" = ${request.eventId} FOR UPDATE`

    const event = await tx.evenement.findUnique({
      where: { id: request.eventId },
      select: {
        slug: true,
        titleFr: true,
        titleEn: true,
        titleDe: true,
        location: true,
        startDate: true,
      },
    })
    if (!event) return fail("NOT_FOUND", EVENT_NOT_FOUND_ERROR)

    const trimmedReason = reason?.trim() || null

    await tx.demandeParticipation.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        rejectionReason: trimmedReason,
        reviewedAt: new Date(),
        reviewedBy: admin.userId,
        reviewedByName: admin.name,
      },
    })

    await tx.historiqueParticipation.create({
      data: {
        requestId,
        fromStatus: request.status,
        toStatus: "REJECTED",
        changedById: admin.userId,
        changedByName: admin.name,
        note: trimmedReason || "Demande refusée par l'équipe APTIC-R.",
      },
    })

    return {
      ok: true,
      slug: event.slug,
      notification: buildNotification({
        id: request.id,
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        lang: request.lang as "FR" | "EN" | "DE",
        event,
      }),
      eventId: request.eventId,
    }
    },
  INTERACTIVE_TRANSACTION
  )

  if (!result.ok) return result
  return {
    ok: true,
    stats: await getEventCapacityStats(result.eventId),
    notification: result.notification,
    slug: result.slug,
  }
}

/**
 * ANNULE une participation déjà validée. La place redevient disponible
 * automatiquement (compteur recalculé sur les `APPROVED`) et la demande comme
 * son historique sont conservés.
 */
export async function cancelParticipationRequest(
  requestId: string,
  admin: ParticipationAdmin
): Promise<DecisionOutcome> {
  const result = await prisma.$transaction(
    async (tx): Promise<DecisionTxResult> => {
    const request = await tx.demandeParticipation.findUnique({
      where: { id: requestId },
      select: {
        id: true,
        eventId: true,
        status: true,
        firstName: true,
        lastName: true,
        email: true,
        lang: true,
      },
    })
    if (!request) return fail("NOT_FOUND", REQUEST_NOT_FOUND_ERROR)
    if (request.status !== "APPROVED") {
      return fail("NOT_APPROVED", CANCEL_INVALID_TRANSITION_ERROR)
    }

    await tx.$queryRaw`SELECT "id" FROM "Evenement" WHERE "id" = ${request.eventId} FOR UPDATE`

    const event = await tx.evenement.findUnique({
      where: { id: request.eventId },
      select: {
        slug: true,
        titleFr: true,
        titleEn: true,
        titleDe: true,
        location: true,
        startDate: true,
      },
    })
    if (!event) return fail("NOT_FOUND", EVENT_NOT_FOUND_ERROR)

    await tx.demandeParticipation.update({
      where: { id: requestId },
      data: {
        status: "CANCELLED",
        reviewedAt: new Date(),
        reviewedBy: admin.userId,
        reviewedByName: admin.name,
      },
    })

    await tx.historiqueParticipation.create({
      data: {
        requestId,
        fromStatus: "APPROVED",
        toStatus: "CANCELLED",
        changedById: admin.userId,
        changedByName: admin.name,
        note: "Participation annulée : la place est de nouveau disponible.",
      },
    })

    return {
      ok: true,
      slug: event.slug,
      notification: buildNotification({
        id: request.id,
        firstName: request.firstName,
        lastName: request.lastName,
        email: request.email,
        lang: request.lang as "FR" | "EN" | "DE",
        event,
      }),
      eventId: request.eventId,
    }
  }, INTERACTIVE_TRANSACTION)

  if (!result.ok) return result
  return {
    ok: true,
    stats: await getEventCapacityStats(result.eventId),
    notification: result.notification,
    slug: result.slug,
  }
}

/* ─────────────────────────── Lecture back-office ──────────────────── */

/** Compteurs et demandes d'un événement, pour l'écran d'administration. */
export async function getParticipationAdminData(eventId: string): Promise<{
  stats: EventCapacityStats
  requests: ParticipationRequestRow[]
}> {
  const [stats, rows] = await Promise.all([
    getEventCapacityStats(eventId),
    prisma.demandeParticipation.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        organization: true,
        city: true,
        country: true,
        message: true,
        lang: true,
        status: true,
        rejectionReason: true,
        reviewedAt: true,
        reviewedByName: true,
        readAt: true,
        createdAt: true,
      },
    }),
  ])

  return {
    stats,
    requests: rows.map((row) => ({
      ...row,
      reviewedAt: row.reviewedAt ? row.reviewedAt.toISOString() : null,
      readAt: row.readAt ? row.readAt.toISOString() : null,
      createdAt: row.createdAt.toISOString(),
    })),
  }
}

/**
 * Marque comme lues les demandes d'un événement.
 *
 * Appelé quand un administrateur ouvre la liste des demandes. « Lue » ne change
 * ni le statut, ni les places : une demande lue reste PENDING tant que
 * l'administrateur n'a pas validé la participation.
 */
export async function markParticipationRequestsRead(
  eventId: string,
  admin: ParticipationAdmin
): Promise<number> {
  try {
    const { count } = await prisma.demandeParticipation.updateMany({
      where: { eventId, readAt: null },
      data: { readAt: new Date() },
    })
    return count
  } catch (error) {
    console.error("[event-participation] Échec du marquage des demandes lues:", error)
    void admin
    return 0
  }
}

/**
 * Journalise l'OUVERTURE d'un canal de contact manuel.
 *
 * Ce que le système sait : l'administrateur a ouvert WhatsApp ou le composeur
 * d'e-mail. Ce qu'il ne sait pas : si le message a réellement été envoyé, la
 * lecture du message, ou une éventuelle réponse. Aucun statut n'est modifié et
 * aucune place n'est consommée : l'événement journalisé dit explicitement que
 * l'envoi reste à la main de l'administrateur.
 */
export async function logParticipationContactChannel(
  requestId: string,
  channel: ContactChannel,
  admin: ParticipationAdmin
): Promise<ServiceResult<{ logged: boolean }>> {
  try {
    const request = await prisma.demandeParticipation.findUnique({
      where: { id: requestId },
      select: { id: true, eventId: true, status: true },
    })
    if (!request) return fail("NOT_FOUND", REQUEST_NOT_FOUND_ERROR)

    await prisma.historiqueParticipation.create({
      data: {
        requestId: request.id,
        fromStatus: request.status,
        toStatus: request.status,
        changedById: admin.userId,
        changedByName: admin.name,
        note:
          channel === "WHATSAPP"
            ? "CONTACT_WHATSAPP_OPENED — WhatsApp ouvert avec un message prérempli ; l'envoi reste à la main de l'administrateur."
            : "CONTACT_EMAIL_OPENED — Composeur d'e-mail ouvert avec un message prérempli ; l'envoi reste à la main de l'administrateur.",
      },
    })

    return { ok: true, logged: true }
  } catch (error) {
    console.error("[event-participation] Échec de la journalisation du canal de contact:", error)
    return fail("UNKNOWN", "Le canal n'a pas pu être journalisé.")
  }
}

/* ─────────────────────────────── Helpers ──────────────────────────── */

function buildNotification(input: {
  id: string
  firstName: string
  lastName: string
  email: string
  lang: "FR" | "EN" | "DE"
  event: {
    titleFr: string | null
    titleEn: string | null
    titleDe: string | null
    location: string | null
    startDate: Date
  }
}): DecisionNotification {
  return {
    id: input.id,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    eventTitle: localizedTitle(input.event, input.lang),
    eventDate: formatDateInLang(input.event.startDate, input.lang),
    eventLocation: input.event.location,
    lang: input.lang,
  }
}

/**
 * Titre dans la langue du demandeur, sans repli sur le français : si la
 * traduction manque, l'e-mail porte la mention neutre « APTIC-R » plutôt qu'un
 * titre dans une langue que la personne n'a pas choisie.
 */
function localizedTitle(
  event: { titleFr: string | null; titleEn: string | null; titleDe: string | null },
  lang: "FR" | "EN" | "DE"
): string {
  if (lang === "EN") return event.titleEn?.trim() || "APTIC-R"
  if (lang === "DE") return event.titleDe?.trim() || "APTIC-R"
  return event.titleFr?.trim() || "APTIC-R"
}

/** Date formatée dans la langue du demandeur. */
function formatDateInLang(date: Date, lang: "FR" | "EN" | "DE"): string {
  const locale = lang === "EN" ? "en-GB" : lang === "DE" ? "de-DE" : "fr-FR"
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date)
  } catch {
    return date.toISOString().slice(0, 10)
  }
}
