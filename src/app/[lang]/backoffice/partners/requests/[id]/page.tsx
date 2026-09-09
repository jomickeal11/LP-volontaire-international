import AdminPartnerRequestDetailWrapper from "./AdminPartnerRequestDetailWrapper"
import prisma from "@/lib/prisma"
import { formatDate } from "@/lib/dateUtils"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function PartnerRequestDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const resolvedParams = await params
  const { lang, id } = resolvedParams

  let request: any = null
  try {
    request = await (prisma as any).demandePartenariat.findUnique({
      where: { id },
      include: {
        partner: true,
        documents: true,
      },
    })
  } catch (e) {
    console.error("Error fetching partner request:", e)
  }

  if (!request) {
    notFound()
  }

  const serializedData = {
    id: request.id,
    referenceNumber: request.referenceNumber || null,
    orgName: request.orgName,
    country: request.country,
    website: request.website || null,
    orgType: request.orgType,
    contactPerson: request.contactPerson,
    email: request.email,
    phone: request.phone || null,
    volunteerCount: request.volunteerCount || null,
    targetCountries: request.targetCountries || null,
    programme: request.programme || null,
    message: request.message,
    consent: request.consent,
    status: request.status || "NEW",
    createdAt: formatDate(request.createdAt, lang, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    updatedAt: formatDate(request.updatedAt, lang, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    partner: request.partner
      ? {
          id: request.partner.id,
          orgName: request.partner.orgName,
          country: request.partner.country,
        }
      : null,
    documents: (request.documents || []).map((doc: any) => ({
      id: doc.id,
      originalName: doc.originalName,
      storageKey: doc.storageKey,
      mimeType: doc.mimeType,
      size: doc.size,
      createdAt: formatDate(doc.createdAt, lang),
    })),
  }

  return <AdminPartnerRequestDetailWrapper data={serializedData} lang={lang} />
}
