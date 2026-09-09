import { writeFileSync, mkdirSync } from "fs"
import { join } from "path"
import { renderCandidateConfirmationEmail } from "../src/lib/email/templates/candidateConfirmation"
import { renderPartnerConfirmationEmail } from "../src/lib/email/templates/partnerConfirmation"
import { renderAdminNotificationEmail } from "../src/lib/email/templates/adminNotification"
import { renderAdminDirectEmail } from "../src/lib/email/templates/adminDirectEmail"

const outDir = join(process.cwd(), "scripts", "email-previews")
try {
  mkdirSync(outDir, { recursive: true })
} catch {}

const candidate = renderCandidateConfirmationEmail({
  firstName: "Sophie",
  lastName: "Laurent",
  referenceNumber: "CAND-2026-89B2",
  arrivalDate: "01/11/2026",
  duration: "6 mois",
  lang: "FR",
})

const partner = renderPartnerConfirmationEmail({
  orgName: "Fondation Solidarité Numérique",
  contactPerson: "Dr. Marc Valadier",
  referenceNumber: "PART-2026-F41A",
  country: "France",
  orgType: "ONG Internationale",
  lang: "FR",
})

const adminCandidateAlert = renderAdminNotificationEmail({
  type: "CANDIDATE",
  referenceNumber: "CAND-2026-89B2",
  name: "Sophie Laurent",
  email: "sophie.laurent@example.com",
  country: "Belgique",
  profession: "Ingénieure Systèmes & Réseaux",
  skills: ["Administration Linux", "Formation", "Réseaux locaux"],
})

const adminDirect = renderAdminDirectEmail({
  candidateName: "Sophie Laurent",
  subject: "Suite de votre candidature au volontariat - Entretien vidéo",
  message: `Nous avons bien étudié votre dossier et vos compétences en administration Linux et réseaux correspondent parfaitement à notre programme de formation à Agbélouvé.

Nous souhaiterions vous proposer un entretien vidéo de 30 minutes via Google Meet ce jeudi 15 septembre à 14h00 UTC.

Pourriez-vous nous confirmer votre disponibilité ?`,
  adminName: "Kossi Amouzou - Coordinateur Volontariat",
})

writeFileSync(join(outDir, "1-candidate-confirmation.html"), candidate.html, "utf8")
writeFileSync(join(outDir, "2-partner-confirmation.html"), partner.html, "utf8")
writeFileSync(join(outDir, "3-admin-notification.html"), adminCandidateAlert.html, "utf8")
writeFileSync(join(outDir, "4-admin-direct-email.html"), adminDirect.html, "utf8")

console.log("✅ 4 email HTML preview files successfully generated in scripts/email-previews/")
