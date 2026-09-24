import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { verifySession } from "@/lib/auth"

const MAX_PDF_SIZE = 50 * 1024 * 1024 // 50 Mo max pour les rapports et guides officiels

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "Authentification requise." },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier fourni." },
        { status: 400 }
      )
    }

    if (file.size > MAX_PDF_SIZE) {
      return NextResponse.json(
        { success: false, error: "Le fichier dépasse la taille maximale autorisée (50 Mo)." },
        { status: 400 }
      )
    }

    const originalName = file.name
    const ext = path.extname(originalName).toLowerCase()

    if (ext !== ".pdf" && file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Format non supporté. Seuls les fichiers PDF (.pdf) sont acceptés." },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Enregistrement dans public/uploads/resources pour accès direct et conservation exacte
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "resources")
    await mkdir(uploadsDir, { recursive: true })

    // Normalisation du nom de fichier pour éviter les conflits tout en préservant le nom d'origine
    const sanitizedBase = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_\-\.]/g, "_")
    const filename = `${sanitizedBase}_${Date.now()}_${randomUUID().slice(0, 6)}${ext}`
    const filePath = path.join(uploadsDir, filename)

    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/resources/${filename}`

    // Formatage lisible de la taille
    let fileSizeStr = `${(file.size / 1024).toFixed(0)} Ko`
    if (file.size >= 1024 * 1024) {
      fileSizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} Mo`
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: originalName,
      fileSize: file.size,
      fileSizeStr,
      mimeType: file.type || "application/pdf",
    })
  } catch (error: any) {
    console.error("Error uploading PDF resource:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors du téléversement du fichier PDF." },
      { status: 500 }
    )
  }
}
