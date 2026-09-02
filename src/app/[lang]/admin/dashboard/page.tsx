"use client"

import AdminDashboard from "@/views/admin/AdminDashboard"
import { useRouter } from "next/navigation"
import type { Page } from "@/types"

export default function AdminDashboardPage() {
  const router = useRouter()

  const handleNavigate = (page: Page) => {
    switch (page) {
      case "home":
        router.push("/")
        break
      case "admin-applications":
        router.push("/admin/applications")
        break
      case "admin-analytics":
        router.push("/admin/analytics")
        break
      default:
        break
    }
  }

  return <AdminDashboard navigate={handleNavigate} />
}
