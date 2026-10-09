"use client"

import AdminPartners, { type PartnerUI } from "@/views/admin/AdminPartners"
import { useRouter } from "next/navigation"
import type { Page } from "@/types"

export default function AdminPartnersClientWrapper({
  partners,
  lang,
}: {
  partners: PartnerUI[]
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

  const handleSelectPartner = (partner: PartnerUI) => {
    const query = partner.orgName || partner.contactPerson || ""
    router.push(`/backoffice/partners/requests?search=${encodeURIComponent(query)}`)
  }

  return (
    <AdminPartners
      partners={partners}
      navigate={handleNavigate}
      onSelectPartner={handleSelectPartner}
    />
  )
}
