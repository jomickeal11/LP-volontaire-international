import AdminPartnersClientWrapper from "./AdminPartnersClientWrapper"
import prisma from "@/lib/prisma"
import { formatDate } from "@/lib/dateUtils"

export const dynamic = "force-dynamic"

export default async function AdminPartnersPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const resolvedParams = await params
  const lang = resolvedParams.lang

  let rawPartners: any[] = []
  try {
    rawPartners = await (prisma as any).partenaire.findMany({
      include: {
        requests: true,
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (e) {
    console.error("Error loading partners:", e)
  }

  const partners = rawPartners.map((p) => {
    // Find any contact info from associated requests
    const latestRequest = p.requests?.[0]
    return {
      id: p.id,
      orgName: p.orgName,
      country: p.country,
      website: p.website,
      orgType: p.orgType,
      contactPerson: latestRequest?.contactPerson || "—",
      volunteerCount: latestRequest?.volunteerCount || "—",
      status: "ACTIVE" as const,
      createdAt: formatDate(p.createdAt, lang),
      requestsCount: p.requests?.length || 0,
    }
  })

  return <AdminPartnersClientWrapper partners={partners} lang={lang} />
}
