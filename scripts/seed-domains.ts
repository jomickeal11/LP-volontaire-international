import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const DOMAINES_DATA = [
  {
    code: "INCLUSION_NUMERIQUE",
    slug: "inclusion-numerique",
    nameFr: "Inclusion numérique",
    nameEn: "Digital Inclusion",
    nameDe: "Digitale Inklusion",
    subtitleFr: "Alphabétisation & Équipement solaire",
    subtitleEn: "Digital Literacy & Solar Labs",
    subtitleDe: "Alphabetisierung & Solarausstattung",
    tagLabel: "Pôle Stratégique",
    descFr:
      "L'alphabétisation numérique est aujourd'hui une compétence vitale au même titre que la lecture et l'écriture. Dans les villages reculés, l'absence de matériel et d'accompagnement creuse un fossé géographique profond. APTIC-R déploie des ateliers mobiles et équipe les écoles rurales pour que chacun acquière une véritable autonomie numérique.",
    descEn:
      "Digital literacy is now an essential skill. In remote villages, the lack of equipment widens geographical inequalities. APTIC-R runs mobile caravans and solar-powered labs to ensure genuine digital autonomy for everyone.",
    descDe:
      "Digitale Alphabetisierung ist heute eine grundlegende Fähigkeit. In abgelegenen Dörfern vertieft der Mangel an Ausstattung die Ungleichheit. APTIC-R betreibt mobile Workshops und stattet ländliche Schulen mit Solarlaboren aus.",
    objectivesFr: JSON.stringify([
      "Former chaque année plus de 1 000 élèves aux fondamentaux de l'informatique",
      "Équiper les écoles de village de parcs d'ordinateurs reconditionnés à énergie solaire",
      "Accompagner les adultes et commerçants vers l'autonomie sur les services en ligne",
    ]),
    objectivesEn: JSON.stringify([
      "Train over 1,000 students annually in computing fundamentals",
      "Equip rural schools with energy-efficient refurbished computer labs",
      "Help rural adults navigate digital administrative portals",
    ]),
    objectivesDe: JSON.stringify([
      "Jährlich über 1.000 Schüler in IT-Grundlagen ausbilden",
      "Dorfschulen mit solarbetriebenen Computern ausstatten",
      "Erwachsene bei der Nutzung von Online-Diensten begleiten",
    ]),
    actionsFr: JSON.stringify([
      "Caravane numérique itinérante dans les écoles rurales",
      "Ateliers hebdomadaires d'initiation et de bureautique au FabLab",
      "Mise à disposition de ressources éducatives hors-ligne (Kiwix)",
    ]),
    actionsEn: JSON.stringify([
      "Mobile digital caravan across rural schools",
      "Weekly community computer workshops at Agbélouvé FabLab",
      "Distribution of offline educational toolkits (Kiwix)",
    ]),
    actionsDe: JSON.stringify([
      "Reisende Digital-Karawane an ländlichen Schulen",
      "Wöchentliche Workshops für Einsteiger im FabLab",
      "Bereitstellung von Offline-Lernressourcen (Kiwix)",
    ]),
    targetAudienceFr: "Élèves, enseignants ruraux, artisans et commerçants locaux",
    targetAudienceEn: "Students, rural teachers, craftspeople, and market women",
    targetAudienceDe: "Schüler, ländliche Lehrkräfte, Handwerker und Händler",
    icon: "MonitorIcon",
    imageUrl: "/photo-ancrage-togo.png",
    imageCaptionFr: "Atelier d'alphabétisation numérique et équipement solaire à Agbélouvé",
    imageCaptionEn: "Digital literacy workshop and solar equipment in Agbélouvé",
    imageCaptionDe: "Digitaler Alphabetisierungs-Workshop und Solaranlage in Agbélouvé",
    imageTag: "Ancrage Terrain",
    order: 1,
    active: true,
  },
  {
    code: "JEUNESSE",
    slug: "jeunesse-education",
    nameFr: "Jeunesse & inclusion",
    nameEn: "Youth & Inclusion",
    nameDe: "Jugend & Inklusion",
    subtitleFr: "Formation aux métiers du web & Compétences d'avenir",
    subtitleEn: "Web Careers & Future Skills",
    subtitleDe: "Web-Berufe & Zukunftskompetenzen",
    tagLabel: "Pôle Stratégique",
    descFr:
      "Pour offrir des perspectives d'avenir concrètes et freiner l'exode rural, APTIC-R dispense des formations qualifiantes accélérées aux métiers du numérique. Du développement web au graphisme, nous préparons les jeunes à générer des revenus sur place grâce au travail à distance et à l'entrepreneuriat local.",
    descEn:
      "To curb forced rural migration, APTIC-R delivers vocational training in web design, coding, and remote work, empowering youth to build sustainable livelihoods locally.",
    descDe:
      "Um der Landflucht entgegenzuwirken, bietet APTIC-R praxisnahe Intensivkurse in digitalen Berufen wie Webentwicklung und Grafikdesign an.",
    objectivesFr: JSON.stringify([
      "Dispenser des cursus intensifs en développement web et conception graphique",
      "Accompagner l'insertion professionnelle et la création de micro-entreprises locales",
      "Garantir une parité stricte femmes-hommes dans tous nos parcours techniques",
    ]),
    objectivesEn: JSON.stringify([
      "Deliver intensive bootcamps in web coding and digital publishing",
      "Support local entrepreneurship and digital micro-enterprises",
      "Achieve strict gender parity in all technical classes",
    ]),
    objectivesDe: JSON.stringify([
      "Intensivkurse in Webentwicklung und Design anbieten",
      "Berufseinstieg und Gründung von Kleinstunternehmen fördern",
      "Gleichberechtigung von Frauen und Männern in technischen Kursen sicherstellen",
    ]),
    actionsFr: JSON.stringify([
      "Bootcamps intensifs « Jeunes Codeurs » sur 3 mois",
      "Programme « Elles Codent » dédié aux jeunes femmes",
      "Incubation et mentorat de micro-services digitaux de proximité",
    ]),
    actionsEn: JSON.stringify([
      "3-month intensive 'Young Coders' bootcamp",
      "'Girls Code' initiative for young women",
      "Incubation and mentoring of local digital service shops",
    ]),
    actionsDe: JSON.stringify([
      "Dreimonatige Intensiv-Bootcamps « Junge Coder »",
      "Programm « Sie Coden » speziell für junge Frauen",
      "Mentoring für lokale digitale Dienstleistungen",
    ]),
    targetAudienceFr: "Jeunes de 16 à 30 ans, diplômés ou en reconversion, porteurs de projets",
    targetAudienceEn: "Youth aged 16–30, jobseekers, prospective entrepreneurs",
    targetAudienceDe: "Jugendliche zwischen 16 und 30 Jahren, Arbeitssuchende, Gründer",
    icon: "GraduationCapIcon",
    imageUrl: "/hero-volunteer-collab.jpg",
    imageCaptionFr: "Formation des jeunes aux métiers du web et du code",
    imageCaptionEn: "Training local youth in coding and web technologies",
    imageCaptionDe: "Ausbildung junger Menschen in Webberufen und Programmierung",
    imageTag: "Ancrage Terrain",
    order: 2,
    active: true,
  },
  {
    code: "CYBERSECURITE",
    slug: "cybersecurite-hygiene",
    nameFr: "Cybersécurité",
    nameEn: "Cybersecurity",
    nameDe: "Cybersicherheit",
    subtitleFr: "Citoyenneté numérique & Hygiène mobile",
    subtitleEn: "Digital Citizenship & Mobile Safety",
    subtitleDe: "Digitale Bürgerschaft & Mobile Sicherheit",
    tagLabel: "Pôle Stratégique",
    descFr:
      "L'adoption massive du smartphone et du paiement mobile expose les primo-utilisateurs à des fraudes financières et à la désinformation. APTIC-R mène des campagnes de sensibilisation de terrain pour transmettre les réflexes de sécurité essentiels et promouvoir une citoyenneté numérique éclairée.",
    descEn:
      "With the rise of smartphones, first-time users face cyber-fraud and disinformation. We run grassroots awareness campaigns to teach digital hygiene, fraud prevention, and responsible mobile habits.",
    descDe:
      "Die weite Verbreitung von Smartphones bringt Risiken wie Betrug bei Mobile Money und Falschinformationen mit sich. APTIC-R sensibilisiert die Bevölkerung für essenzielle Sicherheitsregeln.",
    objectivesFr: JSON.stringify([
      "Sensibiliser les populations aux fraudes et escroqueries sur le mobile money",
      "Former les jeunes à la protection de leur identité et de leurs données personnelles",
      "Développer l'esprit critique face aux fausses informations et au harcèlement",
    ]),
    objectivesEn: JSON.stringify([
      "Educate communities against mobile money fraud and scams",
      "Teach young students privacy protection and safe browsing habits",
      "Foster critical thinking against online fake news",
    ]),
    objectivesDe: JSON.stringify([
      "Aufklärung über Betrugsfälle bei Mobile-Money-Zahlungen",
      "Jugendliche im Schutz persönlicher Daten schulen",
      "Kritisches Denken gegenüber Falschmeldungen stärken",
    ]),
    actionsFr: JSON.stringify([
      "Séances de sensibilisation « Cyber-Vigilance » sur les marchés et places publiques",
      "Guides pratiques illustrés en langues locales (Éwé et Français)",
      "Ateliers scolaires sur l'éthique et la sécurité en ligne",
    ]),
    actionsEn: JSON.stringify([
      "Cyber-safety awareness sessions in rural markets and public squares",
      "Illustrated bilingual guides in local languages and French",
      "School workshops on digital ethics and safety",
    ]),
    actionsDe: JSON.stringify([
      "Sensibilisierungskampagnen auf Marktplätzen",
      "Illustrierte Leitfäden in lokalen Sprachen und Französisch",
      "Schul-Workshops zu Online-Ethik und digitaler Sicherheit",
    ]),
    targetAudienceFr: "Grand public, usagers du mobile money, collégiens et associations locales",
    targetAudienceEn: "General public, mobile money users, students, community groups",
    targetAudienceDe: "Öffentlichkeit, Mobile-Money-Nutzer, Schüler und lokale Vereine",
    icon: "ShieldIcon",
    imageUrl: "/togo-volunteer.jpg",
    imageCaptionFr: "Sensibilisation communautaire à la sécurité mobile et numérique",
    imageCaptionEn: "Community awareness on mobile security and digital hygiene",
    imageCaptionDe: "Aufklärung der Bevölkerung über mobile und digitale Sicherheit",
    imageTag: "Ancrage Terrain",
    order: 3,
    active: true,
  },
  {
    code: "AGRI_LOWTECH",
    slug: "agri-lowtech",
    nameFr: "Agriculture durable",
    nameEn: "Sustainable Agriculture",
    nameDe: "Nachhaltige Landwirtschaft",
    subtitleFr: "Écologie & Low-Tech",
    subtitleEn: "Ecology & Low-Tech Solutions",
    subtitleDe: "Ökologie & Low-Tech",
    tagLabel: "Pôle Stratégique",
    descFr:
      "Face aux dérèglements climatiques, APTIC-R développe des solutions « Low-Tech » sobres, économiques, écologiques et entièrement réparables localement pour accompagner les agriculteurs vers une transition agro-écologique résiliente.",
    descEn:
      "Facing climate instability, APTIC-R promotes simple, repairable, low-tech systems built with locally sourced parts to optimize crops and strengthen agricultural resilience.",
    descDe:
      "Angesichts des Klimawandels entwickelt APTIC-R einfache, kostengünstige und lokal reparierbare Low-Tech-Lösungen für eine krisenfeste Agrarökologie.",
    objectivesFr: JSON.stringify([
      "Co-concevoir des systèmes d'irrigation goutte-à-goutte automatisés à énergie solaire",
      "Déployer des capteurs simples de mesure d'humidité des sols et de pluviométrie",
      "Former les maraîchers aux pratiques agro-écologiques et à la gestion de l'eau",
    ]),
    objectivesEn: JSON.stringify([
      "Co-design solar-powered automated drip irrigation systems",
      "Deploy accessible soil moisture and rainfall sensors",
      "Train farmers in ecological practices and water conservation",
    ]),
    objectivesDe: JSON.stringify([
      "Solarbetriebene Tropfbewässerungssysteme mitentwickeln",
      "Einfache Sensoren für Bodenfeuchtigkeit und Niederschlag installieren",
      "Landwirte in nachhaltigem Wassermanagement schulen",
    ]),
    actionsFr: JSON.stringify([
      "Parcelle expérimentale Low-Tech connectée au FabLab d'Agbélouvé",
      "Fabrication artisanale de séchoirs solaires optimisés pour fruits et légumes",
      "Accompagnement numérique des groupements maraîchers et coopératives féminines",
    ]),
    actionsEn: JSON.stringify([
      "Connected agro-ecological test parcel at the Agbélouvé FabLab",
      "Workshops building optimized solar food dehydrators",
      "Digital harvest management support for women farming cooperatives",
    ]),
    actionsDe: JSON.stringify([
      "Vernetzte Versuchsparzelle am FabLab Agbélouvé",
      "Handwerkliche Herstellung optimierter Solartrockner",
      "Digitale Unterstützung für Frauenkooperativen in der Landwirtschaft",
    ]),
    targetAudienceFr: "Agriculteurs, maraîchers, coopératives agricoles et groupements ruraux",
    targetAudienceEn: "Smallholders, market gardeners, rural women cooperatives",
    targetAudienceDe: "Landwirte, Gärtner, Kooperativen und Dorfgemeinschaften",
    icon: "WheatIcon",
    imageUrl: "/photo-projet-phare.jpg",
    imageCaptionFr: "Capteurs d'irrigation et innovations Low-Tech pour les groupements maraîchers",
    imageCaptionEn: "Irrigation sensors and low-tech innovations for farmers",
    imageCaptionDe: "Bewässerungssensoren und Low-Tech-Innovationen für Gärtnereien",
    imageTag: "Ancrage Terrain",
    order: 4,
    active: true,
  },
  {
    code: "DATA_INNOVATION",
    slug: "data-innovation",
    nameFr: "Données & intelligence",
    nameEn: "Open Data & Intelligence",
    nameDe: "Offene Daten & Innovation",
    subtitleFr: "Cartographie participative & Innovation citoyenne",
    subtitleEn: "Participatory Mapping & Civic Data",
    subtitleDe: "Partizipative Kartierung & Bürgerdaten",
    tagLabel: "Pôle Stratégique",
    descFr:
      "Les zones rurales souffrent souvent d'un manque crucial de données cartographiques et statistiques fiables. En mobilisant les données ouvertes et les outils collaboratifs, APTIC-R permet aux collectivités et communautés de cartographier leurs ressources pour mieux décider.",
    descEn:
      "Rural areas often suffer from a lack of reliable data. By mobilizing OpenStreetMap and community surveying, APTIC-R helps local leaders map community resources to plan sustainable development.",
    descDe:
      "Gemeinsam mit OpenStreetMap kartieren wir Dörfer und Wasserstellen, damit lokale Behörden ihre Entwicklung gezielt planen können.",
    objectivesFr: JSON.stringify([
      "Cartographier collaborativement les pistes, infrastructures et points d'eau essentiels",
      "Accompagner les collectivités locales dans la prise de décision par la donnée ouverte",
      "Former les étudiants et techniciens aux logiciels SIG et à la géomatique libre",
    ]),
    objectivesEn: JSON.stringify([
      "Collaboratively map rural roads, clinics, and clean water wells",
      "Support municipal leaders in evidence-based planning with open datasets",
      "Train university students and technicians in open-source GIS mapping tools",
    ]),
    objectivesDe: JSON.stringify([
      "Kollaborative Kartierung von Infrastrukturen und Brunnen",
      "Unterstützung lokaler Behörden mit offenen Daten",
      "Ausbildung von Studenten in freier GIS-Software",
    ]),
    actionsFr: JSON.stringify([
      "Mapathons communautaires avec OpenStreetMap et les jeunes du territoire",
      "Relevés GPS de terrain pour le recensement des infrastructures hydrauliques et scolaires",
      "Diffusion de cartes physiques et numériques libres auprès des mairies",
    ]),
    actionsEn: JSON.stringify([
      "Community mapathons with OpenStreetMap and local youth",
      "Field GPS surveying of water points and health centers",
      "Publishing freely accessible civic maps for municipal administrations",
    ]),
    actionsDe: JSON.stringify([
      "Mapathons mit Jugendlichen vor Ort",
      "GPS-Erfassung von Brunnen und Landschulen",
      "Bereitstellung digitaler und gedruckter Karten",
    ]),
    targetAudienceFr: "Collectivités territoriales, mairies, étudiants en géographie et citoyens",
    targetAudienceEn: "Municipal authorities, geography students, planners, civic volunteers",
    targetAudienceDe: "Kommunen, Studenten, Freiwillige",
    icon: "BarChartIcon",
    imageUrl: "/photo-recit-documentaire.jpg",
    imageCaptionFr: "Collecte de données participative et cartographie des ressources rurales",
    imageCaptionEn: "Participatory data collection and mapping of rural resources",
    imageCaptionDe: "Datenerfassung und Kartierung ländlicher Ressourcen",
    imageTag: "Ancrage Terrain",
    order: 5,
    active: true,
  },
  {
    code: "DEV_RURAL",
    slug: "dev-rural-fablabs",
    nameFr: "Développement rural",
    nameEn: "Rural Development",
    nameDe: "Ländliche Entwicklung",
    subtitleFr: "FabLabs communautaires & Artisanat connecté",
    subtitleEn: "Community FabLabs & Connected Craftsmanship",
    subtitleDe: "FabLabs & Vernetztes Handwerk",
    tagLabel: "Pôle Stratégique",
    descFr:
      "Le FabLab d'Agbélouvé est un tiers-lieu d'apprentissage, d'artisanat numérique et de co-création. Il réunit outils modernes (impression 3D, découpeuse laser) et artisanat traditionnel pour concevoir et réparer localement les équipements du quotidien.",
    descEn:
      "The Agbélouvé FabLab is a community makerspace uniting digital fabrication (3D printing, laser cutting) and traditional craftsmanship to build and repair local tools.",
    descDe:
      "Das FabLab Agbélouvé verbindet moderne digitale Werkzeuge mit traditionellem Handwerk zur Reparatur und Entwicklung lokaler Ausrüstungen.",
    objectivesFr: JSON.stringify([
      "Maintenir un tiers-lieu d'innovation ouvert, accessible et gratuit pour les villageois",
      "Prototyper et réparer des pièces de rechange pour les machines agricoles et outillages",
      "Initier les artisans locaux à la modélisation 3D et aux techniques de fabrication assistée",
    ]),
    objectivesEn: JSON.stringify([
      "Maintain a vibrant community makerspace open and accessible to all residents",
      "Prototype replacement parts for farming machinery and household appliances",
      "Train craftspeople in computer-aided design and digital manufacturing",
    ]),
    objectivesDe: JSON.stringify([
      "Offener und kostenloser Zugang zum Tiers-Lieu für alle",
      "Prototyping von Ersatzteilen für Landmaschinen",
      "Schulung lokaler Handwerker in 3D-Modellierung",
    ]),
    actionsFr: JSON.stringify([
      "Animation quotidienne du FabLab Rural avec connexion haut débit partagée",
      "Ateliers de réparation solidaire d'équipements électroménagers et outillages",
      "Résidence et accueil de volontaires nationaux et internationaux",
    ]),
    actionsEn: JSON.stringify([
      "Daily operation of the rural FabLab with shared high-speed connectivity",
      "Solidarity repair cafes for household appliances and farm equipment",
      "Welcoming and mentoring local and international makers and volunteers",
    ]),
    actionsDe: JSON.stringify([
      "Betrieb des ländlichen FabLab mit Breitbandanbindung",
      "Solidarische Reparaturwerkstatt für Haushaltsgeräte",
      "Begleitung von Freiwilligen und Maker-Projekten",
    ]),
    targetAudienceFr: "Artisans, réparateurs, porteurs de projets, inventeurs locaux et communauté",
    targetAudienceEn: "Craftspeople, repair technicians, innovators, community residents",
    targetAudienceDe: "Handwerker, Reparateure, Erfinder und Freiwillige",
    icon: "CpuIcon",
    imageUrl: "/meeting-org.jpg",
    imageCaptionFr: "Tiers-lieu FabLab et artisanat connecté au cœur du territoire",
    imageCaptionEn: "Community FabLab and digital craftsmanship hub in the village",
    imageCaptionDe: "FabLab und vernetztes Handwerk im Herzen der Region",
    imageTag: "Ancrage Terrain",
    order: 6,
    active: true,
  },
]

async function main() {
  console.log("🌱 Début de l'initialisation des domaines...")

  for (const item of DOMAINES_DATA) {
    const existing = await prisma.domaine.findUnique({
      where: { code: item.code },
    })

    if (existing) {
      console.log(`Mise à jour du domaine : ${item.nameFr}`)
      await prisma.domaine.update({
        where: { code: item.code },
        data: item,
      })
    } else {
      console.log(`Création du domaine : ${item.nameFr}`)
      await prisma.domaine.create({
        data: item,
      })
    }
  }

  console.log("✅ 6 domaines officiels initialisés avec succès dans la base de données !")
}

main()
  .catch((e) => {
    console.error("❌ Erreur de seed :", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
