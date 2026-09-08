"use client"

import AdminPartnerRequests, {
  type PartnerRequestUI,
  type PartnerRequestStatus,
} from "@/views/admin/AdminPartnerRequests"
import { useRouter, useSearchParams } from "next/navigation"
import type { Page } from "@/types"
import { updatePartnerRequestStatus } from "@/lib/actions"

export default function AdminPartnerRequestsClientWrapper({
  requests,
  lang,
}: {
  requests: PartnerRequestUI[]
  lang: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialSearch = searchParams.get("search") || searchParams.get("org") || searchParams.get("email") || ""

  const handleNavigate = (page: Page) => {
    switch (page) {
      case "home":
        router.push(`/${lang}`)
        break
      case "admin-dashboard":
        router.push(`/${lang}/admin/dashboard`)
        break
      case "admin-applications":
        router.push(`/${lang}/admin/applications`)
        break
      case "admin-analytics":
        router.push(`/${lang}/admin/analytics`)
        break
      case "admin-partner-requests":
        router.push(`/${lang}/admin/partners/requests`)
        break
      case "admin-partners":
        router.push(`/${lang}/admin/partners`)
        break
      default:
        break
    }
  }

  const handleSelectRequest = (id: string) => {
    router.push(`/${lang}/admin/partners/requests/${id}`)
  }

  const handleStatusChange = async (id: string, status: PartnerRequestStatus) => {
    await updatePartnerRequestStatus(id, status)
    router.refresh()
  }

  return (
    <AdminPartnerRequests
      requests={requests}
      navigate={handleNavigate}
      onSelectRequest={handleSelectRequest}
      onStatusChange={handleStatusChange}
      initialSearch={initialSearch}
    />
  )
}
