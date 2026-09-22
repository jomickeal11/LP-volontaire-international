import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const NEWS_PAGE_CONTENT = {
  FR: {
    news_hero_badge: "ACTUALITÉS",
    news_hero_title: "Le Journal d’APTIC-R",
    news_hero_subtitle: "Projets, initiatives, événements et actualités de l’association.",
    news_cta_title: "Vous souhaitez suivre ou soutenir nos actions de terrain ?",
    news_cta_desc: "Découvrez nos programmes en cours et les opportunités d'engagement solidaire.",
    news_cta_btn_projects: "Consulter nos projets",
    news_cta_btn_partner: "Devenir partenaire",
  },
  EN: {
    news_hero_badge: "NEWS & UPDATES",
    news_hero_title: "APTIC-R Dispatch",
    news_hero_subtitle: "Projects, field initiatives, upcoming events, and official releases.",
    news_cta_title: "Want to follow or support our field initiatives?",
    news_cta_desc: "Discover our current programs and community engagement opportunities.",
    news_cta_btn_projects: "Explore our projects",
    news_cta_btn_partner: "Become a partner",
  },
  DE: {
    news_hero_badge: "AKTUELL",
    news_hero_title: "APTIC-R Magazin",
    news_hero_subtitle: "Projekte, Initiativen, Veranstaltungen und offizielle Mitteilungen.",
    news_cta_title: "Möchten Sie unsere Aktionen vor Ort unterstützen?",
    news_cta_desc: "Entdecken Sie unsere laufenden Programme und Möglichkeiten zur Zusammenarbeit.",
    news_cta_btn_projects: "Projekte ansehen",
    news_cta_btn_partner: "Partner werden",
  },
}

const REAL_ARTICLES = [
  {
    slug: "inauguration-pole-solaire-fablab-agbelouve",
    titleFr: "Inauguration du pôle solaire et numérique au FabLab d'Agbélouvé",
    titleEn: "Inauguration of the solar & digital hub at Agbélouvé FabLab",
    titleDe: "Einweihung des Solar- und Digitalzentrums im FabLab Agbélouvé",
    excerptFr: "Une installation 100% autonome en énergie solaire permettant d'accueillir quotidiennement élèves, artisans et jeunes porteurs de projets dans des conditions optimales.",
    excerptEn: "A 100% solar-powered installation providing continuous energy for students, local craftspeople, and young tech project leaders.",
    excerptDe: "Eine vollständig solarbetriebene Anlage, die Schülern und lokalen Handwerkern verlässlichen Zugang zu digitalen Werkzeugen bietet.",
    contentFr: `Le 15 septembre 2026 marque une avancée majeure pour l'émancipation numérique dans la préfecture du Zio. En présence des autorités administratives régionales, des chefs traditionnels et des représentants de l'APTIC-R, le nouveau pôle solaire du FabLab d'Agbélouvé a été inauguré avec succès.\n\nCe dispositif intègre 15 postes informatiques reconditionnés à faible consommation, un serveur local hébergeant des ressources éducatives libres (Wikipédia hors-ligne, cours de sciences) et un onduleur solaire hybride de 5 kVA.\n\nGrâce à cette infrastructure, les ateliers d'initiation au numérique pour les écoles rurales et les cours du soir pour les groupements d'artisans sont désormais garantis sans interruption liée aux coupures du réseau électrique.`,
    featuredImage: "/photo-ancrage-togo.png",
    published: true,
    isFeatured: true,
    publishedAt: new Date("2026-09-15T10:00:00Z"),
    authorName: "Direction des Programmes APTIC-R",
    viewsCount: 385,
  },
  {
    slug: "cloture-session-formation-femmes-autonomie-numerique",
    titleFr: "Clôture de la formation numérique pour 30 femmes artisanes et commerçantes",
    titleEn: "Graduation of 30 women entrepreneurs in digital management & mobile tools",
    titleDe: "Abschluss der digitalen Weiterbildung für 30 Unternehmerinnen in Agbélouvé",
    excerptFr: "Pendant 6 semaines, les participantes ont appris la gestion simplifiée des stocks sur smartphone, la comptabilité de base et la promotion locale de leurs produits.",
    excerptEn: "Over 6 weeks, participants mastered mobile bookkeeping, stock tracking on smartphones, and local digital marketing for cooperatives.",
    excerptDe: "30 Frauen schlossen eine sechswöchige Schulung in digitaler Buchhaltung und mobiler Vermarktung erfolgreich ab.",
    contentFr: `La remise des attestations aux 30 femmes commerçantes et artisanes du canton d'Agbélouvé s'est tenue au centre communautaire.\n\nCe cycle de formation pratique, conduit par les formateurs locaux et volontaires d'APTIC-R, avait pour objectif de lever la fracture numérique touchant les micro-entrepreneuses rurales.\n\nLes participantes utilisent désormais des applications adaptées et des outils de tenue de livre de caisse électronique sur leurs téléphones mobiles, sécurisant ainsi la gestion quotidienne de leurs activités de transformation agroalimentaire et d'artisanat.`,
    featuredImage: "/hero-volunteer-collab.jpg",
    published: true,
    isFeatured: false,
    publishedAt: new Date("2026-09-08T15:30:00Z"),
    authorName: "Pôle Inclusion & Autonomie",
    viewsCount: 240,
  },
  {
    slug: "campagne-sensibilisation-cyber-vigilance-marches-ruraux",
    titleFr: "Sensibilisation à la cyber-vigilance et protection du Mobile Money sur les marchés",
    titleEn: "Cybersecurity & Mobile Money fraud prevention campaign in rural markets",
    titleDe: "Aufklärungskampagne zu Mobile-Money-Sicherheit auf ländlichen Märkten",
    excerptFr: "Des stands d'information mobiles déployés sur 4 marchés ruraux pour prévenir les escroqueries par faux SMS et protéger les économies des familles.",
    excerptEn: "Interactive field booths deployed across 4 rural markets to inform families and small traders against SMS scamming and PIN theft.",
    excerptDe: "Informationsstände auf 4 Wochenmärkten klärten Familien und Händler über Betrugsprävention bei Mobilzahlungen auf.",
    contentFr: `Face à la recrudescence des tentatives de fraude par SMS et des faux appels usurpant les opérateurs de mobile money, l'équipe terrain d'APTIC-R s'est mobilisée directement sur les marchés de Tsévié, Agbélouvé, Davié et Gbatopé.\n\nPlus de 450 personnes ont été sensibilisées aux bonnes pratiques fondamentales : ne jamais communiquer son code PIN, vérifier systématiquement son solde réel avant toute remise de marchandise et signaler immédiatement les numéros suspects.\n\nDes fiches mémos illustrées en Éwé et en Français ont été distribuées à chaque commerçant.`,
    featuredImage: "/togo-volunteer.jpg",
    published: true,
    isFeatured: false,
    publishedAt: new Date("2026-08-28T11:00:00Z"),
    authorName: "Équipe Cybersécurité & Terrain",
    viewsCount: 195,
  },
  {
    slug: "accueil-nouvelle-cohorte-volontaires-terrain-2026",
    titleFr: "Accueil de la nouvelle promotion de volontaires nationaux et internationaux",
    titleEn: "Welcoming the 2026-2027 cohort of national & international volunteers",
    titleDe: "Empfang des neuen Freiwilligen-Jahrgangs 2026-2027 in Togo",
    excerptFr: "Ingénieurs en énergies renouvelables, formateurs pédagogiques et coordinateurs de projets s'installent à Agbélouvé pour des missions de 3 à 12 mois.",
    excerptEn: "Renewable energy technicians, educators, and project coordinators begin their immersion missions in Agbélouvé.",
    excerptDe: "Solar-Ingenieure, Lehrkräfte und Projektkoordinatoren starten ihren Freiwilligendienst in Agbélouvé.",
    contentFr: `L'association APTIC-R a eu le plaisir d'accueillir sa nouvelle équipe de volontaires pour l'année 2026-2027. Après une semaine d'intégration culturelle, d'apprentissage des bases de l'Éwé et de cadrage sécuritaire à Lomé, les volontaires ont rejoint la base vie d'Agbélouvé.\n\nLeurs missions prioritaires porteront sur la maintenance préventive des kits solaires scolaires, l'animation d'ateliers de robotique éducative et l'accompagnement des coopératives agricoles vers des solutions de traçabilité low-tech.`,
    featuredImage: "/meeting-org.jpg",
    published: true,
    isFeatured: false,
    publishedAt: new Date("2026-08-15T09:00:00Z"),
    authorName: "Coordination du Volontariat",
    viewsCount: 312,
  },
]

async function main() {
  console.log("🌱 Seeding News Page CMS settings and Real Articles...")

  // 1. Seed ParametreSite for News
  for (const [lang, dict] of Object.entries(NEWS_PAGE_CONTENT)) {
    const l = lang.toLowerCase()
    for (const [fieldKey, text] of Object.entries(dict)) {
      const dbKey = `${fieldKey}_${l}`
      await prisma.parametreSite.upsert({
        where: { key: dbKey },
        update: { value: text, group: "NEWS", description: `News CMS (${lang})` },
        create: { key: dbKey, value: text, group: "NEWS", description: `News CMS (${lang})` },
      })
      console.log(`  ✓ Setting [${lang}] ${dbKey}`)
    }
  }

  // 2. Ensure default categories exist
  const defaultCats = [
    { slug: "actualites", nameFr: "Actualités & Vie associative", nameEn: "Community & News", nameDe: "Neuigkeiten", order: 1 },
    { slug: "projets-terrain", nameFr: "Projets de terrain", nameEn: "Field Projects", nameDe: "Feldprojekte", order: 2 },
    { slug: "formations-evenements", nameFr: "Formations & FabLab", nameEn: "Trainings & FabLab", nameDe: "Schulungen & FabLab", order: 3 },
    { slug: "communiques", nameFr: "Communiqués officiels", nameEn: "Press Releases", nameDe: "Mitteilungen", order: 4 },
  ]

  const catMap: Record<string, string> = {}
  for (const c of defaultCats) {
    const cat = await prisma.categorieArticle.upsert({
      where: { slug: c.slug },
      update: { nameFr: c.nameFr, nameEn: c.nameEn, nameDe: c.nameDe, order: c.order },
      create: c,
    })
    catMap[c.slug] = cat.id
  }

  // 3. Upsert real articles
  const categoriesAssignment = [
    catMap["projets-terrain"],
    catMap["formations-evenements"],
    catMap["actualites"],
    catMap["communiques"],
  ]

  for (let i = 0; i < REAL_ARTICLES.length; i++) {
    const art = REAL_ARTICLES[i]
    const categoryId = categoriesAssignment[i] || catMap["actualites"]

    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {
        ...art,
        categoryId,
      },
      create: {
        ...art,
        categoryId,
      },
    })
    console.log(`  ✓ Article: ${art.slug} (Featured: ${art.isFeatured})`)
  }

  console.log("✅ Successfully seeded News CMS settings and real articles!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
