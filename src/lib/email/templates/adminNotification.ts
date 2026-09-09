import {
  renderEmailHead,
  renderEmailHeader,
  renderReferenceBox,
  renderCtaButton,
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
    ? `[Notification Back-office] Nouvelle candidature : ${params.name} [${params.referenceNumber}]`
    : `[Notification Back-office] Demande de partenariat : ${params.orgName} [${params.referenceNumber}]`

  const title = isCandidate
    ? "Nouvelle candidature enregistrée"
    : "Nouvelle demande de partenariat"

  const subtitle = isCandidate
    ? "Notification interne · Candidature Volontaire"
    : "Notification interne · Demande Partenaire"

  const backofficeUrl = isCandidate
    ? `${siteUrl}/fr/backoffice/applications`
    : `${siteUrl}/fr/backoffice/partners/requests`

  const html = `
<!DOCTYPE html>
<html lang="fr">
${renderEmailHead(title)}
<body class="email-bg" style="margin: 0; padding: 0; background-color: #F5F7F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #183247; line-height: 1.6;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F7F9;" class="email-bg">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="580" style="max-width: 580px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAF0F4; border-radius: 8px; overflow: hidden;" class="email-card border-line">
          ${renderEmailHeader(subtitle)}

          <!-- Contenu du message -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h1 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700; color: #183247; line-height: 1.3;" class="text-primary">
                ${title}
              </h1>

              <p style="margin: 0 0 18px 0; font-size: 14.5px; color: #5E6B76; line-height: 1.6;" class="text-secondary">
                Une nouvelle soumission requiert l'attention de l'équipe de coordination APTIC-R.
              </p>

              ${renderReferenceBox("Référence attribuée", params.referenceNumber)}

              <!-- Tableau récapitulatif sobre -->
              <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #183247; margin: 24px 0 8px 0;" class="text-primary">
                Données de la soumission
              </div>

              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border: 1px solid #EAF0F4; border-radius: 6px; font-size: 13.5px; margin-bottom: 20px;" class="border-line">
                ${isCandidate ? `
                <tr>
                  <td style="padding: 10px 14px; color: #5E6B76; width: 40%; border-bottom: 1px solid #EAF0F4;" class="text-secondary border-line">
                    Nom complet
                  </td>
                  <td style="padding: 10px 14px; color: #183247; font-weight: 600; border-bottom: 1px solid #EAF0F4;" class="text-primary border-line">
                    ${params.name}
                  </td>
                </tr>
                <tr class="table-row-even">
                  <td style="padding: 10px 14px; color: #5E6B76; border-bottom: 1px solid #EAF0F4;" class="text-secondary border-line">
                    Email
                  </td>
                  <td style="padding: 10px 14px; color: #183247; font-weight: 600; border-bottom: 1px solid #EAF0F4;" class="text-primary border-line">
                    <a href="mailto:${params.email}" style="color: #183247; text-decoration: underline;" class="text-primary">${params.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #5E6B76; border-bottom: 1px solid #EAF0F4;" class="text-secondary border-line">
                    Pays de résidence
                  </td>
                  <td style="padding: 10px 14px; color: #183247; font-weight: 600; border-bottom: 1px solid #EAF0F4;" class="text-primary border-line">
                    ${params.country}
                  </td>
                </tr>
                ${params.profession ? `
                <tr class="table-row-even">
                  <td style="padding: 10px 14px; color: #5E6B76; border-bottom: 1px solid #EAF0F4;" class="text-secondary border-line">
                    Profession
                  </td>
                  <td style="padding: 10px 14px; color: #183247;" class="text-primary border-line">
                    ${params.profession}
                  </td>
                </tr>` : ""}
                ${params.skills && params.skills.length > 0 ? `
                <tr>
                  <td style="padding: 10px 14px; color: #5E6B76;" class="text-secondary">
                    Compétences
                  </td>
                  <td style="padding: 10px 14px; color: #183247;" class="text-primary">
                    ${params.skills.join(", ")}
                  </td>
                </tr>` : ""}
                ` : `
                <tr>
                  <td style="padding: 10px 14px; color: #5E6B76; width: 40%; border-bottom: 1px solid #EAF0F4;" class="text-secondary border-line">
                    Organisation
                  </td>
                  <td style="padding: 10px 14px; color: #183247; font-weight: 600; border-bottom: 1px solid #EAF0F4;" class="text-primary border-line">
                    ${params.orgName}
                  </td>
                </tr>
                <tr class="table-row-even">
                  <td style="padding: 10px 14px; color: #5E6B76; border-bottom: 1px solid #EAF0F4;" class="text-secondary border-line">
                    Contact référent
                  </td>
                  <td style="padding: 10px 14px; color: #183247; font-weight: 600; border-bottom: 1px solid #EAF0F4;" class="text-primary border-line">
                    ${params.contactPerson}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #5E6B76; border-bottom: 1px solid #EAF0F4;" class="text-secondary border-line">
                    Email
                  </td>
                  <td style="padding: 10px 14px; color: #183247; border-bottom: 1px solid #EAF0F4;" class="text-primary border-line">
                    <a href="mailto:${params.email}" style="color: #183247; text-decoration: underline;" class="text-primary">${params.email}</a>
                  </td>
                </tr>
                <tr class="table-row-even">
                  <td style="padding: 10px 14px; color: #5E6B76; border-bottom: 1px solid #EAF0F4;" class="text-secondary border-line">
                    Pays
                  </td>
                  <td style="padding: 10px 14px; color: #183247; border-bottom: 1px solid #EAF0F4;" class="text-primary border-line">
                    ${params.country}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #5E6B76;" class="text-secondary">
                    Type d'organisation
                  </td>
                  <td style="padding: 10px 14px; color: #183247;" class="text-primary">
                    ${params.orgType}
                  </td>
                </tr>
                `}
              </table>

              <!-- Bouton CTA vers le dossier dans le Back-office -->
              ${renderCtaButton("Consulter le dossier dans le Back-office", backofficeUrl)}
            </td>
          </tr>

          ${renderEmailFooter({ customNote: "Notification interne automatique réservée à l'équipe de coordination APTIC-R." })}
        </table>
      </td>
    </tr>
  </table>
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

Accès direct au Back-office :
${backofficeUrl}

--
Notification interne APTIC-R
  `.trim()

  return { subject, html, text }
}
