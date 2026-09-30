"""Fix orphaned tense quick-nav in grammar.html"""

path = r"c:\Users\ahmty\Desktop\SW-PROJECTS\DE app\pages\grammar.html"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Find the exact location of the orphaned chunk
marker_start = content.find('<div class="quick-card-desc">Present / Future Actions (A1 - Daily Speech)</div>')
marker_end = content.find('  <!-- Filter Tabs -->')

print(f"Orphaned start: {marker_start}")
print(f"Filter tabs end: {marker_end}")
print(f"Snippet start: {repr(content[marker_start-20:marker_start+50])}")
print(f"Snippet end: {repr(content[marker_end-20:marker_end+60])}")

if marker_start < 0 or marker_end < 0:
    print("ERROR: Could not find markers")
else:
    orphaned_chunk = content[marker_start:marker_end]
    print(f"\nOrphaned chunk ({len(orphaned_chunk)} chars):\n{repr(orphaned_chunk[:200])}")

    REPLACEMENT = """    <!-- Tenses & Time sub-navigation -->
    <div class="category-heading">
      <h2>Tenses &amp; Time</h2>
      <span class="category-desc">Quick jump to individual tense cards below</span>
    </div>
    <div class="quick-grid">
      <a href="#prasens" class="quick-card">
        <div class="quick-card-title">1. Pr\u00e4sens</div>
        <div class="quick-card-desc">Present / Future Actions &middot; A1 &middot; Daily Speech</div>
      </a>
      <a href="#perfekt" class="quick-card">
        <div class="quick-card-title">2. Perfekt</div>
        <div class="quick-card-desc">Spoken Past Tense &middot; A2 &middot; Daily Speech</div>
      </a>
      <a href="#prateritum" class="quick-card">
        <div class="quick-card-title">3. Pr\u00e4teritum</div>
        <div class="quick-card-desc">Written Past Tense &middot; A2/B1 &middot; Formal/News</div>
      </a>
      <a href="#futur1" class="quick-card">
        <div class="quick-card-title">4. Futur I</div>
        <div class="quick-card-desc">Future Intentions / Assumptions &middot; B1</div>
      </a>
      <a href="#konjunktiv2" class="quick-card">
        <div class="quick-card-title">5. Konjunktiv II</div>
        <div class="quick-card-desc">Wishes, Hypotheses &amp; Politeness &middot; B1</div>
      </a>
      <a href="#passiv" class="quick-card">
        <div class="quick-card-title">6. Passiv</div>
        <div class="quick-card-desc">Process &amp; State Passive Voice &middot; B1/B2</div>
      </a>
      <a href="#plusquamperfekt" class="quick-card">
        <div class="quick-card-title">7. Plusquamperfekt</div>
        <div class="quick-card-desc">Past Before Past &middot; B2</div>
      </a>
      <a href="#futur2" class="quick-card">
        <div class="quick-card-title">8. Futur II</div>
        <div class="quick-card-desc">Completed Future Action / Conjecture &middot; B2/C1</div>
      </a>
    </div>

  """

    new_content = content[:marker_start] + REPLACEMENT + content[marker_end:]
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("\nSUCCESS: grammar.html updated.")
