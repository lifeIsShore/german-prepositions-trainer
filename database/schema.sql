-- Optional future SQLite schema. JSON text fields mirror the static catalogue,
-- allowing an import without transforming the content a second time.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS content_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN (
    'vocabulary', 'idiom', 'verb_preposition', 'phrase', 'grammar_note',
    'konnektor', 'konjunktion', 'reflexive_verb'
  )),
  term TEXT NOT NULL,
  sense TEXT,
  translation TEXT,
  examples_json TEXT NOT NULL,
  levels_json TEXT NOT NULL,
  part_of_speech TEXT NOT NULL,
  usage_json TEXT NOT NULL,
  contexts_json TEXT NOT NULL,
  tags_json TEXT NOT NULL,
  grammar_json TEXT NOT NULL,
  collocations_json TEXT NOT NULL,
  related_json TEXT NOT NULL,
  editorial_json TEXT NOT NULL DEFAULT '{"mnemonicHint":null,"approvedByNative":false}',
  source_json TEXT NOT NULL,
  review_status TEXT NOT NULL CHECK (review_status IN ('unreviewed', 'reviewed'))
);

CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_term ON content_items(term);
CREATE INDEX IF NOT EXISTS idx_content_items_review_status ON content_items(review_status);
-- Useful for connector/konjunktion filter pages
CREATE INDEX IF NOT EXISTS idx_content_items_type_pos ON content_items(type, part_of_speech);
