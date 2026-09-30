#!/usr/bin/env node
// One-time data repair for the level CSVs (a1/a2/b1/b2/c1-all.csv) and overrides.csv.
//
//   node scripts/repair-data.mjs           # repair (originals are backed up to data/_original/)
//   node scripts/repair-data.mjs --dry-run # report only, write nothing
//
// What it does
//  1. Re-aligns rows whose cells are shifted (typed cells such as booleans, gender, dates, URLs
//     are used as anchors) and re-joins text that was split by unquoted commas.
//  2. Normalises enum values (gender, booleans, POS, levels, register, frequency labels, status).
//  3. Re-keys manual/overrides.csv from the old hash IDs to the new stable IDs (w-<csv id>).
//  4. Logs every uncertain decision in data/_repair/ so nothing is changed silently.
// The script is idempotent: running it again on repaired files changes nothing.

import { copyFile, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = resolve(root, 'data');
const DRY = process.argv.includes('--dry-run');

export const COLS = ['id', 'type', 'term', 'sense', 'translation', 'example_de', 'example_en', 'levels', 'part_of_speech', 'native_frequency_rating', 'native_frequency_label', 'native_frequency_notes', 'rated_by', 'rated_at', 'corpus_rank', 'register', 'regional_labels', 'contexts', 'tags', 'gender', 'plural', 'genitive_singular', 'is_reflexive', 'is_separable', 'auxiliary', 'present_er_sie_es', 'praeteritum', 'partizip_ii', 'valency', 'collocations', 'synonyms', 'antonyms', 'false_friends', 'source_name', 'source_url', 'review_status'];
const N = COLS.length;
const C = Object.fromEntries(COLS.map((name, i) => [name, i]));
const FILES = ['a1-all', 'a2-all', 'b1-all', 'b2-all', 'c1-all'];

// ---------- CSV ----------
function parseCsv(text) {
  const rows = []; let row = []; let field = ''; let quoted = false; let closed = false;
  const s = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < s.length; i += 1) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"' && s[i + 1] === '"') { field += '"'; i += 1; } else if (ch === '"') { quoted = false; closed = true; } else field += ch;
      continue;
    }
    if (ch === '"' && !field && !closed) quoted = true;
    else if (ch === ',') { row.push(field); field = ''; closed = false; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i += 1;
      row.push(field); if (row.some((v) => v.trim())) rows.push(row);
      row = []; field = ''; closed = false;
    } else { field += ch; closed = false; }
  }
  if (field || row.length) { row.push(field); if (row.some((v) => v.trim())) rows.push(row); }
  return rows;
}
const esc = (v) => (/[",\n\r]/.test(v) || /^\s|\s$/.test(v) ? `"${String(v).replaceAll('"', '""')}"` : String(v));
const toCsv = (rows) => `${rows.map((r) => r.map(esc).join(',')).join('\n')}\n`;

// ---------- cell classification ----------
const LEVEL = /^(A1|A2|B1|B2|C1|C2)([-;|/](A1|A2|B1|B2|C1|C2))*$/;
const GENDERS = new Set(['der', 'die', 'das', 'm', 'f', 'n', 'masculine', 'feminine', 'neuter', 'der/die', 'm/f', 'masculine/neuter', 'plural only', 'plural']);
const REGISTERS = new Set(['standard', 'neutral', 'formal', 'informal', 'slang', 'regional', 'technical', 'literary', 'colloquial', 'academic', 'business', 'medical', 'legal', 'unknown']);
const FREQ = new Set(['essential', 'very_common', 'common', 'occasional', 'rare', 'very high', 'very_high', 'high', 'medium', 'medium-low', 'low', 'less_common']);
const STATUS = new Set(['draft', 'ai_draft', 'needs_review', 'reviewed', 'verified', 'unreviewed']);
const RATERS = new Set(['ai_estimate', 'ai estimate', 'native-speaker rating', 'curator', 'lexicographer', 'user']);
// Text that looks like a valency pattern ("+ Dativ", "auf + Akk", "etwas ändern", "intransitive"...)
const VALENCY = /(\+|:)\s*(akk|dat|gen|nom)|\b(jmd|jmdn|jmdm|jemand|jemanden|jemandem|etw|etwas|sich)\b|^(intransitive|transitive|none|reflexive)$/i;
const SOURCE = /^(Goethe-Zertifikat|German B\d Vocabulary Dataset|user-provided dataset|Manual entry)/i;

function kind(raw) {
  const v = raw.trim(); const l = v.toLowerCase();
  if (!v) return 'empty';
  if (/^(true|false|optional)$/i.test(v)) return 'bool';
  if (LEVEL.test(v)) return 'level';
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'date';
  if (/^https?:\/\//.test(v)) return 'url';
  if (/^\d+$/.test(v)) return 'int';
  if (STATUS.has(l)) return 'status';
  if (SOURCE.test(v)) return 'source';
  if (/^(haben|sein|haben\/sein|sein\/haben)$/.test(l)) return 'aux';
  if (GENDERS.has(l)) return 'gender';
  if (/^(acc|dat|gen|nom|akk)$/.test(l)) return 'case';
  if (RATERS.has(l)) return 'rater';
  if (FREQ.has(l)) return 'freq';
  if (REGISTERS.has(l)) return 'register';
  if (VALENCY.test(v)) return 'valency';
  return v.includes(';') ? 'list' : 'text';
}
const TEXTY = ['text', 'list', 'valency'];
const ALLOWED = [
  ['int'], TEXTY, 'all', 'all', 'all', 'all', 'all', ['level'], ['text'], ['int'], ['freq'], TEXTY, ['rater'], ['date'], ['int'], ['register'],
  TEXTY, TEXTY, TEXTY, ['gender'], TEXTY, TEXTY, ['bool'], ['bool'], ['aux'], TEXTY, TEXTY, TEXTY, ['case', 'valency'], TEXTY, TEXTY, TEXTY, TEXTY,
  ['source', ...TEXTY], ['url'], ['status'],
];
const PIN = { bool: [22, 23], gender: [19], aux: [24], case: [28], date: [13], url: [34], status: [35], level: [7], rater: [12], freq: [10], register: [15], source: [33], int: [9, 14] };

// Row context used to decide which columns can hold a value: nouns carry gender/plural/genitive,
// verbs (or rows with an auxiliary cell) carry verb forms, nothing else carries either.
function rowContext(fields) {
  const at = fields.findIndex((v, i) => i >= 6 && LEVEL.test(v.trim()));
  const pos = (at >= 0 ? fields[at + 1] ?? '' : '').trim().toLowerCase();
  const ks = fields.map(kind);
  return {
    noun: /^(noun|nomen)$/.test(pos) || ks.includes('gender'),
    verb: /^(verb|verben)$/.test(pos) || ks.includes('aux'),
  };
}
function fits(k, col, v, ctx = { noun: true, verb: true }, strict = true) {
  if (k === 'empty') return true;
  if (col === 28 && !strict && (k === 'text' || k === 'list')) return true;
  if (col >= 19 && col <= 21 && !ctx.noun) return false;
  if (col >= 25 && col <= 27 && !ctx.verb) return false;  const a = ALLOWED[col];
  if (a !== 'all' && !a.includes(k)) return false;
  if (col === 9) return /^[1-5]$/.test(v.trim());
  if (col === 0) return /^\d+$/.test(v.trim());
  if (col === 8 && ((k !== 'text' && k !== 'valency') || v.trim().length > 25)) return false;
  return true;
}
const rowIsValid = (fields) => { const g = rowContext(fields); return fields.length === N && fields.every((v, c) => fits(kind(v), c, v, g, false)); };

// Re-join text that was split by unquoted commas (continuation cells start with a space).
function mergeFragments(fields) {
  const out = [];
  fields.forEach((v, i) => { if (i > 2 && /^\s/.test(v) && v.trim() && out.length) out[out.length - 1] += `,${v}`; else out.push(v); });
  return out;
}

// Monotone alignment of the row's cells to the 36 canonical columns.
// Operations: map a cell to a column, skip a column (cell was missing), drop a cell,
// or join a cell to the previous text cell (text that was split by an unquoted comma).
// Expected canonical column of every cell, derived from the nearest typed cells before/after it
// (a shift is constant between two anchors unless empty cells were dropped in between).
const PIN_COL = { level: 7, freq: 10, rater: 12, date: 13, register: 15, gender: 19, aux: 24, case: 28, source: 33, url: 34, status: 35 };
function expectedCols(fields, kinds) {
  const typed = []; let prevBool = false;
  kinds.forEach((k, j) => {
    if (k === 'bool') { typed.push([j, prevBool ? 23 : 22]); prevBool = true; return; }
    prevBool = false;
    if (k === 'int') { if (/^[1-5]$/.test(fields[j].trim()) && j >= 8 && j <= 10) typed.push([j, 9]); else if (j >= 9 && j <= 16) typed.push([j, 14]); }
    else if (PIN_COL[k] !== undefined) typed.push([j, PIN_COL[k]]);
  });
  return kinds.map((_, j) => {
    let prev = null; let next = null;
    for (const t of typed) { if (t[0] < j) prev = t; else if (t[0] > j && !next) next = t; }
    // cells right behind the auxiliary are the three verb forms; right behind the gender the plural/genitive
    if (prev && ((prev[1] === 24 && j - prev[0] <= 3) || (prev[1] === 19 && j - prev[0] <= 2))) return { options: [prev[1] + (j - prev[0])], weight: 0.8 };
    const options = [prev ? prev[1] + (j - prev[0]) : j];
    if (next) options.push(next[1] - (next[0] - j));
    return { options, weight: 0.15 };
  });
}

const JOINABLE = new Set([2, 3, 4, 5, 6, 11, 16, 17, 18, 20, 21, 28, 29, 30, 31, 32]);
function align(fields) {
  const m = fields.length; const NEG = -1e9;
  const kinds = fields.map(kind); const grp = rowContext(fields); const expect = expectedCols(fields, kinds);
  const dp = Array.from({ length: m + 1 }, () => new Array(N + 1).fill(NEG)); const bt = Array.from({ length: m + 1 }, () => new Array(N + 1).fill(null));
  dp[0][0] = 0;
  for (let j = 0; j <= m; j += 1) {
    for (let c = 0; c <= N; c += 1) {
      const cur = dp[j][c]; if (cur <= NEG / 2) continue;
      if (c < N) { const s = cur - 0.02; if (s > dp[j][c + 1]) { dp[j][c + 1] = s; bt[j][c + 1] = 'skip'; } }
      if (j < m) { const s = cur - (kinds[j] === 'empty' ? 0.05 : 8); if (s > dp[j + 1][c]) { dp[j + 1][c] = s; bt[j + 1][c] = 'drop'; } }
      if (j < m && c > 0 && ['map', 'join'].includes(bt[j][c]) && JOINABLE.has(c - 1) && ['text', 'list', 'int', 'valency'].includes(kinds[j])) {
        const s = cur - 0.6 - 0.02 * (N - c); if (s > dp[j + 1][c]) { dp[j + 1][c] = s; bt[j + 1][c] = 'join'; }
      }
      if (j < m && c < N && fits(kinds[j], c, fields[j], grp)) {
        let s = cur - expect[j].weight * Math.min(...expect[j].options.map((e) => Math.abs(c - e)));
        if (kinds[j] !== 'empty' && PIN[kinds[j]]?.includes(c)) s += 3;
        if (c === 33 && kinds[j] === 'text') s -= 0.5;
        if (kinds[j] === 'source' && c !== 33) s -= 3;
        if (s > dp[j + 1][c + 1]) { dp[j + 1][c + 1] = s; bt[j + 1][c + 1] = 'map'; }
      }
    }
  }
  const out = new Array(N).fill(''); const pending = {}; const dropped = []; let moved = 0; let j = m; let c = N;
  while (j > 0 || c > 0) {
    const step = bt[j][c];
    if (step === 'map') {
      const parts = [fields[j - 1], ...(pending[c - 1] ?? [])];
      out[c - 1] = parts.reduce((acc, p, i) => (i === 0 ? p.trim() : `${acc}${c - 1 <= 6 || /^\s/.test(p) ? ', ' : ';'}${p.trim()}`), '');
      if (kinds[j - 1] !== 'empty' && c - 1 !== j - 1) moved += 1; j -= 1; c -= 1;
    } else if (step === 'join') { (pending[c - 1] ??= []).unshift(fields[j - 1]); j -= 1; }
    else if (step === 'skip') c -= 1;
    else if (step === 'drop') { if (kinds[j - 1] !== 'empty') dropped.push(fields[j - 1].trim()); j -= 1; }
    else break;
  }
  return { out, dropped: dropped.reverse(), moved };
}

// ---------- normalisation ----------
const POS_MAP = {
  nomen: 'noun', noun: 'noun', verb: 'verb', verben: 'verb', adjektiv: 'adjective', adjective: 'adjective', adverb: 'adverb', pronomen: 'pronoun',
  praeposition: 'preposition', 'präposition': 'preposition', konjunktion: 'conjunction', interjektion: 'interjection', numerale: 'numeral', artikel: 'article',
  redewendung: 'idiom', idiom: 'idiom',
};
const POS_OK = new Set(['verb', 'noun', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'connector', 'determiner', 'interjection', 'phrase', 'idiom', 'other', 'unknown', 'article', 'indefinite_pronoun', 'participle', 'affix', 'numeral', 'particle', 'prefix', 'suffix', 'abbreviation']);
const bool = (v) => { const l = v.trim().toLowerCase(); return ['true', 'yes', '1'].includes(l) ? 'true' : ['false', 'no', '0', 'optional'].includes(l) ? 'false' : ''; };
const pipe = (v) => v.split(/[;|]/).map((x) => x.trim()).filter(Boolean).join('|');

function normalise(row) {
  const r = [...row]; const tags = new Set(r[C.tags].split(/[;|]/).map((t) => t.trim()).filter(Boolean));
  let type = r[C.type].toLowerCase(); let pos = r[C.part_of_speech].trim();
  // POS values that ended up in the "type" column
  if (type === 'word' || !type) type = 'vocabulary';
  else if (['verb', 'noun', 'adjective', 'adverb', 'pronoun', 'conjunction', 'preposition'].includes(type)) { if (!pos) pos = type; type = 'vocabulary'; }
  r[C.type] = type;
  // part of speech
  const key = pos.toLowerCase().replace(/[_\s]+/g, ' ');
  if (/(phrase|redewendung)$/.test(key) && key !== 'redewendung') { const kindOfPhrase = key.replace(/ ?phrase$/, '').trim(); if (kindOfPhrase) tags.add(`${kindOfPhrase}_phrase`); pos = 'phrase'; }
  else pos = POS_MAP[key] ?? (POS_OK.has(key) ? key : '');
  r[C.part_of_speech] = pos;
  // levels
  r[C.levels] = LEVEL.test(r[C.levels]) ? r[C.levels].split(/[-;|/]/).join('|') : '';
  // frequency: label is derived from the 1-5 rating (scale in data/README.md)
  const byLabel = { 'very high': 5, very_high: 5, essential: 5, high: 4, very_common: 4, medium: 3, common: 3, 'medium-low': 2, less_common: 2, occasional: 2, low: 1, rare: 1 };
  let rating = /^[1-5]$/.test(r[C.native_frequency_rating]) ? Number(r[C.native_frequency_rating]) : null;
  const lab = r[C.native_frequency_label].toLowerCase();
  if (/^[1-5]$/.test(lab) && rating === null) rating = Number(lab);
  if (rating === null && byLabel[lab]) rating = byLabel[lab];
  r[C.native_frequency_rating] = rating ? String(rating) : '';
  r[C.native_frequency_label] = rating ? ['', 'rare', 'occasional', 'common', 'very_common', 'essential'][rating] : '';
  // register
  const reg = r[C.register].toLowerCase();
  r[C.register] = ({ standard: 'neutral', colloquial: 'informal', academic: 'formal', business: 'formal', medical: 'technical', legal: 'technical' })[reg] ?? (REGISTERS.has(reg) ? reg : '');
  for (const f of ['contexts', 'regional_labels']) r[C[f]] = pipe(r[C[f]]);
  for (const f of ['collocations', 'synonyms', 'antonyms', 'false_friends']) r[C[f]] = pipe(r[C[f]]);
  // gender
  const g = r[C.gender].toLowerCase();
  const G = { der: 'der', masculine: 'der', m: 'der', die: 'die', feminine: 'die', f: 'die', das: 'das', neuter: 'das', n: 'das' };
  if (G[g]) r[C.gender] = G[g];
  else { if (g) tags.add(`gender:${g.replaceAll(' ', '_')}`); r[C.gender] = ''; }
  // booleans / auxiliary
  if (r[C.is_reflexive].trim().toLowerCase() === 'optional') tags.add('reflexive_optional');
  r[C.is_reflexive] = bool(r[C.is_reflexive]); r[C.is_separable] = bool(r[C.is_separable]);
  const aux = r[C.auxiliary].toLowerCase();
  if (aux.includes('/')) tags.add(`auxiliary:${aux}`);
  r[C.auxiliary] = aux.startsWith('sein') ? 'sein' : aux.startsWith('haben') ? 'haben' : '';
  r[C.tags] = [...tags].join('|');
  r[C.review_status] = r[C.review_status].toLowerCase() === 'ai_draft' ? 'draft' : r[C.review_status].toLowerCase();
  return r;
}

// ---------- main ----------
const exists = (p) => access(p).then(() => true, () => false);
const logRows = [['file', 'line', 'id', 'term', 'method', 'cells', 'moved_cells', 'dropped_values']];
const stats = {};
const backupDir = resolve(dataDir, '_original');
const repairDir = resolve(dataDir, '_repair');

async function backup(path) {
  const target = resolve(backupDir, path.split(/[\\/]/).pop());
  if (DRY || await exists(target)) return;
  await mkdir(backupDir, { recursive: true }); await copyFile(path, target);
}

const idOf = (r) => `w-${r[C.id]}`;
const allRows = [];

for (const name of FILES) {
  const path = resolve(dataDir, `${name}.csv`);
  const rows = parseCsv(await readFile(path, 'utf8'));
  const header = rows[0].map((h) => h.trim());
  if (header.join() !== COLS.join()) throw new Error(`${name}.csv: unexpected header (already migrated to a different layout?)`);
  const out = [COLS]; const st = { rows: rows.length - 1, clean: 0, realigned: 0, lowConfidence: 0 };
  for (const [i, raw] of rows.slice(1).entries()) {
    let fields = raw; let method = 'clean'; let dropped = []; let moved = 0;
    if (!rowIsValid(raw)) {
      fields = mergeFragments(raw);
      const a = align(fields); fields = a.out; dropped = a.dropped; moved = a.moved; method = 'realigned';
    }
    let row = normalise(fields.length === N ? fields : fields.concat(new Array(N - fields.length).fill('')));
    if (method === 'clean') st.clean += 1; else st.realigned += 1;
    if (dropped.length) { st.lowConfidence += 1; if (!['reviewed', 'verified'].includes(row[C.review_status]) || true) row[C.review_status] = 'needs_review'; }
    if (method !== 'clean') logRows.push([`${name}.csv`, String(i + 2), idOf(row), row[C.term], dropped.length ? 'realigned-low' : 'realigned', String(raw.length), String(moved), dropped.join(' | ')]);
    out.push(row); allRows.push({ name, row });
  }
  stats[name] = st;
  if (!DRY) { await backup(path); await writeFile(path, toCsv(out)); }
}

// ---------- overrides: old hash IDs -> new stable IDs ----------
const slug = (v) => v.trim().toLocaleLowerCase('de-DE').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 42) || 'entry';
const ovPath = resolve(dataDir, 'manual', 'overrides.csv');
const ovRows = parseCsv(await readFile(ovPath, 'utf8'));
const legacy = ovRows[0][0].trim() === 'id' && ovRows.slice(1).some((r) => /^vocab-(b2|c1)-/.test(r[0]));
const summary = { total: 0, applied: 0, redundant: 0, ambiguous: [], unmatched: [] };
if (legacy) {
  const oh = ovRows[0].map((h) => h.trim()); const bySlug = new Map();
  for (const { name, row } of allRows) if (name === 'b2-all' || name === 'c1-all') {
    const k = `${name === 'b2-all' ? 'b2' : 'c1'}:${slug(row[C.term])}`; bySlug.set(k, [...(bySlug.get(k) ?? []), row]);
  }
  const kept = [COLS];
  for (const raw of ovRows.slice(1)) {
    summary.total += 1; const o = Object.fromEntries(oh.map((h, i) => [h, (raw[i] ?? '').trim()]));
    const m = o.id.match(/^vocab-(b2|c1)-(.*)-[0-9a-f]{10}$/); const cands = m ? (bySlug.get(`${m[1]}:${m[2]}`) ?? []) : [];
    if (cands.length !== 1) { (cands.length ? summary.ambiguous : summary.unmatched).push(o.id); continue; }
    const target = cands[0]; const next = new Array(N).fill(''); next[C.id] = idOf(target); let useful = false;
    for (const f of ['part_of_speech', 'native_frequency_rating']) if (o[f] && !target[C[f]]) { next[C[f]] = o[f]; useful = true; }
    if (useful) { kept.push(next); summary.applied += 1; } else summary.redundant += 1;
  }
  if (!DRY) {
    await backup(ovPath);
    await writeFile(ovPath, toCsv(kept));
    await mkdir(repairDir, { recursive: true });
    await writeFile(resolve(repairDir, 'overrides-unresolved.csv'), toCsv([['old_id', 'reason'], ...summary.ambiguous.map((id) => [id, 'several rows share this term']), ...summary.unmatched.map((id) => [id, 'no row with this term'])]));
  }
}

if (!DRY) {
  if (logRows.length > 1) { await mkdir(repairDir, { recursive: true }); await writeFile(resolve(repairDir, 'repair-log.csv'), toCsv(logRows)); }
}
console.log(DRY ? '[dry run] nothing written' : 'Repair complete. Originals: data/_original/, log: data/_repair/');
console.table(stats);
if (legacy) console.log(`overrides: ${summary.total} old rows -> ${summary.applied} still useful, ${summary.redundant} already covered by the repaired CSVs, ${summary.ambiguous.length} ambiguous, ${summary.unmatched.length} unmatched`);
