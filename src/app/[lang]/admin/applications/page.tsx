"use client"

import AdminApplications from "@/views/admin/AdminApplications"
import { useRouter } from "next/navigation"
import type { Page } from "@/types"

export default function AdminApplicationsPage() {
  const router = useRouter()

  const handleNavigate = (page: Page) => {
    switch (page) {
      case "home":
        router.push("/")
        break
      case "admin-dashboard":
        router.push("/admin/dashboard")
        break
      case "admin-analytics":
        router.push("/admin/analytics")
        break
      default:
        break
    }
  }

  const handleSelectCandidate = (id: string) => {
    router.push(`/admin/applications/${id}`)
  }

  return (
    <AdminApplications
      navigate={handleNavigate}
      onSelectCandidate={handleSelectCandidate}
    />
  )
}
