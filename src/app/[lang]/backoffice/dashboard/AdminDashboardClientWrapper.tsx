"use client"

import AdminDashboard from "@/views/admin/AdminDashboard"
import { useRouter } from "next/navigation"
import type { Page } from "@/types"
import type { DashboardData } from "@/lib/dashboard"

export default function AdminDashboardClientWrapper({ data, lang = "fr" }: { data: DashboardData; lang?: string }) {
  const router = useRouter()

  const handleNavigate = (page: Page) => {
    switch (page) {
      case "home":
        router.push(`/${lang}`)
        break
      case "admin-applications":
        router.push(`/${lang}/backoffice/applications`)
        break
      case "admin-analytics":
        router.push(`/${lang}/backoffice/statistics`)
        break
      default:
        break
    }
  }

  return <AdminDashboard data={data} navigate={handleNavigate} lang={lang} />
}
