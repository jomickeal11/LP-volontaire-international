"""
Patch : ajoute canSubmit + disabled sur les boutons de soumission
pour tous les formulaires Admin sans validation.
"""
import re

def patch_file(filepath, can_submit_expr, state_var, state_anchor, btn_disabled_old, btn_disabled_new, submit_btn_label):
    with open(filepath, 'r', encoding='utf-8') as f:
        c = f.read()

    # 1. Inject canSubmit computation after anchor state
    if f'const canSubmit' not in c:
        c = c.replace(state_anchor, state_anchor + f'\n\n  const canSubmit = {can_submit_expr}')

    # 2. Fix submit button disabled
    c = c.replace(btn_disabled_old, btn_disabled_new)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(c)
    print(f"PATCHED: {filepath}")

# ─────────────────────────────────────────────
# 1. AdminTemoignages — requis: authorName, authorRole, quoteFr
# ─────────────────────────────────────────────
with open('src/views/admin/AdminTemoignages.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

if 'const canSubmit' not in c:
    c = c.replace(
        '  const [feedback, setFeedback] = useState<string | null>(null)',
        '''  const [feedback, setFeedback] = useState<string | null>(null)

  const canSubmit = !!(
    form.authorName.trim() &&
    form.authorRole.trim() &&
    form.quoteFr.trim()
  )'''
    )

# Fix submit button: disabled={submitting} -> disabled={submitting || !canSubmit}
c = c.replace(
    'type="submit"\n                disabled={submitting}\n                className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#003366] text-white hover:bg-[#',
    'type="submit"\n                disabled={submitting || !canSubmit}\n                className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#003366] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#'
)

with open('src/views/admin/AdminTemoignages.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("PATCHED: AdminTemoignages")

# ─────────────────────────────────────────────
# 2. AdminResources — requis: title + (fileUrl ou fileName)
# ─────────────────────────────────────────────
with open('src/views/admin/AdminResources.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

if 'const canSubmit' not in c:
    c = c.replace(
        '  const [error, setError] = useState("")',
        '''  const [error, setError] = useState("")

  const canSubmit = !!(
    formData.title.trim() &&
    (formData.fileUrl.trim() || formData.fileName.trim())
  )'''
    )

# Fix all submit buttons disabled
c = re.sub(
    r'(type="submit"\s*\n\s*)(disabled=\{submitting\})',
    r'\1disabled={submitting || !canSubmit}',
    c
)
# add disabled styles
c = c.replace(
    'className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#003366] text-white hover:bg-[#1a3a5c]',
    'className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#003366] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#1a3a5c]'
)

with open('src/views/admin/AdminResources.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("PATCHED: AdminResources")

# ─────────────────────────────────────────────
# 3. AdminArticles — requis: titleFr + contentFr
# ─────────────────────────────────────────────
with open('src/views/admin/AdminArticles.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

if 'const canSubmit' not in c:
    c = c.replace(
        '  const [error, setError] = useState("")',
        '''  const [error, setError] = useState("")

  const canSubmit = !!(
    formData.titleFr.trim() &&
    formData.contentFr.trim()
  )'''
    )

c = re.sub(
    r'(type="submit"\s*\n\s*)(disabled=\{submitting\})',
    r'\1disabled={submitting || !canSubmit}',
    c
)

with open('src/views/admin/AdminArticles.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("PATCHED: AdminArticles")

# ─────────────────────────────────────────────
# 4. AdminDomaines — requis: code + nameFr + descFr
# ─────────────────────────────────────────────
with open('src/views/admin/AdminDomaines.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

if 'const canSubmit' not in c:
    c = c.replace(
        '  const [error, setError] = useState("")',
        '''  const [error, setError] = useState("")

  const canSubmit = !!(
    formData.code.trim() &&
    formData.nameFr.trim() &&
    formData.descFr.trim()
  )'''
    )

c = re.sub(
    r'(type="submit"\s*\n\s*)(disabled=\{submitting\})',
    r'\1disabled={submitting || !canSubmit}',
    c
)

with open('src/views/admin/AdminDomaines.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("PATCHED: AdminDomaines")

# ─────────────────────────────────────────────
# 5. AdminEvents — requis: titleFr + startDate + location
# ─────────────────────────────────────────────
with open('src/views/admin/AdminEvents.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

if 'const canSubmit' not in c:
    c = c.replace(
        '  const [error, setError] = useState("")',
        '''  const [error, setError] = useState("")

  const canSubmit = !!(
    formData.titleFr.trim() &&
    formData.startDate.trim() &&
    formData.location.trim()
  )'''
    )

c = re.sub(
    r'(type="submit"\s*\n\s*)(disabled=\{submitting[^}]*\})',
    r'\1disabled={submitting || !canSubmit}',
    c
)

with open('src/views/admin/AdminEvents.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("PATCHED: AdminEvents")

# ─────────────────────────────────────────────
# 6. AdminProjects — requis: titleFr + summaryFr + slug
# ─────────────────────────────────────────────
with open('src/views/admin/AdminProjects.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

if 'const canSubmit' not in c:
    # Find a good anchor — use the translating state
    c = c.replace(
        '  const [error, setError] = useState("")',
        '''  const [error, setError] = useState("")

  const canSubmit = !!(
    formData.titleFr.trim() &&
    formData.summaryFr.trim()
  )'''
    )

c = re.sub(
    r'(type="submit"\s*\n\s*)(disabled=\{submitting[^}]*\})',
    r'\1disabled={submitting || !canSubmit}',
    c
)

with open('src/views/admin/AdminProjects.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("PATCHED: AdminProjects")

# ─────────────────────────────────────────────
# 7. AdminMedias — already has canSubmit? Let's enforce it on button too
# ─────────────────────────────────────────────
with open('src/views/admin/AdminMedias.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

if 'canSubmit' not in c:
    c = c.replace(
        '  const [error, setError] = useState("")',
        '''  const [error, setError] = useState("")

  const canSubmit = !!(
    form.titleFr.trim() &&
    form.url.trim()
  )'''
    )
    c = re.sub(
        r'(type="submit"\s*\n\s*)(disabled=\{submitting[^}]*\})',
        r'\1disabled={submitting || !canSubmit}',
        c
    )

with open('src/views/admin/AdminMedias.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
print("PATCHED: AdminMedias (check)")

print("\nAll done.")
