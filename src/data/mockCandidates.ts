import {
  store,
  type ApplicationRecord,
  type CandidateStatus as StoreStatus,
} from "../lib/store"

export type CandidateStatus = "NEW" | "REVIEW" | "SELECTED" | "INTERVIEW" | "CHOSEN" | "PARTNER_VALIDATION" | "PREPARATION" | "ARRIVED" | "COMPLETED"

export interface Candidate {
  id: string
  applicationId: string
  referenceNumber: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  city: string
  dob: string
  education: string
  fieldOfStudy: string
  profession: string
  experience: string
  skills: string[]
  arrivalDate: string
  duration: "6 months" | "9 months" | "12 months"
  motivation: string
  projectExperience: string
  source: string
  language: "FR" | "EN" | "DE"
  status: CandidateStatus
  appliedAt: string
  notes: string[]
  statusHistory: { status: CandidateStatus; date: string; by: string }[]
}

export function mapLegacyToStoreStatus(s: CandidateStatus): StoreStatus {
  return s as StoreStatus
}

export function transformApplicationToCandidate(
  r: ApplicationRecord,
): Candidate {
  const c = r.candidate
  return {
    id: r.id,
    applicationId: r.id,
    referenceNumber: r.referenceNumber,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone || "+33 6 00 00 00 00",
    country: c.country,
    city: c.city || "",
    dob: c.dateOfBirth,
    education: r.education || "",
    fieldOfStudy: r.fieldOfStudy || "",
    profession: r.profession || "",
    experience: r.experience || "1–2 years",
    skills: r.skills,
    arrivalDate: r.arrivalDate || "2025-10-01",
    duration: r.duration as "6 months" | "9 months" | "12 months" || "6 months",
    motivation: r.motivation,
    projectExperience: r.projectExp || "",
    source: r.source || "Website",
    language: r.lang,
    status: r.status as CandidateStatus || "NEW",
    appliedAt: r.createdAt.split("T")[0],
    notes: r.notes.map((n) => `[${n.author}] ${n.content}`),
    statusHistory: r.statusHistory.map((sh) => ({
      status: sh.toStatus as CandidateStatus || "NEW",
      date: sh.changedAt.split("T")[0],
      by: sh.changedBy,
    })),
  }
}

export const transformRecordToCandidate = transformApplicationToCandidate

export function getLiveCandidates(): Candidate[] {
  return store.getApplications().map(transformApplicationToCandidate)
}

export const mockCandidates: Candidate[] = getLiveCandidates()

export const statusColors: Record<CandidateStatus, {
  bg: string
  text: string
  label: string
}> = {
  NEW: { bg: "#EEF1F6", text: "#4A5A6A", label: "Nouveau" },
  REVIEW: { bg: "#FEF3C7", text: "#92400E", label: "Révision" },
  SELECTED: { bg: "#DBEAFE", text: "#1E40AF", label: "Sélectionné" },
  INTERVIEW: { bg: "#E0E7FF", text: "#4338CA", label: "Entretien" },
  CHOSEN: { bg: "#D1FAE5", text: "#065F46", label: "Choisi" },
  PARTNER_VALIDATION: {
    bg: "#FDE68A",
    text: "#78350F",
    label: "Val. Partenaire",
  },
  PREPARATION: { bg: "#E6F4EC", text: "#2E7D52", label: "Préparation" },
  ARRIVED: { bg: "#CCFBF1", text: "#065F46", label: "Arrivé" },
  COMPLETED: { bg: "#F3F4F6", text: "#374151", label: "Complété" },
}
