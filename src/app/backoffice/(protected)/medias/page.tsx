import { requireAdminPagePermission } from "@/lib/access-control"
import type { Metadata } from "next"
import AdminMedias from "@/views/admin/AdminMedias"

export const metadata: Metadata = {
  title: "Médias & Galerie | APTIC-R",
}

export default async function RootAdminMediasPage() {
  await requireAdminPagePermission("content:read")
  return <AdminMedias />
}