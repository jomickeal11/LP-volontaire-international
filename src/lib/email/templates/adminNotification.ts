import {
  renderEmailHead,
  renderEmailHeader,
  renderEmailFooter,
} from "./emailTheme"

interface AdminCandidateAlertParams {
  type: "CANDIDATE"
  referenceNumber: string
  name: string
  email: string
  country: string
  profession?: string
  skills?: string[]
}

interface AdminPartnerAlertParams {
  type: "PARTNER"
  referenceNumber: string
  orgName: string
  contactPerson: string
  email: string
  country: string
  orgType: string
}

export type AdminAlertParams = AdminCandidateAlertParams | AdminPartnerAlertParams

export function renderAdminNotificationEmail(params: AdminAlertParams): {
  subject: string
  html: string
  text: string
} {
  const isCandidate = params.type === "CANDIDATE"
  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"

  const subject = isCandidate
    ? `[Notification] Nouvelle candidature : ${params.name} (${params.referenceNumber})`
    : `[Notification] Demande de partenariat : ${params.orgName} (${params.referenceNumber})`

  const title = isCandidate
    ? "Nouvelle candidature reçue"
    : "Nouvelle demande de partenariat"

  const backofficeUrl = isCandidate
    ? `${siteUrl}/fr/backoffice/applications`
    : `${siteUrl}/fr/backoffice/partners/requests`

  const html = `
<!DOCTYPE html>
<html lang="fr">
${renderEmailHead(title)}
<body style="margin: 0; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #183247;">
  <div style="max-width: 580px; margin: 0 auto;" class="email-wrap">
    ${renderEmailHeader()}

    <p style="margin: 0 0 16px 0; font-weight: 700; font-size: 17px;">
      ${title}
    </p>

    <p style="margin: 0 0 16px 0;">
      Une nouvelle soumission a été enregistrée sur le portail APTIC-R.
    </p>

    <p style="margin: 0 0 16px 0;">
      Référence attribuée : <strong>${params.referenceNumber}</strong>
    </p>

    <p style="margin: 20px 0 6px 0; font-weight: 600;">
      Détails :
    </p>
    <ul style="margin: 0 0 20px 0; padding-left: 20px;">
      ${isCandidate ? `
      <li style="margin-bottom: 4px;">Candidat : ${params.name}</li>
      <li style="margin-bottom: 4px;">Email : <a href="mailto:${params.email}">${params.email}</a></li>
      <li style="margin-bottom: 4px;">Pays : ${params.country}</li>
      ${params.profession ? `<li style="margin-bottom: 4px;">Profession : ${params.profession}</li>` : ""}
      ${params.skills && params.skills.length > 0 ? `<li style="margin-bottom: 4px;">Compétences : ${params.skills.join(", ")}</li>` : ""}
      ` : `
      <li style="margin-bottom: 4px;">Organisation : ${params.orgName}</li>
      <li style="margin-bottom: 4px;">Contact : ${params.contactPerson}</li>
      <li style="margin-bottom: 4px;">Email : <a href="mailto:${params.email}">${params.email}</a></li>
      <li style="margin-bottom: 4px;">Pays : ${params.country}</li>
      <li style="margin-bottom: 4px;">Type : ${params.orgType}</li>
      `}
    </ul>

    <p style="margin: 20px 0 24px 0;">
      Lien d'accès au dossier dans le Back-office :<br>
      <a href="${backofficeUrl}" target="_blank" style="word-break: break-all;">${backofficeUrl}</a>
    </p>

    ${renderEmailFooter({ customNote: "Notification automatique interne destinée à l'équipe APTIC-R." })}
  </div>
</body>
</html>
  `.trim()

  const text = `
${title}
==================================================

Référence : ${params.referenceNumber}

${isCandidate ? `
Candidat : ${params.name}
Email : ${params.email}
Pays : ${params.country}
${params.profession ? `Profession : ${params.profession}\n` : ""}${params.skills && params.skills.length > 0 ? `Compétences : ${params.skills.join(", ")}\n` : ""}
` : `
Organisation : ${params.orgName}
Contact : ${params.contactPerson}
Email : ${params.email}
Pays : ${params.country}
Type : ${params.orgType}
`}

Lien d'accès au Back-office :
${backofficeUrl}

--
Portail APTIC-R
  `.trim()

  return { subject, html, text }
}
