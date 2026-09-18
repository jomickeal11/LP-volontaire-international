import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { verifySession } from "@/lib/auth"

const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5 Mo
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"])

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || !session.userId) {
      return NextResponse.json(
        { success: false, error: "Authentification administrateur requise." },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier d'image fourni." },
        { status: 400 }
      )
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return NextResponse.json(
        { success: false, error: "La photo dépasse la taille maximale de 5 Mo." },
        { status: 400 }
      )
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Format d'image non supporté. Formats acceptés : JPEG, PNG, WEBP, AVIF.",
        },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Ensure uploads directory in public exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "team")
    await mkdir(uploadsDir, { recursive: true })

    const ext = path.extname(file.name) || ".jpg"
    const filename = `team_${Date.now()}_${randomUUID().slice(0, 8)}${ext}`
    const filePath = path.join(uploadsDir, filename)

    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/team/${filename}`

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      message: "Photo téléversée avec succès.",
    })
  } catch (error: any) {
    console.error("Error uploading image:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Erreur lors du téléversement de l'image." },
      { status: 500 }
    )
  }
}
