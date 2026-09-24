/**
 * Modèles d'emails transactionnels pour le workflow des candidatures APTIC-R.
 * Modèles distincts rédigés nativement en FR, EN et DE.
 * Respect absolu :
 *   - L'objet (Subject) n'apparaît JAMAIS dans le corps du message.
 *   - Le logo APTIC-R est centré seul en haut (160 px).
 *   - Ton sobre, administratif, humain et naturel.
 *   - Aucune promesse inventée ou condition non validée.
 *   - Signature officielle APTIC-R trilingue.
 */

import { wrapEmailHtml, renderEmailTextFooter } from "./emailTheme"
import { interpolateVariables, formatTextToHtml, type EmailVariableContext } from "../variableEngine"

export type WorkflowStatusKey =
  | "NEW"
  | "INTERVIEW"
  | "SELECTED"
  | "RETENU"
  | "CHOSEN"
  | "PREPARATION"
  | "ARRIVED"
  | "COMPLETED"

export interface CandidateTemplateDefinition {
  subject: string
  bodyTemplate: string
}

/**
 * Bibliothèque des gabarits bruts par statut et par langue.
 */
export const CANDIDATE_EMAIL_TEMPLATES: Record<
  "FR" | "EN" | "DE",
  Record<string, CandidateTemplateDefinition>
> = {
  FR: {
    NEW: {
      subject: "APTIC-R — Candidature reçue — {{reference}}",
      bodyTemplate: `Bonjour {{firstName}},

Nous vous confirmons la bonne réception de votre candidature au programme de volontariat international APTIC-R.

Référence de candidature : {{reference}}

Votre dossier va maintenant être examiné par l'équipe APTIC-R.

Nous vous contacterons pour la suite du processus.`,
    },
    INTERVIEW: {
      subject: "APTIC-R — Entretien — {{reference}}",
      bodyTemplate: `Bonjour {{firstName}},

Nous vous informons que votre candidature poursuit son parcours avec une étape d'entretien.

Date : {{interviewDate}}
Heure : {{interviewTime}}
Fuseau horaire : {{timezone}}
Mode : {{interviewMode}}
Lieu / lien : {{interviewLocation}}

{{additionalMessage}}

Nous restons à votre disposition pour toute question.`,
    },
    SELECTED: {
      subject: "APTIC-R — Mise à jour de votre candidature — {{reference}}",
      bodyTemplate: `Bonjour {{firstName}},

Nous avons le plaisir de vous informer que votre candidature poursuit favorablement son parcours et a été sélectionnée pour la phase d'évaluation approfondie du programme de volontariat international APTIC-R.

Notre équipe de coordination étudie actuellement les modalités opérationnelles de votre mission en lien avec nos besoins sur le terrain à Agbélouvé.

Nous reviendrons vers vous très prochainement pour vous préciser la suite du processus.`,
    },
    RETENU: {
      subject: "APTIC-R — Votre candidature est retenue — {{reference}}",
      bodyTemplate: `Bonjour {{firstName}},

Nous avons le plaisir de vous confirmer que votre candidature a été officiellement retenue au sein du programme de volontariat international APTIC-R.

Toute l'équipe se réjouit de votre future contribution aux projets de développement rural et d'inclusion numérique portés par l'association à Agbélouvé.

La prochaine étape consistera à finaliser votre cadre d'engagement et à préparer les étapes préalables à votre mission. Nous prendrons contact avec vous très rapidement.`,
    },
    CHOSEN: {
      // Alias DB de RETENU
      subject: "APTIC-R — Votre candidature est retenue — {{reference}}",
      bodyTemplate: `Bonjour {{firstName}},

Nous avons le plaisir de vous confirmer que votre candidature a été officiellement retenue au sein du programme de volontariat international APTIC-R.

Toute l'équipe se réjouit de votre future contribution aux projets de développement rural et d'inclusion numérique portés par l'association à Agbélouvé.

La prochaine étape consistera à finaliser votre cadre d'engagement et à préparer les étapes préalables à votre mission. Nous prendrons contact avec vous très rapidement.`,
    },
    PREPARATION: {
      subject: "APTIC-R — Mise à jour de votre candidature — {{reference}}",
      bodyTemplate: `Bonjour {{firstName}},

Votre mission entre désormais dans sa phase de préparation active.

Afin d'organiser au mieux votre venue à Agbélouvé, nous allons vous accompagner dans les démarches administratives et pratiques préalables à votre départ :
• Rassemblement des pièces justificatives et formalités d'assurance
• Préparation des démarches de voyage, santé internationale et visa
• Transmission des informations pratiques de repérage et contacts utiles

Nous restons à votre entière disposition pour vous guider à chaque étape de cette préparation.`,
    },
    ARRIVED: {
      subject: "APTIC-R — Mise à jour de votre candidature — {{reference}}",
      bodyTemplate: `Bonjour {{firstName}},

Bienvenue à Agbélouvé et au sein du programme de volontariat international APTIC-R.

Toute l'équipe est heureuse de vous accueillir sur place. Les premiers jours seront consacrés à votre installation, à la rencontre avec l'équipe locale et à la découverte de votre cadre de mission.

Votre référent de coordination se tient à vos côtés pour faciliter votre intégration.`,
    },
    COMPLETED: {
      subject: "APTIC-R — Mise à jour de votre candidature — {{reference}}",
      bodyTemplate: `Bonjour {{firstName}},

Votre mission de volontariat international avec APTIC-R arrive à son terme.

Nous tenons à vous remercier chaleureusement pour votre engagement, votre investissement et votre contribution aux actions menées auprès de la communauté d'Agbélouvé.

Nous vous souhaitons un excellent retour ainsi que plein succès dans vos projets futurs.`,
    },
  },

  EN: {
    NEW: {
      subject: "APTIC-R — Application received — {{reference}}",
      bodyTemplate: `Dear {{firstName}},

We confirm the safe receipt of your application for the APTIC-R International Volunteer Program.

Application reference: {{reference}}

Your application will now be reviewed by the APTIC-R team.

We will contact you regarding the next steps in the process.`,
    },
    INTERVIEW: {
      subject: "APTIC-R — Interview — {{reference}}",
      bodyTemplate: `Dear {{firstName}},

We are pleased to inform you that your application is moving forward to the interview stage.

Date: {{interviewDate}}
Time: {{interviewTime}}
Timezone: {{timezone}}
Format: {{interviewMode}}
Location / link: {{interviewLocation}}

{{additionalMessage}}

We remain at your disposal should you have any questions.`,
    },
    SELECTED: {
      subject: "APTIC-R — Application update — {{reference}}",
      bodyTemplate: `Dear {{firstName}},

We are pleased to inform you that your application has successfully advanced and has been shortlisted for the in-depth review phase of the APTIC-R International Volunteer Program.

Our coordination team is currently reviewing mission alignment with our operational priorities in Agbélouvé.

We will reach out to you shortly with further details.`,
    },
    RETENU: {
      subject: "APTIC-R — Your application has been accepted — {{reference}}",
      bodyTemplate: `Dear {{firstName}},

We are pleased to confirm that your application has been officially accepted for the APTIC-R International Volunteer Program.

The entire team looks forward to your contribution to our rural development and digital empowerment initiatives in Agbélouvé.

The next step will be to finalize your engagement agreement and coordinate departure preparation. We will get in touch with you very shortly.`,
    },
    CHOSEN: {
      subject: "APTIC-R — Your application has been accepted — {{reference}}",
      bodyTemplate: `Dear {{firstName}},

We are pleased to confirm that your application has been officially accepted for the APTIC-R International Volunteer Program.

The entire team looks forward to your contribution to our rural development and digital empowerment initiatives in Agbélouvé.

The next step will be to finalize your engagement agreement and coordinate departure preparation. We will get in touch with you very shortly.`,
    },
    PREPARATION: {
      subject: "APTIC-R — Application update — {{reference}}",
      bodyTemplate: `Dear {{firstName}},

Your mission is now entering its active preparation phase.

To ensure a smooth transition to Agbélouvé, we will assist you with the necessary administrative and practical steps prior to your departure:
• Required documentation and insurance verifications
• Travel, health, and visa logistics
• Practical orientation and key on-site contacts

We remain at your service to assist you at every step of this preparation.`,
    },
    ARRIVED: {
      subject: "APTIC-R — Application update — {{reference}}",
      bodyTemplate: `Dear {{firstName}},

Welcome to Agbélouvé and to the APTIC-R International Volunteer Program.

The entire team is delighted to welcome you on the ground. Your first days will be dedicated to getting settled, meeting local partners, and being introduced to your mission environment.

Your coordination supervisor is on hand to support your onboarding.`,
    },
    COMPLETED: {
      subject: "APTIC-R — Application update — {{reference}}",
      bodyTemplate: `Dear {{firstName}},

Your international volunteer mission with APTIC-R has now come to an end.

We would like to express our heartfelt gratitude for your dedication, enthusiasm, and valuable contribution to our actions in Agbélouvé.

We wish you all the very best in your future endeavors.`,
    },
  },

  DE: {
    NEW: {
      subject: "APTIC-R — Bewerbung eingegangen — {{reference}}",
      bodyTemplate: `Guten Tag {{firstName}},

wir bestätigen den Eingang Ihrer Bewerbung für das internationale Freiwilligenprogramm von APTIC-R.

Bewerbungsreferenz: {{reference}}

Ihre Unterlagen werden nun vom APTIC-R-Team geprüft.

Wir werden uns bezüglich des weiteren Ablaufs bei Ihnen melden.`,
    },
    INTERVIEW: {
      subject: "APTIC-R — Vorstellungsgespräch — {{reference}}",
      bodyTemplate: `Guten Tag {{firstName}},

wir freuen uns, Ihnen mitteilen zu können, dass Ihre Bewerbung mit einem Vorstellungsgespräch fortgesetzt wird.

Datum: {{interviewDate}}
Uhrzeit: {{interviewTime}}
Zeitzone: {{timezone}}
Format: {{interviewMode}}
Ort / Link: {{interviewLocation}}

{{additionalMessage}}

Für eventuelle Rückfragen stehen wir Ihnen gerne zur Verfügung.`,
    },
    SELECTED: {
      subject: "APTIC-R — Aktualisierung Ihrer Bewerbung — {{reference}}",
      bodyTemplate: `Guten Tag {{firstName}},

wir freuen uns, Ihnen mitteilen zu können, dass Ihre Bewerbung positiv bewertet wurde und für die vertiefte Prüfphase des APTIC-R-Freiwilligenprogramms ausgewählt wurde.

Unser Koordinationsteam prüft derzeit die genaue Abstimmung mit den operativen Anforderungen vor Ort in Agbélouvé.

Wir werden uns in Kürze mit weiteren Einzelheiten bei Ihnen melden.`,
    },
    RETENU: {
      subject: "APTIC-R — Ihre Bewerbung wurde angenommen — {{reference}}",
      bodyTemplate: `Guten Tag {{firstName}},

wir freuen uns, Ihnen bestätigen zu können, dass Ihre Bewerbung für das internationale Freiwilligenprogramm von APTIC-R offiziell angenommen wurde.

Das gesamte Team freut sich auf Ihre zukünftige Mitwirkung an unseren Projekten für ländliche Entwicklung und digitale Bildung in Agbélouvé.

Als nächstes werden wir gemeinsam Ihre Einsatzvereinbarung finalisieren und die Vorbereitungen treffen. Wir melden uns sehr bald bei Ihnen.`,
    },
    CHOSEN: {
      subject: "APTIC-R — Ihre Bewerbung wurde angenommen — {{reference}}",
      bodyTemplate: `Guten Tag {{firstName}},

wir freuen uns, Ihnen bestätigen zu können, dass Ihre Bewerbung für das internationale Freiwilligenprogramm von APTIC-R offiziell angenommen wurde.

Das gesamte Team freut sich auf Ihre zukünftige Mitwirkung an unseren Projekten für ländliche Entwicklung und digitale Bildung in Agbélouvé.

Als nächstes werden wir gemeinsam Ihre Einsatzvereinbarung finalisieren und die Vorbereitungen treffen. Wir melden uns sehr bald bei Ihnen.`,
    },
    PREPARATION: {
      subject: "APTIC-R — Aktualisierung Ihrer Bewerbung — {{reference}}",
      bodyTemplate: `Guten Tag {{firstName}},

Ihr Einsatz tritt nun in die aktive Vorbereitungsphase ein.

Um Ihre Ankunft in Agbélouvé optimal vorzubereiten, unterstützen wir Sie bei den vorbereitenden Schritten:
• Zusammenstellung der Nachweise und Versicherungsunterlagen
• Klärung von Reise-, Gesundheits- und Visaformalitäten
• Praktische Orientierungsinformationen und Ansprechpartner vor Ort

Wir stehen Ihnen bei jedem Vorbereitungsschritt gerne zur Seite.`,
    },
    ARRIVED: {
      subject: "APTIC-R — Aktualisierung Ihrer Bewerbung — {{reference}}",
      bodyTemplate: `Guten Tag {{firstName}},

herzlich willkommen in Agbélouvé und im internationalen Freiwilligenprogramm von APTIC-R.

Das Team freut sich sehr, Sie vor Ort begrüßen zu dürfen. Die ersten Tage sind Ihrem Einleben, dem Kennenlernen des Teams und der Einführung in Ihr Einsatzgebiet gewidmet.

Ihre Ansprechperson vor Ort begleitet Sie bei der Eingewöhnung.`,
    },
    COMPLETED: {
      subject: "APTIC-R — Aktualisierung Ihrer Bewerbung — {{reference}}",
      bodyTemplate: `Guten Tag {{firstName}},

Ihr Freiwilligendienst bei APTIC-R ist nun offiziell beendet.

Wir möchten Ihnen herzlich für Ihren engagierten Einsatz und Ihren wertvollen Beitrag zu unseren Projekten in Agbélouvé danken.

Für Ihre Zukunft wünschen wir Ihnen alles Gute und viel Erfolg.`,
    },
  },
}

/**
 * Statuts qui proposent un email à l'administrateur lors du changement d'étape.
 * Note : REVIEW et PARTNER_VALIDATION sont strictement internes (aucun email).
 */
export const STATUS_EMAIL_SUPPORTED = [
  "INTERVIEW",
  "SELECTED",
  "RETENU",
  "CHOSEN",
  "PREPARATION",
  "ARRIVED",
  "COMPLETED",
] as const

export function isStatusEmailSupported(status: string): boolean {
  return STATUS_EMAIL_SUPPORTED.includes(status as any)
}

/**
 * Récupère la définition brute d'un modèle par statut et par langue.
 */
export function getCandidateTemplateDefinition(
  status: string,
  lang: "FR" | "EN" | "DE" = "FR"
): CandidateTemplateDefinition | null {
  const safeLang = (lang || "FR").toUpperCase() as "FR" | "EN" | "DE"
  const langTemplates = CANDIDATE_EMAIL_TEMPLATES[safeLang] || CANDIDATE_EMAIL_TEMPLATES.FR
  const normalizedKey = status.toUpperCase()
  return langTemplates[normalizedKey] || null
}

/**
 * Formate une date en chaîne textuelle élégante (ex: "25 septembre 2026").
 */
export function formatHumanDate(val: string, lang: "FR" | "EN" | "DE" = "FR"): string {
  if (!val) return ""
  const trimmed = val.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number)
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
    if (!isNaN(date.getTime())) {
      const locale = lang === "EN" ? "en-US" : lang === "DE" ? "de-DE" : "fr-FR"
      return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date)
    }
  }
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split("/").map(Number)
    const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
    if (!isNaN(date.getTime())) {
      const locale = lang === "EN" ? "en-US" : lang === "DE" ? "de-DE" : "fr-FR"
      return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(date)
    }
  }
  return trimmed
}

/**
 * Construit le corps d'un e-mail d'entretien totalement résolu SANS aucune variable {{...}}.
 * Si un champ est vide, la ligne correspondante est strictement omise.
 */
export function buildInterviewBodyText(params: {
  candidateFirstName: string
  date?: string
  time?: string
  timezone?: string
  mode?: string
  location?: string
  additionalMessage?: string
  lang?: "FR" | "EN" | "DE"
}): string {
  const lang = (params.lang || "FR").toUpperCase() as "FR" | "EN" | "DE"
  const firstName = params.candidateFirstName?.trim() || "Candidat"

  const lines: string[] = []
  const dateFormatted = formatHumanDate(params.date?.trim() || "", lang)

  if (lang === "EN") {
    if (dateFormatted) lines.push(`Date: ${dateFormatted}`)
    if (params.time?.trim()) lines.push(`Time: ${params.time.trim()}`)
    if (params.timezone?.trim()) lines.push(`Time zone: ${params.timezone.trim()}`)
    if (params.mode?.trim()) lines.push(`Format: ${params.mode.trim()}`)
    if (params.location?.trim()) lines.push(`Location / Link: ${params.location.trim()}`)

    const parts: string[] = [
      `Dear ${firstName},`,
      `We are pleased to inform you that your application is moving forward with an interview stage.`,
    ]
    if (lines.length > 0) parts.push(lines.join("\n"))
    if (params.additionalMessage?.trim()) parts.push(params.additionalMessage.trim())
    parts.push("Please let us know if you have any questions.")
    parts.push(`Best regards,

The APTIC-R Team
International Volunteering
Agbélouvé, Togo
aptic.rural19@gmail.com
+228 91 20 19 90`)

    return parts.join("\n\n")
  }

  if (lang === "DE") {
    if (dateFormatted) lines.push(`Datum: ${dateFormatted}`)
    if (params.time?.trim()) lines.push(`Uhrzeit: ${params.time.trim()}`)
    if (params.timezone?.trim()) lines.push(`Zeitzone: ${params.timezone.trim()}`)
    if (params.mode?.trim()) lines.push(`Format: ${params.mode.trim()}`)
    if (params.location?.trim()) lines.push(`Ort / Link: ${params.location.trim()}`)

    const parts: string[] = [
      `Guten Tag ${firstName},`,
      `wir freuen uns, Ihnen mitteilen zu können, dass Ihre Bewerbung mit einem Vorstellungsgespräch fortgesetzt wird.`,
    ]
    if (lines.length > 0) parts.push(lines.join("\n"))
    if (params.additionalMessage?.trim()) parts.push(params.additionalMessage.trim())
    parts.push("Für Fragen stehen wir Ihnen jederzeit gern zur Verfügung.")
    parts.push(`Mit freundlichen Grüßen,

Ihr APTIC-R Team
Internationaler Freiwilligendienst
Agbélouvé, Togo
aptic.rural19@gmail.com
+228 91 20 19 90`)

    return parts.join("\n\n")
  }

  // FR (Par défaut)
  if (dateFormatted) lines.push(`Date : ${dateFormatted}`)
  if (params.time?.trim()) lines.push(`Heure : ${params.time.trim()}`)
  if (params.timezone?.trim()) lines.push(`Fuseau horaire : ${params.timezone.trim()}`)
  if (params.mode?.trim()) lines.push(`Mode : ${params.mode.trim()}`)
  if (params.location?.trim()) lines.push(`Lieu / lien : ${params.location.trim()}`)

  const parts: string[] = [
    `Bonjour ${firstName},`,
    `Nous vous informons que votre candidature poursuit son parcours avec une étape d'entretien.`,
  ]
  if (lines.length > 0) parts.push(lines.join("\n"))
  if (params.additionalMessage?.trim()) parts.push(params.additionalMessage.trim())
  parts.push("Nous restons à votre disposition pour toute question.")
  parts.push(`Cordialement,

L'équipe APTIC-R
Volontariat International
Agbélouvé, Togo
aptic.rural19@gmail.com
+228 91 20 19 90`)

  return parts.join("\n\n")
}

/**
 * Construit le corps d'un e-mail pour n'importe quel statut résolu avec signature, sans variable brute.
 */
export function buildStatusBodyText(params: {
  status: string
  candidateFirstName: string
  lang?: "FR" | "EN" | "DE"
}): string {
  const lang = (params.lang || "FR").toUpperCase() as "FR" | "EN" | "DE"
  const firstName = params.candidateFirstName?.trim() || "Candidat"
  const def = getCandidateTemplateDefinition(params.status, lang)

  if (!def) {
    return `Bonjour ${firstName},\n\nVotre candidature a été mise à jour.\n\n${renderEmailTextFooter({ lang })}`
  }

  const resolvedBody = def.bodyTemplate.replace(/\{\{\s*firstName\s*\}\}/g, firstName)
  const footer = renderEmailTextFooter({ lang })
  return `${resolvedBody}\n\n${footer}`.trim()
}

/**
 * Compile et rend un e-mail complet (Subject, HTML, Text) avec les variables dynamiques.
 * Évite scrupuleusement la duplication de signature si le corps la contient déjà.
 */
export function renderCandidateWorkflowEmail(params: {
  status: string
  context: EmailVariableContext
  customSubject?: string
  customBody?: string
  lang?: "FR" | "EN" | "DE"
}): {
  subject: string
  html: string
  text: string
} {
  const lang = (params.lang || "FR").toUpperCase() as "FR" | "EN" | "DE"
  const def = getCandidateTemplateDefinition(params.status, lang)

  const rawSubject = params.customSubject || def?.subject || "APTIC-R — Mise à jour de votre candidature — {{reference}}"
  const rawBody = params.customBody || def?.bodyTemplate || "Bonjour {{firstName}},\n\nVotre candidature a été mise à jour."

  // 1. Interpolation des variables
  const subject = interpolateVariables(rawSubject, params.context).trim()
  const textBody = interpolateVariables(rawBody, params.context).trim()

  // Détection de présence de signature dans le texte
  const alreadyHasSignature =
    textBody.includes("aptic.rural19@gmail.com") ||
    textBody.includes("+228 91 20 19 90") ||
    textBody.includes("L'équipe APTIC-R") ||
    textBody.includes("The APTIC-R Team") ||
    textBody.includes("Ihr APTIC-R Team")

  // 2. Formatage HTML sobre (paragraphes, listes simples)
  const contentHtml = formatTextToHtml(textBody)
  const html = wrapEmailHtml(contentHtml, lang, undefined, { includeFooter: !alreadyHasSignature })

  // 3. Formatage Texte brut complet avec signature
  const textFooter = alreadyHasSignature ? "" : renderEmailTextFooter({ lang })
  const text = textFooter ? `${textBody}\n\n${textFooter}`.trim() : textBody.trim()

  return { subject, html, text }
}
