import { wrapEmailHtml, renderEmailTextFooter } from "./emailTheme"
import { formatTextToHtml } from "../variableEngine"

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
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://aptic-rural.org"

  const subject = isCandidate
    ? `APTIC-R — Nouvelle candidature — ${params.referenceNumber}`
    : `APTIC-R — Demande de partenariat — ${params.referenceNumber}`

  const backofficeUrl = isCandidate
    ? `${siteUrl}/backoffice/applications`
    : `${siteUrl}/backoffice/partners/requests`

  const bodyContent = isCandidate
    ? `Bonjour,

Une nouvelle candidature a été soumise sur le portail de volontariat international APTIC-R.

Coordonnées & détails du candidat :
• Nom : ${params.name}
• Email : ${params.email}
• Pays : ${params.country}${params.profession ? `\n• Profession : ${params.profession}` : ""}${params.skills && params.skills.length > 0 ? `\n• Compétences : ${params.skills.join(", ")}` : ""}
• Référence : ${params.referenceNumber}

Lien d'accès au dossier dans le Back-office :
${backofficeUrl}

Vous pouvez consulter et gérer ce dossier directement depuis l'espace d'administration.`
    : `Bonjour,

Une nouvelle demande de partenariat a été enregistrée sur le portail APTIC-R.

Détails de l'organisation :
• Organisation : ${params.orgName}
• Contact référent : ${params.contactPerson}
• Email : ${params.email}
• Pays : ${params.country}
• Type de structure : ${params.orgType}
• Référence : ${params.referenceNumber}

Lien d'accès à la demande dans le Back-office :
${backofficeUrl}

Vous pouvez consulter et traiter cette demande depuis le Back-office.`

  const html = wrapEmailHtml(
    formatTextToHtml(bodyContent),
    "FR",
    "Alerte automatique interne de coordination APTIC-R."
  )
  const textFooter = renderEmailTextFooter({
    lang: "FR",
    customNote: "Alerte automatique interne de coordination APTIC-R.",
  })
  const text = `${bodyContent}\n\n${textFooter}`.trim()

  return { subject, html, text }
}
