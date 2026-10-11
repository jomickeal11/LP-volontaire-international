import { normalizeAdminRole } from "./admin-permissions"

export const ADMIN_ROLES = ["SUPER_ADMIN", "CONTENT_ADMIN", "REQUEST_MANAGER"] as const
export type ManagedAdminRole = (typeof ADMIN_ROLES)[number]

export function isManagedAdminRole(value: unknown): value is ManagedAdminRole {
  return typeof value === "string" && ADMIN_ROLES.includes(value as ManagedAdminRole)
}

export function isInvitationUsable(invitation: {
  status: string
  expiresAt: Date
}, now = new Date()): boolean {
  return invitation.status === "SENT" && invitation.expiresAt.getTime() > now.getTime()
}

export function canRemoveActiveSuperAdmin(activeSuperAdminCount: number): boolean {
  return activeSuperAdminCount > 1
}

export function isActiveSuperAdmin(role: string, active: boolean): boolean {
  return active && normalizeAdminRole(role) === "SUPER_ADMIN"
}
