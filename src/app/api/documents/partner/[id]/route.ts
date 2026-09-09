import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { readFile } from "fs/promises"
import { join } from "path"
import { verifySession } from "@/lib/auth"

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

    const filepath = join(process.cwd(), "uploads", document.storageKey)
    const fileBuffer = await readFile(filepath)

    // Audit log de téléchargement de document partenaire (Traçabilité)
    console.log(`[AUDIT] Document partenaire consulté : ID=${document.id} | Fichier="${document.originalName}" | AdminUserId=${session.userId} | IP=${request.headers.get("x-forwarded-for") || "127.0.0.1"} | Date=${new Date().toISOString()}`)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": document.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.originalName)}"`,
        "Content-Length": document.size.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "Pragma": "no-cache",
        "X-Content-Type-Options": "nosniff",
      }
    })
  } catch (error) {
    console.error("Error downloading partner document:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
