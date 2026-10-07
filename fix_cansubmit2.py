import re

def reorder_cansubmit(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the canSubmit block
    can_submit_match = re.search(r'(\s*const canSubmit = !!\([\s\S]*?\)\s*)', content)
    
    if not can_submit_match:
        print(f"canSubmit not found in {filepath}")
        return False
        
    can_submit_code = can_submit_match.group(1)
    
    # Remove all instances of canSubmit
    content = content.replace(can_submit_code, '\n')

    # Look for the end of the `setFormData({ ... })` or similar
    # We'll just find `const loadData = async () => {`
    insert_match = re.search(r'(\s*const loadData = async \(\) => {)', content)
    if insert_match:
        content = content.replace(insert_match.group(1), can_submit_code + insert_match.group(1))
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")
        return True
    
    print(f"loadData not found in {filepath}")
    return False

reorder_cansubmit('src/views/admin/AdminArticles.tsx')
reorder_cansubmit('src/views/admin/AdminDomaines.tsx')
reorder_cansubmit('src/views/admin/AdminProjects.tsx')
reorder_cansubmit('src/views/admin/AdminResources.tsx')

with open('src/views/admin/AdminEvents.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
if 'const canSubmit' not in c:
    c = c.replace(
        '  const loadData = async () => {',
        '''  const canSubmit = !!(
    formData.titleFr.trim() &&
    formData.startDate.trim() &&
    formData.location.trim()
  )

  const loadData = async () => {'''
    )
    c = re.sub(
        r'(type="submit"\s*\n\s*)(disabled=\{submitting[^}]*\})',
        r'\1disabled={submitting || !canSubmit}',
        c
    )
    with open('src/views/admin/AdminEvents.tsx', 'w', encoding='utf-8') as f:
        f.write(c)
    print("Fixed AdminEvents")

