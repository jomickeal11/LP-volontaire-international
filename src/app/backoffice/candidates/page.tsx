import AdminCandidatesClientWrapper from "./AdminCandidatesClientWrapper"
import prisma from "@/lib/prisma"
import { formatDate } from "@/lib/dateUtils"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function AdminCandidatesPage() {
  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "fr"

  let rawCandidates: any[] = []
  try {
    rawCandidates = await prisma.candidat.findMany({
      where: {
        applications: {
          some: {
            status: {
              in: [
                "SELECTED",
                "CHOSEN",
                "PARTNER_VALIDATION",
                "PREPARATION",
                "ARRIVED",
                "COMPLETED",
              ],
            },
          },
        },
      },
      include: {
        applications: {
          orderBy: { createdAt: "desc" },
          include: {
            skills: {
              include: { skill: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (e) {
    console.error("Error loading candidates:", e)
  }

  const candidates = rawCandidates.map((c) => {
    const latestApp = c.applications?.[0]
    const allSkills: string[] = Array.from(
      new Set(
        (c.applications || []).flatMap((app: any) =>
          (app.skills || []).map((s: any) => s.skill.nameEn || s.skill.nameFr)
        )
      )
    ).filter(Boolean) as string[]

    let age: number | null = null
    if (c.dateOfBirth) {
      const diffMs = Date.now() - new Date(c.dateOfBirth).getTime()
      const ageDate = new Date(diffMs)
      age = Math.abs(ageDate.getUTCFullYear() - 1970)
    }

    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone || null,
      country: c.country,
      city: c.city || null,
      dateOfBirth: c.dateOfBirth ? c.dateOfBirth.toISOString() : null,
      age,
      createdAt: formatDate(c.createdAt, lang),
      applicationsCount: c.applications?.length || 0,
      latestApplicationId: latestApp?.id || null,
      latestStatus: latestApp?.status || null,
      latestFieldOfStudy: latestApp?.fieldOfStudy || null,
      skills: allSkills,
    }
  })

  return <AdminCandidatesClientWrapper candidates={candidates} lang={lang} />
}
