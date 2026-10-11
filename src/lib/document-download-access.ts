import { hasAdminPermission } from "./admin-permissions"

export const DOCUMENT_DOWNLOAD_ADMIN_ROLES = new Set(["SUPER_ADMIN", "REQUEST_MANAGER", "SUPERADMIN", "ADMIN", "COORDINATOR", "REVIEWER"])

export interface DocumentDownloadSession {
  userId: string
  role: string
}

export type DocumentDownloadDecision<T> =
  | { kind: "unauthenticated" }
  | { kind: "forbidden" }
  | { kind: "not-found" }
  | { kind: "ready"; document: T; signedUrl: string }

export function isCandidateDocumentAssociatedWithApplication(document: { applicationId: string | null }): boolean {
  return Boolean(document.applicationId?.trim())
}

export function isPartnerDocumentAssociatedWithRecord(document: {
  partnerId: string | null
  partnerRequestId: string | null
}): boolean {
  return Boolean(document.partnerId?.trim() || document.partnerRequestId?.trim())
}

export async function authorizeDocumentDownload<T>(input: {
  session: DocumentDownloadSession | null
  findDocument: () => Promise<T | null>
  isAssociatedWithRecord: (document: T) => boolean
  createSignedUrl: (document: T) => Promise<string>
}): Promise<DocumentDownloadDecision<T>> {
  if (!input.session?.userId) return { kind: "unauthenticated" }
  if (!hasAdminPermission(input.session.role, "requests:read")) return { kind: "forbidden" }

  const document = await input.findDocument()
  if (!document || !input.isAssociatedWithRecord(document)) return { kind: "not-found" }

  const signedUrl = await input.createSignedUrl(document)
  return { kind: "ready", document, signedUrl }
}
