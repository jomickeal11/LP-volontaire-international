"use client"

import AdminDashboard from "@/views/admin/AdminDashboard"
import { useRouter } from "next/navigation"
import type { Page } from "@/types"
import type { DashboardData } from "@/lib/dashboard"

export default function AdminDashboardClientWrapper({ data }: { data: DashboardData }) {
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

  return <AdminDashboard data={data} navigate={handleNavigate} />
}
