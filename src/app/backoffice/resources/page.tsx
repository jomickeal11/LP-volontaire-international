import type { Metadata } from "next"
import AdminResources from "@/views/admin/AdminResources"

export const metadata: Metadata = {
  title: "Ressources | APTIC-R",
}

export default function RootAdminResourcesPage() {
  return <AdminResources />
}

