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

HEADERS.override = HEADERS.levelCsv;


const TYPES = new Set(['vocabulary', 'idiom', 'verb_preposition', 'phrase', 'grammar_note', 'konnektor', 'konjunktion', 'reflexive_verb']);
const LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const POS = new Set(['verb', 'noun', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'connector', 'determiner', 'interjection', 'phrase', 'idiom', 'other', 'unknown', 'article', 'indefinite_pronoun', 'participle', 'affix', 'numeral', 'particle', 'prefix', 'suffix', 'abbreviation']);
const REGISTERS = new Set(['neutral', 'standard', 'formal', 'informal', 'slang', 'regional', 'technical', 'literary', 'unknown', 'colloquial']);
const FREQUENCY_LABELS = new Set(['essential', 'very_common', 'common', 'occasional', 'rare', 'very high', 'high', 'medium', 'medium-low', 'low']);
const VERB_POSITION_EFFECTS = new Set(['position_0_normal', 'position_1_inversion', 'subordinate_verb_end']);
const REVIEW_STATUSES = new Set(['unreviewed', 'reviewed', 'verified', 'draft', 'needs_review']);
const buildWarnings = [];
const sourceRows = {};
const ALLOW_REMOVALS = process.argv.includes('--allow-removals');

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

const CASES = { akk: 'akk', akkusativ: 'akk', acc: 'akk', dat: 'dat', dativ: 'dat', gen: 'gen', genitiv: 'gen', nom: 'nom', nominativ: 'nom' };
const NO_VALENCY = new Set(['intransitive', 'transitive', 'none', '-', 'n/a', 'reflexive']);

function parseValency(value, id) {
  if (!clean(value)) return [];
  return clean(value).split(/[|;]|\s\/\s/).map(clean).filter(Boolean).flatMap((part) => {
    const lower = part.toLowerCase().replace(/\.$/, '');
    if (NO_VALENCY.has(lower)) return [];
    if (CASES[lower]) return [{ role: 'object', preposition: null, case: CASES[lower] }];
    if (part.includes(':')) {
      const [role, second, third] = part.split(':').map(clean);
      const caseKey = (third || (CASES[(second || '').toLowerCase()] ? second : '')).toLowerCase().replace(/\.$/, '');
      const preposition = CASES[(second || '').toLowerCase()] && !third ? null : second || null;
      return [{ role: role || 'object', preposition, case: CASES[caseKey] ?? null }];
    }
    const match = part.match(/^(.*?)\s*\+?\s*(Akkusativ|Akk|Dativ|Dat|Genitiv|Gen|Nominativ|Nom)\.?$/i);
    if (match) {
      const preposition = clean(match[1]) || null;
      return [{ role: preposition ? 'prepositional_object' : 'object', preposition, case: CASES[match[2].toLowerCase()] }];
    }
    // Free text that is not a valency pattern: keep it (nothing is lost) but flag it for cleanup.
    buildWarnings.push({ code: 'valency_unparsed', id, text: part });
    return [{ role: 'pattern', preposition: null, case: null, text: part }];
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

function vocabularyKey(item) {
  const valencyPrep = item.grammar?.valency?.[0]?.preposition || '';
  const valencyCase = item.grammar?.valency?.[0]?.case || '';
  return `${clean(item.term).toLocaleLowerCase('de-DE')}\u001f${clean(item.translation).toLocaleLowerCase('en-US')}\u001f${valencyPrep}\u001f${valencyCase}`;
}


function defaultGrammar(term) {
  return { isReflexive: /^sich\s/i.test(term) };
}

async function importIdioms() {
  const fs = await import('node:fs');
  const path = resolve(dataDir, 'redewendungs.csv');
  if (!fs.existsSync(path)) return [];
  const { file, records } = await readCsv(path, HEADERS.idiom);
  sourceRows[file] = records.length;
  return records.map((row, index) => {
    const term = row['Neue Wörter']; const translation = row['New words'];
    const exampleEn = row['Example sentence here']; const exampleDe = row['Translation here'];
    
    let classification = 'phrase';
    if (term && !term.includes(' ') && !term.includes('-')) classification = 'vocabulary';
    if (translation && (translation.toLowerCase().includes('literally:') || translation.toLowerCase().includes('idiom'))) classification = 'idiom';
    
    return makeItem({
      id: `idiom-${slug(term)}-${fingerprint(term)}`, 
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
      id: `vp-${number.padStart(3, '0')}`, type: 'verb_preposition', term, exampleDe,
      levels, partOfSpeech: 'verb', usage: { editorialFrequencyHint }, grammar: { isReflexive: /^sich\s/i.test(term), valency: parseMarkdownValency(grammarText) },
      tags: ['verb_with_preposition'], source: source(file, lineIndex + 1, 'Verb-preposition reference'),
    }));
  }
  sourceRows[file] = items.length;
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
  sourceRows[file] = records.length;
  return records.map((row) => manualItem(row, file, row._sourceRow, 'manual'));
}

async function importLevelCSVs() {
  const items = [];
  const fs = await import('node:fs');
  const filesToRead = fs.existsSync(resolve(dataDir, 'vocab-all.csv')) ? ['vocab'] : ['a1', 'a2', 'b1', 'b2', 'c1'];
  for (const level of filesToRead) {
    const { file, records } = await readCsv(resolve(dataDir, `${level}-all.csv`), HEADERS.levelCsv);
    sourceRows[file] = records.length;
    for (const row of records) {
      const item = manualItem(row, file, row._sourceRow, 'w');
      items.push(item);
    }
  }
  return items;
}

function applyOverride(item, row) {
  const id = item.id;
  const set = (field, value, transform = optional) => clean(value) ? transform(value) : undefined;
  const assign = (object, key, value) => { if (value !== undefined) object[key] = value; };
  assign(item, 'type', set('type', row.type));
  assign(item, 'sense', set('sense', row.sense));
  assign(item, 'translation', set('translation', row.translation));
  if (clean(row.example_de)) item.examples.de = clean(row.example_de);
  if (clean(row.example_en)) item.examples.en = clean(row.example_en);
  if (clean(row.levels)) item.levels = pipeList(row.levels);
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
  return makeItem({ ...item, exampleDe: item.examples.de, exampleEn: item.examples.en });
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

function aggregateWarnings() {
  const counts = {}; const samples = {};
  for (const warning of buildWarnings) {
    counts[warning.code] = (counts[warning.code] ?? 0) + 1;
    const list = (samples[warning.code] ??= []);
    if (list.length < 15) list.push(warning);
  }
  return { counts, samples };
}

// Data-quality gaps (US-3.x / 6.x): counts plus a few example IDs so they can be worked off in batches.
function qualityReport(items) {
  const checks = {
    unknownPartOfSpeech: (i) => i.partOfSpeech === 'unknown',
    verbWithoutAuxiliary: (i) => i.partOfSpeech === 'verb' && !i.grammar.auxiliary,
    verbWithoutForms: (i) => i.partOfSpeech === 'verb' && !i.grammar.forms.partizipII,
    nounWithoutGender: (i) => i.partOfSpeech === 'noun' && !i.grammar.gender,
    nounWithoutPlural: (i) => i.partOfSpeech === 'noun' && !i.grammar.plural,
    missingTranslation: (i) => !i.translation,
    missingExample: (i) => !i.examples.de || !i.examples.en,
    noLevel: (i) => !i.levels.length,
    noFrequencyRating: (i) => i.usage.nativeFrequencyRating === null,
    needsReview: (i) => i.reviewStatus === 'needs_review',
  };
  const report = {};
  for (const [name, test] of Object.entries(checks)) {
    const hits = items.filter(test);
    report[name] = { count: hits.length, sampleIds: hits.slice(0, 10).map((i) => i.id) };
  }
  const groups = new Map();
  for (const item of items) { const key = vocabularyKey(item); groups.set(key, [...(groups.get(key) ?? []), item.id]); }
  const duplicates = [...groups.values()].filter((ids) => ids.length > 1);
  report.duplicateTermAndTranslation = { count: duplicates.length, samples: duplicates.slice(0, 15) };
  return report;
}

// Stable-ID registry (US-7.1 / 7.4). IDs are never reused; removing one needs a retirement record.
async function updateRegistry(items, buildId) {
  const path = resolve(dataDir, 'id-registry.json');
  let registry = { schemaVersion: 1, contentVersion: 0, buildId: null, ids: {} };
  try { registry = JSON.parse(await readFile(path, 'utf8')); } catch { /* first build */ }
  const retirementPath = resolve(dataDir, 'retirements.csv');
  const retirements = new Map();
  try {
    const { records } = await readCsv(retirementPath, ['id', 'retired_at', 'replaced_by', 'reason']);
    for (const row of records) retirements.set(row.id, { retiredAt: row.retired_at || null, replacedBy: row.replaced_by || null, reason: row.reason || null });
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const current = new Set(items.map((item) => item.id));
  const nextVersion = registry.buildId === buildId ? registry.contentVersion : registry.contentVersion + 1;
  let changed = registry.buildId !== buildId;
  for (const id of current) if (!registry.ids[id]) { registry.ids[id] = { firstSeenVersion: nextVersion }; changed = true; }
  const missing = [];
  for (const [id, entry] of Object.entries(registry.ids)) {
    if (current.has(id)) { if (entry.retired) throw new Error(`${id} is retired in the registry but present in the content; IDs must never be reused`); continue; }
    if (entry.retired) continue;
    const record = retirements.get(id) ?? (ALLOW_REMOVALS ? { retiredAt: new Date().toISOString().slice(0, 10), replacedBy: null, reason: 'removed (--allow-removals)' } : null);
    if (!record) { missing.push(id); continue; }
    if (record.replacedBy && !current.has(record.replacedBy)) throw new Error(`retirement of ${id}: replacement ${record.replacedBy} does not exist`);
    entry.retired = record; entry.retiredInVersion = nextVersion; changed = true;
  }
  if (missing.length) throw new Error(`${missing.length} published ID(s) disappeared without a retirement record (first: ${missing.slice(0, 5).join(', ')}). Add them to data/retirements.csv (id,retired_at,replaced_by,reason) or run with --allow-removals while the content is still pre-release.`);
  registry.contentVersion = nextVersion; registry.buildId = buildId;
  if (changed) await writeFile(path, `${JSON.stringify(registry, null, 1)}\n`);
  return { contentVersion: nextVersion, retiredIds: Object.values(registry.ids).filter((e) => e.retired).length, registeredIds: Object.keys(registry.ids).length };
}

async function main() {
  const imported = [...(await importLevelCSVs()), ...(await importIdioms()), ...(await importVerbPrepositions()), ...(await importManual())];
  let items = collapseImportedDuplicates(imported);
  items = await applyOverrides(items);
  items.sort((left, right) => left.id.localeCompare(right.id));

  // Reconciliation (US-6.1): every source row must end up as exactly one item.
  const produced = {};
  for (const item of items) produced[item.source.file] = (produced[item.source.file] ?? 0) + 1;
  const reconciliation = Object.fromEntries(Object.entries(sourceRows).map(([file, rows]) => [file, { sourceRows: rows, items: produced[file] ?? 0 }]));
  const mismatched = Object.entries(reconciliation).filter(([, r]) => r.sourceRows !== r.items).map(([file]) => file);
  if (mismatched.length) throw new Error(`source rows and built items differ for: ${mismatched.join(', ')}`);

  const buildId = fingerprint(JSON.stringify(items));
  const registry = await updateRegistry(items, buildId);
  const warnings = aggregateWarnings();
  const summary = {
    schemaVersion: 1, contentVersion: registry.contentVersion, buildId, totalItems: items.length,
    byType: countBy(items, (item) => [item.type]),
    byLevel: countBy(items, (item) => item.levels.length ? item.levels : ['unassigned']),
    byPartOfSpeech: countBy(items, (item) => [item.partOfSpeech]),
    byReviewStatus: countBy(items, (item) => [item.reviewStatus]),
    reconciliation, registry: { registeredIds: registry.registeredIds, retiredIds: registry.retiredIds },
    quality: qualityReport(items), warnings,
  };
  await mkdir(generatedDir, { recursive: true });
  try {
    const previous = JSON.parse(await readFile(resolve(generatedDir, 'summary.json'), 'utf8'));
    summary.previousBuild = { contentVersion: previous.contentVersion ?? null, buildId: previous.buildId, totalItems: previous.totalItems, totalItemsDelta: items.length - previous.totalItems };
  } catch { /* no previous summary */ }
  await writeFile(resolve(generatedDir, 'content.json'), `${JSON.stringify({ schemaVersion: 1, contentVersion: registry.contentVersion, buildId, items }, null, 2)}\n`);
  await writeFile(resolve(generatedDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(resolve(generatedDir, 'content.seed.sql'), createSeedSql(items));
  console.log(`Built ${items.length} entries (content version ${registry.contentVersion}): ${Object.entries(summary.byType).map(([type, count]) => `${count} ${type}`).join(', ')}.`);
  console.log(`Warnings: ${JSON.stringify(warnings.counts)}. Quality gaps: ${Object.entries(summary.quality).map(([k, v]) => `${k}=${v.count}`).join(', ')}`);
}

main().catch((error) => { console.error(`Content build failed: ${error.message}`); process.exitCode = 1; });
