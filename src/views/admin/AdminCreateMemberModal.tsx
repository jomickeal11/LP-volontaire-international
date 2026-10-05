"use client"

import React, { useState, useTransition } from "react"
import AdminCreateModal, {
  SectionTitle,
  inputClass,
  labelClass,
} from "./AdminCreateModal"
import { adminCreateMember } from "@/lib/cms-actions"

const CONTRIBUTION_TYPES = [
  { value: "COMPETENCES", label: "Compétences" },
  { value: "FINANCIER", label: "Financier" },
  { value: "VOLONTARIAT", label: "Volontariat" },
  { value: "RESEAU", label: "Réseau" },
  { value: "AUTRE", label: "Autre" },
]

const AVAILABILITIES = [
  { value: "HEBDOMADAIRE", label: "Hebdomadaire" },
  { value: "MENSUEL", label: "Mensuel" },
  { value: "PONCTUEL", label: "Ponctuel" },
  { value: "TEMPS_PLEIN", label: "Temps plein" },
]

export default function AdminCreateMemberModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => void
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})

  const set = (key: string) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }))

  const reset = () => {
    setForm({})
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    startTransition(async () => {
      const result: any = await adminCreateMember({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        profession: form.profession,
        organization: form.organization,
        country: form.country,
        city: form.city,
        domainsOfInterest: form.domainsOfInterest,
        contributionType: form.contributionType || "COMPETENCES",
        availability: form.availability || "HEBDOMADAIRE",
        motivation: form.motivation,
        membershipStatus: form.membershipStatus || "ACTIVE",
        membershipDate: form.membershipDate,
        notes: form.notes,
      })

      if (!result?.success) {
        setError(result?.error || "Erreur inconnue")
        return
      }

      setSuccess(
        `Membre créé avec succès (référence ${result.member?.referenceNumber}).`
      )
      onCreated()
      onClose()
    })
  }

  return (
    <AdminCreateModal
      open={open}
      title="Ajouter un membre"
      subtitle="Création administrative directe. Aucune demande d'adhésion ni historique d'adhésion n'est généré."
      onClose={() => {
        reset()
        onClose()
      }}
      onSubmit={handleSubmit}
      submitLabel={isPending ? "Création…" : "Créer le membre"}
      error={error}
      success={success}
    >
      <section className="space-y-4">
        <SectionTitle>Identité</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="mbr-firstName">Prénom *</label>
            <input id="mbr-firstName" required className={inputClass} value={form.firstName || ""} onChange={(e) => set("firstName")(e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="mbr-lastName">Nom *</label>
            <input id="mbr-lastName" required className={inputClass} value={form.lastName || ""} onChange={(e) => set("lastName")(e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="mbr-email">Email *</label>
            <input id="mbr-email" type="email" required className={inputClass} value={form.email || ""} onChange={(e) => set("email")(e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="mbr-phone">Téléphone</label>
            <input id="mbr-phone" className={inputClass} value={form.phone || ""} onChange={(e) => set("phone")(e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="mbr-country">Pays *</label>
            <input id="mbr-country" required className={inputClass} value={form.country || ""} onChange={(e) => set("country")(e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="mbr-city">Ville</label>
            <input id="mbr-city" className={inputClass} value={form.city || ""} onChange={(e) => set("city")(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Profil</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="mbr-profession">Profession</label>
            <input id="mbr-profession" className={inputClass} value={form.profession || ""} onChange={(e) => set("profession")(e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="mbr-organization">Organisation</label>
            <input id="mbr-organization" className={inputClass} value={form.organization || ""} onChange={(e) => set("organization")(e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="mbr-domainsOfInterest">Domaines / compétences (séparés par des virgules)</label>
            <input id="mbr-domainsOfInterest" className={inputClass} placeholder="Informatique, Éducation numérique" value={form.domainsOfInterest || ""} onChange={(e) => set("domainsOfInterest")(e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="mbr-contributionType">Domaine de contribution</label>
            <select id="mbr-contributionType" className={inputClass} value={form.contributionType || "COMPETENCES"} onChange={(e) => set("contributionType")(e.target.value)}>
              {CONTRIBUTION_TYPES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="mbr-availability">Disponibilité</label>
            <select id="mbr-availability" className={inputClass} value={form.availability || "HEBDOMADAIRE"} onChange={(e) => set("availability")(e.target.value)}>
              {AVAILABILITIES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="mbr-motivation">Motivation *</label>
            <textarea id="mbr-motivation" required rows={4} className={inputClass} value={form.motivation || ""} onChange={(e) => set("motivation")(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <SectionTitle>Informations adhésion</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass} htmlFor="mbr-membershipDate">Date d'adhésion</label>
            <input id="mbr-membershipDate" type="date" className={inputClass} value={form.membershipDate || ""} onChange={(e) => set("membershipDate")(e.target.value)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="mbr-membershipStatus">Statut</label>
            <select id="mbr-membershipStatus" className={inputClass} value={form.membershipStatus || "ACTIVE"} onChange={(e) => set("membershipStatus")(e.target.value)}>
              <option value="ACTIVE">Actif</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="mbr-notes">Notes internes</label>
            <textarea id="mbr-notes" rows={3} className={inputClass} value={form.notes || ""} onChange={(e) => set("notes")(e.target.value)} />
          </div>
        </div>
      </section>
    </AdminCreateModal>
  )
}