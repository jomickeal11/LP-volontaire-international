import type { UploadKind } from "./upload-policy"

interface UploadSuccessPayload {
  url?: string
  key?: string
  fileName?: string
  fileSize?: number
  fileSizeStr?: string
  mimeType?: string
  message?: string
}

export interface MediaUploadSuccess extends UploadSuccessPayload {
  success: true
  url: string
  fileName: string
  fileSize: number
  fileSizeStr: string
  mimeType: string
}

export interface PrivateUploadSuccess extends UploadSuccessPayload {
  success: true
  key: string
}

export interface UploadFailure {
  success: false
  error: string
}

export type MediaUploadResult = MediaUploadSuccess | UploadFailure
export type PrivateUploadResult = PrivateUploadSuccess | UploadFailure

async function readJson(response: Response): Promise<any | null> {
  return await response.json().catch(() => null)
}

async function uploadDirect(file: File, kind: UploadKind): Promise<(UploadSuccessPayload & { success: true }) | UploadFailure> {
  const presignResponse = await fetch("/api/upload/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind,
      fileName: file.name,
      size: file.size,
      contentType: file.type,
    }),
  })
  const presign = await readJson(presignResponse)
  if (!presignResponse.ok || !presign?.success) {
    return {
      success: false,
      error: presign?.error || "Erreur lors de la préparation du téléversement.",
    }
  }

  let uploadResponse: Response
  if (presign.method === "POST" && presign.fields) {
    const formData = new FormData()
    for (const [field, value] of Object.entries(presign.fields as Record<string, string>)) {
      formData.append(field, value)
    }
    formData.append("file", file)
    uploadResponse = await fetch(presign.url, { method: "POST", body: formData })
  } else if (presign.method === "PUT") {
    uploadResponse = await fetch(presign.url, {
      method: "PUT",
      headers: (presign.headers as Record<string, string>) || {},
      body: file,
    })
  } else {
    return { success: false, error: "Réponse de téléversement invalide." }
  }

  if (!uploadResponse.ok) {
    if (uploadResponse.status === 403) {
      return { success: false, error: "Le lien de téléversement a expiré. Veuillez réessayer." }
    }
    if (uploadResponse.status === 413) {
      return { success: false, error: "Le fichier dépasse la taille maximale autorisée." }
    }
    return {
      success: false,
      error: `Le téléversement a échoué (code ${uploadResponse.status}). Vérifiez la taille et le format du fichier.`,
    }
  }

  const confirmResponse = await fetch("/api/upload/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind,
      key: presign.key,
      fileName: file.name,
      contentType: presign.contentType,
    }),
  })
  const confirm = await readJson(confirmResponse)
  if (!confirmResponse.ok || !confirm?.success) {
    return { success: false, error: confirm?.error || "Le fichier téléversé est invalide." }
  }

  return { success: true, ...confirm }
}

/**
 * Téléverse un média public (image CMS ou PDF ressources).
 * Échec métier → `{ success: false, error }` ; seules les erreurs réseau lèvent.
 */
export async function uploadMediaFile(
  file: File,
  kind: "image" | "resource-pdf"
): Promise<MediaUploadResult> {
  const result = await uploadDirect(file, kind)
  if (!result.success) return result
  if (!result.url || !result.fileName || result.fileSize === undefined || !result.fileSizeStr) {
    return { success: false, error: "Réponse de téléversement invalide." }
  }
  return {
    success: true,
    url: result.url,
    fileName: result.fileName,
    fileSize: result.fileSize,
    fileSizeStr: result.fileSizeStr,
    mimeType: result.mimeType || "application/octet-stream",
  }
}

/**
 * Téléverse un document privé (candidature ou partenariat) vers le bucket
 * `documents` ; la clé retournée sera revalidée côté serveur au submit.
 */
export async function uploadPrivateFile(
  file: File,
  kind: "candidate-doc" | "partner-doc" | "project-proposal-doc"
): Promise<PrivateUploadResult> {
  const result = await uploadDirect(file, kind)
  if (!result.success) return result
  if (!result.key) {
    return { success: false, error: "Réponse de téléversement invalide." }
  }
  return { success: true, key: result.key, mimeType: result.mimeType, fileSize: result.fileSize }
}
