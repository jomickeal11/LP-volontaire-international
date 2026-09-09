import { readFileSync } from 'fs'
import { EmailService } from '../src/lib/email'
import { getEmailProvider } from '../src/lib/email'

// Chargement automatique des variables d'environnement locales
try {
  const envContent = readFileSync('.env', 'utf8')
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
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

async function main() {
  console.log("=======================================================")
  console.log("📨 TEST D'INTÉGRATION EMAIL TRANSACTIONNEL & MAILTRAP")
  console.log("=======================================================")

  const provider = getEmailProvider()
  console.log(`\n1. Fournisseur sélectionné : "${provider.name}"`)
  console.log(`   Hôte SMTP : ${process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io'}`)
  console.log(`   Port : ${process.env.MAIL_PORT || '2525'}`)
  console.log(`   Utilisateur : ${process.env.MAIL_USER ? '*** Configuré ***' : '(Non configuré - mode simulation console)'}`)
  console.log(`   Expéditeur (From) : ${process.env.MAIL_FROM || 'contact@aptic-rural.org'}`)
  console.log(`   Alerte Admin : ${process.env.MAIL_ADMIN || 'aptic.rural19@gmail.com'}`)

  console.log("\n2. Test d'envoi d'e-mail candidat (avec référence CAND-2026-XXXX)...")
  const candResult = await EmailService.sendCandidateApplicationEmails({
    firstName: "Alexandre",
    lastName: "Dupont",
    email: "alexandre.dupont@test-mailtrap.io",
    referenceNumber: "CAND-2026-78A1",
    country: "France",
    profession: "Développeur Web & Formateur",
    skills: ["Développement Web", "Pédagogie & Formation", "Gestion de projet"],
    arrivalDate: "15/10/2026",
    duration: "6 mois",
    lang: "FR",
  })
  console.log(`   ➔ E-mail Candidat envoyé : ${candResult.candidateEmailSent ? '✅ OUI' : '❌ NON'}`)
  console.log(`   ➔ Alerte Admin envoyée : ${candResult.adminEmailSent ? '✅ OUI' : '❌ NON'}`)

  console.log("\n3. Pause de régulation (rate-limit Mailtrap Sandbox)...")
  await new Promise((r) => setTimeout(r, 2000))

  console.log("\n4. Test d'envoi d'e-mail partenaire (avec référence PART-2026-XXXX)...")
  const partResult = await EmailService.sendPartnerRequestEmails({
    orgName: "Fondation Européenne pour le Volontariat Solidaire",
    contactPerson: "Dr. Marie Keller",
    email: "marie.keller@fondation-solidaire.eu",
    referenceNumber: "PART-2026-B4E9",
    country: "Allemagne",
    orgType: "Organisation Non Gouvernementale (ONG)",
    lang: "FR",
  })
  console.log(`   ➔ E-mail Partenaire envoyé : ${partResult.partnerEmailSent ? '✅ OUI' : '❌ NON'}`)
  console.log(`   ➔ Alerte Admin envoyée : ${partResult.adminEmailSent ? '✅ OUI' : '❌ NON'}`)

  console.log("\n=======================================================")
  console.log("🎉 TEST DU SERVICE D'EMAIL TERMINÉ AVEC SUCCÈS")
  console.log("=======================================================")
}

main().catch(console.error)
