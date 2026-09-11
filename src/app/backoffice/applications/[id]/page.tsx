import AdminCandidateDetailWrapper from "./AdminCandidateDetailWrapper"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "fr"

  const application = await prisma.candidature.findUnique({
    where: { id: resolvedParams.id },
    include: {
      candidate: true,
      skills: {
        include: { skill: true }
      },
      notes: true,
      statusHistory: true,
      documents: true
    }
  })

  if (!application) {
    notFound()
  }

  // Serialize Dates to strings before passing to Client Component
  const applicationData = {
    ...application,
    createdAt: application.createdAt.toISOString(),
    updatedAt: application.updatedAt.toISOString(),
    arrivalDate: application.arrivalDate?.toISOString() || null,
    candidate: {
      ...application.candidate,
      dateOfBirth: application.candidate.dateOfBirth.toISOString(),
      createdAt: application.candidate.createdAt.toISOString(),
      updatedAt: application.candidate.updatedAt.toISOString(),
    },
    statusHistory: application.statusHistory.map((h: any) => ({
      ...h,
      changedAt: h.changedAt.toISOString(),
    })),
    notes: application.notes.map((n: any) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
    }))
  }

  return (
    <AdminCandidateDetailWrapper application={applicationData} lang={lang} />
  )
}
