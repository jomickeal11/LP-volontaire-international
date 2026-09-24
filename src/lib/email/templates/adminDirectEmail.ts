import { wrapEmailHtml, renderEmailTextFooter } from "./emailTheme"
import { formatTextToHtml } from "../variableEngine"

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

  const greeting = {
    FR: `Bonjour ${candidateName},`,
    EN: `Dear ${candidateName},`,
    DE: `Guten Tag ${candidateName},`,
  }[currentLang]

  const bodyContent = `${greeting}\n\n${message}`

  const html = wrapEmailHtml(formatTextToHtml(bodyContent), currentLang)
  const textFooter = renderEmailTextFooter({
    lang: currentLang,
    customNote: `Message direct transmis par ${adminName}.`,
  })
  const text = `${bodyContent}\n\n${textFooter}`.trim()

  return { subject, html, text }
}
