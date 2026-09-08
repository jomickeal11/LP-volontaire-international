import AdminPartnerRequestsClientWrapper from "./AdminPartnerRequestsClientWrapper"
import prisma from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function AdminPartnerRequestsPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const resolvedParams = await params
  const lang = resolvedParams.lang

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
    createdAt: new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(req.createdAt)),
    documentsCount: req.documents?.length || 0,
  }))

  return <AdminPartnerRequestsClientWrapper requests={requests} lang={lang} />
}
