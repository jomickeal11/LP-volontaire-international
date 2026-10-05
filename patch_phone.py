import re

files = [
    'src/views/admin/AdminCandidates.tsx',
    'src/views/admin/AdminPartners.tsx',
    'src/views/admin/AdminMembers.tsx'
]

phone_jsx_old = r'<div><label className="block text-xs font-semibold mb-1">Téléphone</label><input name="phone" className="w-full border rounded p-2 text-sm" /></div>'
phone_jsx_new = """<div>
                  <label className="block text-xs font-semibold mb-1">Téléphone</label>
                  <div className="flex gap-2">
                    <select name="phoneCode" className="w-1/3 border rounded p-2 text-sm bg-slate-50">
                      <option value="+33">+33 (FR)</option>
                      <option value="+237">+237 (CM)</option>
                      <option value="+225">+225 (CI)</option>
                      <option value="+221">+221 (SN)</option>
                      <option value="+212">+212 (MA)</option>
                      <option value="+213">+213 (DZ)</option>
                      <option value="+216">+216 (TN)</option>
                      <option value="+241">+241 (GA)</option>
                      <option value="+243">+243 (CD)</option>
                      <option value="+228">+228 (TG)</option>
                      <option value="+229">+229 (BJ)</option>
                      <option value="+226">+226 (BF)</option>
                      <option value="+223">+223 (ML)</option>
                      <option value="+242">+242 (CG)</option>
                      <option value="+32">+32 (BE)</option>
                      <option value="+41">+41 (CH)</option>
                      <option value="+1">+1 (US/CA)</option>
                      <option value="+44">+44 (UK)</option>
                    </select>
                    <input name="phone" type="tel" className="w-2/3 border rounded p-2 text-sm" placeholder="Numéro..." />
                  </div>
                </div>"""

phone_submit_old = 'phone: formData.get("phone") as string,'
phone_submit_new = 'phone: formData.get("phone") ? `${formData.get("phoneCode")} ${formData.get("phone")}` : "",'

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(phone_submit_old, phone_submit_new)
    content = content.replace(phone_jsx_old, phone_jsx_new)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Phone patches applied successfully.")
