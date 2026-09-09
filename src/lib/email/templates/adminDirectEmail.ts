import {
  renderEmailHead,
  renderEmailHeader,
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
        ? `<p style="margin: 0 0 14px 0; font-size: 15px; line-height: 1.6;">${line}</p>`
        : `<div style="height: 10px;"></div>`
    )
    .join("")

  const html = `
<!DOCTYPE html>
<html lang="fr">
${renderEmailHead(subject)}
<body style="margin: 0; padding: 24px 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #183247;">
  <div style="max-width: 580px; margin: 0 auto;" class="email-wrap">
    ${renderEmailHeader()}

    <p style="margin: 0 0 16px 0;">
      Bonjour ${candidateName},
    </p>

    ${formattedHtmlParagraphs}

    <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #E2E8F0; font-size: 13px; line-height: 1.6; color: #64748B;" class="border-line muted-text">
      --<br>
      <strong>${adminName}</strong><br>
      Coordination du Programme de Volontariat International<br>
      Association APTIC-R · Agbélouvé, Région Maritime, Togo<br>
      Tél. / WhatsApp : <a href="tel:+22891201990" style="color: inherit; text-decoration: underline;">+228 91 20 19 90</a><br>
      Email : <a href="mailto:contact@aptic-rural.org" style="color: inherit; text-decoration: underline;">contact@aptic-rural.org</a>
    </div>
  </div>
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
Coordination du Programme de Volontariat International
Association APTIC-R · Agbélouvé, Région Maritime, Togo
Tél. / WhatsApp : +228 91 20 19 90
Email : contact@aptic-rural.org
  `.trim()

  return { subject, html, text }
}
