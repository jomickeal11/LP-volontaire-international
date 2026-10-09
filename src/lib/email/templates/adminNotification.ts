import { wrapEmailHtml, renderEmailTextFooter } from "./emailTheme"
import { formatTextToHtml, escapeHtml } from "../variableEngine"
import { getSiteUrl } from "@/lib/seo"

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
  const siteUrl = getSiteUrl()

  // Données issues de formulaires publics : échappées avant intégration au HTML.
  const handledReferenceNumber = escapeHtml(params.referenceNumber)
  const handledEmail = escapeHtml(params.email)
  const handledCountry = escapeHtml(params.country)
  const handledName = isCandidate ? escapeHtml(params.name) : ""
  const handledProfession = isCandidate ? escapeHtml(params.profession) : ""
  const handledSkills = isCandidate && params.skills?.length
    ? escapeHtml(params.skills.join(", "))
    : ""
  const handledOrgName = isCandidate ? "" : escapeHtml(params.orgName)
  const handledContactPerson = isCandidate ? "" : escapeHtml(params.contactPerson)
  const handledOrgType = isCandidate ? "" : escapeHtml(params.orgType)

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
• Nom : ${handledName}
• Email : ${handledEmail}
• Pays : ${handledCountry}${handledProfession ? `\n• Profession : ${handledProfession}` : ""}${handledSkills ? `\n• Compétences : ${handledSkills}` : ""}
• Référence : ${handledReferenceNumber}

Lien d'accès au dossier dans le Back-office :
${backofficeUrl}

Vous pouvez consulter et gérer ce dossier directement depuis l'espace d'administration.`
    : `Bonjour,

Une nouvelle demande de partenariat a été enregistrée sur le portail APTIC-R.

Détails de l'organisation :
• Organisation : ${handledOrgName}
• Contact référent : ${handledContactPerson}
• Email : ${handledEmail}
• Pays : ${handledCountry}
• Type de structure : ${handledOrgType}
• Référence : ${handledReferenceNumber}

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
