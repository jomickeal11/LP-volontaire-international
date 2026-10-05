/**
 * Tests d'intégration des demandes de participation aux événements.
 *
 * Ces tests s'exécutent sur la base de développement (`.env`) et n'appellent
 * QUE le service métier : ni cookie de session, ni e-mail, ni revalidation de
 * cache. Un administrateur est simulé par un objet `{ userId, name }`, ce qui
 * permet de tester réellement les validations, y compris concurrentes.
 *
 * Exécution : `npx tsx scripts/test-event-participation.ts` (option `test05`
 * pour n'en lancer qu'un).
 *
 * Sécurité : toutes les données créées portent le préfixe `TEST-PART-` et ne
 * sont supprimées qu'entre elles. Aucune donnée existante n'est touchée.
 */

import { PrismaClient } from "@prisma/client"
import {
  approveParticipationRequest,
  cancelParticipationRequest,
  rejectParticipationRequest,
  submitParticipationRequest,
  getParticipationAdminData,
  markParticipationRequestsRead,
  logParticipationContactChannel,
  EVENT_ALREADY_PENDING_ERROR,
  EVENT_DUPLICATE_APPROVED_ERROR,
} from "../src/lib/event-participation-service"
import {
  findBlockingActiveRequest,
  getEventCapacityStats,
  getEventCapacityStatsMap,
  normalizeParticipationEmail,
  normalizeParticipationPhone,
  type ActiveRequestIdentity,
} from "../src/lib/event-participation"
import {
  buildMailtoUrl,
  buildWhatsAppUrl,
  checkContactAvailability,
  normalizeWhatsAppNumber,
  renderParticipationEmailMessage,
  renderParticipationWhatsAppMessage,
} from "../src/lib/event-participation-contact"

const prisma = new PrismaClient()

/** Préfixe commun : permet de vérifier qu'aucune donnée étrangère n'est touchée. */
const MARKER = "TEST-PART"
const TEST_EMAIL_DOMAIN = "test-aptic.invalid"

const admin = { userId: "test-admin", name: "Équipe APTIC-R (test)" }

type TestFn = () => Promise<void>

/* ─────────────────────────── Outils de test ─────────────────────────── */

let passed = 0
const failures: string[] = []

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message)
}

function assertEqual<T>(actual: T, expected: T, label: string): void {
  if (actual !== expected) {
    throw new Error(`${label} : attendu ${String(expected)}, obtenu ${String(actual)}`)
  }
}

function uniqueEmail(prefix: string): string {
  return `${prefix}.${Date.now().toString(36)}.${Math.random().toString(36).slice(2, 7)}@${TEST_EMAIL_DOMAIN}`
}

interface EventOverrides {
  maxParticipants?: number | null
  registrationOpen?: boolean
  published?: boolean
  startDate?: Date
}

/** Crée un événement de test et le supprime à la fin du test qui l'a créé. */
async function createEvent(overrides: EventOverrides = {}) {
  const start = overrides.startDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  return prisma.evenement.create({
    data: {
      slug: `${MARKER.toLowerCase()}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      titleFr: `Évén-${MARKER} de test`,
      titleEn: `${MARKER} test event`,
      titleDe: `${MARKER} Testveranstaltung`,
      descriptionFr: "Description de test",
      descriptionEn: "Test description",
      descriptionDe: "Testbeschreibung",
      programmeFr: null,
      programmeEn: null,
      programmeDe: null,
      category: "FORMATION",
      location: "Lomé",
      startDate: start,
      endDate: null,
      isOnline: false,
      meetingUrl: null,
      registrationOpen: overrides.registrationOpen ?? true,
      registrationUrl: null,
      maxParticipants: overrides.maxParticipants === undefined ? 5 : overrides.maxParticipants,
      featuredImage: null,
      contactName: null,
      contactEmail: null,
      contactPhone: null,
      published: overrides.published ?? true,
      publishedFr: true,
      publishedEn: true,
      publishedDe: true,
    },
  })
}

/**
 * Dépôt d'une demande. Le consentement (`consent`) est validé par Zod dans la
 * Server Action ; le service reçoit déjà les données validées, d'où son absence
 * ici — le test porte sur la logique métier, pas sur le formulaire.
 */
async function submit(eventId: string, email: string, extra: Record<string, unknown> = {}) {
  return submitParticipationRequest({
    eventId,
    firstName: "Ama",
    lastName: "Kossi",
    email,
    phone: "+228 90 00 00 00",
    organization: null,
    city: "Lomé",
    country: "Togo",
    message: null,
    lang: "FR",
    ...extra,
  })
}

/** Supprime les données de test du scénario, sans toucher au reste de la base. */
async function purgeAll(): Promise<void> {
  const events = await prisma.evenement.findMany({
    where: { slug: { startsWith: MARKER.toLowerCase() } },
    select: { id: true },
  })
  const ids = events.map((e) => e.id)
  if (ids.length === 0) return

  const requests = await prisma.demandeParticipation.findMany({
    where: { eventId: { in: ids } },
    select: { id: true },
  })
  const requestIds = requests.map((r) => r.id)

  if (requestIds.length > 0) {
    await prisma.historiqueParticipation.deleteMany({ where: { requestId: { in: requestIds } } })
    await prisma.demandeParticipation.deleteMany({ where: { id: { in: requestIds } } })
  }
  await prisma.emailLog.deleteMany({ where: { eventParticipationRequestId: { in: requestIds } } })
  await prisma.evenement.deleteMany({ where: { id: { in: ids } } })
}

/* ──────────────────────────────── TESTS ─────────────────────────────── */

const tests: Array<[string, TestFn]> = []

// 1. Une demande n'est pas une place.
tests.push([
  "Une demande envoyée ne consomme aucune place",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })

    const result = await submit(event.id, uniqueEmail("t1"))
    assert(result.ok, "la demande doit être acceptée")
    if (!result.ok) return

    assertEqual(result.stats.pendingRequests, 1, "demandes en attente")
    assertEqual(result.stats.validatedParticipants, 0, "participants validés")
    assertEqual(result.stats.remainingPlaces, 10, "places restantes")
    assertEqual(result.stats.isFull, false, "événement complet")

    // Le champ de capacité est bien resté intact : rien n'est décrémenté.
    const stored = await prisma.evenement.findUnique({
      where: { id: event.id },
      select: { maxParticipants: true },
    })
    assertEqual(stored?.maxParticipants, 10, "maxParticipants inchangé")

    const request = await prisma.demandeParticipation.findUnique({
      where: { id: result.requestId },
      select: { status: true, consentAt: true },
    })
    assertEqual(request?.status, "PENDING", "statut de la demande")
    assert(request?.consentAt != null, "le consentement doit être horodaté")
  },
])

// 2. Deux demandes simultanées pour la même adresse : une seule est acceptée.
tests.push([
  "Double soumission concurrente : une seule demande enregistrée",
  async () => {
    const event = await createEvent({ maxParticipants: 5 })
    const email = uniqueEmail("t2")

    const results = await Promise.all([submit(event.id, email), submit(event.id, email)])

    const successes = results.filter((r) => r.ok)
    const failures = results.filter((r) => !r.ok)

    assertEqual(successes.length, 1, "demandes acceptées")
    assertEqual(failures.length, 1, "demandes refusées")
    if (!failures[0].ok) {
      assertEqual(failures[0].code, "ALREADY_PENDING", "motif du refus")
    }

    const count = await prisma.demandeParticipation.count({
      where: { eventId: event.id, email },
    })
    assertEqual(count, 1, "demandes enregistrées en base")
  },
])

// 3. Une demande déjà en attente bloque un nouvel envoi.
tests.push([
  "Une demande en attente bloque un nouvel envoi pour la même adresse",
  async () => {
    const event = await createEvent({ maxParticipants: 5 })
    const email = uniqueEmail("t3")

    assert((await submit(event.id, email)).ok, "première demande acceptée")
    const second = await submit(event.id, email)
    assert(!second.ok, "la seconde demande doit être refusée")
    if (!second.ok) assertEqual(second.code, "ALREADY_PENDING", "motif du refus")
  },
])

// 4. Le refus ne consomme rien et conserve le motif.
tests.push([
  "Refuser une demande ne consomme aucune place et conserve le motif",
  async () => {
    const event = await createEvent({ maxParticipants: 4 })
    const created = await submit(event.id, uniqueEmail("t4"))
    assert(created.ok, "demande acceptée")
    if (!created.ok) return

    const result = await rejectParticipationRequest(created.requestId, "Pas de budget", admin)
    assert(result.ok, "le refus doit aboutir")
    if (!result.ok) return

    assertEqual(result.stats.validatedParticipants, 0, "participants validés")
    assertEqual(result.stats.rejectedRequests, 1, "demandes refusées")
    assertEqual(result.stats.remainingPlaces, 4, "places restantes")

    const stored = await prisma.demandeParticipation.findUnique({
      where: { id: created.requestId },
      select: { status: true, rejectionReason: true },
    })
    assertEqual(stored?.status, "REJECTED", "statut")
    assertEqual(stored?.rejectionReason, "Pas de budget", "motif conservé")
  },
])

// 5. Valider consomme exactement une place.
tests.push([
  "Valider une demande consomme exactement une place",
  async () => {
    const event = await createEvent({ maxParticipants: 3 })
    const created = await submit(event.id, uniqueEmail("t5"))
    assert(created.ok, "demande acceptée")
    if (!created.ok) return

    const result = await approveParticipationRequest(created.requestId, admin)
    assert(result.ok, "la validation doit aboutir")
    if (!result.ok) return

    // Compteurs renvoyés après l'écriture : ils doivent déjà refléter la place
    // consommée, sinon l'administrateur verrait un compteur faux juste après
    // son clic.
    assertEqual(result.stats.validatedParticipants, 1, "participants validés")
    assertEqual(result.stats.remainingPlaces, 2, "places restantes")
    assertEqual(result.stats.pendingRequests, 0, "demandes en attente")

    const stored = await prisma.evenement.findUnique({
      where: { id: event.id },
      select: { maxParticipants: true },
    })
    assertEqual(stored?.maxParticipants, 3, "maxParticipants jamais décrémenté")

    const history = await prisma.historiqueParticipation.findMany({
      where: { requestId: created.requestId },
      orderBy: { changedAt: "asc" },
      select: { fromStatus: true, toStatus: true },
    })
    assertEqual(history.length, 2, "entrées d'historique")
    assertEqual(history[1].fromStatus, "PENDING", "statut d'origine")
    assertEqual(history[1].toStatus, "APPROVED", "statut d'arrivée")
  },
])

// 6. Concurrence : deux validations simultanées sur une seule place restante.
tests.push([
  "Deux validations simultanées sur la dernière place : une seule aboutit",
  async () => {
    const event = await createEvent({ maxParticipants: 1 })

    const first = await submit(event.id, uniqueEmail("t6a"))
    const second = await submit(event.id, uniqueEmail("t6b"))
    assert(first.ok && second.ok, "les deux demandes doivent être acceptées")
    if (!first.ok || !second.ok) return

    // Les deux clics partent en même temps : c'est exactement le cas où un
    // simple compteur en mémoire laisserait passer deux validations.
    const [a, b] = await Promise.all([
      approveParticipationRequest(first.requestId, admin),
      approveParticipationRequest(second.requestId, admin),
    ])

    const succeeded = [a, b].filter((r) => r.ok)
    const refused = [a, b].filter((r) => !r.ok)
    assertEqual(succeeded.length, 1, "validations abouties")
    assertEqual(refused.length, 1, "validations refusées")
    if (!refused[0].ok) {
      assertEqual(refused[0].code, "EVENT_FULL", "motif du refus")
    }

    const approved = await prisma.demandeParticipation.count({
      where: { eventId: event.id, status: "APPROVED" },
    })
    assertEqual(approved, 1, "participants validés en base")
    assertEqual(approved <= 1, true, "la capacité ne doit jamais être dépassée")

    const stats = await getEventCapacityStats(event.id)
    assertEqual(stats.isFull, true, "événement complet")
    assertEqual(stats.remainingPlaces, 0, "places restantes")
  },
])

// 7. Deux validations simultanées de la MÊME demande ne consomment qu'une place.
tests.push([
  "Deux validations simultanées de la même demande ne consomment qu'une place",
  async () => {
    const event = await createEvent({ maxParticipants: 5 })
    const created = await submit(event.id, uniqueEmail("t7"))
    assert(created.ok, "demande acceptée")
    if (!created.ok) return

    const [a, b] = await Promise.all([
      approveParticipationRequest(created.requestId, admin),
      approveParticipationRequest(created.requestId, admin),
    ])

    const succeeded = [a, b].filter((r) => r.ok)
    assertEqual(succeeded.length, 1, "validations abouties")
    if (!succeeded[0].ok) return
    assertEqual(succeeded[0].stats.validatedParticipants, 1, "participants validés")

    const history = await prisma.historiqueParticipation.count({
      where: { requestId: created.requestId, toStatus: "APPROVED" },
    })
    assertEqual(history, 1, "une seule validation tracée")
  },
])

// 8. Annuler une participation libère la place sans supprimer la demande.
tests.push([
  "Annuler une participation libère la place et conserve la demande",
  async () => {
    const event = await createEvent({ maxParticipants: 2 })
    const created = await submit(event.id, uniqueEmail("t8"))
    assert(created.ok, "demande acceptée")
    if (!created.ok) return
    assert((await approveParticipationRequest(created.requestId, admin)).ok, "validation")

    const before = await getEventCapacityStats(event.id)
    assertEqual(before.validatedParticipants, 1, "validés avant annulation")
    assertEqual(before.remainingPlaces, 1, "places avant annulation")

    const cancelled = await cancelParticipationRequest(created.requestId, admin)
    assert(cancelled.ok, "l'annulation doit aboutir")
    if (!cancelled.ok) return
    assertEqual(cancelled.stats.validatedParticipants, 0, "validés après annulation")
    assertEqual(cancelled.stats.remainingPlaces, 2, "places après annulation")

    const stored = await prisma.demandeParticipation.findUnique({
      where: { id: created.requestId },
      select: { status: true },
    })
    assertEqual(stored?.status, "CANCELLED", "statut conservé")
  },
])

// 9. Une participation validée ne peut pas être réservée une seconde fois.
tests.push([
  "Une adresse déjà validée ne peut pas soumettre une nouvelle demande",
  async () => {
    const event = await createEvent({ maxParticipants: 5 })
    const email = uniqueEmail("t9")
    const created = await submit(event.id, email)
    assert(created.ok, "demande acceptée")
    if (!created.ok) return
    assert((await approveParticipationRequest(created.requestId, admin)).ok, "validation")

    const second = await submit(event.id, email)
    assert(!second.ok, "la seconde demande doit être refusée")
    if (!second.ok) assertEqual(second.code, "ALREADY_APPROVED", "motif du refus")
  },
])

// 10. Après un refus ou une annulation, la personne peut reposter.
tests.push([
  "Après un refus ou une annulation, la personne peut de nouveau demander",
  async () => {
    const event = await createEvent({ maxParticipants: 2 })
    const refusedEmail = uniqueEmail("t10a")
    const cancelledEmail = uniqueEmail("t10b")

    const refused = await submit(event.id, refusedEmail)
    assert(refused.ok, "demande refusée acceptée")
    if (!refused.ok) return
    assert(
      (await rejectParticipationRequest(refused.requestId, "Report", admin)).ok,
      "refus"
    )
    const afterRefusal = await submit(event.id, refusedEmail)
    assert(afterRefusal.ok, "nouvelle demande après un refus")

    const cancelled = await submit(event.id, cancelledEmail)
    assert(cancelled.ok, "demande annulée acceptée")
    if (!cancelled.ok) return
    assert(
      (await approveParticipationRequest(cancelled.requestId, admin)).ok,
      "validation"
    )
    assert((await cancelParticipationRequest(cancelled.requestId, admin)).ok, "annulation")
    const afterCancel = await submit(event.id, cancelledEmail)
    assert(afterCancel.ok, "nouvelle demande après une annulation")
  },
])

// 11. Un événement fermé ou non publié n'accepte aucune demande.
tests.push([
  "Un événement fermé ou non publié refuse toute demande",
  async () => {
    const closed = await createEvent({ registrationOpen: false, maxParticipants: 5 })
    const closedResult = await submit(closed.id, uniqueEmail("t11a"))
    assert(!closedResult.ok, "un événement fermé doit refuser")
    if (!closedResult.ok) assertEqual(closedResult.code, "CLOSED", "motif (fermé)")

    const draft = await createEvent({ published: false, maxParticipants: 5 })
    const draftResult = await submit(draft.id, uniqueEmail("t11b"))
    assert(!draftResult.ok, "un événement non publié doit refuser")
    if (!draftResult.ok) assertEqual(draftResult.code, "NOT_PUBLISHED", "motif (non publié)")

    const unknown = await submit("evenement-inexistant", uniqueEmail("t11c"))
    assert(!unknown.ok, "un événement inexistant doit refuser")
    if (!unknown.ok) assertEqual(unknown.code, "NOT_FOUND", "motif (inexistant)")
  },
])

// 12. Sans capacité déclarée, aucun compteur n'est inventé.
tests.push([
  "Sans capacité déclarée, aucune limite n'est appliquée ni affichée",
  async () => {
    for (const maxParticipants of [null, 0]) {
      const event = await createEvent({ maxParticipants })
      const created = await submit(event.id, uniqueEmail(`t12-${maxParticipants}`))
      assert(created.ok, "demande acceptée")
      if (!created.ok) return
      assert(
        (await approveParticipationRequest(created.requestId, admin)).ok,
        "validation sans limite"
      )

      const stats = await getEventCapacityStats(event.id)
      assertEqual(stats.hasCapacityLimit, false, "capacité limitée")
      assertEqual(stats.remainingPlaces, null, "places restantes")
      assertEqual(stats.isFull, false, "événement complet")
      assertEqual(stats.validatedParticipants, 1, "participants validés")
    }
  },
])

// 13. Les compteurs affichés par le back-office viennent bien de la base.
tests.push([
  "Le back-office lit les mêmes compteurs que le site public",
  async () => {
    const event = await createEvent({ maxParticipants: 3 })
    const a = await submit(event.id, uniqueEmail("t13a"))
    const b = await submit(event.id, uniqueEmail("t13b"))
    const c = await submit(event.id, uniqueEmail("t13c"))
    assert(a.ok && b.ok && c.ok, "les trois demandes sont acceptées")
    if (!a.ok || !b.ok || !c.ok) return

    assert((await approveParticipationRequest(a.requestId, admin)).ok, "validation A")
    assert((await rejectParticipationRequest(b.requestId, "Non prioritaire", admin)).ok, "refus B")

    const adminData = await getParticipationAdminData(event.id)
    const publicStats = (await getEventCapacityStatsMap([event.id]))[event.id]

    assertEqual(adminData.stats.validatedParticipants, 1, "validés (back-office)")
    assertEqual(adminData.stats.pendingRequests, 1, "en attente (back-office)")
    assertEqual(adminData.stats.rejectedRequests, 1, "refusées (back-office)")
    assertEqual(adminData.stats.remainingPlaces, 2, "places restantes (back-office)")
    assertEqual(adminData.requests.length, 3, "demandes listées")

    assertEqual(
      adminData.stats.remainingPlaces,
      publicStats?.remainingPlaces,
      "accord entre back-office et site public"
    )
    assertEqual(
      adminData.stats.pendingRequests,
      publicStats?.pendingRequests,
      "accord des demandes en attente"
    )
  },
])

/* ══════════════════ CONTACT MANUEL ET INDICATEUR « NON LUE » ══════════════ */

const EVENT_TITLE = "Formation certifiante à la gestion numérique des associations"

/** Une demande est créée non lue, par construction : `readAt` vaut null. */
async function submitUnread(eventId: string, email: string, extra: Record<string, unknown> = {}) {
  const result = await submit(eventId, email, extra)
  assert(result.ok, "la demande doit être acceptée")
  if (!result.ok) throw new Error("la demande doit être acceptée")
  return result.requestId
}

// 1. Nouvelle demande → indicateur non lu.
tests.push([
  "Une nouvelle demande est comptée comme non lue",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    await submitUnread(event.id, uniqueEmail("unread"))

    const { stats } = await getParticipationAdminData(event.id)
    assertEqual(stats.unreadRequests, 1, "demandes non lues")
    // Le compteur « non lue » reste distinct du compteur « en attente ».
    assertEqual(stats.pendingRequests, 1, "demandes en attente")
  },
])

// 2. Ouverture des demandes → les demandes deviennent lues.
tests.push([
  "Ouvrir la liste marque les demandes comme lues sans changer leur statut",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    const requestId = await submitUnread(event.id, uniqueEmail("read"))

    const marked = await markParticipationRequestsRead(event.id, admin)
    assertEqual(marked, 1, "nombre de demandes marquées lues")

    const row = await prisma.demandeParticipation.findUnique({
      where: { id: requestId },
      select: { readAt: true, status: true },
    })
    assert(row?.readAt != null, "readAt doit être renseigné")
    // « Lue » ne signifie PAS « validée ».
    assertEqual(row?.status, "PENDING", "le statut reste en attente")

    const { stats } = await getParticipationAdminData(event.id)
    assertEqual(stats.unreadRequests, 0, "plus aucune demande non lue")
    assertEqual(stats.pendingRequests, 1, "la demande reste en attente")
  },
])

// 3. Une demande déjà lue ne repasse pas dans le compteur.
tests.push([
  "Marquer deux fois ne compte la demande qu'une seule fois",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    await submitUnread(event.id, uniqueEmail("read-twice"))

    assertEqual(await markParticipationRequestsRead(event.id, admin), 1, "première ouverture")
    assertEqual(await markParticipationRequestsRead(event.id, admin), 0, "seconde ouverture")
  },
])

// 4. Le compteur « non lues » est séparé des autres compteurs.
tests.push([
  "Non lues, en attente, validés et places restantes sont distincts",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })

    const unread1 = await submitUnread(event.id, uniqueEmail("mix-1"))
    await submitUnread(event.id, uniqueEmail("mix-2"))
    assert(unread1.length > 0, "première demande créée")

    // Une demande lue, refusée : elle ne doit plus compter comme non lue.
    const rejected = await submitUnread(event.id, uniqueEmail("mix-3"))
    await rejectParticipationRequest(rejected, "Sans objet", admin)
    await markParticipationRequestsRead(event.id, admin)

    // Nouvelle demande non lue, puis validée : elle reste PENDING jusqu'au clic.
    const toValidate = await submitUnread(event.id, uniqueEmail("mix-4"))
    const approved = await approveParticipationRequest(toValidate, admin)
    assert(approved.ok, "la validation doit aboutir")

    const { stats } = await getParticipationAdminData(event.id)

    assertEqual(stats.totalRequests, 4, "demandes totales")
    assertEqual(stats.unreadRequests, 2, "demandes non lues")
    assertEqual(stats.pendingRequests, 2, "demandes en attente")
    assertEqual(stats.validatedParticipants, 1, "participants validés")
    assertEqual(stats.rejectedRequests, 1, "demandes refusées")
    assertEqual(stats.remainingPlaces, 9, "places restantes")
  },
])

// 5. Le lien WhatsApp est bien construit, numéro international conservé.
tests.push([
  "Le lien WhatsApp conserve le préfixe international et retire la ponctuation",
  async () => {
    const message = renderParticipationWhatsAppMessage({
      channel: "WHATSAPP",
      lang: "FR",
      firstName: "Emmanuel",
      eventTitle: EVENT_TITLE,
    })

    const url = buildWhatsAppUrl("+228 (90) 12-34.56", message)
    assert(url != null, "le lien WhatsApp doit être construit")
    const link = url as string
    assert(link.startsWith("https://wa.me/22890123456?text="), "numéro normalisé attendu")

    const decoded = decodeURIComponent(link.split("?text=")[1])
    assertEqual(decoded, message, "le message doit être décodable tel quel")
  },
])

// 6. Aucun préfixe international → aucun lien inventé.
tests.push([
  "Sans préfixe international, aucun lien WhatsApp n'est inventé",
  async () => {
    const message = "Bonjour"
    assertEqual(normalizeWhatsAppNumber("06 12 34 56 78"), null, "numéro national refusé")
    assertEqual(buildWhatsAppUrl("06 12 34 56 78", message), null, "aucun lien construit")

    const check = checkContactAvailability({ phone: "06 12 34 56 78", email: "a@b.fr" })
    assertEqual(check.whatsapp.available, false, "canal WhatsApp indisponible")
    if (!check.whatsapp.available) {
      assertEqual(check.whatsapp.reason, "NO_INTERNATIONAL_PREFIX", "raison attendue")
    }
  },
])

// 7. Numéro absent ou invalide → canal désactivé avec une raison explicite.
tests.push([
  "Téléphone absent ou invalide : WhatsApp est signalé indisponible",
  async () => {
    const empty = checkContactAvailability({ phone: "", email: "a@b.fr" })
    assertEqual(empty.whatsapp.available, false, "canal indisponible")
    if (!empty.whatsapp.available) assertEqual(empty.whatsapp.reason, "NO_PHONE", "raison")

    const invalid = checkContactAvailability({ phone: "+99", email: "a@b.fr" })
    assertEqual(invalid.whatsapp.available, false, "canal indisponible")
    if (!invalid.whatsapp.available) {
      assertEqual(invalid.whatsapp.reason, "INVALID_PHONE", "raison")
    }
  },
])

// 8. Email absent ou invalide → canal désactivé.
tests.push([
  "Email absent ou invalide : le canal Email est signalé indisponible",
  async () => {
    const missing = checkContactAvailability({ phone: "+22890123456", email: "" })
    assertEqual(missing.email.available, false, "canal indisponible")
    if (!missing.email.available) assertEqual(missing.email.reason, "NO_EMAIL", "raison")

    const invalid = checkContactAvailability({ phone: "+22890123456", email: "pas-un-email" })
    assertEqual(invalid.email.available, false, "canal indisponible")

    assertEqual(buildMailtoUrl("", "Objet", "Corps"), null, "aucun mailto construit")
    assertEqual(buildMailtoUrl("pas-un-email", "Objet", "Corps"), null, "aucun mailto construit")
  },
])

// 9. Le mailto contient destinataire, objet et corps encodés.
tests.push([
  "Le lien mailto contient destinataire, objet et corps préremplis",
  async () => {
    const { subject, body } = renderParticipationEmailMessage({
      channel: "EMAIL",
      lang: "FR",
      firstName: "Emmanuel",
      eventTitle: EVENT_TITLE,
    })

    const url = buildMailtoUrl("emmanuel@exemple.fr", subject, body)
    assert(url != null, "le mailto doit être construit")
    const link = url as string
    assert(link.startsWith("mailto:emmanuel@exemple.fr?subject="), "destinataire attendu")

    const params = new URLSearchParams(link.split("?")[1])
    assertEqual(params.get("subject"), `Confirmation de votre participation — ${EVENT_TITLE}`, "objet")
    assert(Boolean(params.get("body")?.includes("Bonjour Emmanuel,")), "corps")
    assert(Boolean(params.get("body")?.includes(`« ${EVENT_TITLE} »`)), "corps")
  },
])

// 10. Les trois langues sont préparées, sans traduction automatique.
tests.push([
  "Les messages existent en FR, EN et DE avec les variables résolues",
  async () => {
    const base = { firstName: "Emmanuel", eventTitle: EVENT_TITLE }

    const fr = renderParticipationWhatsAppMessage({ channel: "WHATSAPP", lang: "FR", ...base })
    const en = renderParticipationWhatsAppMessage({ channel: "WHATSAPP", lang: "EN", ...base })
    const de = renderParticipationWhatsAppMessage({ channel: "WHATSAPP", lang: "DE", ...base })

    assert(fr.startsWith("Bonjour Emmanuel,"), "message FR")
    assert(en.startsWith("Hello Emmanuel,"), "message EN")
    assert(de.startsWith("Hallo Emmanuel,"), "message DE")

    for (const [lang, message] of [["FR", fr], ["EN", en], ["DE", de]] as const) {
      assert(!message.includes("{{"), `aucune variable brute en ${lang}`)
      assert(!message.includes("}}"), `aucune variable brute en ${lang}`)
      assert(message.includes(EVENT_TITLE), `titre résolu en ${lang}`)
      assert(message.includes("Emmanuel"), `prénom résolu en ${lang}`)
    }

    // Une langue inconnue retombe sur le français, sans traduction à l'ouverture.
    const fallback = renderParticipationWhatsAppMessage({
      channel: "WHATSAPP",
      lang: "XX",
      ...base,
    })
    assertEqual(fallback, fr, "repli sur le français")

    const subjects = (["FR", "EN", "DE"] as const).map(
      (lang) =>
        renderParticipationEmailMessage({ channel: "EMAIL", lang, ...base }).subject
    )
    assertEqual(subjects[0], `Confirmation de votre participation — ${EVENT_TITLE}`, "objet FR")
    assertEqual(subjects[1], `Participation confirmation — ${EVENT_TITLE}`, "objet EN")
    assertEqual(subjects[2], `Bestätigung Ihrer Teilnahme — ${EVENT_TITLE}`, "objet DE")
  },
])

// 11. Les textes sont utilisables : aucun caractère cassé.
tests.push([
  "Les modèles sont en UTF-8 valide, sans caractère de remplacement",
  async () => {
    const base = { firstName: "AMEVIGBE Emmanuel", eventTitle: "Agbélouvé — « Formation »" }

    const texts: string[] = []
    for (const lang of ["FR", "EN", "DE"] as const) {
      texts.push(renderParticipationWhatsAppMessage({ channel: "WHATSAPP", lang, ...base }))
      const email = renderParticipationEmailMessage({ channel: "EMAIL", lang, ...base })
      texts.push(email.subject, email.body)
    }

    for (const text of texts) {
      assert(!text.includes("\uFFFD"), "aucun caractère de remplacement U+FFFD")
      assert(text.length > 0, "modèle non vide")
    }

    // Accents et guillemets français intacts.
    const fr = renderParticipationEmailMessage({ channel: "EMAIL", lang: "FR", ...base })
    assert(fr.body.includes("« Agbélouvé"), "guillemets et accents préservés")
    assert(fr.body.includes("aptic.rural19@gmail.com"), "contact APTIC présent")
    assert(fr.body.includes("+228 91 20 19 90"), "numéro APTIC présent")
  },
])

// 12. Une modification ponctuelle ne touche pas le modèle global.
tests.push([
  "Modifier le message pour un contact ne modifie pas le modèle global",
  async () => {
    const first = renderParticipationWhatsAppMessage({
      channel: "WHATSAPP",
      lang: "FR",
      firstName: "Emmanuel",
      eventTitle: EVENT_TITLE,
    })

    // Retouche locale de l'administrateur : simple chaîne, aucun appel serveur.
    const edited = `${first}\n\n(Je serai accompagné d'un collègue.)`
    assert(edited.includes("accompagné"), "message retouché")
    assert(!edited.includes("{{"), "variables toujours résolues")

    // Une nouvelle lecture du modèle global rend le texte d'origine.
    const again = renderParticipationWhatsAppMessage({
      channel: "WHATSAPP",
      lang: "FR",
      firstName: "Emmanuel",
      eventTitle: EVENT_TITLE,
    })
    assertEqual(again, first, "modèle global inchangé")
  },
])

// 13. Contacter ne change ni le statut ni les places, et n'envoie aucun e-mail.
tests.push([
  "Ouvrir un canal de contact ne change ni le statut ni les places",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    const requestId = await submitUnread(event.id, uniqueEmail("contact"))

    const before = await getParticipationAdminData(event.id)
    assertEqual(before.stats.pendingRequests, 1, "une demande en attente")
    assertEqual(before.stats.remainingPlaces, 10, "places restantes avant contact")

    // Ce que fait réellement le back-office : journaliser l'OUVERTURE du canal.
    const logged = await logParticipationContactChannel(requestId, "WHATSAPP", admin)
    assert(logged.ok, "l'ouverture du canal doit être journalisée")

    const after = await getParticipationAdminData(event.id)
    assertEqual(after.stats.pendingRequests, 1, "la demande reste en attente")
    assertEqual(after.stats.validatedParticipants, 0, "aucun participant validé")
    assertEqual(after.stats.remainingPlaces, 10, "places restantes inchangées")
    assertEqual(after.stats.isFull, false, "événement non complet")

    const row = await prisma.demandeParticipation.findUnique({
      where: { id: requestId },
      select: { status: true, reviewedAt: true },
    })
    assertEqual(row?.status, "PENDING", "statut inchangé")
    assertEqual(row?.reviewedAt, null, "aucune décision enregistrée")

    // Aucun e-mail automatique n'est déclenché par le contact.
    const logs = await prisma.emailLog.count({
      where: { eventParticipationRequestId: requestId },
    })
    assertEqual(logs, 0, "aucun e-mail envoyé")

    // La trace dit « ouvert », jamais « envoyé ».
    const history = await prisma.historiqueParticipation.findMany({
      where: { requestId },
      select: { note: true },
    })
    assertEqual(history.length, 1, "une entrée d'historique")
    const note = history[0].note ?? ""
    assert(note.includes("CONTACT_WHATSAPP_OPENED"), "événement d'ouverture journalisé")
    assert(!/message envoy/i.test(note), "jamais de « message envoyé »")
    assert(!/envoyé avec succès/i.test(note), "jamais d'affirmation d'envoi")
  },
])

// 14. Le clic « Valider » reste la seule étape qui consomme une place.
tests.push([
  "Après le contact, seul le clic « Valider » consomme une place",
  async () => {
    const event = await createEvent({ maxParticipants: 2 })
    const requestId = await submitUnread(event.id, uniqueEmail("confirm"))

    await logParticipationContactChannel(requestId, "EMAIL", admin)
    await markParticipationRequestsRead(event.id, admin)

    const afterContact = await getParticipationAdminData(event.id)
    assertEqual(afterContact.stats.remainingPlaces, 2, "toujours deux places")

    // L'administrateur a obtenu la confirmation : il clique « Valider ».
    const approved = await approveParticipationRequest(requestId, admin)
    assert(approved.ok, "la validation doit aboutir")

    const final = await getParticipationAdminData(event.id)
    assertEqual(final.stats.validatedParticipants, 1, "un participant validé")
    assertEqual(final.stats.remainingPlaces, 1, "une place consommée")
  },
])

// 15. L'e-mail du canal utilise bien la langue du participant.
tests.push([
  "La langue du participant détermine le modèle utilisé",
  async () => {
    const event = await createEvent({ maxParticipants: 5 })
    const requestId = await submitUnread(event.id, uniqueEmail("lang-de"), { lang: "DE" })

    const { requests } = await getParticipationAdminData(event.id)
    const row = requests.find((r) => r.id === requestId)
    assert(row != null, "la demande doit être listée")
    const found = row as NonNullable<typeof row>

    // Le back-office relit la langue déjà enregistrée : pas de seconde logique.
    const message = renderParticipationWhatsAppMessage({
      channel: "WHATSAPP",
      lang: found.lang,
      firstName: found.firstName,
      eventTitle: EVENT_TITLE,
    })
    assert(message.startsWith(`Hallo ${found.firstName},`), "modèle allemand")
  },
])

/* ══════════ ANTI-DOUBLON : UNE SEULE DEMANDE ACTIVE PAR ÉVÉNEMENT ═════════ */

/** Réfus attendu, avec son code : un doublon n'est jamais une panne. */
async function assertDuplicateBlocked(
  eventId: string,
  email: string,
  extra: Record<string, unknown> = {}
): Promise<void> {
  const result = await submit(eventId, email, extra)
  assert(!result.ok, "la soumission en doublon doit être refusée")
  if (result.ok) throw new Error("la soumission en doublon doit être refusée")
  assert(
    result.code === "ALREADY_PENDING" || result.code === "ALREADY_APPROVED",
    `code attendu ALREADY_PENDING/ALREADY_APPROVED, obtenu ${result.code}`
  )
}

/** Nombre total de demandes, toutes situations confondues. */
async function countAll(eventId: string): Promise<number> {
  return prisma.demandeParticipation.count({ where: { eventId } })
}

/** Les 12 tests demandés, exprimés sur la règle métier réelle. */

// TEST 1 — même événement + même email → bloqué.
tests.push([
  "TEST 1 - Même événement + même email : bloqué",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    const email = uniqueEmail("t1")
    await submitUnread(event.id, email)

    await assertDuplicateBlocked(event.id, email)
    assertEqual(await countAll(event.id), 1, "aucune demande supplémentaire créée")
  },
])

// TEST 2 — même événement + même téléphone → bloqué.
tests.push([
  "TEST 2 - Même événement + même téléphone : bloqué",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    const phone = "+228 90 12 34 56"
    await submitUnread(event.id, uniqueEmail("t2-a"), { phone })

    // Nouvel email, MÊME téléphone : un seul des deux suffit à bloquer.
    await assertDuplicateBlocked(event.id, uniqueEmail("t2-b"), { phone })
    assertEqual(await countAll(event.id), 1, "aucune demande supplémentaire créée")
  },
])

// TEST 3 — même email + téléphone différent → bloqué.
tests.push([
  "TEST 3 - Même événement + même email mais téléphone différent : bloqué",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    const email = uniqueEmail("t3")
    await submitUnread(event.id, email, { phone: "+228 90 12 34 56" })

    await assertDuplicateBlocked(event.id, email, { phone: "+228 91 11 22 33" })
    assertEqual(await countAll(event.id), 1, "aucune demande supplémentaire créée")
  },
])

// TEST 4 — email différent + même téléphone → bloqué.
tests.push([
  "TEST 4 - Même événement + email différent mais même téléphone : bloqué",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    const phone = "+228 90 12 34 56"
    await submitUnread(event.id, uniqueEmail("t4-a"), { phone })

    await assertDuplicateBlocked(event.id, uniqueEmail("t4-b"), { phone })
    assertEqual(await countAll(event.id), 1, "aucune demande supplémentaire créée")
  },
])

// TEST 5 — email différent + téléphone différent → autorisé.
tests.push([
  "TEST 5 - Même événement + email et téléphone différents : autorisé",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    await submitUnread(event.id, uniqueEmail("t5-a"), { phone: "+228 90 12 34 56" })

    const result = await submit(event.id, uniqueEmail("t5-b"), { phone: "+228 91 11 22 33" })
    assert(result.ok, "une nouvelle demande doit être acceptée")
    assertEqual(await countAll(event.id), 2, "deux demandes distinctes")
  },
])

// TEST 6 — même candidat, autre événement → autorisé.
tests.push([
  "TEST 6 - Même candidat sur un autre événement : autorisé",
  async () => {
    const eventA = await createEvent({ maxParticipants: 10 })
    const eventB = await createEvent({ maxParticipants: 10 })
    const eventC = await createEvent({ maxParticipants: 10 })
    const email = uniqueEmail("t6")
    const phone = "+228 90 12 34 56"

    await submitUnread(eventA.id, email, { phone })

    // Mêmes coordonnées, événement différent : autorisé.
    for (const event of [eventB, eventC]) {
      const result = await submit(event.id, email, { phone })
      assert(result.ok, "une demande par événement doit être possible")
    }
    assertEqual(await countAll(eventA.id), 1, "une demande sur l'événement A")
    assertEqual(await countAll(eventB.id), 1, "une demande sur l'événement B")
    assertEqual(await countAll(eventC.id), 1, "une demande sur l'événement C")
  },
])

// TEST 7 — PENDING existante → bloquée.
tests.push([
  "TEST 7 - Demande existante PENDING : nouvelle demande bloquée",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    await submitUnread(event.id, uniqueEmail("t7"))

    const result = await submit(event.id, uniqueEmail("t7-bis"))
    assert(!result.ok, "doit être refusé")
    if (!result.ok) {
      assertEqual(result.code, "ALREADY_PENDING", "code PENDING")
      assertEqual(result.error, EVENT_ALREADY_PENDING_ERROR, "message clair, pas « une erreur »")
      assert(
        !/une erreur est survenue/i.test(result.error),
        "le message ne doit pas être une erreur générique"
      )
      assert(
        !result.error.includes("@") && !result.error.includes("+228"),
        "aucune coordonnée de la demande existante ne doit être révélée"
      )
    }
  },
])

// TEST 8 — APPROVED existante → bloquée.
tests.push([
  "TEST 8 - Demande existante APPROVED : nouvelle demande bloquée",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    const phone = "+228 90 12 34 56"
    const first = await submitUnread(event.id, uniqueEmail("t8-a"), { phone })
    const approved = await approveParticipationRequest(first, admin)
    assert(approved.ok, "la validation doit aboutir")

    const result = await submit(event.id, uniqueEmail("t8-b"), { phone })
    assert(!result.ok, "doit être refusé")
    if (!result.ok) {
      assertEqual(result.code, "ALREADY_APPROVED", "code APPROVED")
      assertEqual(result.error, EVENT_DUPLICATE_APPROVED_ERROR, "message « déjà confirmée »")
    }

    // Le refus n'a consommé aucune place supplémentaire.
    const { stats } = await getParticipationAdminData(event.id)
    assertEqual(stats.validatedParticipants, 1, "un seul participant validé")
    assertEqual(stats.remainingPlaces, 9, "une seule place consommée")
  },
])

// TEST 9 — REJECTED : nouvelle demande autorisée, historique conservé.
tests.push([
  "TEST 9 - Demande REJECTED : nouvelle demande autorisée, les deux conservées",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    const email = uniqueEmail("t9")

    const first = await submitUnread(event.id, email)
    const rejected = await rejectParticipationRequest(first, "Absence de motivation", admin)
    assert(rejected.ok, "le refus doit aboutir")

    // La règle du projet : un refus laisse la porte ouverte.
    const second = await submit(event.id, email)
    assert(second.ok, "une nouvelle demande doit être possible après un refus")
    assertEqual(await countAll(event.id), 2, "les deux demandes sont conservées")

    const rows = await prisma.demandeParticipation.findMany({
      where: { eventId: event.id },
      orderBy: { createdAt: "asc" },
      select: { status: true },
    })
    assertEqual(rows[0]?.status, "REJECTED", "première demande toujours rejetée")
    assertEqual(rows[1]?.status, "PENDING", "seconde demande en attente")

    // L'historique de la première n'a pas disparu.
    const history = await prisma.historiqueParticipation.count({ where: { requestId: first } })
    assert(history >= 2, "l'historique du refus est conservé")
  },
])

// TEST 10 — email avec majuscules et espaces → reconnu comme doublon.
tests.push([
  "TEST 10 - Email avec majuscules et espaces : reconnu comme doublon",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    await submitUnread(event.id, "jean.dup@email.com")

    for (const variant of ["JEAN.DUP@EMAIL.COM", " Jean.Dup@Email.Com ", "jean.dup@email.com"]) {
      await assertDuplicateBlocked(event.id, variant)
    }
    assertEqual(await countAll(event.id), 1, "aucune demande supplémentaire créée")

    assertEqual(normalizeParticipationEmail(" Jean@Email.com "), "jean@email.com", "normalisation")
  },
])

// TEST 11 — téléphone avec espaces et tirets → reconnu comme doublon.
tests.push([
  "TEST 11 - Téléphone avec espaces et tirets : reconnu comme doublon",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    const phone = "+228 90 12 34 56"
    await submitUnread(event.id, uniqueEmail("t11-a"), { phone })

    for (const variant of ["+22890123456", "+228 90 12 34 56", "+228-90-12-34-56", "+228 (90) 12-34.56"]) {
      await assertDuplicateBlocked(event.id, uniqueEmail(`t11-${variant.length}`), { phone: variant })
    }
    assertEqual(await countAll(event.id), 1, "aucune demande supplémentaire créée")

    // Le code pays n'est jamais retiré ni deviné.
    assertEqual(normalizeParticipationPhone("+228 90 12 34 56"), "+22890123456", "avec préfixe")
    assertEqual(normalizeParticipationPhone("90 12 34 56"), "90123456", "sans préfixe")
    assert(
      normalizeParticipationPhone("+228 90 12 34 56") !== normalizeParticipationPhone("90 12 34 56"),
      "un numéro national ne doit pas être confondu avec sa forme internationale"
    )
  },
])

// TEST 12 — deux soumissions simultanées → une seule créée.
tests.push([
  "TEST 12 - Deux soumissions simultanées avec les mêmes coordonnées : une seule créée",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    const email = uniqueEmail("t12")
    const phone = "+228 90 12 34 56"

    // Déclenchées ensemble : c'est le verrou serveur sous transaction qui
    // arbitre, pas le temps d'exécution du test.
    const results = await Promise.all([
      // Deux envois strictement identiques : un seul doit passer.
      submit(event.id, email, { phone }),
      submit(event.id, email, { phone }),
      // Mêmes coordonnées écrites autrement : toujours un doublon.
      submit(event.id, ` ${email.toUpperCase()} `, { phone: "+22890123456" }),
      // Candidat réellement distinct : autorisé.
      submit(event.id, `autre.${email}`, { phone: "+228 97 00 00 00" }),
    ])

    const accepted = results.filter((r) => r.ok)
    const refused = results.filter((r) => !r.ok)
    assertEqual(accepted.length, 2, "seules les coordonnées distinctes sont acceptées")
    assertEqual(refused.length, 2, "les doublons sont refusés")
    for (const r of refused) {
      if (!r.ok) {
        assert(
          r.code === "ALREADY_PENDING" || r.code === "ALREADY_APPROVED",
          `code attendu, obtenu ${r.code}`
        )
      }
    }

    // Une seule demande pour les coordonnées du candidat.
    assertEqual(
      await prisma.demandeParticipation.count({ where: { eventId: event.id, email } }),
      1,
      "une seule demande pour cet email"
    )
    const active = await prisma.demandeParticipation.count({
      where: { eventId: event.id, phone, status: { in: ["PENDING", "APPROVED"] } },
    })
    assertEqual(active, 1, "une seule demande active pour ce téléphone")
  },
])

// Règle pure : vérifiée sans base, including REJECTED/CANCELLED ignorés.
tests.push([
  "La règle de comparaison ignore REJECTED et CANCELLED et privilégie APPROVED",
  async () => {
    const rows: ActiveRequestIdentity[] = [
      { email: "Jean@Email.com", phone: "+228 90 12 34 56", status: "REJECTED" },
      { email: "jean@email.com", phone: "090123456", status: "CANCELLED" },
    ]
    // Un rejet et une annulation ne bloquent pas une nouvelle demande.
    assertEqual(findBlockingActiveRequest(rows, { email: "jean@email.com", phone: "+22890123456" }).blocked, false, "historique ignoré")

    // Une PENDING matchée par le téléphone seulement.
    const byPhone = findBlockingActiveRequest(
      [{ email: "autre@email.com", phone: "+228 90 12 34 56", status: "PENDING" }],
      { email: "jean@email.com", phone: "+22890123456" }
    )
    assertEqual(byPhone.blocked, true, "bloqué par téléphone")
    if (byPhone.blocked) {
      assertEqual(byPhone.reason, "ALREADY_PENDING", "raison")
      assertEqual(byPhone.matchedBy, "PHONE", "correspondance par téléphone")
    }

    // L'APPROVED l'emporte sur une PENDING, pour un message exact.
    const mixed = findBlockingActiveRequest(
      [
        { email: "jean@email.com", phone: "+22890123456", status: "PENDING" },
        { email: "jean@email.com", phone: "+22890123456", status: "APPROVED" },
      ],
      { email: "JEAN@EMAIL.COM", phone: "+228 90 12 34 56" }
    )
    assertEqual(mixed.blocked, true, "bloqué")
    if (mixed.blocked) assertEqual(mixed.reason, "ALREADY_APPROVED", "APPROVED prioritaire")

    // Aucun critère parasite : ni le nom, ni un autre événement (hors périmètre).
    assertEqual(
      findBlockingActiveRequest(
        [{ email: "jean@email.com", phone: "+22890123456", status: "PENDING" }],
        { email: "jean.new@email.com", phone: "+22899999999" }
      ).blocked,
      false,
      "coordonnées entièrement différentes autorisées"
    )
  },
])

// Le workflow PENDING → contact → APPROVED reste intact.
tests.push([
  "Le workflow contact puis validation n'est pas cassé par l'anti-doublon",
  async () => {
    const event = await createEvent({ maxParticipants: 5 })
    const requestId = await submitUnread(event.id, uniqueEmail("workflow"))

    await markParticipationRequestsRead(event.id, admin)
    const logged = await logParticipationContactChannel(requestId, "WHATSAPP", admin)
    assert(logged.ok, "le contact est journalisé")

    const approved = await approveParticipationRequest(requestId, admin)
    assert(approved.ok, "la validation aboutit")

    const { stats } = await getParticipationAdminData(event.id)
    assertEqual(stats.validatedParticipants, 1, "une place consommée")
    assertEqual(stats.remainingPlaces, 4, "quatre places restantes")
  },
])

/* ═════════ LE FORMULAIRE RESTE ACCESSIBLE (non-régression UX) ═════════ */

/**
 * Aucun navigateur n'est monté ici : ces tests portent sur ce qui conditionne le
 * comportement de la vue publique.
 *
 * 1. Le service ne reçoit QUE l'événement soumis : ni session, ni adresse IP, ni
 *    état antérieur. Il ne peut donc pas piloter un affichage, seulement refuser
 *    une création.
 * 2. Le refus porte le statut (`ALREADY_PENDING` / `ALREADY_APPROVED`), information
 *    qui permet à la vue d'afficher un message informatif et non bloquant.
 * 3. Aucune trace n'est mémorisée côté candidat : la détection reste liée à
 *    l'envoi, donc un rechargement rend un formulaire normalement accessible.
 */
tests.push([
  "Le refus anti-doublon bloque la création, jamais l'accès au formulaire",
  async () => {
    const event = await createEvent({ maxParticipants: 10 })
    const requestId = await submitUnread(event.id, uniqueEmail("ux"))

    // Un candidat déjà connu pour cet événement est refusé À L'ENVOI...
    const refused = await submit(event.id, uniqueEmail("ux-2"), { phone: "+228 90 12 34 56" })
    assert(!refused.ok, "la seconde demande doit être refusée")

    // ...mais la demande d'origine est INTACTE et toujours consultable : rien
    // n'a été remplacé ni retiré des côtés du candidat.
    const original = await prisma.demandeParticipation.findUnique({
      where: { id: requestId },
      select: { status: true },
    })
    assertEqual(original?.status, "PENDING", "la demande d'origine est préservée")

    // Aucune trace du refus : ni demande, ni place consommée.
    const { stats } = await getParticipationAdminData(event.id)
    assertEqual(stats.totalRequests, 1, "aucune demande supplémentaire")
    assertEqual(stats.remainingPlaces, 10, "aucune place consommée")

    // Les deux situations sont distinguées, information nécessaire au message.
    const toApprove = await submitUnread(event.id, uniqueEmail("ux-3"))
    await approveParticipationRequest(toApprove, admin)

    const onPending = await submit(event.id, uniqueEmail("ux-4"), { phone: "+228 90 12 34 56" })
    const onApproved = await submit(event.id, uniqueEmail("ux-5"), {
      phone: "+228 90 12 34 56",
    })
    assert(!onPending.ok && !onApproved.ok, "les deux doivent être refusées")
    if (!onPending.ok && !onApproved.ok) {
      assertEqual(onPending.code, "ALREADY_PENDING", "une PENDING existe déjà")
      assertEqual(onApproved.code, "ALREADY_APPROVED", "une APPROVED existe déjà")
      assert(
        !/une erreur est survenue/i.test(onPending.error),
        "le message ne doit jamais être une erreur générique"
      )
    }
  },
])

/* ─────────────────────────────── Exécution ─────────────────────────── */

async function main(): Promise<void> {
  const only = process.argv[2]
  const selected = only ? tests.filter(([name]) => name.includes(only)) : tests

  if (selected.length === 0) {
    console.error(`Aucun test ne correspond à « ${only} ».`)
    process.exit(1)
  }

  console.log("=== Demandes de participation aux événements ===\n")

  for (const [label, fn] of selected) {
    await purgeAll()
    try {
      await fn()
      passed++
      console.log(`  OK  ${label}`)
    } catch (error) {
      failures.push(label)
      console.error(`  ÉCHEC  ${label}`)
      console.error(`         ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  await purgeAll()
  await prisma.$disconnect()

  console.log(`\n${passed}/${selected.length} test(s) réussi(s).`)
  if (failures.length > 0) {
    console.error(`Échecs : ${failures.length}`)
    process.exit(1)
  }
}

main().catch(async (error) => {
  console.error(error)
  try {
    await purgeAll()
  } finally {
    await prisma.$disconnect()
  }
  process.exit(1)
})
