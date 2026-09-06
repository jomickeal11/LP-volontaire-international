"use client"

import AdminCandidateDetail from "@/views/admin/AdminCandidateDetail"
import { useRouter } from "next/navigation"
import type { Page } from "@/types"
import { updateCandidateStatus, addCandidateNote } from "@/lib/actions"
import type { CandidateStatus } from "@prisma/client"

export default function AdminCandidateDetailWrapper({ application }: { application: any }) {
  const router = useRouter()

  const handleNavigate = (page: Page) => {
    switch (page) {
      case "home":
        router.push("/")
        break
      case "admin-applications":
        router.push("/admin/applications")
        break
      case "admin-dashboard":
        router.push("/admin/dashboard")
        break
      default:
        router.push("/admin/applications")
        break
    }
  }

  const handleStatusChange = async (id: string, status: string) => {
    await updateCandidateStatus(id, status as CandidateStatus, "Status updated from detail view")
    router.refresh()
  }

  const handleAddNote = async (id: string, note: string) => {
    await addCandidateNote(id, note, "Admin APTIC-R")
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
    dob: application.candidate.dateOfBirth ? new Date(application.candidate.dateOfBirth).toLocaleDateString() : "",
    language: application.lang,
    appliedAt: new Date(application.createdAt).toLocaleDateString(),
    duration: application.duration === 'SIX_MONTHS' ? '6 months' : application.duration === 'NINE_MONTHS' ? '9 months' : '12 months',
    skills: application.skills.map((s: any) => s.skill.nameEn),
    statusHistory: application.statusHistory ? application.statusHistory.map((h: any) => ({
      status: h.toStatus,
      date: new Date(h.changedAt).toLocaleString(),
      by: h.changedByName
    })) : [],
    notes: application.notes ? application.notes.map((n: any) => ({
      content: n.content,
      createdAt: new Date(n.createdAt).toLocaleString(),
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
      onStatusChange={handleStatusChange}
      onAddNote={handleAddNote}
    />
  )
}
