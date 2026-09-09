import { NextRequest, NextResponse } from "next/server"
import { renderCandidateConfirmationEmail } from "@/lib/email/templates/candidateConfirmation"
import { renderPartnerConfirmationEmail } from "@/lib/email/templates/partnerConfirmation"
import { renderAdminNotificationEmail } from "@/lib/email/templates/adminNotification"
import { renderAdminDirectEmail } from "@/lib/email/templates/adminDirectEmail"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "candidate"
  const theme = searchParams.get("theme") || "light"

  let email: { subject: string; html: string; text: string }

  switch (type) {
    case "partner":
      email = renderPartnerConfirmationEmail({
        orgName: "Fondation Solidarité Numérique",
        contactPerson: "Dr. Marc Valadier",
        referenceNumber: "PART-2026-F41A",
        country: "France",
        orgType: "ONG Internationale",
        lang: "FR",
      })
      break

    case "admin":
      email = renderAdminNotificationEmail({
        type: "CANDIDATE",
        referenceNumber: "CAND-2026-89B2",
        name: "Sophie Laurent",
        email: "sophie.laurent@example.com",
        country: "Belgique",
        profession: "Ingénieure Systèmes & Réseaux",
        skills: ["Administration Linux", "Formation", "Réseaux locaux"],
      })
      break

    case "direct":
      email = renderAdminDirectEmail({
        candidateName: "Jordan",
        subject: "Suite de votre candidature au volontariat - Entretien vidéo",
        message: `j'espère que cette note te trouve en pleine forme

Nous avons bien étudié votre dossier pour le programme de volontariat international à Agbélouvé.
Vos compétences correspondent parfaitement aux besoins de formation de nos jeunes.

Seriez-vous disponible pour un court entretien vidéo ce jeudi à 14h00 ?`,
        adminName: "Kossi Amouzou",
      })
      break

    case "candidate":
    default:
      email = renderCandidateConfirmationEmail({
        firstName: "Jordan",
        lastName: "Mickeal",
        referenceNumber: "CAND-2026-89B2",
        arrivalDate: "01/11/2026",
        duration: "6 mois",
        lang: "FR",
      })
      break
  }

  // Barre de navigation d'aperçu
  const previewNav = `
  <div style="position: sticky; top: 0; left: 0; right: 0; z-index: 9999; background: #174F7A; color: #FFFFFF; padding: 10px 16px; font-family: -apple-system, sans-serif; font-size: 13px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
    <div style="display: flex; gap: 8px; align-items: center;">
      <span style="font-weight: 700; margin-right: 8px;">Aperçu Email :</span>
      <a href="/api/email-preview?type=candidate&theme=${theme}" style="color: ${type === "candidate" ? "#35A85A" : "#FFFFFF"}; background: ${type === "candidate" ? "#FFFFFF" : "transparent"}; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-weight: 600;">1. Candidat</a>
      <a href="/api/email-preview?type=direct&theme=${theme}" style="color: ${type === "direct" ? "#35A85A" : "#FFFFFF"}; background: ${type === "direct" ? "#FFFFFF" : "transparent"}; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-weight: 600;">2. Message direct</a>
      <a href="/api/email-preview?type=partner&theme=${theme}" style="color: ${type === "partner" ? "#35A85A" : "#FFFFFF"}; background: ${type === "partner" ? "#FFFFFF" : "transparent"}; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-weight: 600;">3. Partenaire</a>
      <a href="/api/email-preview?type=admin&theme=${theme}" style="color: ${type === "admin" ? "#35A85A" : "#FFFFFF"}; background: ${type === "admin" ? "#FFFFFF" : "transparent"}; padding: 4px 10px; border-radius: 4px; text-decoration: none; font-weight: 600;">4. Alerte Interne</a>
    </div>
    <div style="display: flex; gap: 8px; align-items: center;">
      <span style="font-size: 12px; opacity: 0.85;">Fond :</span>
      <a href="/api/email-preview?type=${type}&theme=light" style="color: ${theme === "light" ? "#174F7A" : "#FFFFFF"}; background: ${theme === "light" ? "#FFFFFF" : "rgba(255,255,255,0.2)"}; padding: 3px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: 600;">Clair</a>
      <a href="/api/email-preview?type=${type}&theme=dark" style="color: ${theme === "dark" ? "#174F7A" : "#FFFFFF"}; background: ${theme === "dark" ? "#FFFFFF" : "rgba(255,255,255,0.2)"}; padding: 3px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: 600;">Sombre (Gmail)</a>
    </div>
  </div>
  `

  let finalHtml = email.html.replace("<body", `${previewNav}<body`)
  if (theme === "dark") {
    finalHtml = finalHtml.replace(
      `<body style="`,
      `<body style="background-color: #1f1f1f !important; color: #f1f1f1 !important; `
    )
  }

  return new NextResponse(finalHtml, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  })
}
