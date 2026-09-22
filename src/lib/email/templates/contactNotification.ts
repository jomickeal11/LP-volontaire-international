import {
  renderEmailHead,
  renderEmailHeader,
  renderEmailFooter,
} from "./emailTheme"

export interface ContactNotificationParams {
  name: string
  email: string
  organization?: string
  phone?: string
  subject: string
  message: string
  routedTo: string
  lang?: "FR" | "EN" | "DE"
}

export function renderContactNotificationEmail(params: ContactNotificationParams): {
  subject: string
  html: string
  text: string
} {
  const subjectLabelMap: Record<string, string> = {
    GENERAL: "Information générale",
    SOUTIEN_FINANCIER: "Financement de projet / Parrainage",
    DON_MATERIEL: "Don de matériel (informatique, solaire)",
    MECENAT_COMPETENCES: "Mécénat de compétences / Pro Bono",
    VOLONTARIAT: "Candidature / Volontariat",
    PARTENARIAT: "Partenariat institutionnel & Projets",
    FABLAB: "Formations & FabLab d'Agbélouvé",
    MEDIA: "Presse & Médias",
    AUTRE: "Autre demande",
  }

  const subjectText = subjectLabelMap[params.subject] || params.subject || "Message de contact"
  const emailSubject = subjectText
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || "https://aptic-rural.org"
  const backofficeUrl = `${siteUrl}/backoffice/messages`

  const formattedHtmlParagraphs = params.message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) =>
      line
        ? `<p style="margin: 0 0 12px 0;">${line}</p>`
        : `<p style="margin: 0 0 12px 0;">&nbsp;</p>`
    )
    .join("")

  const html = `
<!DOCTYPE html>
<html lang="fr">
${renderEmailHead(subjectText)}
<body style="margin: 0; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #183247;">
  <div style="max-width: 580px; margin: 0 auto;" class="email-wrap">
    ${renderEmailHeader()}

    <p style="margin: 0 0 16px 0;">
      Bonjour,
    </p>

    <p style="margin: 0 0 16px 0;">
      Vous avez reçu un nouveau message de <strong>${params.name}</strong> depuis le formulaire de contact du site APTIC-R.
    </p>

    <p style="margin: 20px 0 6px 0; font-weight: 600;">
      Coordonnées de l'expéditeur :
    </p>
    <ul style="margin: 0 0 20px 0; padding-left: 20px;">
      <li style="margin-bottom: 4px;">Nom : ${params.name}</li>
      <li style="margin-bottom: 4px;">Email : <a href="mailto:${params.email}">${params.email}</a></li>
      ${params.phone ? `<li style="margin-bottom: 4px;">Téléphone / WhatsApp : ${params.phone}</li>` : ""}
      ${params.organization ? `<li style="margin-bottom: 4px;">Organisation : ${params.organization}</li>` : ""}
    </ul>

    <p style="margin: 20px 0 8px 0; font-weight: 600;">
      Message :
    </p>
    <div style="margin: 0 0 20px 0;">
      ${formattedHtmlParagraphs}
    </div>

    <p style="margin: 20px 0 24px 0;">
      Lien d'accès aux messages dans le Back-office :<br>
      <a href="${backofficeUrl}" target="_blank" style="word-break: break-all;">${backofficeUrl}</a>
    </p>

    <p style="margin: 0 0 24px 0; font-size: 14px; color: #5E6B76;" class="muted-text">
      Vous pouvez répondre directement à cet email pour lui écrire.
    </p>

    ${renderEmailFooter({ customNote: "Notification automatique interne destinée à l'équipe APTIC-R." })}
  </div>
</body>
</html>
  `.trim()

  const text = `
Bonjour,

Vous avez reçu un nouveau message de ${params.name} depuis le formulaire de contact du site APTIC-R.

Coordonnées de l'expéditeur :
- Nom : ${params.name}
- Email : ${params.email}
${params.phone ? `- Téléphone / WhatsApp : ${params.phone}\n` : ""}${params.organization ? `- Organisation : ${params.organization}\n` : ""}
Message :
--------------------------------------------------
${params.message}
--------------------------------------------------

Lien d'accès au Back-office :
${backofficeUrl}

Pour lui répondre : ${params.email} (ou répondez directement à cet email).

--
Portail APTIC-R
  `.trim()

  return {
    subject: emailSubject,
    html,
    text,
  }
}



