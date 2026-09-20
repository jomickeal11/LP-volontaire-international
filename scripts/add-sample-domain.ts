import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const code = "ENERGIE_SOLAIRE"
  const slug = "energie-solaire-rurale"

  const newDomain = {
    code,
    slug,
    nameFr: "Énergie solaire & Autonomie",
    nameEn: "Solar Energy & Autonomy",
    nameDe: "Solarenergie & Autonomie",
    subtitleFr: "Électrification villageoise & Énergie propre",
    subtitleEn: "Rural Electrification & Clean Power",
    subtitleDe: "Ländliche Elektrifizierung & Saubere Energie",
    tagLabel: "Pôle Stratégique",
    descFr:
      "APTIC-R déploie des micro-centrales solaires communautaires pour alimenter les salles informatiques, les unités de transformation agricole et les foyers ruraux hors-réseau.",
    descEn:
      "APTIC-R deploys community solar micro-grids to power computer labs, agricultural processing units, and off-grid rural households.",
    descDe:
      "APTIC-R installiert gemeinschaftliche Solar-Mikronetze zur Versorgung von Computerräumen und landwirtschaftlichen Verarbeitungsbetrieben.",
    objectivesFr: JSON.stringify([
      "Électrifier 10 nouvelles écoles rurales chaque année grâce au photovoltaïque",
      "Former des techniciens locaux à la maintenance et au recyclage des batteries solaires",
      "Alimenter en continu les tiers-lieux et FabLabs en énergie 100% renouvelable",
    ]),
    actionsFr: JSON.stringify([
      "Installation de kits solaires modulaires dans les collèges ruraux",
      "Ateliers pratiques d'initiation à l'énergie solaire au FabLab d'Agbélouvé",
      "Mise en place de stations de recharge solaire pour le petit matériel agricole",
    ]),
    targetAudienceFr: "Écoles, coopératives villageoises, artisans et ménages ruraux",
    icon: "WheatIcon",
    imageUrl: "/photo-projet-phare.jpg",
    imageCaptionFr: "Installation de panneaux solaires pour l'autonomie énergétique villageoise",
    imageTag: "Ancrage Terrain",
    order: 7,
    active: true,
  }

  const existing = await prisma.domaine.findUnique({
    where: { code },
  })

  if (existing) {
    await prisma.domaine.update({
      where: { code },
      data: newDomain,
    })
    console.log("✅ Domaine mis à jour : Énergie solaire & Autonomie")
  } else {
    await prisma.domaine.create({
      data: newDomain,
    })
    console.log("✅ 7ème Domaine créé : Énergie solaire & Autonomie")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
