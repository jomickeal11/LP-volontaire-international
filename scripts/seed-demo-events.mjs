/**
 * Jeu de données de DÉMONSTRATION pour le module « Événements & Formations ».
 *
 * Ces événements sont FICTIFS et servent uniquement à visualiser le site avec
 * du contenu. Ils sont volontairement marqués par un slug `demo-` :
 *
 * - pour les supprimer depuis l'interface : Back-office → Événements →
 *   bouton « Supprimer » sur chaque ligne (le plus simple) ;
 * - pour régénérer le jeu complet : `node scripts/seed-demo-events.mjs`
 *   (il ne supprime et ne recrée QUE les événements dont le slug commence
 *   par `demo-`, il ne touche à aucun autre enregistrement).
 *
 * Aucun lien ni e-mail n'est réellement joignable : le domaine réservé
 * `.example` (RFC 2606) ne peut pas exister sur Internet.
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const DEMO_PREFIX = "demo-"
const MAIL = "contact@demo.aptic-r.example"
const LINK = "https://demo.aptic-r.example"

const evenements = [
  // ── À VENIR ────────────────────────────────────────────────────────────────
  {
    slug: "demo-webinaire-inclusion-numerique",
    titleFr: "Webinaire : inclusion numérique en milieu rural",
    titleEn: "Webinar: digital inclusion in rural areas",
    titleDe: "Webinar: digitale Inklusion im ländlichen Raum",
    descriptionFr:
      "Ce webinaire présente des retours d'expérience de trois projets pilotes menés dans des communes rurales du Togo. Il s'adresse aux associations, aux élus locaux et aux porteurs de projet qui cherchent des méthodes concrètes pour rendre un service numérique accessible à tous.",
    descriptionEn:
      "This webinar shares the feedback from three pilot projects run in rural municipalities in Togo. It is aimed at associations, local elected officials and project leaders looking for practical ways to make a digital service accessible to everyone.",
    descriptionDe:
      "Diese Webpräsentation teilt die Erfahrungen aus drei Pilotprojekten in ländlichen Kommunen Togos. Sie richtet sich an Vereine, lokal gewählte Mandatsträger und Projektträger, die konkrete Wege suchen, um einen digitalen Dienst für alle zugänglich zu machen.",
    programmeFr:
      "15h00 Accueil et présentation de la démarche\n15h20 Panel : trois communes, trois usages du numérique\n16h10 Retour d'expérience du centre communautaire de Tsévié\n16h40 Questions-réponses et ressources",
    programmeEn:
      "15:00 Welcome and approach overview\n15:20 Panel: three municipalities, three digital uses\n16:10 Feedback from the Tsévié community centre\n16:40 Q&A and resources",
    programmeDe:
      "15:00 Begrüßung und Vorstellung des Ansatzes\n15:20 Podium: drei Kommunen, drei digitale Nutzungen\n16:10 Erfahrungsbericht aus dem Gemeindezentrum Tsévié\n16:40 Fragen und Ressourcen",
    category: "CONFERENCE",
    categoryOther: null,
    location: null,
    startDate: new Date("2026-10-08T15:00:00"),
    endDate: new Date("2026-10-08T17:00:00"),
    isOnline: true,
    meetingUrl: `${LINK}/visio/inclusion-numerique`,
    registrationUrl: `${LINK}/inscriptions/webinaire-inclusion`,
    registrationOpen: true,
    maxParticipants: 200,
    featuredImage: null,
    contactName: "Nathalie Adebayo",
    contactEmail: MAIL,
    contactPhone: "+228 90 12 34 56",
    publishedFr: true,
    publishedEn: false,
    publishedDe: true,
  },
  {
    slug: "demo-formation-gestion-numerique-associations",
    titleFr: "Formation certifiante à la gestion numérique des associations",
    titleEn: "Certified training in digital management for associations",
    titleDe: "Zertifizierte Schulung zum digitalen Management von Vereinen",
    descriptionFr:
      "Une semaine de formation intense pour outiller les gestionnaires d'associations à tenir leurs memberships, leurs dons et leurs rapports avec des outils simples et libres. La session se termine par l'attestation de compétences APTIC-R. Prérequis : savoir utiliser un ordinateur et un smartphone.",
    descriptionEn:
      "One intensive week to equip association managers with simple, open-source tools for membership, donations and reporting. The session ends with an APTIC-R skills certificate. Prerequisites: basic use of a computer and a smartphone.",
    descriptionDe:
      "Eine intensive Woche, die Vereinsmanager mit einfachen Open-Source-Werkzeugen für Mitgliedschaften, Spenden und Berichte ausstattet. Die Sitzung endet mit einem APTIC-R Kompetenzzertifikat. Voraussetzung: Grundkenntnisse in Computer und Smartphone.",
    programmeFr:
      "09h00 Accueil et diagnostics des besoins\n09h30 Module 1 : outils de base et logiciels libres\n11h30 Module 2 : gestion des adhérents et des cotisations\n14h00 Module 3 : suivi des dons et rapports d'activité\n16h30 Atelier libre et questions\nJ+1 Évaluation et remise des attestations",
    programmeEn:
      "09:00 Welcome and needs assessment\n09:30 Module 1: basic tools and open-source software\n11:30 Module 2: membership and dues management\n14:00 Module 3: donation tracking and activity reports\n16:30 Open lab and questions\nDay 2 Assessment and certificate handover",
    programmeDe:
      "09:00 Begrüßung und Bedarfsanalyse\n09:30 Modul 1: Grundwerkzeuge und Open-Source-Software\n11:30 Modul 2: Mitgliederverwaltung und Beiträge\n14:00 Modul 3: Spendenverfolgung und Tätigkeitsberichte\n16:30 Offenes Labor und Fragen\nTag 2 Bewertung und Zertifikatsübergabe",
    category: "TRAINING",
    categoryOther: null,
    location: "FabLab d'Agbélouvé, Lomé",
    startDate: new Date("2026-10-20T09:00:00"),
    endDate: new Date("2026-10-20T17:00:00"),
    isOnline: false,
    meetingUrl: null,
    registrationUrl: `${LINK}/inscriptions/formation-gestion`,
    registrationOpen: true,
    maxParticipants: 30,
    featuredImage: "/demo/cover-formation.svg",
    contactName: "Awa Koffi",
    contactEmail: MAIL,
    contactPhone: "+228 90 11 22 33",
    publishedFr: true,
    publishedEn: true,
    publishedDe: true,
  },
  {
    slug: "demo-formation-cybersecurite-associations",
    titleFr: "Formation à distance : cybersécurité pour associations",
    titleEn: "Remote training: cybersecurity for associations",
    titleDe: "Fernkurs: Cybersicherheit für Vereine",
    descriptionFr:
      "Session en ligne consacrée aux réflexes essentiels de sécurité numérique : mots de passe, sauvegardes, protection des données des bénéficiaires et des militants. Formée en français, la session alterne théorie courte et mise en pratique sur des cas réels.",
    descriptionEn:
      "An online session on essential digital security habits: passwords, backups, protecting beneficiary and member data. Short theory segments alternate with hands-on work on real cases.",
    descriptionDe:
      "Eine Onlinesitzung zu den wichtigsten digitalen Sicherheitsgewohnheiten: Passwörter, Backups, Schutz von Daten. Kurze Theorie wechselt sich mit praktischen Übungen ab.",
    programmeFr:
      "14h00 Menaces courantes et Adoption des bonnes pratiques\n15h00 Sauvegardes et gestion des accès\n16h00 Protection des données des bénéficiaires\n17h00 Plan d'action personnalisé",
    programmeEn: null,
    programmeDe: null,
    category: "TRAINING",
    categoryOther: null,
    location: null,
    startDate: new Date("2026-10-29T14:00:00"),
    endDate: new Date("2026-10-29T17:30:00"),
    isOnline: true,
    meetingUrl: `${LINK}/visio/cybersecurite`,
    registrationUrl: `${LINK}/inscriptions/cybersecurite`,
    registrationOpen: true,
    maxParticipants: 80,
    featuredImage: null,
    contactName: "Sègbé Dodzi",
    contactEmail: MAIL,
    contactPhone: null,
    publishedFr: true,
    publishedEn: false,
    publishedDe: false,
  },
  {
    slug: "demo-forum-territorial-numerique",
    titleFr: "Forum territorial du numérique",
    titleEn: "Territorial digital forum",
    titleDe: "Territoriales Digitalforum",
    descriptionFr:
      "Une journée d'échanges entre collectivités, associations et entreprises du numérique autour des services publics de proximité. Tables rondes, présentations de projets et rencontres professionnelles. Entrée libre sur inscription.",
    descriptionEn:
      "A full day of discussion between local authorities, associations and digital companies on local public services. Round tables, project presentations and professional networking. Free entry with registration.",
    descriptionDe:
      "Ein ganzer Tag Austausch zwischen Gemeinden, Vereinen und Digitalunternehmen zu lokalen öffentlichen Diensten. Runden Tische, Projektpräsentationen und Networking. Freier Eintritt mit Anmeldung.",
    programmeFr: null,
    programmeEn: null,
    programmeDe: null,
    category: "OTHER",
    categoryOther: "Forum territorial",
    location: "Centre communautaire de Kpalimé",
    startDate: new Date("2026-11-12T09:00:00"),
    endDate: new Date("2026-11-12T17:00:00"),
    isOnline: false,
    meetingUrl: null,
    registrationUrl: `${LINK}/inscriptions/forum-territorial`,
    registrationOpen: true,
    maxParticipants: null,
    featuredImage: null,
    contactName: null,
    contactEmail: MAIL,
    contactPhone: null,
    publishedFr: true,
    publishedEn: true,
    publishedDe: true,
  },
  {
    slug: "demo-hackathon-territoires-ruraux",
    titleFr: "Hackathon des territoires ruraux",
    titleEn: "Rural territories hackathon",
    titleDe: "Hackathon der ländlichen Territorien",
    descriptionFr:
      "Trente-six heures pour concevoir des prototypes numériques utiles au quotidien des populations rurales : agriculture, santé, transport ou éducation. Équipes de trois à cinq personnes, mentors techniques sur place, restitution devant un jury de partenaires.",
    descriptionEn:
      "Thirty-six hours to prototype digital tools useful to rural populations: agriculture, health, transport or education. Teams of three to five people, on-site technical mentors, and a final presentation to a partner jury.",
    descriptionDe:
      "36 Stunden, um digitale Prototypen zu entwickeln, die den ländlichen Bevölkerungen im Alltag helfen: Landwirtschaft, Gesundheit, Verkehr oder Bildung. Teams aus drei bis fünf Personen, technische Mentorinnen vor Ort und eine Abschlusspräsentation vor einer Jury.",
    programmeFr:
      "Vendredi 16h00 Ouverture et constitution des équipes\nSamedi 08h00 Développement, mentorat permanent\nSamedi 20h00 Nuit de travail et buffet\nDimanche 09h00 Finalisation des prototypes\nDimanche 14h00 Restitution devant le jury",
    programmeEn:
      "Friday 16:00 Opening and team formation\nSaturday 08:00 Development with continuous mentoring\nSaturday 20:00 Working night and buffet\nSunday 09:00 Prototype finalisation\nSunday 14:00 Presentation to the jury",
    programmeDe:
      "Freitag 16:00 Eröffnung und Teambildung\nSamstag 08:00 Entwicklung mit durchgehender Begleitung\nSamstag 20:00 Arbeitsnacht und Buffet\nSonntag 09:00 Fertigstellung der Prototypen\nSonntag 14:00 Präsentation vor der Jury",
    category: "HACKATHON",
    categoryOther: null,
    location: "FabLab d'Agbélouvé, Lomé",
    startDate: new Date("2026-12-03T16:00:00"),
    endDate: new Date("2026-12-04T18:00:00"),
    isOnline: false,
    meetingUrl: null,
    registrationUrl: `${LINK}/inscriptions/hackathon-2026`,
    registrationOpen: true,
    maxParticipants: 50,
    featuredImage: "/demo/cover-hackathon.svg",
    contactName: "Koffi Mensah",
    contactEmail: MAIL,
    contactPhone: "+228 90 45 67 89",
    publishedFr: true,
    publishedEn: true,
    publishedDe: true,
  },
  {
    slug: "demo-atelier-hybride-iot-agricole",
    titleFr: "Atelier hybride d'initiation à l'IoT agricole",
    titleEn: "Hybrid workshop: getting started with agricultural IoT",
    titleDe: "Hybrid-Werkstatt: Einstieg in landwirtschaftliches IoT",
    descriptionFr:
      "Un atelier pensé pour les participants sur place comme pour ceux qui suivent en direct. Au programme : capteurs d'humidité du sol, transmission par réseau low cost, et lecture des données sur un tableau de bord simple. Le matériel est fourni pour les exercices pratiques.",
    descriptionEn:
      "A workshop designed for on-site participants and remote followers alike. Covers soil moisture sensors, low-cost data transmission and reading data on a simple dashboard. Hardware is provided for the hands-on exercises.",
    descriptionDe:
      "Eine Werkstatt für Teilnehmende vor Ort und für Online-Zuschauer. Behandelt Bodensensoren, günstige Datenübertragung und die Auswertung in einem einfachen Dashboard. Die Hardware wird für die Übungen gestellt.",
    programmeFr:
      "09h00 Présentation des capteurs disponibles\n10h00 Branchement et calibration sur le terrain\n14h00 Transmission des données et tableau de bord\n16h00 Cas d'usage agricoles locaux",
    programmeEn: null,
    programmeDe: null,
    category: "WORKSHOP",
    categoryOther: null,
    location: "FabLab d'Agbélouvé, Lomé",
    startDate: new Date("2027-01-21T09:00:00"),
    endDate: new Date("2027-01-21T17:00:00"),
    isOnline: true,
    meetingUrl: `${LINK}/visio/iot-agricole`,
    registrationUrl: null,
    registrationOpen: false,
    maxParticipants: 25,
    featuredImage: null,
    contactName: "Nathalie Adebayo",
    contactEmail: MAIL,
    contactPhone: null,
    publishedFr: true,
    publishedEn: true,
    publishedDe: false,
  },

  // ── PASSÉS ─────────────────────────────────────────────────────────────────
  {
    slug: "demo-atelier-impression-3d",
    titleFr: "Atelier d'initiation à l'impression 3D",
    titleEn: "Getting started with 3D printing",
    titleDe: "Einstieg in den 3D-Druck",
    descriptionFr:
      "Une demi-journée pour découvrir l'impression 3D et repartir avec un objet imprimé. Formation destinée aux associations et aux débutants : n'être pas un expert en informatique n'est pas un obstacle, la session commence par les bases du modelage.",
    descriptionEn:
      "A half-day to discover 3D printing and leave with a printed object. Open to associations and complete beginners: the session starts with modelling basics.",
    descriptionDe:
      "Ein halber Tag, um den 3D-Druck kennenzulernen und mit einem gedruckten Objekt nach Hause zu gehen. Offen für Vereine und absolute Einsteiger: die Sitzung beginnt mit den Grundlagen.",
    programmeFr:
      "09h00 Panorama des imprimantes disponibles\n10h00 Modéliser un objet simple\n11h30 Impression, réglage et finition\n14h00 Impression du modèle personnel",
    programmeEn: null,
    programmeDe: null,
    category: "WORKSHOP",
    categoryOther: null,
    location: "FabLab d'Agbélouvé, Lomé",
    startDate: new Date("2026-06-18T09:00:00"),
    endDate: new Date("2026-06-18T14:00:00"),
    isOnline: false,
    meetingUrl: null,
    registrationUrl: null,
    registrationOpen: false,
    maxParticipants: 12,
    featuredImage: "/demo/cover-atelier.svg",
    contactName: "Awa Koffi",
    contactEmail: MAIL,
    contactPhone: null,
    publishedFr: true,
    publishedEn: true,
    publishedDe: true,
  },
  {
    slug: "demo-conference-egouvernement-rural",
    titleFr: "Conférence régionale sur l'e-gouvernement rural",
    titleEn: "Regional conference on rural e-government",
    titleDe: "Regionale Konferenz zum ländlichen E-Government",
    descriptionFr:
      "Une journée de réflexion avec des collectivités et des acteurs de la société civile sur l'état des services publics numériques dans les zones rurales du pays, et sur les conditions d'un déploiement réaliste.",
    descriptionEn:
      "A day of reflection with local authorities and civil-society technologists on the state of digital public services in rural areas, and the conditions for realistic deployment.",
    descriptionDe:
      "Ein Tag der Reflexion mit Gemeinden und zivilgesellschaftlichen Technologen über den Stand digitaler öffentlicher Dienste im ländlichen Raum.",
    programmeFr: null,
    programmeEn: null,
    programmeDe: null,
    category: "CONFERENCE",
    categoryOther: null,
    location: "Hôtel 2 Février, Lomé",
    startDate: new Date("2026-05-21T09:00:00"),
    endDate: new Date("2026-05-21T17:00:00"),
    isOnline: false,
    meetingUrl: null,
    registrationUrl: null,
    registrationOpen: false,
    maxParticipants: null,
    featuredImage: "/demo/cover-conference.svg",
    contactName: null,
    contactEmail: null,
    contactPhone: null,
    publishedFr: true,
    publishedEn: true,
    publishedDe: true,
  },
  {
    slug: "demo-ceremonie-remise-attestations-2026",
    titleFr: "Cérémonie de remise des attestations de formation",
    titleEn: "Training certificate award ceremony",
    titleDe: "Übergabe der Schulungszertifikate",
    descriptionFr:
      "Remise officielle des attestations aux participants des sessions de formation certifiante de l'année. La cérémonie est ouverte aux familles des participants et aux partenaires.",
    descriptionEn:
      "Official handover of certificates to the participants of this year's certified training sessions.",
    descriptionDe:
      "Offizielle Übergabe der Zertifikate an die Teilnehmenden der zertifizierten Schulungen dieses Jahres.",
    programmeFr: null,
    programmeEn: null,
    programmeDe: null,
    category: "CEREMONY",
    categoryOther: null,
    location: "FabLab d'Agbélouvé, Lomé",
    startDate: new Date("2026-07-10T10:00:00"),
    endDate: new Date("2026-07-10T12:00:00"),
    isOnline: false,
    meetingUrl: null,
    registrationUrl: null,
    registrationOpen: false,
    maxParticipants: null,
    featuredImage: "/demo/cover-ceremonie.svg",
    contactName: "Koffi Mensah",
    contactEmail: MAIL,
    contactPhone: null,
    publishedFr: true,
    publishedEn: true,
    publishedDe: true,
  },

  // ── BROUILLON (visible uniquement dans le Back-office) ──────────────────────
  {
    slug: "demo-journees-economie-sociale-numerique",
    titleFr: "Journées de l'économie sociale numérique",
    titleEn: "Digital social economy days",
    titleDe: "Tage der digitalen Sozialwirtschaft",
    descriptionFr:
      "Événement en préparation : deux journées de rencontres entre coopératives, associations et acteurs de l'économie sociale autour de la transformation numérique du secteur. Le programme est en cours de rédaction.",
    descriptionEn: null,
    descriptionDe: null,
    programmeFr: null,
    programmeEn: null,
    programmeDe: null,
    category: "WORKSHOP",
    categoryOther: null,
    location: "À confirmer",
    startDate: new Date("2027-03-05T09:00:00"),
    endDate: null,
    isOnline: false,
    meetingUrl: null,
    registrationUrl: null,
    registrationOpen: false,
    maxParticipants: null,
    featuredImage: null,
    contactName: null,
    contactEmail: null,
    contactPhone: null,
    publishedFr: false,
    publishedEn: false,
    publishedDe: false,
  },
]

const nettoyage = await prisma.evenement.deleteMany({
  where: { slug: { startsWith: DEMO_PREFIX } },
})
console.log(`Anciens événements de démonstration supprimés : ${nettoyage.count}`)

for (const data of evenements) {
  const langs = [data.publishedFr, data.publishedEn, data.publishedDe]
  await prisma.evenement.create({
    data: {
      ...data,
      // Cohérence avec le Back-office : publié = publié dans au moins une langue
      published: langs.some(Boolean),
    },
  })
}

const total = await prisma.evenement.count()
const demo = await prisma.evenement.count({ where: { slug: { startsWith: DEMO_PREFIX } } })
const publies = await prisma.evenement.count({ where: { slug: { startsWith: DEMO_PREFIX }, published: true } })

console.log(`Événements de démonstration créés : ${demo}`)
console.log(`  dont publiés : ${publies} — brouillons : ${demo - publies}`)
console.log(`Total événements en base : ${total}`)

await prisma.$disconnect()
