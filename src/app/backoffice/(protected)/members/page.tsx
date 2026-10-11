import { requireAdminPagePermission } from "@/lib/access-control"
import React from "react"
import AdminMembers from "@/views/admin/AdminMembers"

export default async function BackofficeMembersPage() {
  await requireAdminPagePermission("requests:read")
  return <AdminMembers />
}
