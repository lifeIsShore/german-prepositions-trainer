# Content storage

This is a backend-first content system. The current UI is unchanged; when you work on it later, it can load `generated/content.json` in one request.

The first version should stay file-based. It is fast, simple to host, works offline, and avoids building an admin/database before you need one. The build also writes a SQLite seed file for a clean future migration.

## Source of truth and generated files

- `b2-all.csv`, `c1-work.csv`, and `redewendungs.csv` are your original imported sources.
- The small `b2-*.csv` files add context labels such as `work`, `health`, and `education`; they are not imported as duplicate words.
- `../words.md` provides the 300 verb-preposition records.
- `manual/entries.csv` is where you add new, fully described records.
- `manual/overrides.csv` is where you enrich or classify an existing imported record without modifying generated output.
- `content.schema.json` is the full data contract.
- `generated/` is built output. Never edit it directly; re-run the builder instead.

## The record model

Each record represents **one teachable meaning/use**. For example, `bestehen aus + Dativ` and `bestehen auf + Dativ` are separate verb records. This keeps filters accurate and is much simpler than trying to make one record represent every possible meaning of a word.

Every item has basic fields such as `type`, `term`, English translation, examples, CEFR `levels`, part of speech, contexts, tags, source, and review status.

`usage` separates three things that should not be confused:

- `nativeFrequencyRating` is your manual German-native rating from 1–5; it starts empty.
- `corpusRank` is an optional objective frequency rank you could import later.
- `editorialFrequencyHint` only preserves the “very common/common” labels already present in `words.md`; it is not presented as a native-speaker judgment.

For consistent manual reviews, use this native-frequency scale: `5` = essential in everyday German, `4` = heard/used very often, `3` = common but context-dependent, `2` = understood but not often used, `1` = rare, specialised, or strongly regional. Record the reviewer and date as well as the score. A score is more useful than an alphabetical “rank” because two words can realistically be equally common.

`grammar` covers noun gender/plural, verb reflexivity/separability/auxiliary/irregular forms, and structured valency. Valency keeps a preposition joined to its case—for example `auf + Akkusativ`—instead of storing disconnected labels.

It also leaves space for collocations, register, regional labels, synonyms, antonyms, false friends, and reviewer notes.

## Add a new word or phrase

Append a row to `manual/entries.csv`, then build the catalogue:

```powershell
node scripts/build-content.mjs
```

Use `|` for multiple values. For `valency`, use `role:preposition:case`, for example `prepositional_object:auf:akk` or `direct_object::akk`.

```csv
,vocabulary,zuverlässig,reliable as a person,reliable,Sie ist eine zuverlässige Kollegin.,She is a reliable colleague.,B1,adjective,5,very_common,Common in everyday and work German,Anna,2026-09-10,,neutral,,work|daily_life,workplace,,,,,,,,,,zuverlässiger Mitarbeiter,,,,Manual entry,,reviewed
,verb_preposition,sich freuen,anticipation,to look forward to,Ich freue mich auf das Wochenende.,I am looking forward to the weekend.,A2|B1,verb,5,very_common,Common spoken German,Anna,2026-09-10,,neutral,,daily_life,verb_with_preposition,,,,true,false,haben,freut sich,freute sich,hat sich gefreut,prepositional_object:auf:akk,sich sehr auf etwas freuen,,,,Manual entry,,reviewed
```

Valid values include:

- `type`: `vocabulary`, `idiom`, `verb_preposition`, `phrase`, or `grammar_note`
- `part_of_speech`: `verb`, `noun`, `adjective`, `adverb`, `pronoun`, `preposition`, `conjunction`, `determiner`, `interjection`, `phrase`, `idiom`, `other`, or `unknown`
- `register`: `neutral`, `formal`, `informal`, `slang`, `regional`, `technical`, `literary`, or `unknown`
- `review_status`: `unreviewed` or `reviewed`

## Enrich existing imported content

First build the catalogue, then find its stable ID:

```powershell
node scripts/find-content.mjs "sich freuen"
```

Copy the ID into a row in `manual/overrides.csv` and fill only the metadata fields you want to change. This is the practical place to add native frequency ratings, word type, idiom/phrase classification, collocations, or corrected verb forms over time.

## Current quality notes

- `a1-all.csv`, `a2-all.csv`, `b1-all.csv`, and `c1-all.csv` are empty and therefore excluded.
- `words.md` contains 300 verb-preposition rows although its title says 200.
- Imported CSV entries start as `unreviewed` and most do not claim a word type or native frequency rating. This is deliberate: the app will not pretend machine guesses are German-native judgments. The `redewendungs.csv` source contains both single words and phrases, so it starts as `vocabulary` with `needs_type_review` rather than being falsely labelled as 724 idioms.
