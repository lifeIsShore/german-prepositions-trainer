#!/usr/bin/env node

// Finds stable IDs for the metadata override file.
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const query = process.argv.slice(2).join(' ').trim().toLocaleLowerCase('de-DE');
if (!query) {
  console.error('Usage: node scripts/find-content.mjs <word or phrase>');
  process.exit(1);
}

const catalogue = JSON.parse(await readFile(resolve(root, 'data', 'generated', 'content.json'), 'utf8'));
const matches = catalogue.items.filter((item) => [item.term, item.translation, item.sense].filter(Boolean).some((value) => value.toLocaleLowerCase('de-DE').includes(query)));
for (const item of matches) console.log(`${item.id}\t${item.term}\t${item.translation ?? ''}\t${item.source.file}:${item.source.row}`);
console.log(`${matches.length} match${matches.length === 1 ? '' : 'es'}`);
