"use server"

/**
 * Server Actions — demandes de participation aux événements.
 *
 * Ce fichier ne contient que les EFFETS DE BORD :
 * 1. validation Zod des données reçues ;
 * 2. vérification de la session et du rôle pour les décisions ;
 * 3. appel de la logique métier (`event-participation-service.ts`) ;
 * 4. revalidation des pages concernées ;
 * 5. notification e-mail facultative.
 *
 * Toute la logique métier — capacité, doublons, transitions de statut —
 * est dans le service, où elle est testable sans cookie ni requête HTTP.
 */

import { revalidatePath } from "next/cache"
import prisma from "./prisma"
import { verifySession } from "./auth"
import { eventParticipationRequestSchema } from "./cms-validations"
import {
  getEventCapacityStats,
  getEventCapacityStatsMap,
  getUnreadParticipationCounts,
  type EventCapacityStats,
} from "./event-participation"
import {
  approveParticipationRequest,
  cancelParticipationRequest,
  rejectParticipationRequest,
  submitParticipationRequest,
  getParticipationAdminData,
  logParticipationContactChannel,
  markParticipationRequestsRead,
  type DecisionNotification,
  type DuplicateReason,
  type ParticipationAdmin,
  type ParticipationRequestRow,
} from "./event-participation-service"
import { EmailService } from "./email/emailService"

/**
 * Statut de la demande existante ayant provoqué le refus anti-doublon.
 *
 * Volontairement distinct de `DuplicateReason` (motif technique du refus) : la
 * vue affiche un message POSITIF, et elle ne connaît que le statut métier.
 */
export type DuplicateRequestStatus = "APPROVED" | "PENDING"

export type EventActionResult =
  | { success: true; message?: string; requestId?: string; stats?: EventCapacityStats }
  | { success: false; error: string; code?: string; duplicateStatus?: DuplicateRequestStatus }

/**
 * Les types sont réexportés pour que l'interface n'ait pas à importer le
 * service lui-même.
 *
 * Les motifs de refus (`EVENT_FULL_ERROR` et consorts) restent, eux, dans
 * `event-participation-service.ts` : un fichier `"use server"` ne peut
 * exporter que des fonctions asynchrones, et réexporter une constante chaîne
 * faisait échouer le chargement du module — donc toute soumission.
 */
export type { ParticipationRequestRow as EventParticipationRequestRow }

/* ─────────────── Action publique : déposer une demande ─────────────── */

/**
 * Refus métier qui signifient « doublon » — et rien d'autre.
 *
 * Cette liste est volontairement étroite : un événement fermé ou devenu
 * introuvable n'est PAS un doublon, et doit donc continuer de remonter son
 * propre code pour que la vue affiche le bon état.
 */
const DUPLICATE_FAILURE_CODES = new Set(["ALREADY_PENDING", "ALREADY_APPROVED"])

/**
 * Dépose une demande de participation pour un événement.
 *
 * Ne consomme aucune place : la demande est enregistrée en `PENDING` et
 * attend une validation humaine de l'équipe APTIC-R.
 */
export async function submitEventParticipationRequest(
  input: unknown
): Promise<EventActionResult> {
  try {
    const parsed = eventParticipationRequestSchema.safeParse(input)
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Formulaire incomplet.",
        code: "VALIDATION",
      }
    }

    const result = await submitParticipationRequest(parsed.data)
    if (!result.ok) {
      // Seuls les refus pour DOUBLON portent un message informatif (« déjà
      // confirmée » / « en cours de traitement ») : la vue affiche alors un
      // panneau sobre et reste informée du statut métier.
      if (DUPLICATE_FAILURE_CODES.has(result.code)) {
        return {
          success: false,
          error: result.error,
          code: "ALREADY_REQUESTED",
          duplicateStatus: result.code === "ALREADY_APPROVED" ? "APPROVED" : "PENDING",
        }
      }

      // Les autres refus gardent LEUR code métier (événement fermé, événement
      // introuvable, non publié) : la vue affiche l'état correspondant au lieu
      // d'un faux message de doublon.
      return { success: false, error: result.error, code: result.code }
    }

    // La page de l'événement et la grille des événements affichent le nombre de
    // demandes en attente : elles doivent refléter la nouvelle demande.
    revalidateEventPaths(result.event.slug)

    // Les courriels ne partent qu'après l'enregistrement réussi de la demande.
    const notification = {
      requestId: result.requestId,
      firstName: parsed.data.firstName.trim(),
      lastName: parsed.data.lastName.trim(),
      email: parsed.data.email.trim(),
      eventTitle: result.notification.eventTitle,
      eventDate: result.notification.eventDate,
      eventLocation: result.notification.eventLocation,
      lang: parsed.data.lang,
    } as const
    await Promise.all([
      EmailService.sendEventParticipationEmails({ ...notification, decision: "PENDING" }),
      EmailService.sendEventParticipationAdminNotification(notification),
    ])

    return {
      success: true,
      requestId: result.requestId,
      message: "Votre demande de participation a bien été envoyée.",
      stats: result.stats,
    }
  } catch (error) {
    console.error("[event-participation] Échec du dépôt d'une demande:", error)
    return {
      success: false,
      error: "Votre demande n'a pas pu être enregistrée. Veuillez réessayer.",
      code: "SERVER_ERROR",
    }
  }
}

/* ───────── Actions admin : décision humaine sur une demande ─────── */

/**
 * VALIDE une demande : c'est le seul moment où une place est consommée.
 *
 * L'action ne décide rien elle-même : elle s'assure que l'appelant est bien
 * administrateur, puis délègue le contrôle de capacité au service, qui le
 * refait sous verrou de ligne.
 */
export async function approveEventParticipationRequest(
  requestId: string
): Promise<EventActionResult> {
  try {
    const admin = await requireAdmin()
    if (!admin) return unauthorized()

    const result = await approveParticipationRequest(requestId, admin)
    if (!result.ok) {
      return { success: false, error: result.error, code: result.code }
    }

    revalidateEventPaths(result.slug)
    await notify(result.notification, "APPROVED")

    return { success: true, stats: result.stats }
  } catch (error) {
    console.error("[event-participation] Échec de la validation:", error)
    return {
      success: false,
      error: "La validation n'a pas pu aboutir. Veuillez réessayer.",
      code: "SERVER_ERROR",
    }
  }
}

/** REFUSE une demande : aucune place consommée, motif conservé. */
export async function rejectEventParticipationRequest(
  requestId: string,
  reason?: string | null
): Promise<EventActionResult> {
  try {
    const admin = await requireAdmin()
    if (!admin) return unauthorized()

    const result = await rejectParticipationRequest(requestId, reason, admin)
    if (!result.ok) {
      return { success: false, error: result.error, code: result.code }
    }

    revalidateEventPaths(result.slug)
    await notify(result.notification, "REJECTED", reason)

    return { success: true, stats: result.stats }
  } catch (error) {
    console.error("[event-participation] Échec du refus:", error)
    return { success: false, error: "Le refus a échoué.", code: "SERVER_ERROR" }
  }
}

/**
 * ANNULE une participation déjà validée : la place redevient disponible et la
 * demande est conservée avec son historique.
 */
export async function cancelEventParticipationRequest(
  requestId: string
): Promise<EventActionResult> {
  try {
    const admin = await requireAdmin()
    if (!admin) return unauthorized()

    const result = await cancelParticipationRequest(requestId, admin)
    if (!result.ok) {
      return { success: false, error: result.error, code: result.code }
    }

    revalidateEventPaths(result.slug)

    return { success: true, stats: result.stats }
  } catch (error) {
    console.error("[event-participation] Échec de l'annulation:", error)
    return { success: false, error: "L'annulation a échoué.", code: "SERVER_ERROR" }
  }
}

/* ─────────────────────── Lecture pour le back-office ───────────────── */

/**
 * Compteurs et demandes d'un événement.
 *
 * Les chiffres affichés par l'administrateur proviennent tous de cette lecture,
 * calculée en base : le navigateur ne fait aucun décompte.
 */
export async function getEventParticipationAdminData(eventId: string): Promise<
  | { success: true; stats: EventCapacityStats; requests: ParticipationRequestRow[] }
  | { success: false; error: string; stats: EventCapacityStats; requests: ParticipationRequestRow[] }
> {
  const fallback: EventCapacityStats = {
    capacity: null,
    hasCapacityLimit: false,
    remainingPlaces: null,
    validatedParticipants: 0,
    pendingRequests: 0,
    rejectedRequests: 0,
    cancelledRequests: 0,
    unreadRequests: 0,
    totalRequests: 0,
    isFull: false,
  }

  try {
    const admin = await requireAdmin()
    if (!admin) {
      return { success: false, error: "Session expirée.", stats: fallback, requests: [] }
    }

    const data = await getParticipationAdminData(eventId)

    // Ouvrir la liste des demandes les marque comme lues : l'indicateur « non
    // lu » retombe pour la prochaine ouverture.
    //
    // Le nombre renvoyé ici est celui observé AVANT le marquage : l'en-tête de
    // la liste (« Non lues ») et les points bleus de chaque ligne décrivent donc
    // exactement la même chose. Renvoyer zéro tout en laissant les points
    // afficherait un total contredit par les lignes.
    if (data.stats.unreadRequests > 0) {
      await markParticipationRequestsRead(eventId, admin)
    }

    return {
      success: true,
      stats: data.stats,
      requests: data.requests,
    }
  } catch (error) {
    console.error("[event-participation] Échec du chargement des demandes:", error)
    return { success: false, error: "Chargement impossible.", stats: fallback, requests: [] }
  }
}

/**
 * Compteur de demandes jamais consultées, pour l'indicateur du back-office.
 *
 * Ne notifie personne : ni e-mail, ni notification navigateur. C'est un simple
 * décompte affiché dans l'interface d'administration.
 */
export async function getEventsUnreadParticipationCounts(): Promise<
  | { success: true; total: number; byEvent: Record<string, number> }
  | { success: false; error: string; total: 0; byEvent: Record<string, number> }
> {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return { success: false, error: "Session expirée.", total: 0, byEvent: {} }
    }
    const counts = await getUnreadParticipationCounts()
    return { success: true, total: counts.total, byEvent: counts.byEvent }
  } catch (error) {
    console.error("[event-participation] Échec du comptage des demandes non lues:", error)
    return { success: false, error: "Comptage impossible.", total: 0, byEvent: {} }
  }
}

/**
 * Vue groupée « demandes de participation » de tous les événements.
 *
 * Alimente la liste back-office : le nombre de demandes non lues, en attente,
 * validées et le total proviennent tous d'un seul calcul en base. Le navigateur
 * ne recompte jamais rien, et le compteur « non lues » reste distinct du statut
 * PENDING — une demande lue peut être encore en attente.
 */
export async function getEventsParticipationSummary(): Promise<
  | { success: true; byEvent: Record<string, EventCapacityStats> }
  | { success: false; error: string; byEvent: Record<string, EventCapacityStats> }
> {
  try {
    const admin = await requireAdmin()
    if (!admin) {
      return { success: false, error: "Session expirée.", byEvent: {} }
    }

    const events = await prisma.evenement.findMany({ select: { id: true } })
    const byEvent = await getEventCapacityStatsMap(events.map((event) => event.id))
    return { success: true, byEvent }
  } catch (error) {
    console.error("[event-participation] Échec du résumé de participation:", error)
    return { success: false, error: "Chargement impossible.", byEvent: {} }
  }
}

/**
 * Journalise l'ouverture d'un canal de contact manuel (WhatsApp ou e-mail).
 *
 * N'envoie RIEN : WhatsApp et le logiciel de messagerie sont externes. Le
 * navigateur a déjà ouvert le lien, et cette action se contente de noter que
 * l'administrateur a ouvert le canal. Aucun statut n'est modifié, aucune place
 * n'est consommée : la validation reste un clic distinct.
 */
export async function logEventParticipationContact(
  requestId: string,
  channel: "WHATSAPP" | "EMAIL"
): Promise<{ success: boolean; error?: string }> {
  try {
    const admin = await requireAdmin()
    if (!admin) return { success: false, error: "Session expirée." }

    const result = await logParticipationContactChannel(requestId, channel, admin)
    if (!result.ok) return { success: false, error: result.error }

    return { success: true }
  } catch (error) {
    console.error("[event-participation] Échec de la journalisation du contact:", error)
    return { success: false, error: "Journalisation impossible." }
  }
}

/* ─────────────────────────────── Helpers ───────────────────────────── */

/** Rôles autorisés à traiter les demandes de participation. */
const ADMIN_ROLES = new Set(["SUPERADMIN", "ADMIN", "COORDINATOR", "CONTENT_MANAGER"])

/**
 * Vérifie la session ET le rôle.
 *
 * Le rôle est relu en base et pas seulement dans le cookie : une session
 * valide mais révoquée, ou un rôle modifié, ne doit jamais suffire à consommer
 * une place. Le back-office du projet n'expose que ces fonctions.
 */
async function requireAdmin(): Promise<ParticipationAdmin | null> {
  const session = await verifySession()
  if (!session?.isAuth || !session.userId) return null

  const user = await prisma.utilisateur.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, role: true },
  })
  if (!user) return null
  if (!ADMIN_ROLES.has(user.role)) return null

  return { userId: user.id, name: user.name }
}

function unauthorized(): EventActionResult {
  return { success: false, error: "Session expirée.", code: "UNAUTHORIZED" }
}

/**
 * La fiche événement et la grille des événements montrent le nombre de
 * demandes en attente : les deux sont revalidées après chaque décision.
 */
function revalidateEventPaths(slug: string): void {
  for (const lang of ["fr", "en", "de"]) {
    revalidatePath(`/${lang}/evenements/${slug}`)
    revalidatePath(`/${lang}/evenements`)
  }
}

/** Notification facultative : jamais bloquante pour l'opération métier. */
async function notify(
  notification: DecisionNotification,
  decision: "APPROVED" | "REJECTED" | "CANCELLED",
  rejectionReason?: string | null
): Promise<void> {
  try {
    await EmailService.sendEventParticipationEmails({
      requestId: notification.id,
      decision,
      firstName: notification.firstName,
      lastName: notification.lastName,
      email: notification.email,
      eventTitle: notification.eventTitle,
      eventDate: notification.eventDate,
      eventLocation: notification.eventLocation,
      lang: notification.lang,
      rejectionReason,
    })
  } catch (error) {
    console.error("[event-participation] Notification impossible:", error)
  }
}

/** Notification facultative : jamais bloquante pour l'opération métier. */
