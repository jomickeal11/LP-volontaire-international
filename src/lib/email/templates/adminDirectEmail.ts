interface AdminDirectEmailParams {
  candidateName: string
  subject: string
  message: string
  adminName?: string
}

export function renderAdminDirectEmail({
  candidateName,
  subject,
  message,
  adminName = "Coordination APTIC-R",
}: AdminDirectEmailParams): { subject: string; html: string; text: string } {
  const formattedHtmlMessage = message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) => (line ? `<p style="margin: 0 0 12px 0; color: #1E293B; font-size: 15px; line-height: 1.6;">${line}</p>` : `<div style="height: 8px;"></div>`))
    .join("")

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F7F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B; line-height: 1.6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F7F9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #174F7A 0%, #0F3554 100%); padding: 28px 32px; text-align: left;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="font-size: 22px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">APTIC-R</div>
                    <div style="color: #94A3B8; font-size: 12px; font-weight: 500; margin-top: 3px; text-transform: uppercase; letter-spacing: 0.8px;">Programme Volontariat International · Togo</div>
                  </td>
                  <td align="right">
                    <span style="background-color: rgba(53, 168, 90, 0.2); border: 1px solid rgba(53, 168, 90, 0.4); color: #FFFFFF; font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 20px;">Message officiel</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 600; color: #0F172A;">Bonjour ${candidateName},</p>
              
              <div style="background-color: #F8FAFC; border-left: 4px solid #174F7A; border-radius: 0 8px 8px 0; padding: 20px 24px; margin-bottom: 28px;">
                ${formattedHtmlMessage}
              </div>

              <div style="margin-top: 24px; padding-top: 20px; border-top: 1px solid #F1F5F9;">
                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #0F172A;">${adminName}</p>
                <p style="margin: 0; font-size: 13px; color: #64748B;">Association APTIC-R · Agbélouvé, Région Maritime, Togo</p>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #94A3B8;">Email : <a href="mailto:contact@aptic-rural.org" style="color: #174F7A; text-decoration: none;">contact@aptic-rural.org</a></p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 18px 32px; text-align: center; font-size: 12px; color: #94A3B8;">
              Ce message vous est adressé par la coordination du programme de volontariat international d'APTIC-R.
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
APTIC-R - Volontariat International au Togo
--------------------------------------------------

Bonjour ${candidateName},

${message}

--
${adminName}
Association APTIC-R · Agbélouvé, Région Maritime, Togo
Contact : contact@aptic-rural.org
  `.trim()

  return { subject, html, text }
}
