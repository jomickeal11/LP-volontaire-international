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
    
    // Auth check here (ideally verifying session role = ADMIN)
    // Skipped in this prototype for simplicity, but we ensure document exists.

    const document = await prisma.documentCandidature.findUnique({
      where: { id }
    })

    if (!document) {
      return new NextResponse("Document not found", { status: 404 })
    }

    const filepath = join(process.cwd(), "uploads", document.storageKey)
    const fileBuffer = await readFile(filepath)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": document.mimeType,
        "Content-Disposition": `attachment; filename="${document.originalName}"`,
        "Content-Length": document.size.toString(),
      }
    })
  } catch (error) {
    console.error("Error downloading document:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
