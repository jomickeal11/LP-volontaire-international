import { wrapEmailHtml, renderEmailTextFooter } from "./emailTheme"
import { formatTextToHtml } from "../variableEngine"

/** Statuts qui déclenchent une notification au demandeur. */
export type EventParticipationDecision = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"

export interface EventParticipationEmailParams {
  decision: EventParticipationDecision
  firstName: string
  lastName: string
  eventTitle: string
  /** Formatée et déjà traduite par l'appelant ; chaîne vide si inconnue. */
  eventDate?: string
  eventLocation?: string | null
  lang?: "FR" | "EN" | "DE"
  rejectionReason?: string | null
}

/**
 * Message au demandeur.
 *
 * Point éditorial majeur : à l'étape PENDING, le texte ne doit JAMAIS laisser
 * croire que la place est réservée. Il annonce une demande reçue et un contact
 * à venir ; seule la décision APPROVED parle de participation confirmée.
 */
export function renderEventParticipationEmail({
  decision,
  firstName,
  lastName,
  eventTitle,
  eventDate,
  eventLocation,
  lang = "FR",
  rejectionReason,
}: EventParticipationEmailParams): { subject: string; html: string; text: string } {
  const currentLang = (lang || "FR").toUpperCase() as "FR" | "EN" | "DE"
  const who = `${firstName} ${lastName}`.trim()
  const locationLine = eventLocation?.trim() ? `\n• Lieu : ${eventLocation.trim()}` : ""

  const contentMap = {
    FR: {
      pending: {
        subject: `APTIC-R — Demande de participation reçue — ${eventTitle}`,
        body: `Bonjour ${firstName},

Nous accusons réception de votre demande de participation à l'événement « ${eventTitle} ».
${eventDate ? `\nDate de l'événement : ${eventDate}` : ""}${locationLine}

Cette demande n'est pas encore une inscription validée : elle est enregistrée et placée en attente de traitement par notre équipe.

Un membre d'APTIC-R va vous contacter pour échanger avec vous et confirmer votre participation. Votre place n'est pas réservée à ce stade.

Cordialement,
L'équipe APTIC-R`,
      },
      approved: {
        subject: `APTIC-R — Participation confirmée — ${eventTitle}`,
        body: `Bonjour ${firstName},

Votre participation à l'événement « ${eventTitle} » est confirmée.
${eventDate ? `\nDate de l'événement : ${eventDate}` : ""}${locationLine}

Merci de vous présenter à l'heure indiquée. Pour toute question, vous pouvez répondre directement à cet e-mail ou joindre l'équipe APTIC-R.

Au plaisir de vous accueillir,
L'équipe APTIC-R`,
      },
      rejected: {
        subject: `APTIC-R — Demande de participation — suite défavorable — ${eventTitle}`,
        body: `Bonjour ${firstName},

Votre demande de participation à l'événement « ${eventTitle} » n'a pas pu être retenue.

${
  rejectionReason?.trim()
    ? `Motif communiqué par notre équipe :\n${rejectionReason.trim()}\n`
    : ""
}
Nous vous remercions de l'intérêt que vous portez aux activités d'APTIC-R et restons à votre disposition pour toute autre opportunité.

Cordialement,
L'équipe APTIC-R`,
      },
      cancelled: {
        subject: `APTIC-R — Participation annulée — ${eventTitle}`,
        body: `Bonjour ${firstName},

Nous accusons réception de votre annulation pour l'événement « ${eventTitle} ».
${eventDate ? `\nDate de l'événement : ${eventDate}` : ""}

Votre place a été libérée. Si vous souhaitez participer à une prochaine soirée d'APTIC-R, nous resterons ravis de recevoir votre demande.`,
      },
    },
    EN: {
      pending: {
        subject: `APTIC-R — Participation request received — ${eventTitle}`,
        body: `Dear ${firstName},

We acknowledge receipt of your participation request for the event “${eventTitle}”.
${eventDate ? `\nEvent date: ${eventDate}` : ""}${locationLine ? locationLine.replace("Lieu", "Venue") : ""}

This request is not yet a confirmed registration: it has been recorded and is awaiting review by our team.

An APTIC-R team member will contact you to discuss and confirm your participation. Your place is not reserved at this stage.

Kind regards,
The APTIC-R team`,
      },
      approved: {
        subject: `APTIC-R — Participation confirmed — ${eventTitle}`,
        body: `Dear ${firstName},

Your participation in the event “${eventTitle}” is confirmed.
${eventDate ? `\nEvent date: ${eventDate}` : ""}${locationLine ? locationLine.replace("Lieu", "Venue") : ""}

Please arrive at the time indicated. Should you have any question, reply to this email or contact the APTIC-R team.

We look forward to welcoming you,
The APTIC-R team`,
      },
      rejected: {
        subject: `APTIC-R — Participation request — unsuccessful — ${eventTitle}`,
        body: `Dear ${firstName},

Your participation request for the event “${eventTitle}” could not be retained.

${
  rejectionReason?.trim()
    ? `Reason given by our team:\n${rejectionReason.trim()}\n`
    : ""
}
Thank you for your interest in APTIC-R activities. We remain at your disposal for any other opportunity.

Kind regards,
The APTIC-R team`,
      },
      cancelled: {
        subject: `APTIC-R — Participation cancelled — ${eventTitle}`,
        body: `Dear ${firstName},

We acknowledge receipt of your cancellation for the event “${eventTitle}”.
${eventDate ? `\nEvent date: ${eventDate}` : ""}

Your place has been released. Should you wish to participate in a future APTIC-R event, we will be glad to receive your request.

Kind regards,
The APTIC-R team`,
      },
    },
    DE: {
      pending: {
        subject: `APTIC-R — Teilnahmeanfrage eingegangen — ${eventTitle}`,
        body: `Guten Tag ${firstName},

wir bestätigen den Eingang Ihrer Teilnahmeanfrage für die Veranstaltung „${eventTitle}“.
${eventDate ? `\nVeranstaltungsdatum: ${eventDate}` : ""}${locationLine ? locationLine.replace("Lieu", "Ort") : ""}

Diese Anfrage ist noch keine bestätigte Anmeldung: Sie wurde erfasst und wartet auf die Prüfung durch unser Team.

Ein Mitglied des APTIC-R-Teams wird Sie kontaktieren, um mit Ihnen zu sprechen und Ihre Teilnahme zu bestätigen. Ihr Platz ist zum jetzigen Zeitpunkt nicht reserviert.

Mit freundlichen Grüßen
Das APTIC-R-Team`,
      },
      approved: {
        subject: `APTIC-R — Teilnahme bestätigt — ${eventTitle}`,
        body: `Guten Tag ${firstName},

Ihre Teilnahme an der Veranstaltung „${eventTitle}“ ist bestätigt.
${eventDate ? `\nVeranstaltungsdatum: ${eventDate}` : ""}${locationLine ? locationLine.replace("Lieu", "Ort") : ""}

Bitte erscheinen Sie zur angegebenen Zeit. Bei Fragen antworten Sie einfach auf diese E-Mail oder wenden sich an das APTIC-R-Team.

Wir freuen uns, Sie begrüßen zu dürfen,
Das APTIC-R-Team`,
      },
      rejected: {
        subject: `APTIC-R — Teilnahmeanfrage — abschlägig — ${eventTitle}`,
        body: `Guten Tag ${firstName},

Ihre Teilnahmeanfrage für die Veranstaltung „${eventTitle}“ konnte nicht berücksichtigt werden.

${
  rejectionReason?.trim()
    ? `Von unserem Team genannter Grund:\n${rejectionReason.trim()}\n`
    : ""
}
Wir danken Ihnen für Ihr Interesse an den Aktivitäten von APTIC-R und stehen Ihnen für jede andere Gelegenheit gerne zur Verfügung.

Mit freundlichen Grüßen
Das APTIC-R-Team`,
      },
      cancelled: {
        subject: `APTIC-R — Teilnahme abgesagt — ${eventTitle}`,
        body: `Guten Tag ${firstName},

wir bestätigen den Eingang Ihrer Absage für die Veranstaltung „${eventTitle}“.
${eventDate ? `\nVeranstaltungsdatum: ${eventDate}` : ""}

Ihr Platz wurde wieder freigegeben. Möchten Sie an einer künftigen Veranstaltung von APTIC-R teilnehmen, senden Sie uns gerne erneut eine Anfrage.

Mit freundlichen Grüßen
Das APTIC-R-Team`,
      },
    },
  }

  // Les clés du dictionnaire sont en minuscules, les statuts de la base en
  // majuscules : on passe par une table de correspondance explicite plutôt que
  // qu'un cast silencieux sur la forme du contenu.
  const KEY_BY_DECISION: Record<EventParticipationDecision, string> = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    CANCELLED: "cancelled",
  }

  const dictionary: Record<string, { subject: string; body: string }> =
    contentMap[currentLang] ?? contentMap.FR
  const entry =
    dictionary[KEY_BY_DECISION[decision]] ?? dictionary.pending ?? contentMap.FR.pending

  const html = wrapEmailHtml(formatTextToHtml(entry.body), currentLang)
  const textFooter = renderEmailTextFooter({ lang: currentLang })
  const text = `${entry.body}\n\n${textFooter}`.trim()

  return { subject: entry.subject, html, text }
}
