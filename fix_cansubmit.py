import re

files_to_fix = [
    'src/views/admin/AdminArticles.tsx',
    'src/views/admin/AdminDomaines.tsx',
    'src/views/admin/AdminEvents.tsx',
    'src/views/admin/AdminProjects.tsx',
    'src/views/admin/AdminResources.tsx',
]

for filepath in files_to_fix:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the canSubmit block
    can_submit_match = re.search(r'(\s*const canSubmit = !!\([\s\S]*?\)\s*)', content)
    
    if not can_submit_match:
        print(f"canSubmit not found in {filepath}")
        continue
        
    can_submit_code = can_submit_match.group(1)
    
    # Remove it from its current position
    content = content.replace(can_submit_code, '\n')
    
    # Find where formData block ends
    # We'll look for `const loadData = async () => {` which is typically right after the state declarations
    insert_match = re.search(r'(\s*const loadData = async \(\) => {)', content)
    
    if insert_match:
        # Insert before loadData
        content = content.replace(insert_match.group(1), can_submit_code + insert_match.group(1))
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath} (before loadData)")
    else:
        # Fallback: maybe there is a 'useEffect' or something similar
        print(f"loadData not found in {filepath}, need alternative anchor")
        
