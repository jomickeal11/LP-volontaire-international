import { wrapEmailHtml, renderEmailTextFooter } from "./emailTheme"
import { formatTextToHtml, escapeHtml } from "../variableEngine"

interface AdminDirectEmailParams {
  candidateName: string
  subject: string
  message: string
  adminName?: string
  lang?: "FR" | "EN" | "DE"
}

export function renderAdminDirectEmail({
  candidateName,
  subject,
  message,
  adminName = "Coordination APTIC-R",
  lang = "FR",
}: AdminDirectEmailParams): { subject: string; html: string; text: string } {
  const currentLang = (lang || "FR").toUpperCase() as "FR" | "EN" | "DE"

  // Le nom du candidat peut contenir du HTML saisi via le formulaire public :
  // il est échappé. Le message reste un contenu éditorial admin (HTML conservé).
  const safeCandidateName = escapeHtml(candidateName)
  const safeAdminName = escapeHtml(adminName)

  const greeting = {
    FR: `Bonjour ${safeCandidateName},`,
    EN: `Dear ${safeCandidateName},`,
    DE: `Guten Tag ${safeCandidateName},`,
  }[currentLang]

  const bodyContent = `${greeting}\n\n${message}`

  const html = wrapEmailHtml(formatTextToHtml(bodyContent), currentLang)
  const textFooter = renderEmailTextFooter({
    lang: currentLang,
    customNote: `Message direct transmis par ${safeAdminName}.`,
  })
  const text = `${bodyContent}\n\n${textFooter}`.trim()

  return { subject, html, text }
}
