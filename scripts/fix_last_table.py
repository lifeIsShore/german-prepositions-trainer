"""Fix the one table with style attribute that wasn't wrapped."""
path = r"c:\Users\ahmty\Desktop\SW-PROJECTS\DE app\pages\grammar.html"
with open(path, encoding="utf-8") as f:
    content = f.read()

target = '<table class="example-table" style="margin-bottom: 32px;">'
if target in content and '<div class="table-scroll">' + target not in content:
    content = content.replace(target, '<div class="table-scroll">' + target)
    print("Fixed! table-scroll count:", content.count("table-scroll"))
else:
    print("Already fixed or target not found")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)
