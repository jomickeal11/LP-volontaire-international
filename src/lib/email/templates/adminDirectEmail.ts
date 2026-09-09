import {
  renderEmailHead,
  renderEmailHeader,
  renderEmailFooter,
} from "./emailTheme"

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
  const formattedHtmlParagraphs = message
    .split(/\r?\n/)
    .map((line) => line.trim())
    .map((line) =>
      line
        ? `<p style="margin: 0 0 14px 0; font-size: 14.5px; color: #183247; line-height: 1.6;" class="text-primary">${line}</p>`
        : `<div style="height: 8px;"></div>`
    )
    .join("")

  const html = `
<!DOCTYPE html>
<html lang="fr">
${renderEmailHead(subject)}
<body class="email-bg" style="margin: 0; padding: 0; background-color: #F5F7F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #183247; line-height: 1.6;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F5F7F9;" class="email-bg">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="580" style="max-width: 580px; width: 100%; background-color: #FFFFFF; border: 1px solid #EAF0F4; border-radius: 8px; overflow: hidden;" class="email-card border-line">
          ${renderEmailHeader("Coordination du Volontariat International")}

          <!-- Contenu du message -->
          <tr>
            <td style="padding: 32px 32px 24px 32px;">
              <h1 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #183247; line-height: 1.3;" class="text-primary">
                ${subject}
              </h1>

              <p style="margin: 0 0 16px 0; font-size: 15px; font-weight: 600; color: #183247;" class="text-primary">
                Bonjour ${candidateName},
              </p>

              <!-- Corps du message -->
              <div style="margin: 18px 0 24px 0;">
                ${formattedHtmlParagraphs}
              </div>

              <!-- Bloc signature directe du coordinateur -->
              <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #EAF0F4;" class="border-line">
                <div style="font-size: 14px; font-weight: 700; color: #183247;" class="text-primary">
                  ${adminName}
                </div>
                <div style="font-size: 12.5px; color: #5E6B76; margin-top: 2px;" class="text-secondary">
                  Association APTIC-R · Agbélouvé, Région Maritime, Togo
                </div>
              </div>
            </td>
          </tr>

          ${renderEmailFooter({
            customNote: "Ce message vous a été adressé directement par un membre de l'équipe de coordination APTIC-R. Vous pouvez y répondre en écrivant à contact@aptic-rural.org.",
          })}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
${subject}
==================================================

Bonjour ${candidateName},

${message}

--
${adminName}
Association APTIC-R · Agbélouvé, Région Maritime, Togo
Contact : contact@aptic-rural.org
  `.trim()

  return { subject, html, text }
}
