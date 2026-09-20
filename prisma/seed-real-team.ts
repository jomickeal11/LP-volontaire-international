import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const REAL_TEAM_MEMBERS = [
  {
    name: "Komal DAGNON",
    roleFr: "Directeur Exécutif & Co-fondateur",
    roleEn: "Executive Director & Co-Founder",
    roleDe: "Geschäftsführender Direktor & Mitgründer",
    category: "DIRECTION",
    bioFr:
      "Fondateur et Directeur Exécutif d'APTIC-R à Agbélouvé. Engagé depuis 2018 pour le désenclavement numérique, l'autonomie technologique des zones rurales et le développement socio-économique communautaire dans la préfecture du Zio et la région Maritime au Togo.",
    bioEn:
      "Founder and Executive Director of APTIC-R in Agbélouvé. Dedicated since 2018 to digital inclusion, technological self-reliance for rural communities, and grassroots socio-economic development across the Zio Prefecture and Maritime Region of Togo.",
    bioDe:
      "Gründer und geschäftsführender Direktor von APTIC-R in Agbélouvé. Seit 2018 engagiert für digitale Inklusion, technologische Eigenständigkeit im ländlichen Raum und sozioökonomische Entwicklung in der Region Maritime in Togo.",
    email: "direction@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Gouvernance institutionnelle", "Développement rural", "Plaidoyer numérique", "Partenariats stratégiques"]),
    order: 1,
    active: true,
  },
  {
    name: "Kokouvi Mensah",
    roleFr: "Président du Conseil d'Administration",
    roleEn: "President of the Board of Directors",
    roleDe: "Vorsitzender des Verwaltungsrats",
    category: "DIRECTION",
    bioFr:
      "Ingénieur en systèmes d'information formé à Lomé et à Dakar. Engagé pour l'accès universel aux technologies en milieu rural, il veille au respect des orientations stratégiques, de la charte éthique et des engagements statutaires de l'association.",
    bioEn:
      "Information Systems Engineer trained in Lomé and Dakar. Dedicated to digital inclusion and rural technology access across West Africa, steering strategic governance and institutional partnerships.",
    bioDe:
      "IT-Ingenieur mit Ausbildung in Lomé und Dakar. Engagiert für digitale Inklusion im ländlichen Raum, strategische Partnerschaften und ethische Organisationsentwicklung.",
    email: "presidence@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Gouvernance", "Stratégie IT", "Plaidoyer institutionnel", "Partenariats"]),
    order: 2,
    active: true,
  },
  {
    name: "Afiwa Lawson",
    roleFr: "Coordinatrice des Programmes & Ingénierie Pédagogique",
    roleEn: "Programs & Pedagogical Engineering Coordinator",
    roleDe: "Programm- & Pädagogikkoordinatorin",
    category: "COORDINATION",
    bioFr:
      "Spécialiste de l'éducation populaire et de la formation professionnelle. Elle conçoit les parcours d'alphabétisation numérique, supervise les formateurs et assure l'accueil et le suivi personnalisé des volontaires internationaux à Agbélouvé.",
    bioEn:
      "Specialist in popular education and curriculum design. She oversees digital literacy training modules, trainer capacity building, and international volunteer mentorship in Agbélouvé.",
    bioDe:
      "Fachkraft für Bildungswesen und Lehrplanentwicklung. Verantwortlich für digitale Alphabetisierung, Trainerausbildung und Betreuung internationaler Freiwilliger vor Ort.",
    email: "programmes@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Ingénierie pédagogique", "Coordination de projets", "Égalité F/H", "Formation"]),
    order: 3,
    active: true,
  },
  {
    name: "Kodjo Agbodjan",
    roleFr: "Responsable Technique & FabLab Rural",
    roleEn: "Technical Lead & Rural FabLab Manager",
    roleDe: "Technischer Leiter & Rural FabLab",
    category: "FORMATION",
    bioFr:
      "Électronicien et maker engagé. Il anime les ateliers de prototypage Low-Tech, supervise l'impression 3D, la maintenance du parc informatique reconditionné et l'expérimentation de capteurs solaires adaptés à l'agriculture locale.",
    bioEn:
      "Electronics technician and passionate maker. He leads Low-Tech prototyping workshops, 3D printing, refurbished hardware maintenance, and solar-powered sensors for local farming.",
    bioDe:
      "Elektroniker und Maker. Leitet Low-Tech-Prototyping-Workshops, 3D-Druck, Hardware-Instandsetzung und solarbetriebene Sensorsysteme für die Landwirtschaft.",
    email: "fablab@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["FabLab & Prototypage", "Impression 3D", "Électronique Low-Tech", "Maintenance IT"]),
    order: 4,
    active: true,
  },
  {
    name: "Essivi Kpogo",
    roleFr: "Chargée de Mobilisation Communautaire & Genre",
    roleEn: "Community Engagement & Gender Officer",
    roleDe: "Referentin für Gemeindeengagement & Gleichstellung",
    category: "COORDINATION",
    bioFr:
      "Travailleuse sociale et médiatrice de terrain. Elle coordonne les relations avec les chefferies et les groupements de femmes maraîchères, et anime le programme d'initiation au numérique « Elles Codent pour le Changement ».",
    bioEn:
      "Social worker and community organizer leading partnerships with traditional leaders and women farming cooperatives, while coordinating the 'Girls Code for Change' empowerment initiative.",
    bioDe:
      "Sozialarbeiterin und Koordinatorin für Frauenkooperativen und das Bildungsprogramm für Mädchen und Frauen im ländlichen Raum.",
    email: "communaute@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Animation rurale", "Autonomisation des femmes", "Médiation communautaire"]),
    order: 5,
    active: true,
  },
  {
    name: "Dr. Yao Tete",
    roleFr: "Conseiller Scientifique, Climat & Agro-Écologie",
    roleEn: "Scientific Advisor, Climate & Agro-Ecology",
    roleDe: "Wissenschaftlicher Berater für Klima & Agrarökologie",
    category: "CONSEIL",
    bioFr:
      "Enseignant-chercheur agronome. Il oriente les projets appliqués d'APTIC-R sur la résilience climatique, la régénération des sols et l'intégration de capteurs d'irrigation solaire Low-Tech au service des coopératives maraîchères.",
    bioEn:
      "Agronomy researcher advising APTIC-R projects on climate resilience, soil regeneration, and solar-powered Low-Tech irrigation sensors for agricultural cooperatives.",
    bioDe:
      "Agrarwissenschaftler mit Schwerpunkt auf Klimaresilienz, Bodenfruchtbarkeit und sparsamer solarer Bewässerungstechnik für landwirtschaftliche Genossenschaften.",
    email: "conseil@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["Agro-écologie", "Recherche appliquée", "Résilience climatique"]),
    order: 6,
    active: true,
  },
  {
    name: "Léa Dupont",
    roleFr: "Volontaire Internationale — UI/UX & Documentation",
    roleEn: "International Volunteer — UI/UX & Digital Design",
    roleDe: "Internationale Freiwillige — UI/UX & Mediengestaltung",
    category: "VOLONTAIRE",
    bioFr:
      "Designer d'interface diplômée en mission de solidarité internationale à Agbélouvé. Elle forme les apprenants aux fondamentaux du design graphique et du prototypage web, et documente en images les projets du FabLab.",
    bioEn:
      "UI/UX designer on an international volunteer mission in Agbélouvé, mentoring youth in visual design and web prototyping while documenting local FabLab community projects.",
    bioDe:
      "UI/UX-Designerin im Freiwilligendienst in Agbélouvé zur Ausbildung junger Menschen in Webdesign und Dokumentation der FabLab-Aktivitäten.",
    email: "volontariat@aptic-r.org",
    photoUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    skills: JSON.stringify(["UI/UX Design", "Formation & Mentorat", "Documentation visuelle"]),
    order: 7,
    active: true,
  },
]

async function seedRealTeam() {
  console.log("Synchronisation de la vraie équipe APTIC-R en base de données...")

  for (const m of REAL_TEAM_MEMBERS) {
    const existing = await prisma.membreEquipe.findFirst({
      where: { name: m.name },
    })

    if (existing) {
      await prisma.membreEquipe.update({
        where: { id: existing.id },
        data: m,
      })
      console.log(`Mis à jour : ${m.name} (${m.roleFr})`)
    } else {
      await prisma.membreEquipe.create({
        data: m,
      })
      console.log(`Créé : ${m.name} (${m.roleFr})`)
    }
  }

  const all = await prisma.membreEquipe.findMany({
    orderBy: { order: "asc" },
  })

  console.log(`\nSuccès : ${all.length} membres actifs présents en base de données.`)
}

seedRealTeam()
  .catch((e) => {
    console.error("Erreur lors de la synchronisation de l'équipe :", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
