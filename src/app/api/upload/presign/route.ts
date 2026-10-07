import { NextRequest, NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"
import { checkRateLimit, getClientIp } from "@/lib/security"
import {
  UPLOAD_POLICIES,
  buildStorageKey,
  contentTypeForExtension,
  getFilesInstance,
  resolveExtension,
  type UploadKind,
} from "@/lib/upload-policy"

const ADMIN_KINDS: UploadKind[] = ["image", "resource-pdf"]
const PRESIGN_TTL_SECONDS = 10 * 60

function errorResponse(status: number, error: string) {
  return NextResponse.json({ success: false, error }, { status })
}

/**
 * Émet une URL de téléversement présignée : le client envoie ensuite le
 * fichier directement au stockage (aucun transit par la fonction serveur,
 * donc aucune limite de payload Vercel).
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
    if (requiresAuth && (!session || !session.userId)) {
      return errorResponse(401, "Authentification requise.")
    }

    const ip = await getClientIp()
    const rateCheck = checkRateLimit(`upload-presign:${ip}`, requiresAuth ? 60 : 20, 10 * 60 * 1000)
    if (!rateCheck.allowed) {
      return errorResponse(429, "Trop de téléversements détectés depuis cette adresse. Veuillez patienter quelques minutes.")
    }

    const fileName = typeof body?.fileName === "string" ? body.fileName.trim() : ""
    const size = Number(body?.size)
    const declaredType = typeof body?.contentType === "string" ? body.contentType : undefined

    if (!fileName) {
      return errorResponse(400, "Aucun fichier fourni.")
    }
    if (!Number.isFinite(size) || size <= 0) {
      return errorResponse(400, "Aucun fichier fourni.")
    }
    if (size > policy.maxSizeBytes) {
      return errorResponse(
        400,
        `${fileName} dépasse la taille maximale autorisée (${Math.round(policy.maxSizeBytes / (1024 * 1024))} Mo).`
      )
    }

    const ext = resolveExtension(fileName, declaredType, policy.allowedExtensions)
    if (!ext) {
      return errorResponse(
        400,
        `Format non supporté pour ${fileName}. Formats acceptés : ${policy.allowedExtensions.join(", ").toUpperCase()}.`
      )
    }

    const key = buildStorageKey(kind, fileName, ext)
    const contentType = contentTypeForExtension(ext)

    const instance = getFilesInstance(policy.bucket)
    const signed = await instance.signedUploadUrl(key, {
      expiresIn: PRESIGN_TTL_SECONDS,
      contentType,
      maxSize: policy.maxSizeBytes,
      minSize: 1,
    })

    return NextResponse.json({
      success: true,
      key,
      contentType,
      method: signed.method,
      url: signed.url,
      headers: "headers" in signed ? signed.headers : undefined,
      fields: "fields" in signed ? signed.fields : undefined,
    })
  } catch (error: any) {
    console.error("Error presigning upload:", error)
    return errorResponse(500, error.message || "Erreur lors de la génération du lien de téléversement.")
  }
}
