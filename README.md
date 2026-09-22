# DE App — German Learning Trainer

> **"All you need to use German confidently and correctly."**

A static, client-side German vocabulary and grammar trainer. Current state: **V1 prototype**, single-user, browser-based, no backend, no accounts.

---

## Table of Contents

1. [Product Vision](#product-vision)
2. [Current Architecture (V1)](#current-architecture-v1)
3. [File Structure](#file-structure)
4. [Dataset — Current State](#dataset--current-state)
5. [Data Pipeline](#data-pipeline)
6. [Content Schema](#content-schema)
7. [App Logic & State](#app-logic--state)
8. [Grammar Reference Pages](#grammar-reference-pages)
9. [Branching & Workflow](#branching--workflow)
10. [Known Issues & Pending Work](#known-issues--pending-work)
11. [Planned Architecture (V2)](#planned-architecture-v2)
12. [Long-Term Vision (V3+)](#long-term-vision-v3)

---

## Product Vision

The app is targeted as a **pocket reference and learning trainer** — not a competitor to Duolingo, but a structured tool for learners who already know some German and need fast access to vocabulary, grammar rules, and idiomatic expressions.

**Primary users:** B1–C1 learners, integration course students, professionals relocating to Germany, TELC exam candidates.

**B2B angle:** Language schools, integration course providers, universities, vocational training centers. Institutions pay for a learner dashboard with analytics and progress reporting.

**Core data moat:** Behavioral learning data (what's hard, what's easy, how long to mastery) collected from real users at scale — something competitors cannot replicate.

---

## Current Architecture (V1)

```
Browser
  ↓
index.html  (SPA shell)
  ↓
app.js  (all state, DB init, render, event logic)
  ↓
IndexedDB  (client-side storage, loaded from content.json on first run)
  ↓
data/generated/content.json  (9.1 MB — full dataset served statically)
```

### Key characteristics

| Property | Current state |
|---|---|
| Hosting | Static files (no server needed) |
| Database | Browser IndexedDB only |
| User accounts | None |
| Progress persistence | None (resets per session) |
| Data delivery | Full JSON bundle downloaded on first visit |
| Cache invalidation | `buildId` in `localStorage` — rebuild triggers full re-sync |
| Framework | Vanilla HTML / CSS / JS — no build step |
| Font | Inter (Google Fonts) |

> ⚠️ **Critical known issue:** The full `content.json` (9.1 MB) is downloaded to the browser on every new build. The entire dataset is inspectable by any user via DevTools. This is intentional for V1 but **must change before going to production with paying users**.

---

## File Structure

```
DE app/
├── index.html               # Main flashcard trainer (entry point)
├── app.js                   # All JS logic — state, IndexedDB, rendering, events
├── style.css                # Global styles (dark red/black/white, flat design)
│
├── pages/
│   ├── tenses.html          # Grammar page: all 8 German tenses
│   ├── word-order.html      # Grammar page: Satzbau, verb position, TeKaMoLo
│   └── connectors.html      # Grammar page: Konnektoren & Konjunktionen
│
├── data/
│   ├── README.md            # Data system documentation
│   ├── content.schema.json  # Full JSON schema / data contract
│   ├── a1-all.csv           # Source vocabulary: A1
│   ├── a2-all.csv           # Source vocabulary: A2
│   ├── b1-all.csv           # Source vocabulary: B1
│   ├── b2-all.csv           # Source vocabulary: B2
│   ├── b2-*.csv             # B2 sub-topic context files (work, health, etc.)
│   ├── c1-work.csv          # Source vocabulary: C1 (work domain)
│   ├── redewendungs.csv     # Idioms, phrases, Redewendungen
│   ├── manual/
│   │   ├── entries.csv      # New manually authored records
│   │   ├── overrides.csv    # Enrichments for existing imported records
│   │   ├── Konnektoren.md   # Source reference for connectors
│   │   ├── Konjunktionen.md # Source reference for conjunctions
│   │   └── reflesivverben.md# Source reference for reflexive verbs
│   └── generated/           # ⚠️ Never edit directly — output of build script
│       ├── content.json     # Full compiled dataset (9.1 MB)
│       ├── content.seed.sql # SQLite import file (for future DB migration)
│       └── summary.json     # Build stats and warnings
│
├── scripts/
│   ├── build-content.mjs    # Main build script (CSV + manual → content.json)
│   └── find-content.mjs     # CLI: look up stable ID for a term
│
├── database/
│   ├── schema.sql           # Future SQLite / PostgreSQL schema
│   └── README.md
│
├── build_app.py             # Python helper for build automation
│
├── plan.md                  # Product + business planning notes
├── dashboard.md             # Teacher & institution dashboard design notes
├── algo-for-reshow.md       # Spaced repetition / memory algorithm design
├── dataset-update.md        # Data layer architecture (4-layer model)
├── todo.md                  # Current TODO list
└── words.md                 # Original 300 verb-preposition entries
```

---

## Dataset — Current State

**Build ID:** `e756cc66c6`  
**Total items:** **4,746**

### By content type

| Type | Count |
|---|---|
| `vocabulary` | 4,299 |
| `verb_preposition` | 300 |
| `idiom` | 50 |
| `phrase` | 41 |
| `konjunktion` | 28 |
| `konnektor` | 14 |
| `reflexive_verb` | 14 |

### By CEFR level

| Level | Count |
|---|---|
| A1 | 952 |
| A2 | 792 |
| B1 | 1,345 |
| B2 | 1,528 |
| C1 | 329 |
| unassigned | 50 |

### By part of speech (top categories)

| POS | Count |
|---|---|
| noun | 1,629 |
| verb | 1,283 |
| unknown | 877 |
| adjective | 453 |
| adverb | 203 |
| connector | 42 |
| preposition | 36 |

### By review status

| Status | Count |
|---|---|
| unreviewed | 1,702 |
| draft | 1,272 |
| verified | 998 |
| reviewed | 774 |

> ℹ️ **877 items still have `partOfSpeech: unknown`** — these need classification via `overrides.csv`. Priority: top 200–300 B2 words.

---

## Data Pipeline

```
CSV sources (a1, a2, b1, b2, c1, redewendungs)
  +
manual/entries.csv  (new records)
  +
manual/overrides.csv  (enrichments / corrections)
       ↓
  node scripts/build-content.mjs
       ↓
  data/generated/content.json   ← loaded by the app
  data/generated/content.seed.sql  ← for future SQLite migration
  data/generated/summary.json   ← build stats
```

**To rebuild after changes:**
```powershell
node scripts/build-content.mjs
```

**To find the stable ID of a term (for overrides):**
```powershell
node scripts/find-content.mjs "berücksichtigen"
```

**To seed a local SQLite database:**
```powershell
sqlite3 german.db < data/generated/content.seed.sql
```

---

## Content Schema

Each record in `content.json` follows the schema defined in `data/content.schema.json`. Key fields:

```json
{
  "id": "stable-hash-id",
  "type": "vocabulary | verb_preposition | idiom | phrase | konnektor | konjunktion | reflexive_verb",
  "term": "berücksichtigen",
  "translation": "to take into account",
  "examples": { "de": "...", "en": "..." },
  "levels": ["B2"],
  "partOfSpeech": "verb",
  "usage": {
    "nativeFrequencyRating": 4,
    "nativeFrequencyLabel": "High",
    "register": "formal"
  },
  "grammar": {
    "auxiliary": "haben",
    "valency": [{ "role": "direct_object", "preposition": null, "case": "Akk." }],
    "verbPositionEffect": null
  },
  "contexts": ["work", "education"],
  "tags": [],
  "related": { "synonyms": [], "antonyms": [], "wordFamily": [] },
  "editorial": { "mnemonicHint": null, "approvedByNative": false },
  "reviewStatus": "reviewed"
}
```

**Valency format:** `role:preposition:case` — e.g. `prepositional_object:auf:akk`

---

## App Logic & State

`app.js` is a single-file vanilla JS module with no dependencies. It is structured in clear sections:

### State object
```js
let state = {
  deck: [],        // current filtered card array
  index: 0,        // current card position
  flipped: false,  // front or back showing
  correct: 0,      // session correct count
  wrong: 0,        // session wrong count
  filterType: 'all',
  filterLevel: 'all',
  mode: 'sequential' | 'random',
  wrongCards: []   // cards marked wrong, for "practice wrong only" feature
};
```

### Startup flow
1. `initApp()` — caches all DOM elements
2. `initDB()` — opens IndexedDB, fetches `content.json`, compares `buildId` vs `localStorage`, syncs if changed
3. `restart()` → `buildDeck()` — reads IndexedDB with active filters, optionally shuffles
4. `render()` — renders front/back of current card based on type and grammar fields

### Keyboard shortcuts
| Key | Action |
|---|---|
| `Space` | Flip card |
| `→` | Mark correct (if flipped) / go to next card |
| `←` | Previous card |
| `1` | Mark wrong (if flipped) |
| `2` | Mark correct (if flipped) |

### Filters available in UI
- **Category:** All / Wortschatz / Verben / Verb+Präposition / Reflexive Verben / Konnektoren / Konjunktionen / Redewendungen
- **Level:** All / A1 / A2 / B1 / B2
- **Mode:** Sequential / Random

---

## Grammar Reference Pages

Three standalone static HTML pages linked from the main nav:

| Page | Path | Content |
|---|---|---|
| Die 8 Zeitformen | `pages/tenses.html` | All 8 German tenses with usage labels and example sentences |
| Satzbau & Wortstellung | `pages/word-order.html` | Verb position rules, TeKaMoLo, V2 rule |
| Konnektoren | `pages/connectors.html` | All connectors/conjunctions with verb-position effect highlighted |

These are **static reference pages** — no JS logic, no data loading.

---

## Branching & Workflow

```
main  → production (stable, do NOT push broken code here)
dev   → all active development

# Release flow:
git checkout main
git merge dev
git push origin main
```

---

## Known Issues & Pending Work

### 🔴 Critical (before any production launch)

- [ ] **Full dataset exposed in browser** — `content.json` is fully downloadable. Must move to server-side API for V2.
- [ ] **No user accounts** — progress is not saved between sessions.
- [ ] **All word lists use overlapping IDs starting from 1** — will cause collisions when merged in a real DB.
- [ ] **No rate limiting or session auth** — nothing protects the data layer.

### 🟡 Data quality

- [ ] **877 items with `unknown` partOfSpeech** — needs classification via `overrides.csv`
- [ ] **~724 Redewendungen entries unassigned to CEFR** — need level tagging
- [ ] **~724 entries flagged `needs_type_review`** — true idioms vs. vocabulary vs. phrases need reclassification
- [ ] **Many verbs missing `auxiliary` (Perfekt Hilfsverb)** — especially in imported CSVs
- [ ] **Missing Doppelkonnektoren** — currently 14 connectors, ~7 double-connectors missing
- [ ] **`redewendungs` still shows old data** in some cards (stale `sein` entries etc.)
- [ ] **Level filter should hide when Redewendungen is selected** (no CEFR for idioms)

### 🟠 UX / Feature gaps

- [ ] **"Richtig/Falsch" stat counts session answers** — plan is to count "memorized / not memorized" per user account (requires accounts)
- [ ] **No word-list table view** — users may want to browse all cards as a list
- [ ] **No topic/Thema filter** (work, education, daily life) — data model supports it, UI does not

---

## Planned Architecture (V2)

V2 introduces a **backend, user accounts, and server-side data delivery**.

```
Browser (HTML/CSS/JS)
       ↓  API requests only — no full dataset download
Cloudflare Worker  (edge API layer)
       ↓
Cloudflare D1  (SQLite-compatible serverless DB)
  ├── WORDS table  (linguistic data — static)
  ├── USERS table  (accounts)
  └── USER_PROGRESS table  (per-word learning state)
```

### V2 API design (session-based, not word-by-word GET)

```
POST /api/session/start          → returns session token + first card
GET  /api/session/next           → returns next card for this learner
POST /api/session/answer         → records remembered/not-remembered
GET  /api/progress               → learner's overall stats
GET  /api/review/due             → cards due for review today
```

> No bulk endpoints. No `/api/all-words`. No sequential IDs exposed. The dataset never leaves the server as a file.

### V2 user progress schema (to add to existing SQL)

```sql
CREATE TABLE users (
  user_id     TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_progress (
  user_id       TEXT REFERENCES users(user_id),
  word_id       TEXT REFERENCES content_items(id),
  attempts      INTEGER DEFAULT 0,
  correct       INTEGER DEFAULT 0,
  incorrect     INTEGER DEFAULT 0,
  first_seen    TIMESTAMP,
  last_review   TIMESTAMP,
  next_review   TIMESTAMP,
  interval_days INTEGER DEFAULT 1,
  mastery_score INTEGER DEFAULT 0,   -- 0–100
  PRIMARY KEY (user_id, word_id)
);
```

### V2 spaced repetition model

Confidence-decay model based on binary feedback ("I remember" / "I don't remember"):

- Each word has `mastery_score` (0–100) and `next_review` timestamp
- Score increases on correct recall, decreases significantly on failure after success
- Review interval scales with confidence: 20% → 1 day, 60% → 7 days, 92% → 60 days
- Confidence decays with time even without a review (uncertainty increases)
- Session shows: **new words** + **words to strengthen** + **memory checks** (not a raw card queue)

---

## Long-Term Vision (V3+)

### Data architecture — 4 layers

| Layer | What it stores | Purpose |
|---|---|---|
| **A — Linguistic** | Word metadata (static) | What is this word? |
| **B — Learner state** | Per-user progress | What does this learner know? |
| **C — Population behavior** | Aggregated difficulty, retention stats | How do learners in general perform? |
| **D — Institution data** | Course + class + institution context | What are this class's weaknesses? |

### Key analytics metrics to collect

- `attempts`, `correct`, `incorrect` per word per user
- `response_time` (how long the flip+answer took)
- `time_to_mastery` (reviews needed before consistent recall)
- `forgetting_rate` (correct then forgotten after interval)
- `retention_probability` (estimated at next review)

### Teacher & institution dashboards

- **Teacher dashboard:** action-oriented. Class overview → struggling students → vocabulary needing focus → create assignment
- **Institution dashboard:** management-oriented. Usage KPIs → course comparison → learner engagement → vocabulary intelligence reports

Both dashboards read from the same data, but present different interpretations:
- Teacher: *"31 students struggle with this word → I should teach it."*
- Institution: *"Our B1 cohort shows recurring difficulty with these 14 items."*

### Quarterly reporting

Automated institution report (PDF + dashboard):
- Active learners, sessions, words reviewed
- Most difficult vocabulary by CEFR level
- Retention rate over time
- CEFR coverage progress

### AI / automation (later)

- AutoML difficulty scoring (no manual model per word)
- Predictive review scheduling: `P(correct at time T)`
- Outreach & CRM agent for B2B sales
- Analytics agent generating monthly institution summaries
- Learner motivation nudges (not forced — projected progress shown)

### PWA / native

Stay as a **PWA** (Progressive Web App) for V2. Native app wrapper only if economics justify it later. One codebase, no App Store dependency.

---

## Quick Commands

```powershell
# Rebuild the content catalogue after any CSV/manual change
node scripts/build-content.mjs

# Find the stable ID of any term (for overrides.csv)
node scripts/find-content.mjs "sich kümmern"

# Seed a local SQLite DB (optional, for testing)
sqlite3 german.db < data/generated/content.seed.sql

# Open the app locally (no server needed — just open in browser)
start index.html
```

---

*Last updated: September 2026 — V1 prototype state.*
