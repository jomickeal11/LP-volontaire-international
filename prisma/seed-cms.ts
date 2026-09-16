import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Démarrage du seed CMS APTIC-R...")

  // 1. Les 6 Domaines d'intervention
  const domaines = [
    {
      slug: "inclusion-numerique",
      code: "INCLUSION_NUMERIQUE",
      nameFr: "Inclusion numérique & alphabétisation",
      nameEn: "Digital Inclusion & Literacy",
      nameDe: "Digitale Inklusion & Grundbildung",
      descFr: "Démocratiser l'accès aux outils numériques, initier les enfants, jeunes et femmes aux compétences informatiques fondamentales en milieu rural et périurbain.",
      descEn: "Democratizing access to digital tools, introducing children, youth, and women to fundamental computing skills in rural and peri-urban areas.",
      descDe: "Demokratisierung des Zugangs zu digitalen Werkzeugen, Heranführung von Kindern, Jugendlichen und Frauen an grundlegende Computerkenntnisse im ländlichen Raum.",
      icon: "💻",
      color: "#174F7A",
      order: 1,
    },
    {
      slug: "jeunesse-education",
      code: "JEUNESSE",
      nameFr: "Jeunesse, éducation & compétences d'avenir",
      nameEn: "Youth, Education & Future Skills",
      nameDe: "Jugend, Bildung & Zukunftskompetenzen",
      descFr: "Former les jeunes aux métiers du web, du design, du codage et de l'entrepreneuriat numérique pour favoriser l'employabilité locale et freiner l'exode rural.",
      descEn: "Training young people in web technologies, design, coding, and digital entrepreneurship to foster local employability and prevent rural exodus.",
      descDe: "Ausbildung junger Menschen in Webtechnologien, Design, Programmierung und digitalem Unternehmertum zur Förderung lokaler Beschäftigung.",
      icon: "🚀",
      color: "#35A85A",
      order: 2,
    },
    {
      slug: "cybersecurite-hygiene",
      code: "CYBERSECURITE",
      nameFr: "Cybersécurité & citoyenneté numérique",
      nameEn: "Cybersecurity & Digital Citizenship",
      nameDe: "Cybersicherheit & digitale Bürgerschaft",
      descFr: "Sensibiliser aux risques d'Internet, protéger les données personnelles, lutter contre la désinformation et promouvoir les bonnes pratiques d'hygiène numérique.",
      descEn: "Raising awareness of online risks, protecting personal data, fighting disinformation, and promoting digital hygiene best practices.",
      descDe: "Sensibilisierung für Onlinerisiken, Schutz personenbezogener Daten, Bekämpfung von Desinformation und Förderung digitaler Hygiene.",
      icon: "🛡️",
      color: "#0F3452",
      order: 3,
    },
    {
      slug: "agri-lowtech",
      code: "AGRI_LOWTECH",
      nameFr: "Agriculture durable, écologie & Low-Tech",
      nameEn: "Sustainable Agriculture, Ecology & Low-Tech",
      nameDe: "Nachhaltige Landwirtschaft, Ökologie & Low-Tech",
      descFr: "Allier numérique sobre, énergie solaire, capteurs accessibles et techniques agro-écologiques pour soutenir les producteurs locaux et la résilience climatique.",
      descEn: "Combining frugal tech, solar energy, accessible sensors, and agro-ecological techniques to support local farmers and climate resilience.",
      descDe: "Verbindung von sparsamer Technologie, Solarenergie, zugänglichen Sensoren und agrarökologischen Methoden zur Unterstützung lokaler Bauern.",
      icon: "🌱",
      color: "#2E7D32",
      order: 4,
    },
    {
      slug: "data-innovation",
      code: "DATA_INNOVATION",
      nameFr: "Données ouvertes & innovation citoyenne",
      nameEn: "Open Data & Citizen Innovation",
      nameDe: "Offene Daten & Bürgerinnovation",
      descFr: "Cartographie participative (OpenStreetMap), collecte citoyenne de données locales et prototypage de solutions numériques d'intérêt général.",
      descEn: "Participatory mapping (OpenStreetMap), civic data collection, and prototyping digital solutions serving the public interest.",
      descDe: "Partizipative Kartierung (OpenStreetMap), Bürgerdatenerfassung und Prototyping digitaler Lösungen im öffentlichen Interesse.",
      icon: "📊",
      color: "#1976D2",
      order: 5,
    },
    {
      slug: "dev-rural-fablabs",
      code: "DEV_RURAL",
      nameFr: "Développement rural & FabLabs communautaires",
      nameEn: "Rural Development & Community FabLabs",
      nameDe: "Ländliche Entwicklung & Gemeinschafts-FabLabs",
      descFr: "Implanter des tiers-lieux d'apprentissage, de réparation, d'impression 3D et de fabrication numérique locale au service des communautés villageoises.",
      descEn: "Establishing community hubs for learning, repair, 3D printing, and local digital fabrication directly serving village communities.",
      descDe: "Aufbau von Gemeinschaftszentren für Lernen, Reparatur, 3D-Druck und lokale digitale Fertigung direkt in Dorfgemeinschaften.",
      icon: "⚙️",
      color: "#E65100",
      order: 6,
    },
  ]

  for (const d of domaines) {
    await prisma.domaine.upsert({
      where: { slug: d.slug },
      create: d,
      update: d,
    })
  }
  console.log(`✅ ${domaines.length} domaines d'intervention créés ou mis à jour.`)

  // 2. Catégories d'articles
  const categories = [
    { slug: "actualites", nameFr: "Actualités", nameEn: "News", nameDe: "Neuigkeiten", order: 1 },
    { slug: "projets-terrain", nameFr: "Projets & Terrain", nameEn: "Projects & Field", nameDe: "Projekte & Feld", order: 2 },
    { slug: "formations-evenements", nameFr: "Formations & Événements", nameEn: "Trainings & Events", nameDe: "Schulungen & Events", order: 3 },
    { slug: "communiques", nameFr: "Communiqués officiels", nameEn: "Official Press Releases", nameDe: "Offizielle Mitteilungen", order: 4 },
  ]

  for (const c of categories) {
    await prisma.categorieArticle.upsert({
      where: { slug: c.slug },
      create: c,
      update: c,
    })
  }
  console.log(`✅ ${categories.length} catégories d'articles créées ou mises à jour.`)

  // 3. Projets phares
  const inclusionDomaine = await prisma.domaine.findUnique({ where: { slug: "inclusion-numerique" } })
  const ruralDomaine = await prisma.domaine.findUnique({ where: { slug: "dev-rural-fablabs" } })
  const youthDomaine = await prisma.domaine.findUnique({ where: { slug: "jeunesse-education" } })

  const projets = [
    {
      slug: "fablab-rural-agbelouve",
      titleFr: "FabLab Rural d'Agbélouvé",
      titleEn: "Agbélouvé Rural FabLab",
      titleDe: "Ländliches FabLab Agbélouvé",
      summaryFr: "Création et animation du premier tiers-lieu de fabrication numérique et de formation technologique au cœur du village d'Agbélouvé.",
      summaryEn: "Establishment and operation of the first digital fabrication and tech training hub in the rural community of Agbélouvé.",
      summaryDe: "Einrichtung und Betrieb des ersten digitalen FabLab- und Technologie-Ausbildungszentrums in Agbélouvé.",
      descriptionFr: "Le FabLab d'Agbélouvé est un espace communautaire équipé d'ordinateurs reconditionnés, de connexion Internet satellitaire, d'imprimantes 3D et d'outils d'électronique libre. Il accueille quotidiennement écoliers, artisans, agriculteurs et jeunes en quête de formation pratique.",
      location: "Agbélouvé, Région Maritime",
      country: "Togo",
      status: "IN_PROGRESS",
      beneficiaries: "600+ jeunes et artisans formés par an",
      featured: true,
      order: 1,
      domaineId: ruralDomaine?.id,
    },
    {
      slug: "caravane-numerique-zio",
      titleFr: "Caravane Numérique des Écoles du Zio",
      titleEn: "Zio Schools Digital Caravan",
      titleDe: "Digitale Schulkarawane von Zio",
      summaryFr: "Ateliers mobiles d'initiation à l'informatique et aux sciences participatives dans les établissements scolaires isolés de la préfecture.",
      summaryEn: "Mobile workshops introducing basic computing and participatory science in remote schools across the prefecture.",
      summaryDe: "Mobile Workshops zur Einführung in Computer und partizipative Wissenschaften in abgelegenen Schulen.",
      descriptionFr: "Une équipe itinérante équipée de valises pédagogiques autonomes à énergie solaire sillonne les villages pour dispenser des modules de découverte numérique aux élèves et sensibiliser les enseignants aux ressources éducatives libres.",
      location: "Préfecture du Zio",
      country: "Togo",
      status: "IN_PROGRESS",
      beneficiaries: "12 écoles, 1 500+ élèves",
      featured: true,
      order: 2,
      domaineId: inclusionDomaine?.id,
    },
    {
      slug: "bootcamp-code-jeunes-filles",
      titleFr: "Bootcamp « Elles Codent pour le Changement »",
      titleEn: "Bootcamp 'Girls Code for Change'",
      titleDe: "Bootcamp 'Mädchen programmieren für Veränderung'",
      summaryFr: "Cycle intensif de 3 mois dédié à la formation au développement web et aux métiers du numérique pour les jeunes femmes togolaises.",
      summaryEn: "3-month intensive training program in web development and digital skills for young Togolese women.",
      summaryDe: "3-monatiges Intensivprogramm für Webentwicklung und digitale Berufe für junge Frauen in Togo.",
      descriptionFr: "Programme d'autonomisation économique et technologique visant à combler le fossé de genre dans le secteur technologique togolais. Les participantes réalisent des projets concrets pour des coopératives et associations locales.",
      location: "Agbélouvé & Lomé",
      country: "Togo",
      status: "COMPLETED",
      beneficiaries: "45 jeunes femmes diplômées",
      featured: true,
      order: 3,
      domaineId: youthDomaine?.id,
    },
  ]

  for (const p of projets) {
    await prisma.projet.upsert({
      where: { slug: p.slug },
      create: p,
      update: p,
    })
  }
  console.log(`✅ ${projets.length} projets phares créés ou mis à jour.`)

  // 4. Membres de l'équipe
  const equipe = [
    {
      name: "Kokouvi Mensah",
      roleFr: "Président & Fondateur",
      roleEn: "President & Founder",
      roleDe: "Präsident & Gründer",
      category: "DIRECTION",
      bioFr: "Ingénieur en systèmes d'information et militant engagé pour le désenclavement numérique des zones rurales ouest-africaines.",
      email: "direction@aptic-r.org",
      order: 1,
      active: true,
    },
    {
      name: "Afiwa Lawson",
      roleFr: "Coordinatrice des Programmes & Pédagogie",
      roleEn: "Program & Pedagogy Coordinator",
      roleDe: "Programm- & Pädagogikkoordinatorin",
      category: "COORDINATION",
      bioFr: "Spécialiste de l'éducation populaire et de la formation professionnelle, elle supervise le déploiement des formations et l'accueil des volontaires.",
      email: "programmes@aptic-r.org",
      order: 2,
      active: true,
    },
    {
      name: "Kodjo Agbodjan",
      roleFr: "Responsable Technique & FabLab",
      roleEn: "Technical & FabLab Lead",
      roleDe: "Technischer Leiter & FabLab",
      category: "FORMATION",
      bioFr: "Maker passionné, formateur en prototypage électronique, impression 3D et maintenance d'équipements informatiques reconditionnés.",
      email: "fablab@aptic-r.org",
      order: 3,
      active: true,
    },
  ]

  for (const m of equipe) {
    const existing = await prisma.membreEquipe.findFirst({ where: { name: m.name } })
    if (existing) {
      await prisma.membreEquipe.update({ where: { id: existing.id }, data: m })
    } else {
      await prisma.membreEquipe.create({ data: m })
    }
  }
  console.log(`✅ ${equipe.length} membres d'équipe créés ou mis à jour.`)

  // 5. Témoignages
  const temoignages = [
    {
      authorName: "Sarah M.",
      authorRole: "Volontaire internationale (France)",
      authorType: "VOLUNTEER",
      quoteFr: "Mon séjour de 6 mois à Agbélouvé avec APTIC-R a transformé ma vision de l'engagement solidaire. L'accueil de la communauté, la richesse des échanges humains et la fierté de voir des jeunes coder leurs premiers sites restent inoubliables.",
      rating: 5,
      featured: true,
      order: 1,
    },
    {
      authorName: "Kossi Amégan",
      authorRole: "Apprenant FabLab & Maraîcher",
      authorType: "BENEFICIARY",
      quoteFr: "Grâce aux ateliers Low-Tech du FabLab, nous avons appris à fabriquer un système d'irrigation goutte-à-goutte automatisé alimenté par un panneau solaire. Nos rendements ont augmenté sans gaspillage d'eau.",
      rating: 5,
      featured: true,
      order: 2,
    },
    {
      authorName: "Dr. Elom Kudzodzi",
      authorRole: "Représentant Partenaire ONG SoliTech",
      authorType: "PARTNER",
      quoteFr: "APTIC-R est un partenaire de terrain d'une rigueur et d'une authenticité exemplaires. Leurs projets répondent à des besoins concrets et mesurables, avec un ancrage communautaire d'une grande valeur.",
      rating: 5,
      featured: true,
      order: 3,
    },
  ]

  for (const t of temoignages) {
    const existing = await prisma.temoignage.findFirst({ where: { authorName: t.authorName } })
    if (existing) {
      await prisma.temoignage.update({ where: { id: existing.id }, data: t })
    } else {
      await prisma.temoignage.create({ data: t })
    }
  }
  console.log(`✅ ${temoignages.length} témoignages créés ou mis à jour.`)

  console.log("🎉 Seed CMS APTIC-R terminé avec succès !")
}

main()
  .catch((e) => {
    console.error("❌ Erreur de seed :", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
