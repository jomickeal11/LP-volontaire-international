import { verifySession } from "@/lib/auth"
import prisma from "@/lib/prisma"

export const PROJECT_PROPOSAL_ADMIN_ROLES = new Set([
  "SUPERADMIN",
  "ADMIN",
  "COORDINATOR",
  "CONTENT_MANAGER",
])

export async function getProjectProposalAdmin() {
  const session = await verifySession()
  if (!session?.userId) return null

  const user = await prisma.utilisateur.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, role: true },
  })
  if (!user || !PROJECT_PROPOSAL_ADMIN_ROLES.has(user.role)) return null

  return user
}
