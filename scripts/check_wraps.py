"""Check for doubled open table-scroll divs."""
path = r"c:\Users\ahmty\Desktop\SW-PROJECTS\DE app\pages\grammar.html"
with open(path, encoding="utf-8") as f:
    c = f.read()

open_divs = c.count('<div class="table-scroll">')
close_table_divs = c.count("</table></div>")
dbl = c.count('<div class="table-scroll"><div class="table-scroll">')
print(f"Open table-scroll divs: {open_divs}")
print(f"</table></div>: {close_table_divs}")
print(f"Doubled opens: {dbl}")
