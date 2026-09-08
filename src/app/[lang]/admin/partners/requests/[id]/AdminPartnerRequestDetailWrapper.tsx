"use client"

import AdminPartnerRequestDetail, {
  type PartnerRequestDetailData,
} from "@/views/admin/AdminPartnerRequestDetail"
import { useRouter } from "next/navigation"
import type { Page } from "@/types"
import { updatePartnerRequestStatus } from "@/lib/actions"
import type { PartnerRequestStatus } from "@/views/admin/AdminPartnerRequests"

export default function AdminPartnerRequestDetailWrapper({
  data,
  lang,
}: {
  data: PartnerRequestDetailData
  lang: string
}) {
  const router = useRouter()

  const handleNavigate = (page: Page) => {
    switch (page) {
      case "home":
        router.push(`/${lang}`)
        break
      case "admin-partner-requests":
        router.push(`/${lang}/admin/partners/requests`)
        break
      case "admin-partners":
        router.push(`/${lang}/admin/partners`)
        break
      case "admin-applications":
        router.push(`/${lang}/admin/applications`)
        break
      case "admin-dashboard":
        router.push(`/${lang}/admin/dashboard`)
        break
      default:
        router.push(`/${lang}/admin/partners/requests`)
        break
    }
  }

  const handleStatusChange = async (id: string, status: PartnerRequestStatus) => {
    await updatePartnerRequestStatus(id, status)
    router.refresh()
  }

  return (
    <AdminPartnerRequestDetail
      data={data}
      navigate={handleNavigate}
      onStatusChange={handleStatusChange}
    />
  )
}
