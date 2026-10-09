"use client"

import AdminCandidates, {
  type CandidateDirectoryItemUI,
} from "@/views/admin/AdminCandidates"
import { useRouter } from "next/navigation"
import type { Page } from "@/types"

export default function AdminCandidatesClientWrapper({
  candidates,
  lang,
}: {
  candidates: CandidateDirectoryItemUI[]
  lang: string
}) {
  const router = useRouter()

  const handleNavigate = (page: Page) => {
    switch (page) {
      case "home":
        router.push(`/${lang}`)
        break
      case "admin-dashboard":
        router.push("/backoffice/dashboard")
        break
      case "admin-applications":
        router.push("/backoffice/applications")
        break
      case "admin-candidates":
        router.push("/backoffice/candidates")
        break
      case "admin-analytics":
        router.push("/backoffice/statistics")
        break
      case "admin-partner-requests":
        router.push("/backoffice/partners/requests")
        break
      case "admin-partners":
        router.push("/backoffice/partners")
        break
      default:
        break
    }
  }

  const handleSelectCandidate = (candidate: CandidateDirectoryItemUI) => {
    const query = candidate.email || `${candidate.firstName} ${candidate.lastName}`
    router.push(`/backoffice/applications?search=${encodeURIComponent(query)}`)
  }

  return (
    <AdminCandidates
      candidates={candidates}
      navigate={handleNavigate}
      onSelectCandidate={handleSelectCandidate}
    />
  )
}
