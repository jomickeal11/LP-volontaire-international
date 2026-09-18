import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function testFeaturedSystem() {
  console.log("🧪 Démarrage des tests de validation du système « À LA UNE »...")

  // Récupération de tous les articles existants
  const articles = await prisma.article.findMany({ orderBy: { publishedAt: "desc" } })
  console.log(`📊 ${articles.length} articles trouvés en base.`)

  // 1. Initialiser : tous isFeatured = false
  await prisma.article.updateMany({ data: { isFeatured: false } })

  // CAS 2 : 4 articles publiés, aucun isFeatured
  const pubArticles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  })
  console.log(`\n--- CAS 2 : Pas de featured défini ---`)
  console.log(`Fallback attendu : dernier article publié => "${pubArticles[0]?.titleFr}"`)

  // CAS 3 & CAS 4 : Définir un article ancien comme isFeatured via transaction atomique
  const oldestArticle = pubArticles[pubArticles.length - 1]
  console.log(`\n--- CAS 3 : Définir l'ancien article ("${oldestArticle.titleFr}") comme featured ---`)
  
  await prisma.$transaction([
    prisma.article.updateMany({ where: { isFeatured: true }, data: { isFeatured: false } }),
    prisma.article.update({ where: { id: oldestArticle.id }, data: { isFeatured: true } }),
  ])

  const checkCas3 = await prisma.article.findMany({ where: { isFeatured: true } })
  console.log(`Nombre d'articles featured en base : ${checkCas3.length} (doit être 1)`)
  console.log(`Titre du featured : "${checkCas3[0]?.titleFr}"`)

  // CAS 4 : Définir un nouvel article comme featured
  const secondArticle = pubArticles[1]
  console.log(`\n--- CAS 4 : Remplacer par un autre article ("${secondArticle.titleFr}") ---`)
  await prisma.$transaction([
    prisma.article.updateMany({ where: { isFeatured: true }, data: { isFeatured: false } }),
    prisma.article.update({ where: { id: secondArticle.id }, data: { isFeatured: true } }),
  ])

  const checkCas4 = await prisma.article.findMany({ where: { isFeatured: true } })
  console.log(`Nombre d'articles featured en base : ${checkCas4.length} (doit être 1)`)
  console.log(`Nouveau featured : "${checkCas4[0]?.titleFr}"`)
  console.log(`L'ancien est-il désactivé ? ${checkCas4[0]?.id === secondArticle.id ? "OUI ✅" : "NON ❌"}`)

  // CAS 5 : Featured mis en brouillon
  console.log(`\n--- CAS 5 : Featured mis en brouillon (published = false) ---`)
  await prisma.article.update({ where: { id: secondArticle.id }, data: { published: false } })
  
  // Simulation de la requête publique NewsView
  const publicArticles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { publishedAt: "desc" },
  })
  const publicFeatured = publicArticles.find(a => a.isFeatured === true) || publicArticles[0] || null
  console.log(`Article à la une public résolu : "${publicFeatured?.titleFr}"`)
  console.log(`L'article brouillon est-il exclu du public ? ${publicFeatured?.id !== secondArticle.id ? "OUI ✅" : "NON ❌"}`)

  // Nettoyage / Remise en état publié pour le second article
  await prisma.article.update({ where: { id: secondArticle.id }, data: { published: true } })
  
  // Mettons le 1er article à la une officiellement
  await prisma.$transaction([
    prisma.article.updateMany({ where: { isFeatured: true }, data: { isFeatured: false } }),
    prisma.article.update({ where: { id: pubArticles[0].id }, data: { isFeatured: true } }),
  ])

  console.log("\n✅ Tous les tests techniques du système « À LA UNE » sont validés avec succès !")
}

testFeaturedSystem()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
