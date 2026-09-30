"""
Update grammar.html:
Use index-based replacement to update the tenses wrapper section.
"""

path = r"c:\Users\ahmty\Desktop\SW-PROJECTS\DE app\pages\grammar.html"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Find start and end of the tenses wrapper div (just the opening tag section)
start_marker = '  <!-- 6. Verbs & Tenses Wrapper -->'
end_marker = '\n\n    <div class="table-scroll">'

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx)

if start_idx < 0 or end_idx < 0:
    print(f"ERROR: start_idx={start_idx}, end_idx={end_idx}")
    print("Dumping:", repr(content[start_idx:start_idx+400] if start_idx >= 0 else "NOT FOUND"))
else:
    old_chunk = content[start_idx:end_idx]
    print(f"Found chunk ({len(old_chunk)} chars):\n{repr(old_chunk)}")

    new_chunk = '  <!-- 6. Verbs & Tenses Wrapper -->\n  <div class="grammar-section" id="tenses" data-title="Verbs Tenses Pr\u00e4sens Perfekt Pr\u00e4teritum Futur Plusquamperfekt">\n    <div class="category-heading" style="margin-top: 32px; margin-bottom: 8px;">\n      <h2>6. Verbs &amp; Tenses</h2>\n      <span class="category-desc">Core overview &mdash; detailed tense cards follow below</span>\n    </div>\n    <p style="color:var(--text-dim); margin-bottom: 16px;">Here is the core summary. The detailed tense cards follow\n      below.</p>'

    content = content[:start_idx] + new_chunk + content[end_idx:]
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("SUCCESS: Tenses wrapper updated.")
