import { requireAdminPagePermission } from "@/lib/access-control"
import React from "react"
import AdminNewsletter from "@/views/admin/AdminNewsletter"

export default async function BackofficeNewsletterPage() {
  await requireAdminPagePermission("newsletter:prepare")
  return <AdminNewsletter />
}
