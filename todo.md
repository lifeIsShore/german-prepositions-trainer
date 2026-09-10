# DE App — TODO

All work happens on the `dev` branch. Merge to `main` only when a feature is complete and tested.

---

## ✅ Done (this session)

- [x] Created `.gitignore`
- [x] Created `dev` git branch (production stays on `main`)
- [x] Extended schema with 3 new content types: `konnektor`, `konjunktion`, `reflexive_verb`
- [x] Added `connector` to `partOfSpeech` enum
- [x] Added connector-specific grammar fields: `connectorFunction`, `verbPositionEffect`, `highlightedExample`, `nounArticleRule`
- [x] Added editorial fields: `mnemonicHint`, `approvedByNative`
- [x] Added `wordFamily` to `related`
- [x] Changed `nativeFrequencyLabel` from free string to controlled enum (`essential / very_common / common / occasional / rare`)
- [x] Updated `entries.csv` and `overrides.csv` headers with all new columns
- [x] Updated `database/schema.sql` with new types and `editorial_json` column
- [x] Build confirmed: 2,376 entries, no errors

---

## 🔵 Data Entry — High Priority

### Konnektoren CSV
- [ ] Convert `data/manual/Konnektoren .md` into structured CSV rows in `data/manual/entries.csv`
  - Use `type: konnektor`, `part_of_speech: connector`
  - Fill `connector_function` (causal / adversative / additive / temporal / concessive / conditional)
  - Fill `verb_position_effect` (`position_0_normal` / `position_1_inversion` / `subordinate_verb_end`)
  - Fill `highlighted_example` — mark the verb with `**double asterisks**` so UI can highlight it
  - Fill CEFR `levels` per entry
  - Fill `native_frequency_rating` manually (you or a native speaker friend)

### Konjunktionen CSV
- [ ] Convert `data/manual/Konjunktionen.md` into structured CSV rows in `data/manual/entries.csv`
  - Use `type: konjunktion`, `part_of_speech: connector`
  - Same attributes as above — `verb_position_effect` is always `subordinate_verb_end` for Group 2
  - Group 4 (Doppelkonjunktionen) get `type: konjunktion`, tag `double_conjunction`

### Reflexive Verbs CSV
- [ ] Convert `data/manual/reflesivverben.md` into structured CSV rows in `data/manual/entries.csv`
  - Use `type: reflexive_verb`, `part_of_speech: verb`, `is_reflexive: true`
  - Fill `auxiliary` (`haben` or `sein`) — this is the Perfekt auxiliary ← **important attribute**
  - Fill `partizip_ii` (Partizip II form, e.g. `gewaschen`)
  - Fill `valency` for the case the reflexive pronoun takes:
    - Akkusativ reflexive → `reflexive_pronoun::akk`
    - Dativ reflexive → `reflexive_pronoun::dat`
  - Fill CEFR `levels` per entry (they are already grouped by level in the MD)

---

## 🟡 Data Enrichment — Medium Priority

- [ ] Add `part_of_speech` to the 2,076 `unknown` vocabulary items via `data/manual/overrides.csv`
  - Start with the top 200–300 most frequent B2 words
  - Use `node scripts/find-content.mjs "<term>"` to get the stable ID
- [ ] Add `native_frequency_rating` (1–5) for B2 vocab top 200 words via `overrides.csv`
  - Use scale: 5 = essential, 4 = very often, 3 = common but context-dependent, 2 = understood rarely, 1 = rare
- [ ] Add CEFR `levels` to the 724 `unassigned` entries from `redewendungs.csv`
  - These came from the phrase/idiom source and have no level assigned
  - Do via `overrides.csv` — use `node scripts/find-content.mjs` to look up IDs

---

## 🟠 New Content — Grammar Notes (Static HTML Pages)

> These will be standalone HTML files, not part of the JSON catalogue. Link to them from the main app.

- [ ] **Tenses page** (`/pages/tenses.html`)
  - All 8 tenses: Präsens, Perfekt, Präteritum, Futur I, Konjunktiv II, Passiv, Plusquamperfekt, Futur II
  - Each tense: 1-line "when to use" rule + 3 example sentences + usage frequency label
  - Mark tenses as very common / occasional / formal only
  - TODO: create the HTML file and wire up from main nav

- [ ] **Word order page** (`/pages/word-order.html`)
  - Verb position rules: main clause, subordinate clause, question, imperative
  - TeKaMoLo rule with examples
  - Verb-second rule with examples
  - TODO: create the HTML file

- [ ] **Konnektoren & Konjunktionen visual page** (`/pages/connectors.html`)
  - Show each connector with its verb-position rule highlighted visually
  - Verb in example highlighted (uses `highlightedExample` field)
  - Group by effect: Position 0 / Position 1 / Verb-end
  - TODO: once CSV data is entered, build this page

---

## 🟣 A1 / A2 / B1 Content

- [ ] Locate PDF source material for A1, A2, B1 levels
- [ ] Convert PDFs to CSV format matching `b2-all.csv` headers: `German Word, English Meaning, German Example Sentence, English Translation`
- [ ] Place files as `data/a1-all.csv`, `data/a2-all.csv`, `data/b1-all.csv`
- [ ] Add them to `build-content.mjs` `importVocabulary()` function (same pattern as B2)

---

## 🔵 Redewendungs Reclassification

- [ ] Review the 724 entries tagged `needs_type_review` from `redewendungs.csv`
  - Most are mixed vocab + idioms + phrases
  - True idioms (figurative, non-literal): change `type` to `idiom` via `overrides.csv`
  - Standalone vocabulary: leave as `vocabulary`
  - Multi-word phrases: change `type` to `phrase`

---

## ⚪ Dev / Prod Workflow Reminder

```
main  → production (live app, do NOT touch during dev)
dev   → all development work happens here

When ready to release:
  git checkout main
  git merge dev
  git push origin main
```

---

## 🔮 Future: Database Migration

When the JSON file becomes too large or you need search/filtering:

1. Run: `sqlite3 german.db < data/generated/content.seed.sql`
2. Create a small local API endpoint to replace `fetch('./generated/content.json')`
3. Schema is already at `database/schema.sql`

When you add user accounts / progress tracking → migrate to PostgreSQL (same schema).
