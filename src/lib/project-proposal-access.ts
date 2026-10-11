import { verifySession } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { hasAdminPermission } from "@/lib/access-control"

export const PROJECT_PROPOSAL_ADMIN_ROLES = new Set(["SUPER_ADMIN", "REQUEST_MANAGER", "SUPERADMIN", "ADMIN", "COORDINATOR", "REVIEWER"])

export async function getProjectProposalAdmin() {
  const session = await verifySession()
  if (!session?.userId) return null

  const user = await prisma.utilisateur.findUnique({
    where: { id: session.userId },
    select: { id: true, name: true, role: true },
  })
  if (!user || !hasAdminPermission(user.role, "requests:read")) return null

  return user
}
