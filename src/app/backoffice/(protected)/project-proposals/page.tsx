import { notFound, redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import AdminProjectProposals from "@/views/admin/AdminProjectProposals"
import { getProjectProposalAdmin } from "@/lib/project-proposal-access"
import { cookies } from "next/headers"
import type { Language } from "@/types"
import type { Prisma } from "@prisma/client"

export const dynamic = "force-dynamic"
type ProposalWithAdminRelations = Prisma.PropositionProjetGetPayload<{
  include: {
    document: true
    notes: true
    statusHistory: true
    convertedProject: { select: { id: true; titleFr: true; slug: true } }
  }
}>

export default async function ProjectProposalsAdminPage() {
  const admin = await getProjectProposalAdmin()
  if (!admin) {
    const sessionCookie = (await cookies()).get("session")?.value
    if (!sessionCookie) redirect("/backoffice/login")
    notFound()
  }
  const cookieStore = await cookies()
  const locale = cookieStore.get("NEXT_LOCALE")?.value?.toUpperCase() || "FR"
  const lang = (["FR", "EN", "DE"].includes(locale) ? locale : "FR") as Language
  let proposals: ProposalWithAdminRelations[] = []
  let initialError = false
  try {
    proposals = await prisma.propositionProjet.findMany({
      include: {
        document: true,
        notes: { orderBy: { createdAt: "desc" } },
        statusHistory: { orderBy: { createdAt: "desc" } },
        convertedProject: {
          select: { id: true, titleFr: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("Failed to load project proposals for back-office:", error)
    initialError = true
  }
  return (
    <AdminProjectProposals
      lang={lang}
      initialError={initialError}
      proposals={proposals.map((proposal) => ({
        ...proposal,
        createdAt: proposal.createdAt.toISOString(),
        updatedAt: proposal.updatedAt.toISOString(),
        notes: proposal.notes.map((note) => ({
          id: note.id,
          authorName: note.authorName,
          content: note.content,
          createdAt: note.createdAt.toISOString(),
        })),
        statusHistory: proposal.statusHistory.map((entry) => ({
          id: entry.id,
          fromStatus: entry.fromStatus,
          toStatus: entry.toStatus,
          changedByName: entry.changedByName,
          createdAt: entry.createdAt.toISOString(),
        })),
        document: proposal.document
          ? {
              id: proposal.document.id,
              originalName: proposal.document.originalName,
              size: proposal.document.size,
            }
          : null,
      }))}
    />
  )
}
