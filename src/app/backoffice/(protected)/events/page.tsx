import { requireAdminPagePermission } from "@/lib/access-control"
import React from "react"
import AdminEvents from "@/views/admin/AdminEvents"

export default async function BackofficeEventsPage() {
  await requireAdminPagePermission("content:read", "requests:read")
  return <AdminEvents />
}
