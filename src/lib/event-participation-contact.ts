/**
 * CONTACT MANUEL DES DEMANDES DE PARTICIPATION
 * =============================================
 *
 * Règle absolue de ce module : RIEN n'est envoyé.
 *
 * WhatsApp et l'e-mail sont des canaux externes. Le back-office se contente de
 * préparer le message et d'ouvrir le canal choisi par l'administrateur :
 * - WhatsApp : `https://wa.me/<numéro>?text=<message encodé>`
 * - e-mail   : `mailto:<adresse>?subject=<objet>&body=<corps encodé>`
 *
 * L'administrateur doit encore cliquer sur « Envoyer » dans WhatsApp ou dans
 * son logiciel de messagerie. Aucune Server Action de ce projet n'envoie de
 * message : ce fichier ne fait que produire des chaînes de caractères.
 *
 * Il ne contient aucun import serveur : il est testable isolément.
 */

import { PARTICIPATION_PHONE_NOISE } from "./event-participation"

/** Langues de correspondance disponibles, alignées sur `LanguageCode`. */
export type ContactLang = "FR" | "EN" | "DE"

/** Canal de contact manuel. Aucun de ces canaux n'est déclenché par le serveur. */
export type ContactChannel = "WHATSAPP" | "EMAIL"

/** Journalisation d'ouverture d'un canal — jamais « message envoyé ». */
export type ContactChannelEvent = "CONTACT_WHATSAPP_OPENED" | "CONTACT_EMAIL_OPENED"

const LANGS: ContactLang[] = ["FR", "EN", "DE"]

/* ────────────────────────────── Modèles ────────────────────────────── */

/**
 * Modèles pré-écrits dans les trois langues. Rien n'est traduit à l'ouverture
 * du message : la langue du participant est résolue une fois, puis le texte
 * correspondant est choisi tel quel.
 *
 * Ces constantes sont la source unique du libellé. L'administrateur peut
 * modifier le texte d'un contact donné dans la fenêtre d'aperçu, mais cette
 * modification est locale : elle n'est jamais enregistrée comme nouveau modèle.
 */
export const PARTICIPATION_CONTACT_TEMPLATES: Record<
  ContactLang,
  {
    whatsapp: string
    emailSubject: string
    emailBody: string
  }
> = {
  FR: {
    whatsapp: `Bonjour {{firstName}},

Nous avons bien reçu votre demande de participation à l'événement « {{eventTitle}} » organisé par APTIC-R.

Nous souhaitons confirmer avec vous votre participation à cet événement.

Pouvez-vous nous confirmer que vous souhaitez toujours y participer ?

Merci.

L'équipe APTIC-R`,
    emailSubject: `Confirmation de votre participation — {{eventTitle}}`,
    emailBody: `Bonjour {{firstName}},

Nous avons bien reçu votre demande de participation à l'événement « {{eventTitle}} » organisé par APTIC-R.

Nous souhaitons confirmer avec vous votre participation à cet événement.

Pouvez-vous nous confirmer que vous souhaitez toujours y participer ?

Merci.

Cordialement,

L'équipe APTIC-R
Volontariat International
Agbélouvé, Togo
aptic.rural19@gmail.com
+228 91 20 19 90`,
  },
  EN: {
    whatsapp: `Hello {{firstName}},

We have received your request to take part in the event "{{eventTitle}}" organised by APTIC-R.

We would like to confirm your participation in this event.

Could you please confirm that you still wish to take part?

Thank you.

The APTIC-R team`,
    emailSubject: `Participation confirmation — {{eventTitle}}`,
    emailBody: `Hello {{firstName}},

We have received your request to take part in the event "{{eventTitle}}" organised by APTIC-R.

We would like to confirm your participation in this event.

Could you please confirm that you still wish to take part?

Thank you.

Kind regards,

The APTIC-R team
International Volunteering
Agbélouvé, Togo
aptic.rural19@gmail.com
+228 91 20 19 90`,
  },
  DE: {
    whatsapp: `Hallo {{firstName}},

wir haben Ihre Anmeldung für die Veranstaltung „{{eventTitle}}“ der APTIC-R erhalten.

Wir möchten Ihre Teilnahme an dieser Veranstaltung bestätigen.

Könnten Sie uns bitte bestätigen, dass Sie weiterhin teilnehmen möchten?

Vielen Dank.

Das APTIC-R-Team`,
    emailSubject: `Bestätigung Ihrer Teilnahme — {{eventTitle}}`,
    emailBody: `Hallo {{firstName}},

wir haben Ihre Anmeldung für die Veranstaltung „{{eventTitle}}“ der APTIC-R erhalten.

Wir möchten Ihre Teilnahme an dieser Veranstaltung bestätigen.

Könnten Sie uns bitte bestätigen, dass Sie weiterhin teilnehmen möchten?

Vielen Dank.

Mit freundlichen Grüßen,

Das APTIC-R-Team
Internationale Freiwilligenarbeit
Agbélouvé, Togo
aptic.rural19@gmail.com
+228 91 20 19 90`,
  },
}

/** Raz-de-chaîne des espaces, y compris les espaces insécables des guillemets. */
const SPACE_CHARS = /[\s  ]/g

/**
 * Remplace les variables d'un modèle.
 *
 * `{{firstName}}` et `{{eventTitle}}` sont résolus avant tout affichage ou toute
 * ouverture de canal : l'administrateur ne doit jamais voir une variable brute.
 * Une valeur vide Efface proprement la phrase au lieu de laisser un trou.
 */
export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key: string) => {
    const value = (vars[key] ?? "").trim()
    return value
  })
}

/**
 * Langue de correspondance du participant.
 *
 * Le système enregistre déjà `DemandeParticipation.lang` : c'est cette donnée
 * qui est réutilisée. Aucune logique de langue parallèle n'est introduite.
 */
export function resolveContactLang(lang: string | null | undefined): ContactLang {
  const upper = (lang || "").trim().toUpperCase()
  return (LANGS as string[]).includes(upper) ? (upper as ContactLang) : "FR"
}

export interface ContactRenderInput {
  channel: ContactChannel
  lang: string | null | undefined
  firstName: string
  eventTitle: string
}

/** Message WhatsApp prêt à être ouvert : texte final, variables résolues. */
export function renderParticipationWhatsAppMessage(input: ContactRenderInput): string {
  const lang = resolveContactLang(input.lang)
  return fillTemplate(PARTICIPATION_CONTACT_TEMPLATES[lang].whatsapp, {
    firstName: input.firstName,
    eventTitle: input.eventTitle,
  })
}

export interface ContactEmailMessage {
  subject: string
  body: string
}

/** Objet et corps d'e-mail prêts à être ouverts : texte final, variables résolues. */
export function renderParticipationEmailMessage(input: ContactRenderInput): ContactEmailMessage {
  const lang = resolveContactLang(input.lang)
  const templates = PARTICIPATION_CONTACT_TEMPLATES[lang]
  const vars = { firstName: input.firstName, eventTitle: input.eventTitle }
  return {
    subject: fillTemplate(templates.emailSubject, vars),
    body: fillTemplate(templates.emailBody, vars),
  }
}

/* ───────────────────────── Normalisation du téléphone ───────────────── */

/**
 * Caractères de présentation à retirer : espaces, points, tirets, parenthèses…
 * Expression partagée avec la comparaison anti-doublon (voir `event-participation`).
 */
const PHONE_NOISE = PARTICIPATION_PHONE_NOISE

/**
 * Normalise un numéro pour un lien WhatsApp.
 *
 * Règles :
 * - espaces, parenthèses, tirets et points sont retirés ;
 * - le préfixe international est conservé ;
 * - si le numéro ne porte pas de préfixe international explicite, il est
 *   refusé : deviner « +228 » à partir d'un numéro national produirait un lien
 *   vers un mauvais destinataire, donc aucun lien n'est construit.
 *
 * Renvoie `null` si aucun lien sûr ne peut être produit.
 */
export function normalizeWhatsAppNumber(raw: string | null | undefined): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  if (!trimmed) return null

  const hasPlus = trimmed.startsWith("+")
  const digits = trimmed.replace(PHONE_NOISE, "").replace(/\D/g, "")
  if (!digits) return null

  // Préfixe international absent : impossible de déterminer le pays sans inventer.
  if (!hasPlus) return null

  // Trop court pour être un numéro international valide (on garde 8 chiffres minimum).
  if (digits.length < 8 || digits.length > 15) return null

  return digits
}

/** Raison pour laquelle un lien WhatsApp n'a pas pu être construit. */
export type ContactAvailability =
  | { available: true }
  | { available: false; reason: "NO_PHONE" | "NO_INTERNATIONAL_PREFIX" | "INVALID_PHONE" | "NO_EMAIL" }

/** Contrôle la présence d'un canal exploitable, sans jamais l'ouvrir. */
export function checkContactAvailability(input: {
  phone: string | null | undefined
  email: string | null | undefined
}): { whatsapp: ContactAvailability; email: ContactAvailability } {
  const raw = (input.phone ?? "").trim()

  let whatsapp: ContactAvailability
  if (!raw) {
    whatsapp = { available: false, reason: "NO_PHONE" }
  } else if (!raw.startsWith("+")) {
    whatsapp = { available: false, reason: "NO_INTERNATIONAL_PREFIX" }
  } else if (normalizeWhatsAppNumber(raw) === null) {
    whatsapp = { available: false, reason: "INVALID_PHONE" }
  } else {
    whatsapp = { available: true }
  }

  const email = (input.email ?? "").trim()
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  return {
    whatsapp,
    email: emailOk ? { available: true } : { available: false, reason: "NO_EMAIL" },
  }
}

/* ───────────────────────────── Liens ouverts ────────────────────────── */

/**
 * Lien WhatsApp (`wa.me`) avec message prérempli.
 *
 * Ouvre WhatsApp avec le texte prêt à être envoyé : le serveur n'envoie rien.
 * Renvoie `null` si le numéro ne permet pas de produire un lien fiable.
 */
export function buildWhatsAppUrl(phone: string | null | undefined, message: string): string | null {
  const digits = normalizeWhatsAppNumber(phone)
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

/**
 * Lien `mailto:` avec destinataire, objet et corps préremplis.
 *
 * Ouvre le logiciel de messagerie de l'administrateur ; c'est lui qui envoie.
 * Renvoie `null` si l'adresse est absente ou manifestement invalide.
 */
export function buildMailtoUrl(
  email: string | null | undefined,
  subject: string,
  body: string
): string | null {
  const address = (email ?? "").trim()
  if (!address || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return null

  const params = `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  return `mailto:${address}${params}`
}

/* ──────────────────────────── Journalisation ────────────────────────── */

/** Libellés lisibles de la fenêtre d'aperçu, par raison de blocage. */
export const CONTACT_UNAVAILABLE_LABELS: Record<
  Extract<ContactAvailability, { available: false }>["reason"],
  string
> = {
  NO_PHONE: "Numéro de téléphone indisponible",
  NO_INTERNATIONAL_PREFIX: "Numéro sans préfixe international : lien WhatsApp indisponible",
  INVALID_PHONE: "Numéro de téléphone invalide : lien WhatsApp indisponible",
  NO_EMAIL: "Adresse email indisponible",
}

/** Libellé du bouton d'ouverture pour le canal choisi. */
export const CONTACT_OPEN_LABELS: Record<ContactChannel, string> = {
  WHATSAPP: "Ouvrir WhatsApp",
  EMAIL: "Ouvrir l'email",
}
