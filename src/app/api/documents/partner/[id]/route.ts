import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const document = await (prisma as any).documentPartenaire.findUnique({
      where: { id }
    })

    if (!document) {
      return new NextResponse("Document partenaire non trouvé", { status: 404 })
    }

    const filepath = join(process.cwd(), "uploads", document.storageKey)
    const fileBuffer = await readFile(filepath)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": document.mimeType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(document.originalName)}"`,
        "Content-Length": document.size.toString(),
      }
    })
  } catch (error) {
    console.error("Error downloading partner document:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
