import AdminPartnerRequestsClientWrapper from "./AdminPartnerRequestsClientWrapper"
import prisma from "@/lib/prisma"
import { formatDate } from "@/lib/dateUtils"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export default async function AdminPartnerRequestsPage() {
  const cookieStore = await cookies()
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "fr"

  let rawRequests: any[] = []
  try {
    rawRequests = await (prisma as any).demandePartenariat.findMany({
      include: {
        documents: true,
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (e) {
    console.error("Failed to load partner requests:", e)
  }

  const requests = rawRequests.map((req) => ({
    id: req.id,
    referenceNumber: req.referenceNumber || "",
    orgName: req.orgName,
    country: req.country,
    website: req.website,
    orgType: req.orgType,
    contactPerson: req.contactPerson,
    email: req.email,
    phone: req.phone,
    volunteerCount: req.volunteerCount,
    targetCountries: req.targetCountries,
    programme: req.programme,
    message: req.message,
    status: req.status || "NEW",
    createdAt: formatDate(req.createdAt, lang),
    documentsCount: req.documents?.length || 0,
  }))

  return <AdminPartnerRequestsClientWrapper requests={requests} lang={lang} />
}
