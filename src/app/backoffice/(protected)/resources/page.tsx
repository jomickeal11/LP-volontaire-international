import { requireAdminPagePermission } from "@/lib/access-control"
import type { Metadata } from "next"
import AdminResources from "@/views/admin/AdminResources"

export const metadata: Metadata = {
  title: "Ressources | APTIC-R",
}

export default async function RootAdminResourcesPage() {
  await requireAdminPagePermission("content:read")
  return <AdminResources />
}

