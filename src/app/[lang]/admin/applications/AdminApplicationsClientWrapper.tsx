"use client"

import AdminApplications, { type CandidateUI } from "@/views/admin/AdminApplications"
import { useRouter, useSearchParams } from "next/navigation"
import type { Page } from "@/types"
import { updateCandidateStatus } from "@/lib/actions"
import type { CandidateStatus } from "@prisma/client"

export default function AdminApplicationsClientWrapper({ applications }: { applications: CandidateUI[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("search") || searchParams.get("email") || ""

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
  
  const handleStatusChange = async (id: string, status: string) => {
    // Call server action to update status
    await updateCandidateStatus(id, status as CandidateStatus, "Status updated from list")
    // Refresh current route to fetch new data from DB
    router.refresh()
  }

  return (
    <AdminApplications
      applications={applications}
      navigate={handleNavigate}
      onSelectCandidate={handleSelectCandidate}
      onStatusChange={handleStatusChange}
      initialSearch={initialSearch}
    />
  )
}
