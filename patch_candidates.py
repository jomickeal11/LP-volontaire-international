import re

with open('src/views/admin/AdminCandidates.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = re.sub(
    r'import { useState } from "react"',
    'import { useState, useEffect } from "react"\nimport { adminCreateCandidate, getSkills } from "@/lib/cms-actions"',
    content
)

# 2. State and Handlers
state_code = """  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [dbSkills, setDbSkills] = useState<{id: string, slug: string, nameFr: string}[]>([])

  useEffect(() => {
    if (isAddModalOpen && dbSkills.length === 0) {
      getSkills().then(res => {
        if (res.success) setDbSkills(res.skills as any)
      })
    }
  }, [isAddModalOpen])

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      country: formData.get("country") as string,
      city: formData.get("city") as string,
      dateOfBirth: formData.get("dateOfBirth") as string,
      education: formData.get("education") as string,
      fieldOfStudy: formData.get("fieldOfStudy") as string,
      profession: formData.get("profession") as string,
      experienceLevel: formData.get("experienceLevel") as string,
      digitalSkillLevel: formData.get("digitalSkillLevel") as string,
      skills: formData.getAll("skills") as string[],
      arrivalDate: formData.get("arrivalDate") as string,
      duration: formData.get("duration") as string,
      motivation: formData.get("motivation") as string,
      projectExperience: formData.get("projectExperience") as string,
      notes: formData.get("notes") as string,
      status: formData.get("status") as string,
    }
    const res = await adminCreateCandidate(data)
    setIsSubmitting(false)
    if (res.success) {
      setSuccess("Candidat créé avec succès.")
      setTimeout(() => {
        setIsAddModalOpen(false)
        setSuccess("")
        window.location.reload()
      }, 1500)
    } else {
      setError(res.error || "Une erreur est survenue.")
    }
  }

"""

content = content.replace('  const [page, setPage] = useState(1)', '  const [page, setPage] = useState(1)\n' + state_code)

# 3. Add Button
btn_code = """          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Ajouter un candidat
          </button>
"""
content = content.replace('          <button\n            onClick={() => navigate("admin-applications")}', btn_code + '          <button\n            onClick={() => navigate("admin-applications")}')

# 4. Add Modal
modal_code = """
      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-[#003366]">Ajouter un candidat (Création Admin)</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">{success}</div>}
            
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* IDENTITÉ */}
                <div className="md:col-span-2"><h3 className="font-bold text-slate-700 border-b pb-1">Identité</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Prénom *</label><input required name="firstName" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Nom *</label><input required name="lastName" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Email *</label><input required type="email" name="email" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Téléphone</label><input name="phone" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Date de naissance *</label><input required type="date" name="dateOfBirth" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Pays *</label><input required name="country" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Ville</label><input name="city" className="w-full border rounded p-2 text-sm" /></div>

                {/* PROFIL */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Profil & Compétences</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Niveau d'études</label><input name="education" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Domaine d'études</label><input name="fieldOfStudy" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Profession</label><input name="profession" className="w-full border rounded p-2 text-sm" /></div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Années d'expérience</label>
                  <select name="experienceLevel" className="w-full border rounded p-2 text-sm">
                    <option value="LESS_THAN_1_YEAR">Moins d'un an</option>
                    <option value="ONE_TO_TWO_YEARS">1 à 2 ans</option>
                    <option value="TWO_TO_FIVE_YEARS">2 à 5 ans</option>
                    <option value="FIVE_PLUS_YEARS">Plus de 5 ans</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Niveau numérique</label>
                  <select name="digitalSkillLevel" className="w-full border rounded p-2 text-sm">
                    <option value="BEGINNER">Débutant</option>
                    <option value="INTERMEDIATE">Intermédiaire</option>
                    <option value="ADVANCED">Avancé</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Compétences (Domaines)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {dbSkills.map(skill => (
                      <label key={skill.id} className="flex items-center gap-2 text-xs">
                        <input type="checkbox" name="skills" value={skill.slug} className="accent-[#174F7A]" />
                        {skill.nameFr}
                      </label>
                    ))}
                  </div>
                </div>

                {/* DISPONIBILITE */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Disponibilité & Mission</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Date de disponibilité</label><input type="date" name="arrivalDate" className="w-full border rounded p-2 text-sm" /></div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Durée souhaitée</label>
                  <select name="duration" className="w-full border rounded p-2 text-sm">
                    <option value="SIX_MONTHS">6 mois</option>
                    <option value="NINE_MONTHS">9 mois</option>
                    <option value="TWELVE_MONTHS">12 mois</option>
                  </select>
                </div>

                {/* MOTIVATION */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Motivation</h3></div>
                <div className="md:col-span-2"><label className="block text-xs font-semibold mb-1">Motivation</label><textarea name="motivation" rows={3} className="w-full border rounded p-2 text-sm" placeholder="Création administrative directe..."></textarea></div>
                <div className="md:col-span-2"><label className="block text-xs font-semibold mb-1">Expérience de projet</label><textarea name="projectExperience" rows={2} className="w-full border rounded p-2 text-sm"></textarea></div>

                {/* ADMIN */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Informations Admin</h3></div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Statut initial</label>
                  <select name="status" className="w-full border rounded p-2 text-sm">
                    <option value="NEW">NEW</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="SELECTED">SELECTED</option>
                    <option value="INTERVIEW">INTERVIEW</option>
                    <option value="CHOSEN">CHOSEN</option>
                  </select>
                </div>
                <div className="md:col-span-2"><label className="block text-xs font-semibold mb-1">Notes internes (visibles uniquement par l'équipe)</label><textarea name="notes" rows={2} className="w-full border rounded p-2 text-sm"></textarea></div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-[#174F7A] hover:bg-[#123E60] rounded-lg disabled:opacity-50">
                  {isSubmitting ? "Création..." : "Créer le candidat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
"""

content = content.replace('    </div>\n  )\n}\n', modal_code + '    </div>\n  )\n}\n')

with open('src/views/admin/AdminCandidates.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
