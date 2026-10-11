export type AdminPermission =
  | "backoffice:access" | "dashboard:read" | "analytics:read" | "content:read" | "content:write"
  | "requests:read" | "requests:process" | "requests:export" | "requests:delete"
  | "candidate-document:read" | "partner-document:read" | "proposal-document:read"
  | "newsletter:prepare" | "newsletter:send" | "campaign-links:manage" | "uploads:content"
  | "contact:manage" | "admin-users:manage"

export type AdminRole = "SUPER_ADMIN" | "CONTENT_ADMIN" | "REQUEST_MANAGER"

const permissionByRole: Record<AdminRole, ReadonlySet<AdminPermission>> = {
  SUPER_ADMIN: new Set([
    "backoffice:access", "dashboard:read", "analytics:read", "content:read", "content:write",
    "requests:read", "requests:process", "requests:export", "requests:delete",
    "candidate-document:read", "partner-document:read", "proposal-document:read",
    "newsletter:prepare", "newsletter:send", "campaign-links:manage", "uploads:content",
    "contact:manage", "admin-users:manage",
  ]),
  CONTENT_ADMIN: new Set([
    "backoffice:access", "dashboard:read", "content:read", "content:write",
    "newsletter:prepare", "campaign-links:manage", "uploads:content",
  ]),
  REQUEST_MANAGER: new Set([
    "backoffice:access", "dashboard:read", "requests:read", "requests:process", "requests:export",
    "candidate-document:read", "partner-document:read", "proposal-document:read", "contact:manage",
  ]),
}

/** Temporary, non-persistent compatibility mapping for existing role strings. */
const legacyRoleMap: Readonly<Record<string, AdminRole>> = {
  SUPERADMIN: "SUPER_ADMIN", ADMIN: "SUPER_ADMIN", CONTENT_MANAGER: "CONTENT_ADMIN",
  COORDINATOR: "REQUEST_MANAGER",
}

export function normalizeAdminRole(role: string | null | undefined): AdminRole | null {
  if (!role) return null
  if (role === "SUPER_ADMIN" || role === "CONTENT_ADMIN" || role === "REQUEST_MANAGER") return role
  return legacyRoleMap[role] ?? null
}

export function hasAdminPermission(role: string | null | undefined, permission: AdminPermission): boolean {
  const normalized = normalizeAdminRole(role)
  return normalized ? permissionByRole[normalized].has(permission) : false
}
