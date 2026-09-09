import type {
  CandidateApplicationInput,
  PartnerRequestInput,
} from "./validations"

export type CandidateStatus = "NEW" | "REVIEW" | "SELECTED" | "INTERVIEW" | "CHOSEN" | "PARTNER_VALIDATION" | "PREPARATION" | "ARRIVED" | "COMPLETED" | "REJECTED" | "ARCHIVED"

// Constrained status transition map
export const ALLOWED_STATUS_TRANSITIONS: Record<CandidateStatus, CandidateStatus[]> =
  {
    NEW: ["REVIEW", "REJECTED"],
    REVIEW: ["SELECTED", "REJECTED", "NEW"],
    SELECTED: ["INTERVIEW", "REJECTED", "REVIEW"],
    INTERVIEW: ["CHOSEN", "REJECTED", "SELECTED"],
    CHOSEN: ["PARTNER_VALIDATION", "REJECTED", "INTERVIEW"],
    PARTNER_VALIDATION: ["PREPARATION", "REJECTED", "CHOSEN"],
    PREPARATION: ["ARRIVED", "REJECTED", "PARTNER_VALIDATION"],
    ARRIVED: ["COMPLETED", "PREPARATION"],
    COMPLETED: ["ARCHIVED"],
    REJECTED: ["REVIEW", "ARCHIVED"],
    ARCHIVED: [],
  }

export interface CandidateRecord {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  country: string
  city?: string
  dateOfBirth: string
  createdAt: string
  updatedAt: string
}

export interface ApplicationRecord {
  id: string
  referenceNumber: string
  candidateId: string
  candidate: CandidateRecord
  status: CandidateStatus
  lang: "FR" | "EN" | "DE"
  education?: string
  fieldOfStudy?: string
  profession?: string
  experience?: string
  skills: string[]
  arrivalDate?: string
  duration: string
  motivation: string
  projectExp?: string
  source?: string
  documents: {
    id: string
    type: "CV" | "MOTIVATION_LETTER" | "PORTFOLIO"
    originalName: string
    storageKey: string
    size: number
    mimeType: string
    createdAt: string
  }[]
  notes: { id: string; author: string; content: string; date: string }[]
  statusHistory: {
    id: string
    fromStatus: CandidateStatus
    toStatus: CandidateStatus
    changedBy: string
    changedAt: string
    note?: string
  }[]
  createdAt: string
  updatedAt: string
}

export interface PartnerRequestRecord {
  id: string
  orgName: string
  country: string
  website?: string
  contactPerson: string
  email: string
  orgType: string
  volunteerCount?: string
  targetCountries?: string
  programme?: string
  message: string
  docFile?: string
  createdAt: string
}

// Initial seed applications with Candidate separation
const initialApplications: ApplicationRecord[] = [
  {
    id: "APP_001",
    referenceNumber: "CAND-2026-0001",
    candidateId: "CAND_001",
    candidate: {
      id: "CAND_001",
      firstName: "Jonas",
      lastName: "Müller",
      email: "jonas.m@example.de",
      phone: "+49 151 23456789",
      country: "Germany",
      city: "Munich",
      dateOfBirth: "1998-04-12",
      createdAt: "2025-08-10T14:30:00.000Z",
      updatedAt: "2025-08-10T14:30:00.000Z",
    },
    status: "INTERVIEW",
    lang: "EN",
    education: "M.Sc. Computer Science",
    fieldOfStudy: "Software Engineering & IoT",
    profession: "Fullstack Developer",
    experience: "2–5 years",
    skills: [
      "Web Development",
      "Mobile Development",
      "Arduino",
      "IoT",
      "Python",
    ],
    arrivalDate: "2025-10-01",
    duration: "9 months",
    motivation:
      "I want to apply my technical background to solve real challenges alongside farming cooperatives in Agbélouvé. Low-tech and offline tools are the most meaningful engineering challenge.",
    projectExp:
      "Built a local sensor network for agricultural soil monitoring with automated SMS alerts.",
    source: "weltwärts",
    documents: [
      {
        id: "doc_1",
        type: "CV",
        originalName: "CV_Jonas_Muller_2025.pdf",
        storageKey: "private/cv/c001_cv.pdf",
        size: 1048576,
        mimeType: "application/pdf",
        createdAt: "2025-08-10",
      },
      {
        id: "doc_2",
        type: "MOTIVATION_LETTER",
        originalName: "Cover_Letter_Jonas.pdf",
        storageKey: "private/letters/c001_lettre.pdf",
        size: 524288,
        mimeType: "application/pdf",
        createdAt: "2025-08-10",
      },
    ],
    notes: [
      {
        id: "n1",
        author: "Koffi A. (APTIC-R)",
        content:
          "Excellent profil technique. Très motivé par le travail de terrain et les solutions SMS.",
        date: "2025-08-15",
      },
      {
        id: "n2",
        author: "Afiwa D.",
        content: "Entretien vidéo programmé pour le 22 août.",
        date: "2025-08-18",
      },
    ],
    statusHistory: [
      {
        id: "sh1",
        fromStatus: "NEW",
        toStatus: "REVIEW",
        changedBy: "Admin",
        changedAt: "2025-08-12",
        note: "Dossier complet",
      },
      {
        id: "sh2",
        fromStatus: "REVIEW",
        toStatus: "SELECTED",
        changedBy: "Koffi A.",
        changedAt: "2025-08-15",
        note: "Pré-sélectionné",
      },
      {
        id: "sh3",
        fromStatus: "SELECTED",
        toStatus: "INTERVIEW",
        changedBy: "Afiwa D.",
        changedAt: "2025-08-18",
        note: "Convocation entretien",
      },
    ],
    createdAt: "2025-08-10T14:30:00.000Z",
    updatedAt: "2025-08-18T10:00:00.000Z",
  },
  {
    id: "APP_002",
    referenceNumber: "CAND-2026-0002",
    candidateId: "CAND_002",
    candidate: {
      id: "CAND_002",
      firstName: "Claire",
      lastName: "Dubois",
      email: "claire.d@example.fr",
      phone: "+33 6 98 76 54 32",
      country: "France",
      city: "Lyon",
      dateOfBirth: "2000-09-24",
      createdAt: "2025-08-20T09:15:00.000Z",
      updatedAt: "2025-08-20T09:15:00.000Z",
    },
    status: "SELECTED",
    lang: "FR",
    education: "Master Gestion de Projets Ruraux",
    fieldOfStudy: "Développement Rural & Agroécologie",
    profession: "Chargée de mission développement",
    experience: "1–2 years",
    skills: [
      "Agriculture",
      "Communication",
      "Graphic Design",
      "Project Management",
    ],
    arrivalDate: "2025-11-15",
    duration: "12 months",
    motivation:
      "Convaincue que l'inclusion numérique et l'agroécologie doivent se construire avec les communautés locales.",
    projectExp:
      "Animation d’ateliers d’initiation aux outils numériques pour des coopératives maraîchères.",
    source: "France Volontaires",
    documents: [
      {
        id: "doc_3",
        type: "CV",
        originalName: "CV_Claire_Dubois.pdf",
        storageKey: "private/cv/c002_cv.pdf",
        size: 840000,
        mimeType: "application/pdf",
        createdAt: "2025-08-20",
      },
      {
        id: "doc_4",
        type: "PORTFOLIO",
        originalName: "Portfolio_Claire.pdf",
        storageKey: "private/portfolios/c002_port.pdf",
        size: 4500000,
        mimeType: "application/pdf",
        createdAt: "2025-08-20",
      },
    ],
    notes: [
      {
        id: "n3",
        author: "Koffi A.",
        content:
          "Très bon profil pédagogique et communication. Candidature pré-sélectionnée.",
        date: "2025-08-22",
      },
    ],
    statusHistory: [
      {
        id: "sh4",
        fromStatus: "NEW",
        toStatus: "REVIEW",
        changedBy: "Admin",
        changedAt: "2025-08-21",
      },
      {
        id: "sh5",
        fromStatus: "REVIEW",
        toStatus: "SELECTED",
        changedBy: "Koffi A.",
        changedAt: "2025-08-22",
      },
    ],
    createdAt: "2025-08-20T09:15:00.000Z",
    updatedAt: "2025-08-22T16:00:00.000Z",
  },
  {
    id: "APP_003",
    referenceNumber: "CAND-2026-0003",
    candidateId: "CAND_003",
    candidate: {
      id: "CAND_003",
      firstName: "Thomas",
      lastName: "Laurent",
      email: "thomas.l@example.be",
      phone: "+32 470 12 34 56",
      country: "Belgium",
      city: "Bruxelles",
      dateOfBirth: "1997-12-05",
      createdAt: "2025-08-12T11:00:00.000Z",
      updatedAt: "2025-08-12T11:00:00.000Z",
    },
    status: "CHOSEN",
    lang: "FR",
    education: "Ingénieur Agronome",
    fieldOfStudy: "Sciences du Sol & Irrigation",
    profession: "Agronome",
    experience: "2–5 years",
    skills: ["Agriculture", "Data Science", "IoT", "Digital Education"],
    arrivalDate: "2025-10-01",
    duration: "12 months",
    motivation:
      "Partager des techniques durables de gestion de l’eau tout en découvrant les savoirs agricoles togolais.",
    projectExp:
      "Conception de systèmes de micro-irrigation à gravité couplés à des capteurs d’humidité low-cost.",
    source: "Corps de solidarité européen",
    documents: [
      {
        id: "doc_5",
        type: "CV",
        originalName: "CV_Thomas_Laurent.pdf",
        storageKey: "private/cv/c003_cv.pdf",
        size: 920000,
        mimeType: "application/pdf",
        createdAt: "2025-08-12",
      },
    ],
    notes: [
      {
        id: "n4",
        author: "Direction APTIC-R",
        content: "Candidat retenu pour la mission agro-numérique 2025-2026.",
        date: "2025-08-28",
      },
    ],
    statusHistory: [
      {
        id: "sh6",
        fromStatus: "NEW",
        toStatus: "REVIEW",
        changedBy: "Admin",
        changedAt: "2025-08-14",
      },
      {
        id: "sh7",
        fromStatus: "REVIEW",
        toStatus: "SELECTED",
        changedBy: "Admin",
        changedAt: "2025-08-18",
      },
      {
        id: "sh8",
        fromStatus: "SELECTED",
        toStatus: "INTERVIEW",
        changedBy: "Admin",
        changedAt: "2025-08-23",
      },
      {
        id: "sh9",
        fromStatus: "INTERVIEW",
        toStatus: "CHOSEN",
        changedBy: "Direction",
        changedAt: "2025-08-28",
      },
    ],
    createdAt: "2025-08-12T11:00:00.000Z",
    updatedAt: "2025-08-28T14:20:00.000Z",
  },
  {
    id: "APP_004",
    referenceNumber: "CAND-2026-0004",
    candidateId: "CAND_004",
    candidate: {
      id: "CAND_004",
      firstName: "Sarah",
      lastName: "Lindqvist",
      email: "sarah.l@example.se",
      phone: "+46 70 123 4567",
      country: "Sweden",
      city: "Stockholm",
      dateOfBirth: "2001-02-18",
      createdAt: "2025-08-30T17:45:00.000Z",
      updatedAt: "2025-08-30T17:45:00.000Z",
    },
    status: "NEW",
    lang: "EN",
    education: "B.Sc. Interaction Design",
    fieldOfStudy: "UX / UI & Digital Inclusion",
    profession: "Junior Product Designer",
    experience: "Less than 1 year",
    skills: [
      "Graphic Design",
      "Communication",
      "Content Creation",
      "Digital Education",
    ],
    arrivalDate: "2026-01-10",
    duration: "6 months",
    motivation:
      "Designing accessible, intuitive interfaces for offline rural tools is my passion. I want to co-create with users on the ground.",
    projectExp:
      "Designed an offline visual icon-based interface for low-literacy farmers.",
    source: "LinkedIn",
    documents: [
      {
        id: "doc_6",
        type: "CV",
        originalName: "CV_Sarah_Lindqvist.pdf",
        storageKey: "private/cv/c004_cv.pdf",
        size: 1200000,
        mimeType: "application/pdf",
        createdAt: "2025-08-30",
      },
    ],
    notes: [],
    statusHistory: [
      {
        id: "sh10",
        fromStatus: "NEW",
        toStatus: "NEW",
        changedBy: "Système",
        changedAt: "2025-08-30",
        note: "Candidature reçue",
      },
    ],
    createdAt: "2025-08-30T17:45:00.000Z",
    updatedAt: "2025-08-30T17:45:00.000Z",
  },
]

class DataStore {
  private applications: ApplicationRecord[] = []
  private partnerRequests: PartnerRequestRecord[] = []
  private listeners: (() => void)[] = []

  constructor() {
    this.init()
  }

  private init() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("apticr_applications_store_v2")
      if (saved) {
        try {
          this.applications = JSON.parse(saved)
        } catch {
          this.applications = [...initialApplications]
        }
      } else {
        this.applications = [...initialApplications]
        this.persist()
      }
    } else {
      this.applications = [...initialApplications]
    }
  }

  private persist() {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "apticr_applications_store_v2",
        JSON.stringify(this.applications),
      )
    }
    this.notify()
  }

  private notify() {
    this.listeners.forEach((cb) => cb())
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb)
    }
  }

  public getApplications(): ApplicationRecord[] {
    return [...this.applications]
  }

  public getApplicationById(id: string): ApplicationRecord | undefined {
    return this.applications.find(
      (a) => a.id === id || a.referenceNumber === id || a.candidateId === id,
    )
  }

  public addCandidateApplication(
    input: CandidateApplicationInput,
    lang: "FR" | "EN" | "DE" = "FR",
  ): ApplicationRecord {
    const nextSeq = this.applications.length + 1
    const year = new Date().getFullYear()
    const refNum = `CAND-${year}-${String(nextSeq).padStart(4, "0")}`
    const candId = `CAND_${String(nextSeq).padStart(3, "0")}`
    const appId = `APP_${String(nextSeq).padStart(3, "0")}`

    const newCandidate: CandidateRecord = {
      id: candId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      country: input.country,
      city: input.city,
      dateOfBirth: input.dob,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const newApplication: ApplicationRecord = {
      id: appId,
      referenceNumber: refNum,
      candidateId: candId,
      candidate: newCandidate,
      status: "NEW",
      lang,
      education: input.education,
      fieldOfStudy: input.fieldOfStudy,
      profession: input.profession,
      experience: input.experience,
      skills: input.skills,
      arrivalDate: input.arrivalDate,
      duration: input.duration,
      motivation: input.motivation,
      projectExp: input.projectExp,
      source: input.source || "Direct Website",
      documents: input.cvFile
        ? [
            {
              id: `doc_${Date.now()}`,
              type: "CV",
              originalName: input.cvFile,
              storageKey: `private/cv/${appId}_cv.pdf`,
              size: 1024000,
              mimeType: "application/pdf",
              createdAt: new Date().toISOString().split("T")[0],
            },
          ]
        : [],
      notes: [
        {
          id: `n_${Date.now()}`,
          author: "Système",
          content: "Candidature enregistrée automatiquement via le portail.",
          date: new Date().toISOString().split("T")[0],
        },
      ],
      statusHistory: [
        {
          id: `sh_${Date.now()}`,
          fromStatus: "NEW",
          toStatus: "NEW",
          changedBy: "Système",
          changedAt: new Date().toISOString().split("T")[0],
          note: "Dossier créé",
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.applications = [newApplication, ...this.applications]
    this.persist()
    return newApplication
  }

  public updateStatus(
    applicationId: string,
    newStatus: CandidateStatus,
    changedBy = "Admin",
    note?: string,
  ): boolean {
    const app = this.applications.find(
      (a) => a.id === applicationId || a.referenceNumber === applicationId,
    )
    if (!app) return false

    const oldStatus = app.status
    app.status = newStatus
    app.updatedAt = new Date().toISOString()

    app.statusHistory.push({
      id: `sh_${Date.now()}`,
      fromStatus: oldStatus,
      toStatus: newStatus,
      changedBy,
      changedAt: new Date().toISOString().split("T")[0],
      note,
    })

    if (note) {
      app.notes.push({
        id: `n_${Date.now()}`,
        author: changedBy,
        content: `Statut changé [${oldStatus} → ${newStatus}] : ${note}`,
        date: new Date().toISOString().split("T")[0],
      })
    }

    this.persist()
    return true
  }

  public addNote(
    applicationId: string,
    author: string,
    content: string,
  ): boolean {
    const app = this.applications.find(
      (a) => a.id === applicationId || a.referenceNumber === applicationId,
    )
    if (!app) return false

    app.notes.push({
      id: `n_${Date.now()}`,
      author,
      content,
      date: new Date().toISOString().split("T")[0],
    })
    app.updatedAt = new Date().toISOString()

    this.persist()
    return true
  }

  public addPartnerRequest(input: PartnerRequestInput): PartnerRequestRecord {
    const newRecord: PartnerRequestRecord = {
      id: `PR_${Date.now()}`,
      orgName: input.orgName,
      country: input.country,
      website: input.website,
      contactPerson: input.contactPerson,
      email: input.email,
      orgType: input.orgType,
      volunteerCount: input.volunteerCount,
      targetCountries: input.targetCountries,
      programme: input.programme,
      message: input.message,
      docFile: input.docFile,
      createdAt: new Date().toISOString(),
    }
    this.partnerRequests.push(newRecord)
    return newRecord
  }

  public getPartnerRequests(): PartnerRequestRecord[] {
    return [...this.partnerRequests]
  }
}

export const store = new DataStore()
export default store
