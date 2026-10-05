import re

with open('src/views/admin/AdminMembers.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = re.sub(
    r'import { getMembers, updateMemberStatus } from "@/lib/cms-actions"',
    'import { getMembers, updateMemberStatus, adminCreateMember, getSkills } from "@/lib/cms-actions"',
    content
)

# 2. State and Handlers
state_code = """
  // Add Member State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
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
      profession: formData.get("profession") as string,
      organization: formData.get("organization") as string,
      contributionType: formData.get("contributionType") as string,
      availability: formData.get("availability") as string,
      domainsOfInterest: formData.getAll("domainsOfInterest") as string[],
      motivation: formData.get("motivation") as string,
      membershipStatus: formData.get("membershipStatus") as string,
      notes: formData.get("notes") as string,
    }
    const res = await adminCreateMember(data)
    setIsSubmitting(false)
    if (res.success) {
      setSuccess("Membre créé avec succès.")
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

content = content.replace('  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())', '  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())\n' + state_code)

# 3. Add Button
btn_code = """
        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            <span>Ajouter un membre</span>
          </button>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-[#174F7A] hover:bg-[#123E60] rounded-lg shadow-xs cursor-pointer transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Exporter CSV</span>
          </button>
        </div>
"""
content = re.sub(
    r'<button\s+onClick=\{exportCSV\}(.|\n)*?<\/button>',
    btn_code,
    content
)

# 4. Add Modal
modal_code = """
      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-[#003366]">Ajouter un membre (Création Admin)</h2>
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
                <div><label className="block text-xs font-semibold mb-1">Pays *</label><input required name="country" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Ville</label><input name="city" className="w-full border rounded p-2 text-sm" /></div>

                {/* PROFIL */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Profil & Engagement</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Profession</label><input name="profession" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Organisation</label><input name="organization" className="w-full border rounded p-2 text-sm" /></div>
                
                <div>
                  <label className="block text-xs font-semibold mb-1">Type de contribution</label>
                  <select name="contributionType" className="w-full border rounded p-2 text-sm">
                    <option value="COMPETENCES">Mécénat de compétences</option>
                    <option value="FINANCIER">Soutien financier</option>
                    <option value="VOLONTARIAT">Volontariat</option>
                    <option value="RESEAU">Mise en réseau / Apporteur d'affaires</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Disponibilité</label>
                  <select name="availability" className="w-full border rounded p-2 text-sm">
                    <option value="PONCTUEL">Ponctuelle / À la demande</option>
                    <option value="HEBDOMADAIRE">Quelques heures par semaine</option>
                    <option value="MENSUEL">Quelques heures par mois</option>
                    <option value="TEMPS_PLEIN">Temps plein (missions dédiées)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1">Domaines d'intérêt</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {dbSkills.map(skill => (
                      <label key={skill.id} className="flex items-center gap-2 text-xs">
                        <input type="checkbox" name="domainsOfInterest" value={skill.nameFr} className="accent-[#174F7A]" />
                        {skill.nameFr}
                      </label>
                    ))}
                  </div>
                </div>

                {/* MOTIVATION */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Motivation & Admin</h3></div>
                <div className="md:col-span-2"><label className="block text-xs font-semibold mb-1">Motivation</label><textarea name="motivation" rows={2} className="w-full border rounded p-2 text-sm" placeholder="Création administrative directe..."></textarea></div>
                
                <div>
                  <label className="block text-xs font-semibold mb-1">Statut initial</label>
                  <select name="membershipStatus" className="w-full border rounded p-2 text-sm">
                    <option value="APPROVED">Validé (Adhérent)</option>
                    <option value="PENDING">En attente</option>
                    <option value="SUSPENDED">Suspendu</option>
                    <option value="ALUMNI">Alumni</option>
                  </select>
                </div>
                <div className="md:col-span-2"><label className="block text-xs font-semibold mb-1">Notes internes</label><textarea name="notes" rows={2} className="w-full border rounded p-2 text-sm"></textarea></div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-[#174F7A] hover:bg-[#123E60] rounded-lg disabled:opacity-50">
                  {isSubmitting ? "Création..." : "Créer le membre"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
"""

content = content.replace('    </div>\n  )\n}\n', modal_code + '    </div>\n  )\n}\n')

with open('src/views/admin/AdminMembers.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
