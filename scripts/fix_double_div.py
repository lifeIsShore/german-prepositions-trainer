"""Remove duplicate </div> after </table></div>."""
import re

path = r"c:\Users\ahmty\Desktop\SW-PROJECTS\DE app\pages\grammar.html"
with open(path, encoding="utf-8") as f:
    content = f.read()

before = content.count("</table></div></div>")
# Replace double-close with single close
content = content.replace("</table></div></div>", "</table></div>")
after = content.count("</table></div></div>")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Fixed {before} occurrences. Remaining: {after}")
print(f"table-scroll count: {content.count('table-scroll')}")
print(f"</table></div> count: {content.count('</table></div>')}")
