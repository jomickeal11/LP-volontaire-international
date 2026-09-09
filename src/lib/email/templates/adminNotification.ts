interface AdminCandidateAlertParams {
  type: 'CANDIDATE'
  referenceNumber: string
  name: string
  email: string
  country: string
  profession?: string
  skills?: string[]
}

interface AdminPartnerAlertParams {
  type: 'PARTNER'
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
  const isCandidate = params.type === 'CANDIDATE'
  const siteUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const subject = isCandidate
    ? `[Alerte Back-office] Nouvelle candidature : ${params.name} (${params.referenceNumber})`
    : `[Alerte Back-office] Nouvelle demande de partenariat : ${params.orgName} (${params.referenceNumber})`

  const title = isCandidate ? 'Nouvelle Candidature Reçue' : 'Nouvelle Demande Partenaire Reçue'
  const backofficeUrl = isCandidate
    ? `${siteUrl}/fr/backoffice/applications`
    : `${siteUrl}/fr/backoffice/partners/requests`

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F7F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F7F9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="background: #0F172A; padding: 24px 32px; text-align: left;">
              <span style="font-size: 18px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.3px;">APTIC-R</span>
              <span style="display: inline-block; background-color: #35A85A; color: #FFFFFF; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; margin-left: 12px; text-transform: uppercase;">Alerte Back-office</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 700; color: #0F172A;">${title}</h1>
              <div style="color: #64748B; font-size: 13px; margin-bottom: 24px;">Une nouvelle soumission requiert l'attention de l'équipe de coordination.</div>

              <!-- Ref box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px;">
                    <div style="font-size: 12px; color: #64748B; text-transform: uppercase; font-weight: 600;">Référence attribuée</div>
                    <div style="font-size: 20px; font-weight: 800; font-family: monospace; color: #174F7A; margin-top: 4px;">${params.referenceNumber}</div>
                  </td>
                </tr>
              </table>

              <!-- Details Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; margin-bottom: 28px;">
                ${isCandidate ? `
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500; width: 35%;">Nom complet</td>
                  <td style="padding: 10px 14px; color: #0F172A; font-weight: 600;">${params.name}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9; background-color: #F8FAFC;">
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500;">Email</td>
                  <td style="padding: 10px 14px; color: #0F172A; font-weight: 600;"><a href="mailto:${params.email}" style="color: #174F7A; text-decoration: none;">${params.email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500;">Pays de résidence</td>
                  <td style="padding: 10px 14px; color: #0F172A; font-weight: 600;">${params.country}</td>
                </tr>
                ${params.profession ? `
                <tr style="border-bottom: 1px solid #F1F5F9; background-color: #F8FAFC;">
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500;">Profession</td>
                  <td style="padding: 10px 14px; color: #0F172A;">${params.profession}</td>
                </tr>` : ''}
                ${params.skills && params.skills.length > 0 ? `
                <tr>
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500;">Compétences</td>
                  <td style="padding: 10px 14px; color: #0F172A;">${params.skills.join(', ')}</td>
                </tr>` : ''}
                ` : `
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500; width: 35%;">Organisation</td>
                  <td style="padding: 10px 14px; color: #0F172A; font-weight: 600;">${params.orgName}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9; background-color: #F8FAFC;">
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500;">Contact</td>
                  <td style="padding: 10px 14px; color: #0F172A; font-weight: 600;">${params.contactPerson}</td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9;">
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500;">Email de contact</td>
                  <td style="padding: 10px 14px; color: #0F172A;"><a href="mailto:${params.email}" style="color: #174F7A; text-decoration: none;">${params.email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #F1F5F9; background-color: #F8FAFC;">
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500;">Pays</td>
                  <td style="padding: 10px 14px; color: #0F172A;">${params.country}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; color: #64748B; font-weight: 500;">Type d'organisation</td>
                  <td style="padding: 10px 14px; color: #0F172A;">${params.orgType}</td>
                </tr>
                `}
              </table>

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 12px 0 24px 0;">
                    <a href="${backofficeUrl}" style="background-color: #174F7A; color: #FFFFFF; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 6px; display: inline-block;">
                      Consulter dans le Back-office →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 16px 32px; text-align: center; font-size: 12px; color: #94A3B8;">
              Notification automatique générée par la plateforme APTIC-R.
            </td>
          </tr>
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
${params.profession ? `Profession : ${params.profession}\n` : ''}${params.skills ? `Compétences : ${params.skills.join(', ')}\n` : ''}
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
Notification automatique APTIC-R
  `.trim()

  return { subject, html, text }
}
