import { prisma } from "../src/lib/prisma"

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

async function migrateLegacyAlbums() {
  console.log("Starting legacy album migration...")
  
  // Find all medias with non-null album and null albumId
  const medias = await prisma.media.findMany({
    where: {
      album: { not: null },
      albumId: null,
    },
    select: {
      id: true,
      album: true,
      url: true,
      thumbnailUrl: true,
      order: true,
    },
  })

  console.log(`Found ${medias.length} media items with legacy text albums.`)

  const albumNames = [...new Set(medias.map((m) => m.album?.trim()).filter(Boolean))] as string[]
  console.log("Distinct album names:", albumNames)

  for (let i = 0; i < albumNames.length; i++) {
    const name = albumNames[i]
    let slug = slugify(name)
    if (!slug) slug = `album-${i + 1}`

    // Ensure slug uniqueness
    let finalSlug = slug
    let counter = 1
    while (await prisma.album.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter}`
      counter++
    }

    // Find cover image from first media in this album
    const firstMedia = medias.find((m) => m.album?.trim() === name)
    const coverImage = firstMedia?.thumbnailUrl || firstMedia?.url || null

    // Create Album record: French title gets the name, English and German remain null/empty (no false translation)
    const album = await prisma.album.create({
      data: {
        slug: finalSlug,
        titleFr: name,
        titleEn: null,
        titleDe: null,
        descriptionFr: null,
        descriptionEn: null,
        descriptionDe: null,
        coverImage,
        published: true,
        order: i,
      },
    })
    console.log(`Created album: "${album.titleFr}" (id: ${album.id}, slug: ${album.slug})`)

    // Update all medias associated with this album name
    const updateRes = await prisma.media.updateMany({
      where: {
        album: name,
        albumId: null,
      },
      data: {
        albumId: album.id,
      },
    })
    console.log(`Linked ${updateRes.count} media records to album ${album.id}`)
  }

  const totalAlbums = await prisma.album.count()
  const totalLinked = await prisma.media.count({ where: { albumId: { not: null } } })
  console.log(`Migration completed successfully! Total albums in DB: ${totalAlbums}, Total linked medias: ${totalLinked}`)
}

migrateLegacyAlbums()
  .catch((e) => {
    console.error("Migration failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
