import { requireAdminPagePermission } from "@/lib/access-control"
import React from "react"
import AdminProjects from "@/views/admin/AdminProjects"

export default async function BackofficeProjectsPage() {
  await requireAdminPagePermission("content:read")
  return <AdminProjects />
}
