"use client"

import AdminCandidateDetail from "@/views/admin/AdminCandidateDetail"
import { useRouter } from "next/navigation"
import type { Page } from "@/types"
import { updateCandidateStatus, addCandidateNote, deleteCandidateNote } from "@/lib/actions"
import type { CandidateStatus } from "@prisma/client"

import { getLocaleFromLang, formatDate } from "@/lib/dateUtils"

export default function AdminCandidateDetailWrapper({ application, lang = "fr" }: { application: any; lang?: string }) {
  const router = useRouter()

  const targetLang = (lang || application.lang || "fr").toLowerCase()
  const locale = getLocaleFromLang(targetLang)

  const handleNavigate = (page: Page) => {
    switch (page) {
      case "home":
        router.push(`/${targetLang}`)
        break
      case "admin-applications":
        router.push(`/${targetLang}/backoffice/applications`)
        break
      case "admin-dashboard":
        router.push(`/${targetLang}/backoffice/dashboard`)
        break
      default:
        router.push(`/${targetLang}/backoffice/applications`)
        break
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    await updateCandidateStatus(id, status as CandidateStatus)
    router.refresh()
  }

  const handleAddNote = async (id: string, note: string) => {
    await addCandidateNote(id, note, "Admin APTIC-R")
    router.refresh()
  }

  const handleDeleteNote = async (noteId: string) => {
    await deleteCandidateNote(noteId)
    router.refresh()
  }

  // Transform the application data into the format expected by the UI if necessary
  const candidateUI = {
    ...application,
    firstName: application.candidate.firstName,
    lastName: application.candidate.lastName,
    email: application.candidate.email,
    phone: application.candidate.phone,
    country: application.candidate.country,
    city: application.candidate.city,
    dob: application.candidate.dateOfBirth 
      ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(application.candidate.dateOfBirth)) 
      : "",
    language: application.lang === "FR" ? "Français" : application.lang === "EN" ? "Anglais" : "Allemand",
    appliedAt: new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(application.createdAt)),
    arrivalDate: application.arrivalDate 
      ? new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(new Date(application.arrivalDate)) 
      : "Non renseignée",
    duration: application.duration === 'SIX_MONTHS' ? '6 mois' : application.duration === 'NINE_MONTHS' ? '9 mois' : '12 mois',
    source: application.source || "Non renseignée",
    education: application.education || "—",
    fieldOfStudy: application.fieldOfStudy || "—",
    profession: application.profession || "—",
    experience: application.experienceLevel === 'LESS_THAN_1_YEAR' ? '< 1 an' 
      : application.experienceLevel === 'ONE_TO_TWO_YEARS' ? '1 - 2 ans' 
      : application.experienceLevel === 'TWO_TO_FIVE_YEARS' ? '2 - 5 ans' 
      : application.experienceLevel === 'FIVE_PLUS_YEARS' ? '5+ ans' 
      : (application.experience || "—"),
    digitalSkillLevel: application.digitalSkillLevel || "—",
    languages: application.languages || null,
    reference: application.referenceNumber || application.reference || `CAND-${new Date().getFullYear()}-0001`,
    motivation: application.motivation || "",
    projectExperience: application.projectExperience || "—",
    skills: application.skills.map((s: any) => s.skill.nameFr || s.skill.nameEn),
    statusHistory: application.statusHistory ? application.statusHistory.map((h: any) => ({
      status: h.toStatus,
      date: formatDate(h.changedAt, targetLang, { day: "2-digit", month: "2-digit" }),
      by: h.changedByName
    })) : [],
    notes: application.notes ? application.notes.map((n: any) => ({
      id: n.id,
      content: n.content,
      createdAt: formatDate(n.createdAt, targetLang),
      author: n.authorName
    })) : [],
    documents: application.documents ? application.documents.map((d: any) => ({
      id: d.id,
      name: d.originalName,
      type: d.type
    })) : []
  }

  return (
    <AdminCandidateDetail
      candidateId={application.id}
      navigate={handleNavigate}
      application={candidateUI}
      locale={locale}
      lang={targetLang}
      onStatusChange={handleStatusChange}
      onAddNote={handleAddNote}
      onDeleteNote={handleDeleteNote}
    />
  )
}
