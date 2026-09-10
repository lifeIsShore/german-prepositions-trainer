import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const parseCsvLine = (line) => {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
};

const columns = ['type', 'register', 'review_status', 'verb_position_effect', 'connector_function', 'levels'];
const sets = Object.fromEntries(columns.map(c => [c, new Set()]));

for (const file of ['data/a1-all.csv', 'data/a2-all.csv', 'data/b1-all.csv', 'data/manual/entries.csv', 'data/manual/overrides.csv']) {
  try {
    const text = await readFile(resolve(file), 'utf8');
    const lines = text.split(/\r?\n/).filter((l) => l.trim());
    if (lines.length <= 1) continue;
    const header = parseCsvLine(lines[0]);

    for (const col of columns) {
      const idx = header.indexOf(col);
      if (idx === -1) continue;
      for (let i = 1; i < lines.length; i++) {
        const fields = parseCsvLine(lines[i]);
        const val = fields[idx]?.trim();
        if (val) sets[col].add(val);
      }
    }
  } catch (e) {
    console.error(file, e.message);
  }
}

for (const [col, values] of Object.entries(sets)) {
  console.log(`=== Column: ${col} ===`);
  console.log(Array.from(values).sort());
}
