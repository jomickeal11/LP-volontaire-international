import re

with open('src/views/admin/AdminPartners.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = re.sub(
    r'import { useState } from "react"',
    'import { useState } from "react"\nimport { adminCreatePartner } from "@/lib/cms-actions"',
    content
)

# 2. State and Handlers
state_code = """  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const data = {
      orgName: formData.get("orgName") as string,
      country: formData.get("country") as string,
      website: formData.get("website") as string,
      orgType: formData.get("orgType") as string,
      contactPerson: formData.get("contactPerson") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      volunteerCount: formData.get("volunteerCount") as string,
      targetCountries: formData.get("targetCountries") as string,
      programme: formData.get("programme") as string,
      message: formData.get("message") as string,
    }
    const res = await adminCreatePartner(data)
    setIsSubmitting(false)
    if (res.success) {
      setSuccess("Partenaire créé avec succès.")
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
            Ajouter un partenaire
          </button>
"""
content = content.replace('          <button\n            onClick={() => navigate("admin-partner-requests")}', btn_code + '          <button\n            onClick={() => navigate("admin-partner-requests")}')

# 4. Add Modal
modal_code = """
      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b pb-3">
              <h2 className="text-xl font-bold text-[#003366]">Ajouter un partenaire (Création Admin)</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>
            
            {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
            {success && <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm">{success}</div>}
            
            <form onSubmit={handleAddSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* IDENTITÉ */}
                <div className="md:col-span-2"><h3 className="font-bold text-slate-700 border-b pb-1">Identité de l'organisation</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Nom de l'organisation *</label><input required name="orgName" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Pays *</label><input required name="country" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Site web</label><input name="website" placeholder="https://" className="w-full border rounded p-2 text-sm" /></div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Type d'organisation</label>
                  <select name="orgType" className="w-full border rounded p-2 text-sm">
                    <option value="NGO">ONG / Association</option>
                    <option value="UNIVERSITY">Université / École</option>
                    <option value="GOVERNMENT">Institution publique</option>
                    <option value="COMPANY">Entreprise</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>

                {/* CONTACT */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Contact</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Personne de contact *</label><input required name="contactPerson" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Email *</label><input required type="email" name="email" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Téléphone</label><input name="phone" className="w-full border rounded p-2 text-sm" /></div>
                
                {/* PARTENARIAT */}
                <div className="md:col-span-2 mt-4"><h3 className="font-bold text-slate-700 border-b pb-1">Partenariat</h3></div>
                <div><label className="block text-xs font-semibold mb-1">Volontaires potentiels / an</label><input type="number" name="volunteerCount" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Pays ciblés</label><input name="targetCountries" className="w-full border rounded p-2 text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Programme / Financement</label><input name="programme" className="w-full border rounded p-2 text-sm" /></div>
                
                <div className="md:col-span-2"><label className="block text-xs font-semibold mb-1">Notes / Message interne</label><textarea name="message" rows={3} className="w-full border rounded p-2 text-sm" placeholder="Création administrative directe..."></textarea></div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">Annuler</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-semibold text-white bg-[#174F7A] hover:bg-[#123E60] rounded-lg disabled:opacity-50">
                  {isSubmitting ? "Création..." : "Créer le partenaire"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
"""

content = content.replace('    </div>\n  )\n}\n', modal_code + '    </div>\n  )\n}\n')

with open('src/views/admin/AdminPartners.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
