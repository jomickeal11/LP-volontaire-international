import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const SKILLS = [
  { slug: "computer-science", nameFr: "Informatique", nameEn: "Computer Science", nameDe: "Informatik", category: "IT" },
  { slug: "data", nameFr: "Données", nameEn: "Data Science", nameDe: "Daten", category: "IT" },
  { slug: "web-development", nameFr: "Développement web", nameEn: "Web Development", nameDe: "Webentwicklung", category: "IT" },
  { slug: "mobile-development", nameFr: "Développement mobile", nameEn: "Mobile Development", nameDe: "Mobile Entwicklung", category: "IT" },
  { slug: "cybersecurity", nameFr: "Cybersécurité", nameEn: "Cybersecurity", nameDe: "Cybersicherheit", category: "IT" },
  { slug: "agriculture", nameFr: "Agriculture", nameEn: "Agriculture", nameDe: "Landwirtschaft", category: "AGRICULTURE" },
  { slug: "graphic-design", nameFr: "Conception graphique", nameEn: "Graphic Design", nameDe: "Grafikdesign", category: "CREATIVE" },
  { slug: "communication", nameFr: "Communication", nameEn: "Communication", nameDe: "Kommunikation", category: "CREATIVE" },
  { slug: "content-creation", nameFr: "Création de contenu", nameEn: "Content Creation", nameDe: "Inhaltserstellung", category: "CREATIVE" },
  { slug: "arduino", nameFr: "Arduino", nameEn: "Arduino", nameDe: "Arduino", category: "ENGINEERING" },
  { slug: "raspberry-pi", nameFr: "Raspberry Pi", nameEn: "Raspberry Pi", nameDe: "Raspberry Pi", category: "ENGINEERING" },
  { slug: "iot", nameFr: "IoT", nameEn: "IoT", nameDe: "IoT", category: "ENGINEERING" },
  { slug: "digital-education", nameFr: "Éducation numérique", nameEn: "Digital Education", nameDe: "Digitale Bildung", category: "IT" },
  { slug: "project-management", nameFr: "Gestion de projet", nameEn: "Project Management", nameDe: "Projektmanagement", category: "IT" },
]

async function main() {
  console.log("Seeding skills...")
  for (const s of SKILLS) {
    await prisma.competence.upsert({
      where: { slug: s.slug },
      update: s,
      create: s,
    })
  }
  console.log("Done seeding skills.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
