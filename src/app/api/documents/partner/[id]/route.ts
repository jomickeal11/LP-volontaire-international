import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { files } from "@/lib/storage"
import { verifySession } from "@/lib/auth"

// Durée de validité de l'URL présignée en secondes (15 minutes)
const PRESIGNED_URL_EXPIRY = 15 * 60 // 15 minutes en secondes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return new NextResponse("Accès refusé. Authentification administrateur requise.", { status: 401 })
    }

    const { id } = await params

    const document = await (prisma as any).documentPartenaire.findUnique({
      where: { id }
    })

    if (!document) {
      return new NextResponse("Document partenaire non trouvé", { status: 404 })
    }

    // Générer une URL présignée temporaire vers le fichier dans Object Storage
    const signedUrl = await files.url(document.storageKey, {
      expiresIn: PRESIGNED_URL_EXPIRY,
      responseContentDisposition: `attachment; filename="${encodeURIComponent(document.originalName)}"`,
    })

    // Audit log de téléchargement de document partenaire (Traçabilité)
    console.log(`[AUDIT] Document partenaire consulté : ID=${document.id} | Fichier="${document.originalName}" | AdminUserId=${session.userId} | IP=${request.headers.get("x-forwarded-for") || "127.0.0.1"} | URL signée générée (expire dans ${PRESIGNED_URL_EXPIRY}s) | Date=${new Date().toISOString()}`)

    // Rediriger vers l'URL présignée - le téléchargement se fera directement depuis Object Storage
    return NextResponse.redirect(signedUrl, 307) // 307 Temporary Redirect preserve method
  } catch (error) {
    console.error("Error generating signed URL for partner document:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
