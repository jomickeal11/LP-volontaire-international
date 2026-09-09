import AdminPartnerRequestDetailWrapper from "./AdminPartnerRequestDetailWrapper"
import prisma from "@/lib/prisma"
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
    createdAt: new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(request.createdAt)),
    updatedAt: new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(request.updatedAt)),
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
      createdAt: new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(doc.createdAt)),
    })),
  }

  return <AdminPartnerRequestDetailWrapper data={serializedData} lang={lang} />
}
