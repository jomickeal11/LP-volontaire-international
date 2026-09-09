import { readFileSync } from "fs"
import { getEmailProvider } from "../src/lib/email"
import { renderCandidateConfirmationEmail } from "../src/lib/email/templates/candidateConfirmation"

// Chargement des variables d'environnement locales
try {
  const envContent = readFileSync(".env", "utf8")
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const idx = trimmed.indexOf("=")
    if (idx !== -1) {
      const key = trimmed.substring(0, idx).trim()
      let val = trimmed.substring(idx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1)
      }
      process.env[key] = val
    }
  }
} catch {}

async function run() {
  const emailData = renderCandidateConfirmationEmail({
    firstName: "Jordan",
    lastName: "Mickeal",
    referenceNumber: "CAND-2026-89B2",
    arrivalDate: "01/11/2026",
    duration: "6 mois",
    lang: "FR",
  })

  const provider = getEmailProvider()
  console.log("Envoi d'un e-mail unique de test vers votre Sandbox Mailtrap...")
  const res = await provider.sendEmail({
    to: "jordan@aptic-rural.org",
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text,
  })

  if (res.success) {
    console.log("✅ E-mail envoyé avec succès ! Message ID:", res.messageId)
  } else {
    console.error("❌ Erreur lors de l'envoi :", res.error)
  }
}

run()
