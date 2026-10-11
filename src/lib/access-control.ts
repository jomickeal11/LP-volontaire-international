import "server-only"

import { verifySession } from "@/lib/auth"
import { notFound } from "next/navigation"
import { hasAdminPermission, type AdminPermission } from "@/lib/admin-permissions"

export { hasAdminPermission, normalizeAdminRole } from "@/lib/admin-permissions"
export type { AdminPermission, AdminRole } from "@/lib/admin-permissions"

export async function authorizeAdminPermission(permission: AdminPermission) {
  const session = await verifySession()
  if (!session?.userId || !hasAdminPermission(session.role, permission)) return null
  return session
}

export async function hasCurrentAdminPermission(permission: AdminPermission): Promise<boolean> {
  return Boolean(await authorizeAdminPermission(permission))
}

export async function requireAdminPagePermission(...permissions: AdminPermission[]) {
  const session = await verifySession()
  if (!session?.userId || !permissions.some((permission) => hasAdminPermission(session.role, permission))) {
    notFound()
  }
  return session
}
