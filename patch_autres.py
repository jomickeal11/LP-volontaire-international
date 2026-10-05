import re

# PATCH PARTNERS
with open('src/views/admin/AdminPartners.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('  const [success, setSuccess] = useState("")', '  const [success, setSuccess] = useState("")\n  const [orgType, setOrgType] = useState("NGO")')
old_submit_orgType = 'orgType: formData.get("orgType") as string,'
new_submit_orgType = 'orgType: (formData.get("orgType") === "OTHER" ? formData.get("orgTypeOther") : formData.get("orgType")) as string,'
content = content.replace(old_submit_orgType, new_submit_orgType)

new_field = """                  <label className="block text-xs font-semibold mb-1">Type d'organisation</label>
                  <select name="orgType" value={orgType} onChange={(e) => setOrgType(e.target.value)} className="w-full border rounded p-2 text-sm mb-2">
                    <option value="NGO">ONG / Association</option>
                    <option value="UNIVERSITY">Université / École</option>
                    <option value="GOVERNMENT">Institution publique</option>
                    <option value="COMPANY">Entreprise</option>
                    <option value="OTHER">Autre</option>
                  </select>
                  {orgType === "OTHER" && (
                    <input name="orgTypeOther" required placeholder="Précisez le type d'organisation..." className="w-full border rounded p-2 text-sm" />
                  )}"""

content = re.sub(
    r'<label className="block text-xs font-semibold mb-1">Type d\'organisation<\/label>\s*<select name="orgType" className="w-full border rounded p-2 text-sm">.*?<\/select>',
    new_field,
    content,
    flags=re.DOTALL
)

with open('src/views/admin/AdminPartners.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

# PATCH MEMBERS
with open('src/views/admin/AdminMembers.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('  const [dbSkills, setDbSkills]', '  const [contributionType, setContributionType] = useState("COMPETENCES")\n  const [dbSkills, setDbSkills]')
old_submit_ct = 'contributionType: formData.get("contributionType") as string,'
new_submit_ct = 'contributionType: (formData.get("contributionType") === "AUTRE" ? formData.get("contributionTypeOther") : formData.get("contributionType")) as string,'
content = content.replace(old_submit_ct, new_submit_ct)

new_field = """                  <label className="block text-xs font-semibold mb-1">Type de contribution</label>
                  <select name="contributionType" value={contributionType} onChange={(e) => setContributionType(e.target.value)} className="w-full border rounded p-2 text-sm mb-2">
                    <option value="COMPETENCES">Mécénat de compétences</option>
                    <option value="FINANCIER">Soutien financier</option>
                    <option value="VOLONTARIAT">Volontariat</option>
                    <option value="RESEAU">Mise en réseau / Apporteur d'affaires</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                  {contributionType === "AUTRE" && (
                    <input name="contributionTypeOther" required placeholder="Précisez le type de contribution..." className="w-full border rounded p-2 text-sm" />
                  )}"""

content = re.sub(
    r'<label className="block text-xs font-semibold mb-1">Type de contribution<\/label>\s*<select name="contributionType" className="w-full border rounded p-2 text-sm">.*?<\/select>',
    new_field,
    content,
    flags=re.DOTALL
)

with open('src/views/admin/AdminMembers.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
