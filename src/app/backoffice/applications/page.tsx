import AdminApplicationsClientWrapper from "./AdminApplicationsClientWrapper"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function AdminApplicationsPage() {
  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "fr"

  const rawApplications = await prisma.candidature.findMany({
    include: {
      candidate: true,
      skills: {
        include: { skill: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  // Format to match the view's expected type
  const applications = rawApplications.map(app => ({
    id: app.id,
    firstName: app.candidate.firstName,
    lastName: app.candidate.lastName,
    email: app.candidate.email,
    country: app.candidate.country,
    appliedAt: app.createdAt.toISOString().split('T')[0],
    duration: app.duration === 'SIX_MONTHS' ? '6 months' : app.duration === 'NINE_MONTHS' ? '9 months' : '12 months',
    status: app.status as any,
    fieldOfStudy: app.fieldOfStudy || "",
    language: app.lang,
    skills: app.skills.map(s => s.skill.nameEn)
  }))

  return (
    <AdminApplicationsClientWrapper applications={applications} lang={lang} />
  )
}
