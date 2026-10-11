import { requireAdminPagePermission } from "@/lib/access-control"
import React from "react"
import AdminMemberApplications from "@/views/admin/AdminMemberApplications"

export default async function BackofficeMemberApplicationsPage() {
  await requireAdminPagePermission("requests:read")
  return <AdminMemberApplications />
}
