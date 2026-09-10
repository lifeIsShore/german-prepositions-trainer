#!/usr/bin/env node

// Builds a single validated catalogue from the original CSV/Markdown sources.
// No packages are required: `node scripts/build-content.mjs` is enough.

import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = resolve(root, 'data');
const generatedDir = resolve(dataDir, 'generated');

const HEADERS = {
  b2: ['German Word', 'English Meaning', 'German Example Sentence', 'English Translation'],
  c1: ['german_words', 'meaning_in_english', 'sentence', 'sentence_meaning'],
  idiom: ['Neue Wörter', 'New words', 'Example sentence here', 'Translation here'],
  manual: [
    'id', 'type', 'term', 'sense', 'translation', 'example_de', 'example_en', 'levels',
    'part_of_speech', 'native_frequency_rating', 'native_frequency_label', 'native_frequency_notes',
    'rated_by', 'rated_at', 'corpus_rank', 'register', 'regional_labels', 'contexts', 'tags',
    'gender', 'plural', 'genitive_singular', 'is_reflexive', 'is_separable', 'auxiliary',
    'present_er_sie_es', 'praeteritum', 'partizip_ii', 'valency', 'collocations', 'synonyms',
    'antonyms', 'false_friends', 'word_family', 'mnemonic_hint', 'approved_by_native',
    'connector_function', 'verb_position_effect', 'highlighted_example', 'noun_article_rule',
    'source_name', 'source_url', 'review_status',
  ],
  override: [
    'id', 'type', 'part_of_speech', 'native_frequency_rating', 'native_frequency_label',
    'native_frequency_notes', 'rated_by', 'rated_at', 'corpus_rank', 'register', 'regional_labels',
    'contexts', 'tags', 'gender', 'plural', 'genitive_singular', 'is_reflexive', 'is_separable',
    'auxiliary', 'present_er_sie_es', 'praeteritum', 'partizip_ii', 'valency', 'collocations',
    'synonyms', 'antonyms', 'false_friends', 'word_family', 'mnemonic_hint', 'approved_by_native',
    'connector_function', 'verb_position_effect', 'highlighted_example', 'noun_article_rule',
    'review_status',
  ],
  levelCsv: [
    'id', 'type', 'term', 'sense', 'translation', 'example_de', 'example_en', 'levels',
    'part_of_speech', 'native_frequency_rating', 'native_frequency_label', 'native_frequency_notes',
    'rated_by', 'rated_at', 'corpus_rank', 'register', 'regional_labels', 'contexts', 'tags',
    'gender', 'plural', 'genitive_singular', 'is_reflexive', 'is_separable', 'auxiliary',
    'present_er_sie_es', 'praeteritum', 'partizip_ii', 'valency', 'collocations', 'synonyms',
    'antonyms', 'false_friends', 'source_name', 'source_url', 'review_status',
  ],
};

const TOPIC_FILES = {
  'b2-work-professions.csv': ['work'],
  'b2-work-skills-qualities.csv': ['work'],
  'b2-education-training.csv': ['education'],
  'b2-communication.csv': ['communication'],
  'b2-emotions-psychology.csv': ['daily_life', 'psychology'],
  'b2-health-body.csv': ['health'],
  'b2-home-living.csv': ['home'],
  'b2-legal-rules.csv': ['legal'],
  'b2-nature-environment.csv': ['environment'],
  'b2-social-society.csv': ['society'],
  'b2-culture-art.csv': ['culture'],
};

const TYPES = new Set(['vocabulary', 'idiom', 'verb_preposition', 'phrase', 'grammar_note', 'konnektor', 'konjunktion', 'reflexive_verb']);
const LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const POS = new Set(['verb', 'noun', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'connector', 'determiner', 'interjection', 'phrase', 'idiom', 'other', 'unknown', 'article', 'indefinite_pronoun', 'participle', 'affix', 'numeral', 'particle', 'prefix', 'suffix', 'abbreviation']);
const REGISTERS = new Set(['neutral', 'standard', 'formal', 'informal', 'slang', 'regional', 'technical', 'literary', 'unknown', 'colloquial']);
const FREQUENCY_LABELS = new Set(['essential', 'very_common', 'common', 'occasional', 'rare', 'very high', 'high', 'medium', 'medium-low', 'low']);
const VERB_POSITION_EFFECTS = new Set(['position_0_normal', 'position_1_inversion', 'subordinate_verb_end']);
const REVIEW_STATUSES = new Set(['unreviewed', 'reviewed', 'verified', 'draft', 'needs_review']);
const buildWarnings = [];

const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');
const pipeList = (value) => clean(value).split('|').map(clean).filter(Boolean);
const unique = (values) => [...new Set(values.filter(Boolean))];
const optional = (value) => clean(value) || null;

function fingerprint(...values) {
  return createHash('sha256').update(values.map(clean).join('\u001f')).digest('hex').slice(0, 10);
}

function slug(value) {
  return clean(value).toLocaleLowerCase('de-DE')
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 42) || 'entry';
}

function importedId(prefix, term, translation, exampleDe, exampleEn) {
  return `${prefix}-${slug(term)}-${fingerprint(term, translation, exampleDe, exampleEn)}`;
}

// Small RFC 4180-compatible parser so the build does not depend on npm.
function parseCsv(text, file) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let justClosedQuote = false;
  const input = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') { field += '"'; i += 1; }
      else if (char === '"') { quoted = false; justClosedQuote = true; }
      else field += char;
      continue;
    }
    if (char === '"' && !field && !justClosedQuote) quoted = true;
    else if (char === ',') { row.push(field); field = ''; justClosedQuote = false; }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && input[i + 1] === '\n') i += 1;
      row.push(field);
      if (row.some((value) => clean(value))) rows.push(row);
      row = []; field = ''; justClosedQuote = false;
    } else { field += char; justClosedQuote = false; }
  }
  if (quoted) throw new Error(`${file}: unclosed quoted value`);
  if (field || row.length) { row.push(field); if (row.some((value) => clean(value))) rows.push(row); }
  return rows;
}

async function readCsv(path, headers) {
  const file = relative(root, path).replaceAll('\\', '/');
  const rows = parseCsv(await readFile(path, 'utf8'), file);
  if (!rows.length) throw new Error(`${file}: file is empty`);
  const actualHeaders = rows[0].map(clean);
  if (JSON.stringify(actualHeaders) !== JSON.stringify(headers)) {
    throw new Error(`${file}: unexpected headers. Expected ${JSON.stringify(headers)}, got ${JSON.stringify(actualHeaders)}`);
  }
  return {
    file,
    records: rows.slice(1).flatMap((values, index) => {
      if (values.length !== headers.length) throw new Error(`${file}: row ${index + 2} has ${values.length} columns; expected ${headers.length}`);
      const record = Object.fromEntries(headers.map((header, column) => [header, clean(values[column])]));
      const normalizedValues = values.map(clean);
      const isEmbeddedHeader = Object.values(HEADERS).some((candidate) => JSON.stringify(candidate) === JSON.stringify(normalizedValues));
      if (isEmbeddedHeader) {
        buildWarnings.push({ code: 'embedded_header_skipped', file, row: index + 2 });
        return [];
      }
      return [{ ...record, _sourceRow: index + 2 }];
    }),
  };
}

function parseBoolean(value, field, id) {
  if (!clean(value)) return null;
  const val = clean(value).toLowerCase();
  if (val === 'true' || val === 'yes' || val === '1') return true;
  if (val === 'false' || val === 'no' || val === '0' || val === 'optional') return false;
  return null;
}

function parseNumber(value, field, id, min, max) {
  if (!clean(value)) return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) return null;
  return number;
}

function parseValency(value, id) {
  if (!clean(value)) return [];
  const parts = clean(value).split(/[|;]/).map(clean).filter(Boolean);
  return parts.flatMap((part) => {
    if (part.includes(':')) {
      const segments = part.split(':').map(clean);
      const role = segments[0] || 'object';
      let preposition = segments[1] || null;
      let grammaticalCase = (segments[2] || '').toLowerCase();
      if (!grammaticalCase && segments[1]) {
        const possibleCase = segments[1].toLowerCase();
        if (['akk', 'dat', 'gen', 'nom', 'akkusativ', 'dativ', 'genitiv', 'nominativ'].includes(possibleCase)) {
          grammaticalCase = possibleCase.startsWith('akk') ? 'akk' : possibleCase.startsWith('dat') ? 'dat' : possibleCase.startsWith('gen') ? 'gen' : 'nom';
          preposition = null;
        }
      }
      if (grammaticalCase) {
        if (grammaticalCase.startsWith('akk')) grammaticalCase = 'akk';
        else if (grammaticalCase.startsWith('dat')) grammaticalCase = 'dat';
        else if (grammaticalCase.startsWith('gen')) grammaticalCase = 'gen';
        else if (grammaticalCase.startsWith('nom')) grammaticalCase = 'nom';
        else grammaticalCase = null;
      }
      return [{ role, preposition, case: grammaticalCase }];
    }

    const match = part.match(/^(.*?)\s*\+?\s*(Akkusativ|Akk|Dativ|Dat|Genitiv|Gen|Nominativ|Nom)$/i);
    if (match) {
      const prepStr = clean(match[1]) || null;
      const caseStr = match[2].toLowerCase();
      const caseValue = caseStr.startsWith('akk') ? 'akk' : caseStr.startsWith('dat') ? 'dat' : caseStr.startsWith('gen') ? 'gen' : 'nom';
      return [{
        role: prepStr ? 'prepositional_object' : 'object',
        preposition: prepStr,
        case: caseValue,
      }];
    }

    return [{ role: 'object', preposition: part || null, case: null }];
  });
}

function source(file, row, name) {
  return { kind: 'local_source', name, file, row };
}

function makeItem(input) {
  const id = clean(input.id);
  const type = clean(input.type);
  const levels = unique(input.levels ?? []);
  const partOfSpeech = clean(input.partOfSpeech || 'unknown');
  const usage = {
    nativeFrequencyRating: input.usage?.nativeFrequencyRating ?? null,
    nativeFrequencyLabel: optional(input.usage?.nativeFrequencyLabel),
    nativeFrequencyNotes: optional(input.usage?.nativeFrequencyNotes),
    ratedBy: optional(input.usage?.ratedBy),
    ratedAt: optional(input.usage?.ratedAt),
    corpusRank: input.usage?.corpusRank ?? null,
    editorialFrequencyHint: optional(input.usage?.editorialFrequencyHint),
    register: clean(input.usage?.register || 'unknown'),
    regionalLabels: unique(input.usage?.regionalLabels ?? []),
  };
  const grammar = {
    gender: optional(input.grammar?.gender),
    plural: optional(input.grammar?.plural),
    genitiveSingular: optional(input.grammar?.genitiveSingular),
    isReflexive: input.grammar?.isReflexive ?? null,
    isSeparable: input.grammar?.isSeparable ?? null,
    auxiliary: optional(input.grammar?.auxiliary),
    forms: {
      presentErSieEs: optional(input.grammar?.forms?.presentErSieEs),
      praeteritum: optional(input.grammar?.forms?.praeteritum),
      partizipII: optional(input.grammar?.forms?.partizipII),
    },
    valency: input.grammar?.valency ?? [],
    // Connector-specific fields (null for non-connector types)
    connectorFunction: optional(input.grammar?.connectorFunction),
    verbPositionEffect: optional(input.grammar?.verbPositionEffect),
    highlightedExample: optional(input.grammar?.highlightedExample),
    nounArticleRule: optional(input.grammar?.nounArticleRule),
  };
  const editorial = {
    mnemonicHint: optional(input.editorial?.mnemonicHint),
    approvedByNative: input.editorial?.approvedByNative ?? false,
  };
  if (!id || !/^[a-z0-9-]+$/.test(id)) throw new Error(`invalid content id "${id}"`);
  if (!TYPES.has(type)) throw new Error(`${id}: unsupported type "${type}"`);
  if (!clean(input.term)) throw new Error(`${id}: term is required`);
  if (!levels.every((level) => LEVELS.has(level))) throw new Error(`${id}: invalid CEFR level`);
  if (!POS.has(partOfSpeech)) throw new Error(`${id}: invalid part of speech "${partOfSpeech}"`);
  if (!REGISTERS.has(usage.register)) throw new Error(`${id}: invalid register "${usage.register}"`);
  if (usage.nativeFrequencyLabel && !FREQUENCY_LABELS.has(usage.nativeFrequencyLabel)) throw new Error(`${id}: invalid nativeFrequencyLabel "${usage.nativeFrequencyLabel}"`);
  if (usage.nativeFrequencyRating !== null && (!Number.isInteger(usage.nativeFrequencyRating) || usage.nativeFrequencyRating < 1 || usage.nativeFrequencyRating > 5)) throw new Error(`${id}: native frequency rating must be 1–5`);
  if (usage.corpusRank !== null && (!Number.isInteger(usage.corpusRank) || usage.corpusRank < 1)) throw new Error(`${id}: corpus rank must be a positive whole number`);
  if (![null, true, false].includes(grammar.isReflexive) || ![null, true, false].includes(grammar.isSeparable)) throw new Error(`${id}: grammar booleans must be true, false, or null`);
  if (grammar.gender && !['der', 'die', 'das'].includes(grammar.gender)) throw new Error(`${id}: gender must be der, die, or das`);
  if (grammar.auxiliary && !['haben', 'sein'].includes(grammar.auxiliary)) throw new Error(`${id}: auxiliary must be haben or sein`);
  if (grammar.verbPositionEffect && !VERB_POSITION_EFFECTS.has(grammar.verbPositionEffect)) throw new Error(`${id}: invalid verbPositionEffect "${grammar.verbPositionEffect}"`);
  if (!REVIEW_STATUSES.has(input.reviewStatus || 'unreviewed')) throw new Error(`${id}: invalid review status`);
  return {
    id, type, term: clean(input.term), sense: optional(input.sense), translation: optional(input.translation),
    examples: { de: optional(input.exampleDe), en: optional(input.exampleEn) }, levels, partOfSpeech,
    usage, contexts: unique(input.contexts ?? []), tags: unique(input.tags ?? []), grammar,
    collocations: unique(input.collocations ?? []),
    related: {
      synonyms: unique(input.related?.synonyms ?? []),
      antonyms: unique(input.related?.antonyms ?? []),
      falseFriends: unique(input.related?.falseFriends ?? []),
      wordFamily: unique(input.related?.wordFamily ?? []),
    },
    editorial,
    source: input.source, reviewStatus: input.reviewStatus || 'unreviewed',
  };
}

function vocabularyKey(term, translation) {
  return `${clean(term).toLocaleLowerCase('de-DE')}\u001f${clean(translation).toLocaleLowerCase('en-US')}`;
}

async function topicIndex() {
  const index = new Map();
  for (const [filename, contexts] of Object.entries(TOPIC_FILES)) {
    const { records } = await readCsv(resolve(dataDir, filename), HEADERS.b2);
    for (const row of records) {
      const key = vocabularyKey(row['German Word'], row['English Meaning']);
      index.set(key, unique([...(index.get(key) ?? []), ...contexts]));
    }
  }
  return index;
}

function defaultGrammar(term) {
  return { isReflexive: /^sich\s/i.test(term) };
}

async function importVocabulary(topics) {
  const items = [];
  const b2 = await readCsv(resolve(dataDir, 'b2-all.csv'), HEADERS.b2);
  for (const [index, row] of b2.records.entries()) {
    const term = row['German Word']; const translation = row['English Meaning'];
    const exampleDe = row['German Example Sentence']; const exampleEn = row['English Translation'];
    items.push(makeItem({
      id: importedId('vocab-b2', term, translation, exampleDe, exampleEn), type: 'vocabulary', term, translation, exampleDe, exampleEn,
      levels: ['B2'], contexts: topics.get(vocabularyKey(term, translation)) ?? [], grammar: defaultGrammar(term),
      source: source(b2.file, row._sourceRow, 'B2 vocabulary'),
    }));
  }
  const c1 = await readCsv(resolve(dataDir, 'c1-work.csv'), HEADERS.c1);
  for (const [index, row] of c1.records.entries()) {
    const term = row.german_words; const translation = row.meaning_in_english;
    const exampleDe = row.sentence; const exampleEn = row.sentence_meaning;
    items.push(makeItem({
      id: importedId('vocab-c1', term, translation, exampleDe, exampleEn), type: 'vocabulary', term, translation, exampleDe, exampleEn,
      levels: ['C1'], contexts: ['work'], grammar: defaultGrammar(term), source: source(c1.file, row._sourceRow, 'C1 work vocabulary'),
    }));
  }
  return items;
}

async function importIdioms() {
  const { file, records } = await readCsv(resolve(dataDir, 'redewendungs.csv'), HEADERS.idiom);
  return records.map((row, index) => {
    const term = row['Neue Wörter']; const translation = row['New words'];
    const exampleEn = row['Example sentence here']; const exampleDe = row['Translation here'];
    
    let classification = 'phrase';
    if (term && !term.includes(' ') && !term.includes('-')) classification = 'vocabulary';
    if (translation && (translation.toLowerCase().includes('literally:') || translation.toLowerCase().includes('idiom'))) classification = 'idiom';
    
    return makeItem({
      id: importedId('phrase-source', term, translation, exampleDe, exampleEn), 
      type: classification, 
      term, translation, exampleDe, exampleEn,
      levels: [],
      contexts: ['general'], 
      tags: ['redewendung'], 
      source: source(file, row._sourceRow, 'Phrase/idiom source'),
    });
  });
}

function parseMarkdownValency(value) {
  return clean(value).split('/').map(clean).filter(Boolean).flatMap((part) => {
    const matches = [...part.matchAll(/(.*?)\s*\+\s*(Akk\.|Dat\.|Gen\.|Nom\.)/gi)];
    if (!matches.length) return [{ role: 'object', preposition: part || null, case: null }];
    return matches.map((match) => {
      const preposition = clean(match[1]) || null;
      return { role: preposition ? 'prepositional_object' : 'object', preposition, case: match[2].replace('.', '').toLowerCase() };
    });
  });
}

async function importVerbPrepositions() {
  const path = resolve(root, 'words.md');
  const file = relative(root, path).replaceAll('\\', '/');
  const lines = (await readFile(path, 'utf8')).split(/\r?\n/);
  const items = [];
  let levels = ['B2']; let editorialFrequencyHint = 'common';
  for (const [lineIndex, line] of lines.entries()) {
    if (/1[–-]50: Very common B1\/B2 verbs/.test(line)) { levels = ['B1', 'B2']; editorialFrequencyHint = 'very_common'; continue; }
    if (/51[–-]100: Important B2 verbs/.test(line)) { levels = ['B2']; editorialFrequencyHint = 'common'; continue; }
    if (/101[–-]150: B2\/C1/.test(line) || /151[–-]200: Strong B2\/C1/.test(line)) { levels = ['B2', 'C1']; editorialFrequencyHint = 'common'; continue; }
    const match = line.match(/^\|\s*(\d+)\s*\|\s*\*\*(.*?)\*\*\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*$/);
    if (!match) continue;
    const [, number, term, grammarText, exampleDe] = match.map(clean);
    items.push(makeItem({
      id: importedId('verb-preposition', term, grammarText, exampleDe, number), type: 'verb_preposition', term, exampleDe,
      levels, partOfSpeech: 'verb', usage: { editorialFrequencyHint }, grammar: { isReflexive: /^sich\s/i.test(term), valency: parseMarkdownValency(grammarText) },
      tags: ['verb_with_preposition'], source: source(file, lineIndex + 1, 'Verb-preposition reference'),
    }));
  }
  if (items.length !== 300) throw new Error(`${file}: expected 300 verb-preposition rows, found ${items.length}`);
  return items;
}

function normalizeGender(raw) {
  if (!raw) return null;
  const g = clean(raw).toLowerCase();
  if (g === 'masculine' || g === 'der' || g === 'm') return 'der';
  if (g === 'feminine' || g === 'die' || g === 'f') return 'die';
  if (g === 'neuter' || g === 'das' || g === 'n') return 'das';
  return null;
}

function normalizeAuxiliary(raw) {
  if (!raw) return null;
  const a = clean(raw).toLowerCase();
  if (a === 'haben' || a === 'sein') return a;
  return null;
}

function manualItem(row, file, rowNumber, idPrefix = null) {
  let id = clean(row.id);
  if (idPrefix && id) {
    id = `${idPrefix}-${id}`;
  } else if (!id) {
    id = importedId(idPrefix || 'manual', row.term, row.translation, row.example_de, row.example_en);
  }
  const rawType = clean(row.type);
  const type = (rawType === 'word' ? 'vocabulary' : rawType) || 'vocabulary';
  const gender = normalizeGender(row.gender);
  const auxiliary = normalizeAuxiliary(row.auxiliary);
  let reg = clean(row.register).toLowerCase();
  if (!REGISTERS.has(reg)) reg = 'standard';
  return makeItem({
    id, type, term: row.term, sense: row.sense, translation: row.translation,
    exampleDe: row.example_de, exampleEn: row.example_en, levels: pipeList(row.levels), partOfSpeech: row.part_of_speech || 'unknown',
    usage: {
      nativeFrequencyRating: parseNumber(row.native_frequency_rating, 'native_frequency_rating', id, 1, 5),
      nativeFrequencyLabel: row.native_frequency_label || null,
      nativeFrequencyNotes: row.native_frequency_notes, ratedBy: row.rated_by, ratedAt: row.rated_at,
      corpusRank: parseNumber(row.corpus_rank, 'corpus_rank', id, 1, Number.MAX_SAFE_INTEGER),
      register: reg, regionalLabels: pipeList(row.regional_labels),
    },
    contexts: pipeList(row.contexts), tags: pipeList(row.tags),
    grammar: {
      gender, plural: row.plural, genitiveSingular: row.genitive_singular,
      isReflexive: parseBoolean(row.is_reflexive, 'is_reflexive', id),
      isSeparable: parseBoolean(row.is_separable, 'is_separable', id),
      auxiliary,
      forms: { presentErSieEs: row.present_er_sie_es, praeteritum: row.praeteritum, partizipII: row.partizip_ii },
      valency: parseValency(row.valency, id),
      connectorFunction: row.connector_function || null,
      verbPositionEffect: row.verb_position_effect || null,
      highlightedExample: row.highlighted_example || null,
      nounArticleRule: row.noun_article_rule || null,
    },
    collocations: pipeList(row.collocations),
    related: {
      synonyms: pipeList(row.synonyms), antonyms: pipeList(row.antonyms),
      falseFriends: pipeList(row.false_friends), wordFamily: pipeList(row.word_family),
    },
    editorial: {
      mnemonicHint: row.mnemonic_hint || null,
      approvedByNative: parseBoolean(row.approved_by_native, 'approved_by_native', id) ?? false,
    },
    source: { kind: 'manual_entry', name: row.source_name || 'Manual entry', file, row: rowNumber, url: optional(row.source_url) },
    reviewStatus: row.review_status || 'unreviewed',
  });
}

async function importManual() {
  const { file, records } = await readCsv(resolve(dataDir, 'manual', 'entries.csv'), HEADERS.manual);
  return records.map((row) => manualItem(row, file, row._sourceRow, 'manual'));
}

async function importLevelCSVs() {
  const items = [];
  for (const filename of ['a1-all.csv', 'a2-all.csv', 'b1-all.csv']) {
    const prefix = filename.replace('-all.csv', '');
    const { file, records } = await readCsv(resolve(dataDir, filename), HEADERS.levelCsv);
    for (const row of records) {
      items.push(manualItem(row, file, row._sourceRow, prefix));
    }
  }
  return items;
}

function applyOverride(item, row) {
  const id = item.id;
  const set = (field, value, transform = optional) => clean(value) ? transform(value) : undefined;
  const assign = (object, key, value) => { if (value !== undefined) object[key] = value; };
  assign(item, 'type', set('type', row.type));
  assign(item, 'partOfSpeech', set('part_of_speech', row.part_of_speech));
  if (!TYPES.has(item.type)) throw new Error(`${id}: invalid type`);
  if (clean(row.part_of_speech) && !POS.has(item.partOfSpeech)) throw new Error(`${id}: invalid part of speech`);
  assign(item.usage, 'nativeFrequencyRating', set('native_frequency_rating', row.native_frequency_rating, (value) => parseNumber(value, 'native_frequency_rating', id, 1, 5)));
  assign(item.usage, 'nativeFrequencyLabel', set('native_frequency_label', row.native_frequency_label));
  assign(item.usage, 'nativeFrequencyNotes', set('native_frequency_notes', row.native_frequency_notes));
  assign(item.usage, 'ratedBy', set('rated_by', row.rated_by));
  assign(item.usage, 'ratedAt', set('rated_at', row.rated_at));
  assign(item.usage, 'corpusRank', set('corpus_rank', row.corpus_rank, (value) => parseNumber(value, 'corpus_rank', id, 1, Number.MAX_SAFE_INTEGER)));
  assign(item.usage, 'register', set('register', row.register));
  if (!REGISTERS.has(item.usage.register)) throw new Error(`${id}: invalid register`);
  for (const [field, target] of [['regional_labels', 'regionalLabels'], ['contexts', 'contexts'], ['tags', 'tags'], ['collocations', 'collocations']]) {
    if (clean(row[field])) {
      if (target === 'regionalLabels') item.usage[target] = pipeList(row[field]);
      else item[target] = pipeList(row[field]);
    }
  }
  for (const [field, target] of [['plural', 'plural'], ['genitive_singular', 'genitiveSingular']]) assign(item.grammar, target, set(field, row[field]));
  if (clean(row.gender)) item.grammar.gender = normalizeGender(row.gender);
  if (clean(row.auxiliary)) item.grammar.auxiliary = normalizeAuxiliary(row.auxiliary);
  for (const [field, target] of [['is_reflexive', 'isReflexive'], ['is_separable', 'isSeparable']]) if (clean(row[field])) item.grammar[target] = parseBoolean(row[field], field, id);
  for (const [field, target] of [['present_er_sie_es', 'presentErSieEs'], ['praeteritum', 'praeteritum'], ['partizip_ii', 'partizipII']]) assign(item.grammar.forms, target, set(field, row[field]));
  if (clean(row.valency)) item.grammar.valency = parseValency(row.valency, id);
  // New grammar fields
  for (const [field, target] of [['connector_function', 'connectorFunction'], ['verb_position_effect', 'verbPositionEffect'], ['highlighted_example', 'highlightedExample'], ['noun_article_rule', 'nounArticleRule']]) assign(item.grammar, target, set(field, row[field]));
  // New related fields
  for (const [field, target] of [['synonyms', 'synonyms'], ['antonyms', 'antonyms'], ['false_friends', 'falseFriends'], ['word_family', 'wordFamily']]) if (clean(row[field])) item.related[target] = pipeList(row[field]);
  // Editorial fields
  if (!item.editorial) item.editorial = { mnemonicHint: null, approvedByNative: false };
  assign(item.editorial, 'mnemonicHint', set('mnemonic_hint', row.mnemonic_hint));
  if (clean(row.approved_by_native)) item.editorial.approvedByNative = parseBoolean(row.approved_by_native, 'approved_by_native', id) ?? false;
  if (clean(row.review_status)) item.reviewStatus = row.review_status;
  return makeItem(item);
}

async function applyOverrides(items) {
  const { file, records } = await readCsv(resolve(dataDir, 'manual', 'overrides.csv'), HEADERS.override);
  const byId = new Map(items.map((item) => [item.id, item]));
  for (const [index, row] of records.entries()) {
    if (!row.id) throw new Error(`${file}: row ${row._sourceRow} needs an id`);
    if (!byId.has(row.id)) throw new Error(`${file}: row ${row._sourceRow} references unknown id "${row.id}"`);
    byId.set(row.id, applyOverride(byId.get(row.id), row));
  }
  return [...byId.values()];
}

function collapseImportedDuplicates(items) {
  const byId = new Map();
  for (const item of items) {
    const existing = byId.get(item.id);
    if (!existing) { byId.set(item.id, item); continue; }
    if (existing.source.kind === 'manual_entry' || item.source.kind === 'manual_entry') {
      throw new Error(`duplicate manual content ID: ${item.id}`);
    }
    buildWarnings.push({ code: 'duplicate_record_collapsed', id: item.id, kept: existing.source, skipped: item.source });
  }
  return [...byId.values()];
}

function countBy(items, select) {
  const counts = {};
  for (const item of items) for (const value of select(item)) counts[value] = (counts[value] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function quoteSql(value) { return `'${String(value ?? '').replaceAll("'", "''")}'`; }

function createSeedSql(items) {
  const columns = ['id', 'type', 'term', 'sense', 'translation', 'examples_json', 'levels_json', 'part_of_speech', 'usage_json', 'contexts_json', 'tags_json', 'grammar_json', 'collocations_json', 'related_json', 'source_json', 'review_status'];
  const rows = items.map((item) => `INSERT OR REPLACE INTO content_items (${columns.join(', ')}) VALUES (${[
    item.id, item.type, item.term, item.sense, item.translation, JSON.stringify(item.examples), JSON.stringify(item.levels), item.partOfSpeech,
    JSON.stringify(item.usage), JSON.stringify(item.contexts), JSON.stringify(item.tags), JSON.stringify(item.grammar), JSON.stringify(item.collocations), JSON.stringify(item.related), JSON.stringify(item.source), item.reviewStatus,
  ].map(quoteSql).join(', ')});`);
  return ['-- Generated by scripts/build-content.mjs. Do not edit by hand.', 'BEGIN TRANSACTION;', ...rows, 'COMMIT;', ''].join('\n');
}

async function main() {
  const topics = await topicIndex();
  let items = collapseImportedDuplicates([
    ...(await importLevelCSVs()), ...(await importVocabulary(topics)), ...(await importIdioms()), ...(await importVerbPrepositions()), ...(await importManual()),
  ]);
  items = await applyOverrides(items);
  items.sort((left, right) => left.id.localeCompare(right.id));
  const buildId = fingerprint(JSON.stringify(items));
  const summary = {
    schemaVersion: 1, buildId, totalItems: items.length,
    byType: countBy(items, (item) => [item.type]),
    byLevel: countBy(items, (item) => item.levels.length ? item.levels : ['unassigned']),
    byPartOfSpeech: countBy(items, (item) => [item.partOfSpeech]),
    byReviewStatus: countBy(items, (item) => [item.reviewStatus]),
    warnings: buildWarnings,
  };
  await mkdir(generatedDir, { recursive: true });
  await writeFile(resolve(generatedDir, 'content.json'), `${JSON.stringify({ schemaVersion: 1, buildId, items }, null, 2)}\n`);
  await writeFile(resolve(generatedDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(resolve(generatedDir, 'content.seed.sql'), createSeedSql(items));
  console.log(`Built ${items.length} entries: ${Object.entries(summary.byType).map(([type, count]) => `${count} ${type}`).join(', ')}.`);
}

main().catch((error) => { console.error(`Content build failed: ${error.message}`); process.exitCode = 1; });
