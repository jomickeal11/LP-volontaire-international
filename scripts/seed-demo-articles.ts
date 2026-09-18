import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Insertion des données de démonstration pour les Actualités...")

  // Récupération des catégories
  const catActualites = await prisma.categorieArticle.findUnique({ where: { slug: "actualites" } })
  const catTerrain = await prisma.categorieArticle.findUnique({ where: { slug: "projets-terrain" } })
  const catFormations = await prisma.categorieArticle.findUnique({ where: { slug: "formations-evenements" } })
  const catCommuniques = await prisma.categorieArticle.findUnique({ where: { slug: "communiques" } })

  const articles = [
    {
      slug: "inauguration-nouveau-pole-solaire-agbelouve",
      titleFr: "Inauguration du nouveau pôle informatique solaire d'Agbélouvé",
      titleEn: "Inauguration of the new solar-powered IT center in Agbélouvé",
      titleDe: "Einweihung des neuen solarbetriebenen IT-Zentrums in Agbélouvé",
      excerptFr: "Un équipement 100% autonome en énergie permettant d'accueillir quotidiennement plus de 40 élèves et artisans du canton pour des sessions d'initiation et de télétravail.",
      excerptEn: "A 100% energy-autonomous lab welcoming over 40 students and craftspeople daily for computing sessions and remote work.",
      excerptDe: "Ein energieautarkes Zentrum, das täglich über 40 Schüler und Handwerker für Computerkurse empfängt.",
      contentFr: `Le 15 septembre 2026 marque une étape décisive pour l'autonomie numérique de la préfecture du Zio. En présence des autorités locales, des chefs traditionnels et des équipes d'APTIC-R, le nouveau pôle solaire du FabLab d'Agbélouvé a été officiellement mis en service.\n\nÉquipé de 15 postes reconditionnés basse consommation et d'un onduleur solaire hybride de 5 kVA, ce centre garantit une continuité de service totale, même lors des coupures de réseau électrique récurrentes. Les premiers ateliers débuteront dès la semaine prochaine avec les classes de CM2 et de 6ème des écoles environnantes.`,
      featuredImage: "/photo-ancrage-togo.png",
      published: true,
      publishedAt: new Date("2026-09-15T10:00:00Z"),
      authorName: "Direction des Programmes",
      categoryId: catTerrain?.id,
      viewsCount: 142,
    },
    {
      slug: "lancement-programme-cyber-vigilance-marches",
      titleFr: "Campagne de sensibilisation à l'hygiène mobile sur les marchés du Zio",
      titleEn: "Mobile hygiene & security awareness campaign in rural Zio markets",
      titleDe: "Aufklärungskampagne zu mobiler Sicherheit auf den Märkten von Zio",
      excerptFr: "Nos volontaires ont déployé des stands d'information interactifs sur 4 marchés ruraux pour prévenir les fraudes sur le mobile money et protéger les données personnelles.",
      excerptEn: "Our volunteers set up interactive info booths across 4 rural markets to prevent mobile money fraud and protect privacy.",
      excerptDe: "Unsere Freiwilligen informierten auf 4 Märkten über den Schutz vor Mobile-Money-Betrug.",
      contentFr: `Face à la recrudescence des arnaques par SMS et des faux appels ciblant les commerçantes et usagers du mobile money, APTIC-R a mené une opération de sensibilisation directe sur les marchés de Tsévié, Agbélouvé, Davié et Gbatopé.\n\nPlus de 350 personnes ont reçu un guide illustré en Éwé et en Français résumant les réflexes de sécurité : non-partage du code secret, vérification de l'expéditeur et signalement immédiat.`,
      featuredImage: "/togo-volunteer.jpg",
      published: true,
      publishedAt: new Date("2026-09-10T14:30:00Z"),
      authorName: "Équipe Cybersécurité",
      categoryId: catActualites?.id,
      viewsCount: 89,
    },
    {
      slug: "cloture-bootcamp-jeunes-codeurs-promotion-2026",
      titleFr: "Remise des attestations aux 25 lauréats du Bootcamp « Jeunes Codeurs »",
      titleEn: "Graduation ceremony for 25 young web developers in Agbélouvé",
      titleDe: "Zertifikatsübergabe an 25 Absolventen des Programmier-Bootcamps",
      excerptFr: "Après 12 semaines intensives de formation en HTML, CSS, JavaScript et gestion de projets web, 25 jeunes filles et garçons de la région ont présenté leurs réalisations devant un jury de professionnels.",
      excerptEn: "After 12 weeks of intensive web development training, 25 young local students showcased their capstone projects.",
      excerptDe: "Nach 12 intensiven Wochen präsentierten 25 Absolventen ihre Webprojekte vor einer Fachjury.",
      contentFr: `La cérémonie de clôture du Bootcamp Jeunes Codeurs s'est tenue dans une ambiance festive au FabLab. Les projets présentés incluaient un annuaire numérique des artisans locaux, une plateforme de gestion des récoltes pour coopératives et deux sites vitrines pour des groupements de femmes.\n\nSept lauréats ont d'ores et déjà décroché des premières missions de prestation pour des organisations partenaires.`,
      featuredImage: "/hero-volunteer-collab.jpg",
      published: true,
      publishedAt: new Date("2026-09-02T16:00:00Z"),
      authorName: "Pôle Formation",
      categoryId: catFormations?.id,
      viewsCount: 215,
    },
    {
      slug: "appel-a-candidatures-volontaires-mission-2026-2027",
      titleFr: "Ouverture de l'appel à candidatures pour les volontaires 2026-2027",
      titleEn: "Call for applications open for 2026-2027 international volunteers",
      titleDe: "Bewerbungsphase für internationale Freiwillige 2026-2027 eröffnet",
      excerptFr: "APTIC-R recrute 8 volontaires nationaux et internationaux pour des missions d'ingénierie pédagogique, de maintenance de fablab, de cartographie SIG et d'agro-écologie.",
      excerptEn: "APTIC-R is recruiting 8 national and international volunteers for educational engineering, fablab maintenance, and GIS mapping.",
      excerptDe: "APTIC-R sucht 8 Freiwillige für Bildungs-, FabLab- und GIS-Kartierungsprojekte.",
      contentFr: `Les candidatures pour la prochaine cohorte de volontaires sont officiellement ouvertes. Les missions s'étendent sur des durées de 3 à 12 mois et se déroulent principalement au FabLab d'Agbélouvé et en immersion dans les villages partenaires.\n\nLes profils recherchés incluent des compétences en développement informatique, électronique embarquée/Arduino, animation pédagogique, gestion de projets associatifs et agronomie durable.`,
      featuredImage: "/meeting-org.jpg",
      published: true,
      publishedAt: new Date("2026-08-25T09:00:00Z"),
      authorName: "Secrétariat Général",
      categoryId: catCommuniques?.id,
      viewsCount: 310,
    },
  ]

  for (const art of articles) {
    await prisma.article.upsert({
      where: { slug: art.slug },
      create: art,
      update: art,
    })
  }

  console.log(`✅ ${articles.length} articles de démonstration insérés avec succès !`)
}

main()
  .catch((e) => {
    console.error("❌ Erreur :", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
