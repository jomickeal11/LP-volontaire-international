import type { Metadata } from "next"
import AdminTemoignages from "@/views/admin/AdminTemoignages"

export const metadata: Metadata = {
  title: "Témoignages | APTIC-R",
}

export default function AdminTemoignagesPage() {
  return <AdminTemoignages />
}