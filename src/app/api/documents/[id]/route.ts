import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { files } from "@/lib/storage"
import { verifySession } from "@/lib/auth"
import {
  authorizeDocumentDownload,
  isCandidateDocumentAssociatedWithApplication,
} from "@/lib/document-download-access"

// Durée de validité de l'URL présignée en secondes (15 minutes)
const PRESIGNED_URL_EXPIRY = 15 * 60 // 15 minutes en secondes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession()
    const { id } = await params

    const decision = await authorizeDocumentDownload({
      session,
      findDocument: () => prisma.documentCandidature.findUnique({
        where: { id },
        select: { id: true, applicationId: true, storageKey: true, originalName: true },
      }),
      isAssociatedWithRecord: isCandidateDocumentAssociatedWithApplication,
      createSignedUrl: (document) => files.url(document.storageKey, {
        expiresIn: PRESIGNED_URL_EXPIRY,
        responseContentDisposition: `attachment; filename="${encodeURIComponent(document.originalName)}"`,
      }),
    })

    if (decision.kind === "unauthenticated") {
      return new NextResponse("Authentification administrateur requise.", { status: 401 })
    }
    if (decision.kind === "forbidden") {
      return new NextResponse("Droits administrateur insuffisants.", { status: 403 })
    }
    if (decision.kind === "not-found") {
      return new NextResponse("Document introuvable ou non associé à une candidature.", { status: 404 })
    }

    const { document, signedUrl } = decision

    // Audit log de téléchargement de document personnel (RGPD / Traçabilité)
    console.log(`[AUDIT] Document consulté : ID=${document.id} | Fichier="${document.originalName}" | AdminUserId=${session?.userId || "unknown"} | IP=${request.headers.get("x-forwarded-for") || "127.0.0.1"} | URL signée générée (expire dans ${PRESIGNED_URL_EXPIRY}s) | Date=${new Date().toISOString()}`)

    // Rediriger vers l'URL présignée - le téléchargement se fera directement depuis Object Storage
    return NextResponse.redirect(signedUrl, 307)
  } catch (error) {
    console.error("Error generating signed URL for document:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
