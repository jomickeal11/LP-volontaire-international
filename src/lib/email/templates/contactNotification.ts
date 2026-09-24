import { wrapEmailHtml, renderEmailTextFooter } from "./emailTheme"
import { formatTextToHtml } from "../variableEngine"

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

  const subjectText = subjectLabelMap[params.subject] || params.subject || "Demande de contact"
  const emailSubject = "APTIC-R — Nouveau message de contact"

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://aptic-rural.org"
  const backofficeUrl = `${siteUrl}/backoffice/messages`

  const bodyContent = `Bonjour,

Vous avez reçu un nouveau message de ${params.name} depuis le formulaire de contact du site APTIC-R.

Coordonnées de l'expéditeur :
• Nom : ${params.name}
• Email : ${params.email}${params.phone ? `\n• Téléphone / WhatsApp : ${params.phone}` : ""}${params.organization ? `\n• Organisation : ${params.organization}` : ""}
• Objet : ${subjectText}

Message :
${params.message}

Lien d'accès aux messages dans le Back-office :
${backofficeUrl}

Vous pouvez répondre directement à cet email pour lui écrire.`

  const html = wrapEmailHtml(
    formatTextToHtml(bodyContent),
    "FR",
    "Notification interne automatique destinée à la coordination APTIC-R."
  )
  const textFooter = renderEmailTextFooter({
    lang: "FR",
    customNote: "Notification interne automatique destinée à la coordination APTIC-R.",
  })
  const text = `${bodyContent}\n\n${textFooter}`.trim()

  return {
    subject: emailSubject,
    html,
    text,
  }
}
