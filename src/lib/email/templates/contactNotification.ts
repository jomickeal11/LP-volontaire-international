import { wrapEmailHtml, renderEmailTextFooter } from "./emailTheme"
import { formatTextToHtml, escapeHtml } from "../variableEngine"
import { getSiteUrl } from "@/lib/seo"

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

  const siteUrl = getSiteUrl()
  const backofficeUrl = `${siteUrl}/backoffice/messages`

  // Données issues du formulaire (non fiables) → échappées avant intégration au HTML
  const handledName = escapeHtml(params.name)
  const handledEmail = escapeHtml(params.email)
  const handledPhone = escapeHtml(params.phone)
  const handledOrg = escapeHtml(params.organization)
  const handledSubjectText = escapeHtml(subjectText)
  const handledMessage = escapeHtml(params.message)

  const bodyContent = `Bonjour,

Vous avez reçu un nouveau message de ${handledName} depuis le formulaire de contact du site APTIC-R.

Coordonnées de l'expéditeur :
• Nom : ${handledName}
• Email : ${handledEmail}${handledPhone ? `\n• Téléphone / WhatsApp : ${handledPhone}` : ""}${handledOrg ? `\n• Organisation : ${handledOrg}` : ""}
• Objet : ${handledSubjectText}

Message :
${handledMessage}

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
