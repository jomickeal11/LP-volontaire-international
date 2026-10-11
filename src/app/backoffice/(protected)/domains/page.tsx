import { requireAdminPagePermission } from "@/lib/access-control"
import React from "react"
import AdminDomaines from "@/views/admin/AdminDomaines"

export default async function BackofficeDomainsPage() {
  await requireAdminPagePermission("content:read")
  return <AdminDomaines />
}
