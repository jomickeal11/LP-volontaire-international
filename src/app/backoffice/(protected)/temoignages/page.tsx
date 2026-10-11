import { requireAdminPagePermission } from "@/lib/access-control"
import type { Metadata } from "next"
import AdminTemoignages from "@/views/admin/AdminTemoignages"

export const metadata: Metadata = {
  title: "Témoignages | APTIC-R",
}

export default async function RootAdminTemoignagesPage() {
  await requireAdminPagePermission("content:read")
  return <AdminTemoignages />
}