import { submitCandidateApplication } from '../src/lib/actions'
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
  console.log("🚀 TEST SOUMISSION RÉELLE DE CANDIDATURE AVEC MAILTRAP SANDBOX")
  console.log("=================================================================\n")

  const email = `sophie.laurent.${Date.now()}@volunteer-europe.org`

  console.log(`1. Soumission d'une candidature pour Sophie Laurent (${email})...`)

  const res = await submitCandidateApplication({
    firstName: "Sophie",
    lastName: "Laurent",
    email,
    phone: "+33 6 12 34 56 78",
    country: "France",
    city: "Lyon",
    dob: "1997-06-15",
    education: "Master en Ingénierie Pédagogique et Numérique",
    fieldOfStudy: "Technologies Éducatives",
    profession: "Ingénieure pédagogique",
    experience: "TWO_TO_FIVE_YEARS",
    digitalSkillLevel: "EXPERT",
    languages: JSON.stringify({ french: "C2", english: "C1" }),
    skills: ["Formation & Enseignement", "Développement Web", "Communication digitale"],
    cvFile: "cv_sophie_laurent.pdf",
    motivationFile: "lm_sophie_laurent.pdf",
    arrivalDate: "2026-10-15",
    duration: "SIX_MONTHS",
    motivation: "Je souhaite vivement mettre mes compétences en ingénierie pédagogique et outils numériques au service des jeunes et formateurs d'Agbélouvé dans le cadre des missions de l'association APTIC-R au Togo.",
    projectExp: "J'ai coordonné des projets de formation au numérique auprès d'associations locales et développé des modules d'apprentissage libres et accessibles.",
    source: "France Volontaires",
    consent: true,
  }, "FR")

  if (!res.success || !res.data) {
    console.error("❌ Échec de la soumission de candidature :", res.error)
    process.exit(1)
  }

  const app = res.data
  console.log("\n✅ Candidature enregistrée en base PostgreSQL avec succès !")
  console.log(`   ➔ ID Candidature : ${app.id}`)
  console.log(`   ➔ Référence unique générée : ${app.referenceNumber}`)
  console.log(`   ➔ Candidat : ${app.candidate.firstName} ${app.candidate.lastName} (${app.candidate.email})`)
  console.log(`   ➔ Pays : ${app.candidate.country}`)

  // Attendre 3.5s pour laisser le temps aux deux e-mails (candidat + alerte admin) d'être expédiés vers Mailtrap
  console.log("\n2. Expédition des e-mails transactionnels vers Mailtrap Sandbox en cours...")
  await new Promise((r) => setTimeout(r, 4500))

  console.log("\n=================================================================")
  console.log("🎉 SUCCÈS TOTAL !")
  console.log("Vérifiez dès maintenant votre boîte Mailtrap Sandbox :")
  console.log(`- E-mail 1 : "Confirmation de candidature APTIC-R [Réf: ${app.referenceNumber}]"`)
  console.log(`- E-mail 2 : "[Alerte Back-office] Nouvelle candidature : Sophie Laurent (${app.referenceNumber})"`)
  console.log("=================================================================")

  await prisma.$disconnect()
  process.exit(0)
}

test().catch(console.error)
