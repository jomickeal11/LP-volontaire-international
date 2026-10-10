import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { files } from "@/lib/storage"
import { verifySession } from "@/lib/auth"
import { getProjectProposalAdmin } from "@/lib/project-proposal-access"

const SIGNED_URL_TTL_SECONDS = 15 * 60

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getProjectProposalAdmin()
    if (!admin) {
      const session = await verifySession()
      return new NextResponse(
        session ? "Permission insuffisante." : "Authentification administrateur requise.",
        { status: session ? 403 : 401 }
      )
    }

    const { id } = await params
    const document = await prisma.documentPropositionProjet.findUnique({ where: { id } })
    if (!document) {
      return new NextResponse("Document de proposition introuvable.", { status: 404 })
    }

    const signedUrl = await files.url(document.storageKey, {
      expiresIn: SIGNED_URL_TTL_SECONDS,
      responseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(document.originalName)}`,
    })
    console.info(`[AUDIT] Project proposal document accessed: document=${document.id}, admin=${admin.id}, ip=${request.headers.get("x-forwarded-for") || "unknown"}`)
    return NextResponse.redirect(signedUrl, 307)
  } catch (error) {
    console.error("Error generating project proposal document URL:", error)
    return new NextResponse("Impossible de générer le lien de téléchargement.", { status: 500 })
  }
}
