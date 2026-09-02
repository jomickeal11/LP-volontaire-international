"use client"

import { use } from "react"
import AdminCandidateDetail from "@/views/admin/AdminCandidateDetail"
import { useRouter } from "next/navigation"
import type { Page } from "@/types"

export default function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const resolvedParams = use(params)

  const handleNavigate = (page: Page) => {
    switch (page) {
      case "home":
        router.push("/")
        break
      case "admin-applications":
        router.push("/admin/applications")
        break
      case "admin-dashboard":
        router.push("/admin/dashboard")
        break
      default:
        router.push("/admin/applications")
        break
    }
  }

  return (
    <AdminCandidateDetail
      candidateId={resolvedParams.id}
      navigate={handleNavigate}
    />
  )
}
