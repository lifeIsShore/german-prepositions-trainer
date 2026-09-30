"""Fix inline flex divs in grammar.html to add min-width:0."""
path = r"c:\Users\ahmty\Desktop\SW-PROJECTS\DE app\pages\grammar.html"

with open(path, encoding="utf-8") as f:
    content = f.read()

old = 'style="display:flex; justify-content:space-between; width:100%; align-items:center;"'
new = 'style="display:flex; justify-content:space-between; width:100%; align-items:flex-start; min-width:0; flex-wrap:wrap; gap:12px;"'

count = content.count(old)
content = content.replace(old, new)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Fixed {count} inline style flex divs")
