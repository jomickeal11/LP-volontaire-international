import AdminCandidateDetailWrapper from "./AdminCandidateDetailWrapper"
import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const resolvedParams = await params
  
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
    <AdminCandidateDetailWrapper application={applicationData} lang={resolvedParams.lang} />
  )
}
