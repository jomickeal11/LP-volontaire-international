import {
  candidateApplicationSchema,
  partnerRequestSchema,
  updateStatusSchema,
  addNoteSchema,
  type CandidateApplicationInput,
  type PartnerRequestInput,
} from "./validations"
import {
  store,
  type ApplicationRecord,
  type CandidateStatus,
  type PartnerRequestRecord,
} from "./store"

export async function submitCandidateApplication(
  data: CandidateApplicationInput,
  lang: "FR" | "EN" | "DE" = "FR",
): Promise<{ success: boolean; data?: ApplicationRecord; error?: string }> {
  try {
    const validated = candidateApplicationSchema.parse(data)
    const record = store.addCandidateApplication(validated, lang)
    return { success: true, data: record }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur de validation"
    return { success: false, error: message }
  }
}

export async function submitPartnerRequest(
  data: PartnerRequestInput,
): Promise<{ success: boolean; data?: PartnerRequestRecord; error?: string }> {
  try {
    const validated = partnerRequestSchema.parse(data)
    const record = store.addPartnerRequest(validated)
    return { success: true, data: record }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur de validation"
    return { success: false, error: message }
  }
}

export async function updateCandidateStatus(
  applicationId: string,
  newStatus: CandidateStatus,
  noteContent?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    updateStatusSchema.parse({ candidateId: applicationId, newStatus })
    const success = store.updateStatus(
      applicationId,
      newStatus,
      "Admin APTIC-R",
      noteContent,
    )
    return { success }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur de mise à jour"
    return { success: false, error: message }
  }
}

export async function addCandidateNote(
  applicationId: string,
  content: string,
  author = "Admin APTIC-R",
): Promise<{ success: boolean; error?: string }> {
  try {
    addNoteSchema.parse({ candidateId: applicationId, content, author })
    const success = store.addNote(applicationId, author, content)
    return { success }
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Erreur d'ajout de note"
    return { success: false, error: message }
  }
}

export function getCandidatesList(filters?: {
  status?: string
  search?: string
}): ApplicationRecord[] {
  let list = store.getApplications()
  if (filters?.status && filters.status !== "ALL") {
    list = list.filter((c) => c.status === filters.status)
  }
  if (filters?.search) {
    const s = filters.search.toLowerCase()
    list = list.filter(
      (c) =>
        c.candidate.firstName.toLowerCase().includes(s) ||
        c.candidate.lastName.toLowerCase().includes(s) ||
        c.candidate.email.toLowerCase().includes(s) ||
        c.candidate.country.toLowerCase().includes(s) ||
        c.referenceNumber.toLowerCase().includes(s) ||
        c.skills.some((sk) => sk.toLowerCase().includes(s)),
    )
  }
  return list
}

export function getCandidateDetail(id: string): ApplicationRecord | undefined {
  return store.getApplicationById(id)
}
