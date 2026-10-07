import path from "path"
import { randomUUID } from "crypto"
import { files, mediaFiles } from "./storage"
import { verifyMagicBytes } from "./security"

/**
 * Politique d'upload centralisée.
 *
 * Utilisée par les endpoints de téléversement (presign/confirm) et par les
 * server actions qui valident un objet déjà déposé dans le stockage.
 * Une seule source de vérité pour : bucket, taille max, formats autorisés,
 * génération des clés et URLs publiques.
 */

export type UploadKind = "image" | "resource-pdf" | "candidate-doc" | "partner-doc"
export type UploadBucket = "media" | "documents"

export interface UploadKindPolicy {
  bucket: UploadBucket
  maxSizeBytes: number
  allowedExtensions: string[]
  /** Préfixe de clé dans le bucket média (null = bucket privé) */
  publicPrefix: string | null
  label: string
}

const MB = 1024 * 1024

const PRIVATE_DOC_EXTENSIONS = ["pdf", "doc", "docx", "odt", "ppt", "pptx", "jpg", "jpeg", "png"]

export const UPLOAD_POLICIES: Record<UploadKind, UploadKindPolicy> = {
  image: {
    bucket: "media",
    maxSizeBytes: 5 * MB,
    allowedExtensions: ["jpg", "jpeg", "png", "webp", "avif"],
    publicPrefix: "team/",
    label: "l'image",
  },
  "resource-pdf": {
    bucket: "media",
    maxSizeBytes: 50 * MB,
    allowedExtensions: ["pdf"],
    publicPrefix: "resources/",
    label: "le document PDF",
  },
  "candidate-doc": {
    bucket: "documents",
    maxSizeBytes: 15 * MB,
    allowedExtensions: PRIVATE_DOC_EXTENSIONS,
    publicPrefix: null,
    label: "le document",
  },
  "partner-doc": {
    bucket: "documents",
    maxSizeBytes: 15 * MB,
    allowedExtensions: PRIVATE_DOC_EXTENSIONS,
    publicPrefix: null,
    label: "le document",
  },
}

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  odt: "application/vnd.oasis.opendocument.text",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
}

export function getFilesInstance(bucket: UploadBucket) {
  return bucket === "media" ? mediaFiles : files
}

export function contentTypeForExtension(ext: string): string {
  return CONTENT_TYPES[ext] || "application/octet-stream"
}

/** Extension finale du fichier : nom d'origine si autorisé, sinon dérivée du type MIME. */
export function resolveExtension(
  fileName: string,
  contentType: string | undefined,
  allowedExtensions: string[]
): string | null {
  const rawExt = (fileName.split(".").pop() || "").toLowerCase().trim()
  if (rawExt && allowedExtensions.includes(rawExt)) return rawExt

  const byMime: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "application/vnd.oasis.opendocument.text": "odt",
    "application/vnd.ms-powerpoint": "ppt",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  }
  const derived = byMime[(contentType || "").toLowerCase()]
  if (derived && allowedExtensions.includes(derived)) return derived

  return null
}

/** Clé d'objet unique, calquée sur l'ancien schéma de noms de fichiers. */
export function buildStorageKey(kind: UploadKind, fileName: string, ext: string): string {
  if (kind === "image") {
    return `team_${Date.now()}_${randomUUID().slice(0, 8)}.${ext}`
  }
  if (kind === "resource-pdf") {
    const base = path.basename(fileName, path.extname(fileName)).replace(/[^a-zA-Z0-9_\-\.]/g, "_")
    return `${base}_${Date.now()}_${randomUUID().slice(0, 6)}.${ext}`
  }
  return `${randomUUID()}.${ext}`
}

/** URL applicative (résolue côté serveur vers le bucket au moment de la requête). */
export function publicUrlForKey(key: string): string {
  return `/uploads/${key}`
}

const STORAGE_KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{2,5}$/

export interface StoredDocumentDescriptor {
  storageKey: string
  originalName: string
  mimeType?: string
  size?: number
}

export interface StoredDocumentValidation {
  valid: boolean
  error?: string
  size?: number
  mimeType?: string
}

/**
 * Valide un objet déjà présent dans le stockage : clé au format attendu,
 * extension autorisée, existence, taille réelle, octets magiques.
 * Appelée par /api/upload/confirm ET par les server actions au moment du submit
 * (défense en profondeur : la clé provient toujours du client).
 */
export async function validateStoredDocument(
  kind: UploadKind,
  descriptor: StoredDocumentDescriptor
): Promise<StoredDocumentValidation> {
  const policy = UPLOAD_POLICIES[kind]
  const key = descriptor.storageKey

  if (!STORAGE_KEY_PATTERN.test(key)) {
    return { valid: false, error: `Clé de fichier invalide pour "${descriptor.originalName}".` }
  }

  const keyExt = (key.split(".").pop() || "").toLowerCase()
  if (!policy.allowedExtensions.includes(keyExt)) {
    return {
      valid: false,
      error: `Format de fichier non autorisé pour "${descriptor.originalName}". Formats acceptés : ${policy.allowedExtensions.join(", ")}.`,
    }
  }

  const originalExt = resolveExtension(descriptor.originalName, descriptor.mimeType, policy.allowedExtensions)
  if (originalExt !== keyExt) {
    return { valid: false, error: `Le format déclaré pour "${descriptor.originalName}" ne correspond pas au fichier stocké.` }
  }

  const instance = getFilesInstance(policy.bucket)

  try {
    const meta = await instance.head(key)
    if (!meta.size || meta.size <= 0) {
      return { valid: false, error: `Le fichier "${descriptor.originalName}" est vide.` }
    }
    if (meta.size > policy.maxSizeBytes) {
      return {
        valid: false,
        error: `Le fichier "${descriptor.originalName}" dépasse la taille maximale autorisée (${Math.round(policy.maxSizeBytes / MB)} Mo).`,
      }
    }

    const head = await instance.download(key, { range: { start: 0, end: 2047 } })
    const buffer = Buffer.from(await head.arrayBuffer())

    const magic = verifyMagicBytes(buffer, descriptor.originalName)
    if (!magic.valid) {
      return {
        valid: false,
        error: magic.reason || `Le contenu réel du fichier "${descriptor.originalName}" ne correspond pas à son format annoncé.`,
      }
    }

    return { valid: true, size: meta.size, mimeType: contentTypeForExtension(keyExt) }
  } catch (err) {
    console.error("validateStoredDocument error:", err)
    return { valid: false, error: `Le fichier "${descriptor.originalName}" est introuvable dans le stockage. Veuillez le téléverser à nouveau.` }
  }
}
