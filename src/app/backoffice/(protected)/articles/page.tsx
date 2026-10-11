import { requireAdminPagePermission } from "@/lib/access-control"
import React from "react"
import AdminArticles from "@/views/admin/AdminArticles"

export default async function BackofficeArticlesPage() {
  await requireAdminPagePermission("content:read")
  return <AdminArticles />
}
