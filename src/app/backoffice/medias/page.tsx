import type { Metadata } from "next"
import AdminMedias from "@/views/admin/AdminMedias"

export const metadata: Metadata = {
  title: "Médias & Galerie | APTIC-R",
}

export default function RootAdminMediasPage() {
  return <AdminMedias />
}