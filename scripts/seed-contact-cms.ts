import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Seed Contact CMS
 *
 * Politique de peuplement :
 *   - Seules les données validées par APTIC-R sont insérées.
 *   - Les emails de routage spécialisés ne sont PAS peuplés
 *     (doivent être configurés manuellement dans le back-office
 *      après validation APTIC-R).
 *   - Le contact validé est : aptic.rural19@gmail.com / +228 91 20 19 90
 */

// ── Contenu public multilingue (traduisible) ─────────────────────────────

const CONTACT_CONTENT = {
  FR: {
    contact_access_info:
      "À 65 km au nord de Lomé sur la route nationale RN1 (axe Lomé–Tsévié–Atakpamé).",
    contact_hours_week: "Lundi – Vendredi : 08h00 – 18h00 GMT",
    contact_hours_sat: "Samedi : 09h00 – 14h00 (Ateliers jeunes)",
    contact_hours_sun: "Dimanche : Fermé",
  },
  EN: {
    contact_access_info:
      "Located 65 km north of Lomé along National Highway RN1 (Lomé–Tsévié–Atakpamé route).",
    contact_hours_week: "Monday – Friday: 08:00 – 18:00 GMT",
    contact_hours_sat: "Saturday: 09:00 – 14:00 (Youth workshops)",
    contact_hours_sun: "Sunday: Closed",
  },
  DE: {
    contact_access_info:
      "65 km nördlich von Lomé an der Nationalstraße RN1 (Strecke Lomé–Tsévié–Atakpamé).",
    contact_hours_week: "Montag – Freitag: 08:00 – 18:00 Uhr GMT",
    contact_hours_sat: "Samstag: 09:00 – 14:00 Uhr (Jugendworkshops)",
    contact_hours_sun: "Sonntag: Geschlossen",
  },
}

// ── Configuration (non traduisible) ──────────────────────────────────────
//    GPS et zoom laissés vides : doivent être validés par APTIC-R.
//    Emails de routage spécialisés laissés vides : doivent être configurés
//    dans le back-office après validation.
//    Seul le contact_form_recipient est initialisé (email validé).

const CONTACT_CONFIG: Record<string, string> = {
  contact_form_recipient: "aptic.rural19@gmail.com",
  // contact_map_lat: "",          // à compléter dans le back-office
  // contact_map_lng: "",          // à compléter dans le back-office
  // contact_map_zoom: "",         // défaut géré dans le code (13)
  // contact_map_label: "",        // à compléter dans le back-office
  // contact_email_general: "",    // à valider par APTIC-R
  // contact_email_volunteer: "",  // à valider par APTIC-R
  // contact_email_partnership: "",// à valider par APTIC-R
  // contact_email_direction: "",  // à valider par APTIC-R
}

async function main() {
  console.log("🔧 Seeding Contact CMS settings…")
  let count = 0

  // 1. Contenu multilingue
  for (const [lang, fields] of Object.entries(CONTACT_CONTENT)) {
    const suffix = lang.toLowerCase()
    for (const [baseKey, value] of Object.entries(fields)) {
      const key = `${baseKey}_${suffix}`
      await prisma.parametreSite.upsert({
        where: { key: key },
        update: { value: value, group: "CONTACT" },
        create: { key: key, value: value, group: "CONTACT" },
      })
      count++
      console.log(`  ✓ ${key}`)
    }
  }

  // 2. Configuration non traduisible
  for (const [key, value] of Object.entries(CONTACT_CONFIG)) {
    await prisma.parametreSite.upsert({
      where: { key: key },
      update: { value: value, group: "CONTACT" },
      create: { key: key, value: value, group: "CONTACT" },
    })
    count++
    console.log(`  ✓ ${key}`)
  }

  console.log(`\n✅ Contact CMS : ${count} paramètres peuplés.`)
  console.log("")
  console.log("⚠️  Les champs suivants doivent être complétés dans le back-office :")
  console.log("   - Coordonnées GPS (latitude, longitude)")
  console.log("   - Nom du lieu sur la carte")
  console.log("   - Emails de routage par service (après validation APTIC-R)")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
