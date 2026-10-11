import { requireAdminPagePermission } from "@/lib/access-control"
import React from "react"
import AdminMessages from "@/views/admin/AdminMessages"

export default async function BackofficeMessagesPage() {
  await requireAdminPagePermission("requests:read")
  return <AdminMessages />
}
