import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const code = "ENERGIE_SOLAIRE"

  const existing = await prisma.domaine.findUnique({
    where: { code },
  })

  if (existing) {
    await prisma.domaine.delete({
      where: { code },
    })
    console.log("✅ 7ème domaine 'Énergie solaire & Autonomie' supprimé avec succès de la base de données.")
  } else {
    console.log("Domaine non trouvé.")
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
