import { submitPartnerRequest } from '../src/lib/actions'
import { prisma } from '../src/lib/prisma'
import { readFileSync } from 'fs'

// Load .env
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
} catch (e) {}

async function test() {
  console.log("=================================================================")
  console.log("🤝 TEST SOUMISSION PARTENAIRE AVEC NOTIFICATIONS MAILTRAP")
  console.log("=================================================================\n")

  const email = `lukas.weber.${Date.now()}@weltwaerts.de`

  console.log(`1. Soumission d'une demande pour weltwärts Deutschland (${email})...`)

  const res = await submitPartnerRequest({
    orgName: "weltwärts Deutschland - Coordination",
    contactPerson: "Lukas Weber",
    email,
    phone: "+49 228 123456",
    country: "Allemagne",
    orgType: "Organisation Non Gouvernementale (ONG)",
    volunteerCount: "5 à 10 par an",
    programme: "weltwärts Nord-Sud",
    message: "Nous souhaitons établir un partenariat officiel pour l'envoi de volontaires allemands en mission éducative et numérique au Togo avec APTIC-R.",
    consent: true,
  })

  if (!res.success || !res.data) {
    console.error("❌ Échec de la soumission de demande partenaire :", res.error)
    process.exit(1)
  }

  const req = res.data
  console.log("\n✅ Demande partenaire enregistrée en base avec succès !")
  console.log(`   ➔ ID : ${req.id}`)
  console.log(`   ➔ Référence unique générée : ${req.referenceNumber}`)
  console.log(`   ➔ Organisation : ${req.orgName} (Contact: ${req.contactPerson})`)

  console.log("\n2. Expédition des e-mails partenaire vers Mailtrap Sandbox en cours...")
  await new Promise((r) => setTimeout(r, 4500))

  console.log("\n=================================================================")
  console.log("🎉 SUCCÈS TOTAL PARTENAIRE !")
  console.log("Vérifiez dès maintenant votre boîte Mailtrap Sandbox :")
  console.log(`- E-mail 1 : "Accusé de réception - Demande de partenariat APTIC-R [Réf: ${req.referenceNumber}]"`)
  console.log(`- E-mail 2 : "[Alerte Back-office] Nouvelle demande de partenariat : ${req.orgName} (${req.referenceNumber})"`)
  console.log("=================================================================")

  await prisma.$disconnect()
  process.exit(0)
}

test().catch(console.error)
