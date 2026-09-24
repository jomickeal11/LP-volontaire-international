import { wrapEmailHtml, renderEmailTextFooter } from "./emailTheme"
import { formatTextToHtml } from "../variableEngine"

interface PartnerEmailParams {
  orgName: string
  contactPerson: string
  referenceNumber: string
  country?: string
  orgType?: string
  lang?: "FR" | "EN" | "DE"
}

export function renderPartnerConfirmationEmail({
  orgName,
  contactPerson,
  referenceNumber,
  country,
  orgType,
  lang = "FR",
}: PartnerEmailParams): { subject: string; html: string; text: string } {
  const currentLang = (lang || "FR").toUpperCase() as "FR" | "EN" | "DE"

  const contentMap = {
    FR: {
      subject: `APTIC-R — Demande de partenariat reçue — ${referenceNumber}`,
      body: `Bonjour ${contactPerson},

Nous vous confirmons la bonne réception de la demande de partenariat transmise pour l'organisation ${orgName} auprès de l'association APTIC-R.

Référence de votre dossier : ${referenceNumber}

Informations transmises :
• Organisation : ${orgName}
• Contact référent : ${contactPerson}${country ? `\n• Pays : ${country}` : ""}${orgType ? `\n• Type de structure : ${orgType}` : ""}

Votre demande va être étudiée par la direction et l'équipe de coordination d'APTIC-R sous 3 à 5 jours ouvrés.

Nous reviendrons vers vous très prochainement afin d'échanger sur les modalités de collaboration possibles.`,
    },
    EN: {
      subject: `APTIC-R — Partnership request received — ${referenceNumber}`,
      body: `Dear ${contactPerson},

We confirm the safe receipt of the partnership request submitted on behalf of ${orgName} to the APTIC-R association.

Application reference: ${referenceNumber}

Submitted details:
• Organization: ${orgName}
• Contact person: ${contactPerson}${country ? `\n• Country: ${country}` : ""}${orgType ? `\n• Organization type: ${orgType}` : ""}

Your request will be reviewed by the APTIC-R management and coordination team within 3 to 5 business days.

We will contact you shortly to discuss potential collaboration opportunities.`,
    },
    DE: {
      subject: `APTIC-R — Partnerschaftsanfrage eingegangen — ${referenceNumber}`,
      body: `Guten Tag ${contactPerson},

wir bestätigen den Eingang der Partnerschaftsanfrage für die Organisation ${orgName} beim Verein APTIC-R.

Referenznummer Ihrer Anfrage: ${referenceNumber}

Übermittelte Angaben:
• Organisation: ${orgName}
• Ansprechperson: ${contactPerson}${country ? `\n• Land: ${country}` : ""}${orgType ? `\n• Art der Organisation: ${orgType}` : ""}

Ihre Anfrage wird von der Geschäftsleitung und dem Koordinationsteam von APTIC-R innerhalb von 3 bis 5 Werktagen geprüft.

Wir werden uns in Kürze mit Ihnen in Verbindung setzen.`,
    },
  }

  const { subject, body } = contentMap[currentLang] || contentMap.FR

  const html = wrapEmailHtml(formatTextToHtml(body), currentLang)
  const textFooter = renderEmailTextFooter({ lang: currentLang })
  const text = `${body}\n\n${textFooter}`.trim()

  return { subject, html, text }
}
