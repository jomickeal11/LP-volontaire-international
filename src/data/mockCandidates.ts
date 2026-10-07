export type CandidateStatus =
  | "NEW"
  | "REVIEW"
  | "SELECTED"
  | "INTERVIEW"
  | "CHOSEN"
  | "PARTNER_VALIDATION"
  | "PREPARATION"
  | "ARRIVED"
  | "COMPLETED"

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

export const mockCandidates: Candidate[] = []

export const statusColors: Record<
  CandidateStatus,
  {
    bg: string
    text: string
    label: string
  }
> = {
  NEW: { bg: "#EEF1F6", text: "#4A5A6A", label: "Nouveau" },
  REVIEW: { bg: "#FEF3C7", text: "#92400E", label: "Révision" },
  SELECTED: { bg: "#DBEAFE", text: "#1E40AF", label: "Sélectionné" },
  INTERVIEW: { bg: "#E0E7FF", text: "#4338CA", label: "Entretien" },
  CHOSEN: { bg: "#D1FAE5", text: "#065F46", label: "Retenu" },
  PARTNER_VALIDATION: {
    bg: "#FDE68A",
    text: "#78350F",
    label: "Val. Partenaire",
  },
  PREPARATION: { bg: "#E6F4EC", text: "#2E7D52", label: "Préparation" },
  ARRIVED: { bg: "#CCFBF1", text: "#065F46", label: "Arrivé" },
  COMPLETED: { bg: "#F3F4F6", text: "#374151", label: "Complété" },
}
