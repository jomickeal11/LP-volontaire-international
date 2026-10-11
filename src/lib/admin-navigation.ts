import { hasAdminPermission, type AdminPermission } from "./admin-permissions"
import type { Page } from "../types"

const permissionByPage: Partial<Record<Page, AdminPermission>> = {
  "admin-dashboard": "dashboard:read", "admin-analytics": "analytics:read",
  "admin-articles": "content:read", "admin-projects": "content:read", "admin-domains": "content:read",
  "admin-resources": "content:read", "admin-temoignages": "content:read", "admin-medias": "content:read", "admin-albums": "content:read",
  "admin-newsletter": "newsletter:prepare", "admin-newsletter-campaigns": "newsletter:prepare",
  "admin-applications": "requests:read", "admin-candidates": "requests:read", "admin-partner-requests": "requests:read",
  "admin-project-proposals": "requests:read", "admin-partners": "requests:read", "admin-member-applications": "requests:read",
    "admin-members": "requests:read", "admin-messages": "contact:manage", "admin-settings": "content:read", "admin-users": "admin-users:manage",
}

export function canRoleSeeAdminPage(role: string | null | undefined, page: Page): boolean {
  if (page === "admin-account") return hasAdminPermission(role, "backoffice:access")
  if (page === "admin-events") return hasAdminPermission(role, "content:read") || hasAdminPermission(role, "requests:read")
  const permission = permissionByPage[page]
  return permission ? hasAdminPermission(role, permission) : hasAdminPermission(role, "requests:read")
}

export function getVisibleAdminPages(role: string | null | undefined, pages: Page[]): Page[] {
  return pages.filter((page) => canRoleSeeAdminPage(role, page))
}
