import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { hasAdminPermission } from "@/lib/admin-permissions"
import { checkRateLimit, getClientIp } from "@/lib/security"
import {
  UPLOAD_POLICIES,
  getFilesInstance,
  publicUrlForKey,
  validateStoredDocument,
  type UploadKind,
} from "@/lib/upload-policy"

const ADMIN_KINDS: UploadKind[] = ["image", "resource-pdf"]

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
  return `${(bytes / 1024).toFixed(0)} Ko`
}

function errorResponse(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status })
}

/**
 * Contrôle un objet venu directement du client : existence, taille réelle
 * et octets magiques. Un fichier invalide est supprimé du stockage.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const kind = body?.kind as UploadKind
    const policy = UPLOAD_POLICIES[kind]
    if (!policy) {
      return errorResponse(400, "Type de téléversement invalide.")
    }

    const session = await verifySession()
    const requiresAuth = ADMIN_KINDS.includes(kind)
    if (requiresAuth && (!session || !session.userId || !hasAdminPermission(session.role, "uploads:content"))) {
      return errorResponse(401, "Authentification requise.")
    }

    const ip = await getClientIp()
    const rateCheck = checkRateLimit(`upload-confirm:${ip}`, requiresAuth ? 60 : 20, 10 * 60 * 1000)
    if (!rateCheck.allowed) {
      return errorResponse(429, "Trop de téléversements détectés depuis cette adresse. Veuillez patienter quelques minutes.")
    }

    const storageKey = typeof body?.key === "string" ? body.key : ""
    const originalName = typeof body?.fileName === "string" ? body.fileName.trim() : ""
    const mimeType = typeof body?.contentType === "string" ? body.contentType : undefined

    if (!storageKey || !originalName) {
      return errorResponse(400, "Aucun fichier fourni.")
    }

    const validation = await validateStoredDocument(kind, { storageKey, originalName, mimeType })
    if (!validation.valid) {
      const instance = getFilesInstance(policy.bucket)
      await instance.delete(storageKey).catch(() => undefined)
      return errorResponse(400, validation.error || "Le téléversement est invalide.")
    }

    const size = validation.size || 0
    return NextResponse.json({
      success: true,
      key: storageKey,
      url: policy.publicPrefix ? publicUrlForKey(storageKey) : undefined,
      filename: storageKey.split("/").pop(),
      fileName: originalName,
      fileSize: size,
      fileSizeStr: formatFileSize(size),
      mimeType: validation.mimeType || "application/octet-stream",
      message: "Fichier téléversé avec succès.",
    })
  } catch (error: any) {
    console.error("Error confirming upload:", error)
    return errorResponse(500, error.message || "Erreur lors de la vérification du fichier téléversé.")
  }
}
