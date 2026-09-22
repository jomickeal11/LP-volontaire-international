import { prisma } from "../src/lib/prisma"
import { getContactRoutingRecipient, submitContactMessageAction } from "../src/lib/contact-actions"

async function runRoutingTests() {
  console.log("🧪 === TEST DE ROUTAGE DES EMAILS DE CONTACT ===\n")

  // 1. Test 1 : Sans configuration spécialisée, tout motif replie sur contact_form_recipient
  const defaultGeneral = await getContactRoutingRecipient("GENERAL")
  const defaultVolunteer = await getContactRoutingRecipient("VOLONTARIAT")
  const defaultPartnership = await getContactRoutingRecipient("PARTENARIAT")
  const defaultDirection = await getContactRoutingRecipient("DIRECTION")

  console.log(`1. Routage par défaut et repli interne automatique :`)
  console.log(`   - GENERAL → ${defaultGeneral} (attendu: aptic.rural19@gmail.com)`)
  console.log(`   - VOLONTARIAT → ${defaultVolunteer} (attendu: aptic.rural19@gmail.com)`)
  console.log(`   - PARTENARIAT → ${defaultPartnership} (attendu: aptic.rural19@gmail.com)`)
  console.log(`   - DIRECTION → ${defaultDirection} (attendu: aptic.rural19@gmail.com)`)

  if (
    defaultGeneral !== "aptic.rural19@gmail.com" ||
    defaultVolunteer !== "aptic.rural19@gmail.com" ||
    defaultPartnership !== "aptic.rural19@gmail.com" ||
    defaultDirection !== "aptic.rural19@gmail.com"
  ) {
    throw new Error("❌ Échec test 1 : Le repli interne par défaut ne correspond pas à contact_form_recipient.")
  }
  console.log("   ✅ Test 1 validé : Aucun message perdu, repli interne automatique opérationnel.\n")

  // 2. Test 2 : Modification de contact_form_recipient (l'adresse de secours universelle)
  console.log(`2. Test modification contact_form_recipient vers 'nouveau-destinataire@test.org' :`)
  await prisma.parametreSite.update({
    where: { key: "contact_form_recipient" },
    data: { value: "nouveau-destinataire@test.org" },
  })

  // Vérifier qu'une demande de volontariat sans adresse spécialisée prend la nouvelle adresse générale
  const resFallbackVolunteer = await submitContactMessageAction({
    name: "Jean Dupont",
    email: "jean.dupont@test.org",
    subject: "VOLONTARIAT",
    message: "Bonjour, ceci est un test de repli interne pour volontariat vers contact_form_recipient.",
    consent: true,
    lang: "FR",
  })
  console.log(`   - Résultat envoi : ${resFallbackVolunteer.success ? "Succès" : "Échec"}`)
  console.log(`   - VOLONTARIAT sans adresse dédiée acheminé vers : ${resFallbackVolunteer.routedTo} (attendu: nouveau-destinataire@test.org)`)

  if (resFallbackVolunteer.routedTo !== "nouveau-destinataire@test.org") {
    throw new Error("❌ Échec test 2 : Le message n'a pas été acheminé vers le fallback de secours.")
  }
  console.log("   ✅ Test 2 validé : Sécurisation du repli interne confirmée.\n")

  // 3. Test 3 : Configuration d'adresses spécialisées (avec renommage PARTENARIAT -> contact_email_partnership)
  console.log(`3. Test routage spécialisé par service (avec contact_email_partnership) :`)
  await prisma.parametreSite.upsert({
    where: { key: "contact_email_volunteer" },
    update: { value: "routing-volontariat@test.org", group: "CONTACT" },
    create: { key: "contact_email_volunteer", value: "routing-volontariat@test.org", group: "CONTACT" },
  })
  await prisma.parametreSite.upsert({
    where: { key: "contact_email_partnership" },
    update: { value: "routing-partenariat@test.org", group: "CONTACT" },
    create: { key: "contact_email_partnership", value: "routing-partenariat@test.org", group: "CONTACT" },
  })
  await prisma.parametreSite.upsert({
    where: { key: "contact_email_direction" },
    update: { value: "routing-direction@test.org", group: "CONTACT" },
    create: { key: "contact_email_direction", value: "routing-direction@test.org", group: "CONTACT" },
  })

  // 3a. Soumission Volontariat (adresse spécialisée configurée)
  const resVolontariat = await submitContactMessageAction({
    name: "Candidat Spécialisé",
    email: "candidat@test.org",
    subject: "VOLONTARIAT",
    message: "Demande sur le volontariat technique au FabLab.",
    consent: true,
    lang: "FR",
  })
  console.log(`   - VOLONTARIAT acheminé vers : ${resVolontariat.routedTo} (attendu: routing-volontariat@test.org)`)

  // 3b. Soumission Partenariat (contact_email_partnership configuré)
  const resPartenariat = await submitContactMessageAction({
    name: "Partenaire Institutionnel",
    email: "partenaire@test.org",
    subject: "PARTENARIAT",
    message: "Proposition de coopération décentralisée pour l'accès au numérique.",
    consent: true,
    lang: "FR",
  })
  console.log(`   - PARTENARIAT acheminé vers : ${resPartenariat.routedTo} (attendu: routing-partenariat@test.org)`)

  // 3c. Soumission Direction (contact_email_direction configuré)
  const resDirection = await submitContactMessageAction({
    name: "Délégué Direction",
    email: "direction-contact@test.org",
    subject: "DIRECTION",
    message: "Demande d'audience officielle.",
    consent: true,
    lang: "FR",
  })
  console.log(`   - DIRECTION acheminé vers : ${resDirection.routedTo} (attendu: routing-direction@test.org)`)

  if (
    resVolontariat.routedTo !== "routing-volontariat@test.org" ||
    resPartenariat.routedTo !== "routing-partenariat@test.org" ||
    resDirection.routedTo !== "routing-direction@test.org"
  ) {
    throw new Error("❌ Échec test 3 : Erreur dans le routage spécialisé.")
  }
  console.log("   ✅ Test 3 validé : Routage spécialisé et contact_email_partnership fonctionnels.\n")

  // 4. Nettoyage et restauration de l'état validé APTIC-R
  console.log("4. Nettoyage et restauration de l'état initial certifié APTIC-R...")
  await prisma.parametreSite.update({
    where: { key: "contact_form_recipient" },
    data: { value: "aptic.rural19@gmail.com" },
  })
  await prisma.parametreSite.deleteMany({
    where: {
      key: {
        in: ["contact_email_volunteer", "contact_email_partnership", "contact_email_direction"],
      },
    },
  })
  console.log("   ✅ Restauration terminée : contact_form_recipient = aptic.rural19@gmail.com")
  console.log("   ✅ Aucun faux email spécialisé stocké en base de données.\n")

  console.log("🎉 TOUS LES TESTS DE ROUTAGE ET DE SÉCURISATION SONT VALIDÉS AVEC SUCCÈS !")
}

runRoutingTests()
  .catch((err) => {
    console.error("Erreur durant les tests :", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
