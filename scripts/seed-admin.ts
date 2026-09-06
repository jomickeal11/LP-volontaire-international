import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { config } from "dotenv"

// Load env vars
config()

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@apticr.tg"
  const password = process.env.ADMIN_INITIAL_PASSWORD

  if (!password) {
    console.error("❌ ERROR: ADMIN_INITIAL_PASSWORD is not set in .env")
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const admin = await prisma.utilisateur.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "SUPERADMIN",
    },
    create: {
      email,
      name: "Admin APTIC-R",
      passwordHash,
      role: "SUPERADMIN",
    },
  })

  console.log(`✅ Admin user seeded successfully: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
