#!/usr/bin/env node
/**
 * Migrace `<EditorNote>` Astro JSX tagů z 40 hodinařských stubů do
 * frontmatter pole `editorNotes[]`. Po migraci smaže import statement
 * a JSX tag. Soubor zůstává jako .mdx (může mít jiný JSX obsah později).
 *
 * Idempotentní — pokud už není import EditorNote, skip.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { walk } from './_lib.mjs';

const apply = process.argv.includes('--apply');
const root = process.cwd();
const dir = join(root, 'content/hodinari');
const files = walk(dir);

const stats = { scanned: 0, migrated: 0, skipped: 0 };

function escapeYaml(s) {
  if (s.includes('\n')) {
    return `|\n    ${s.split('\n').map((l) => l.trim()).filter(Boolean).join('\n    ')}`;
  }
  if (/[:#&*!|>'"%@`{}\[\]]/.test(s) || /^[?!\-]/.test(s)) {
    return `'${s.replace(/'/g, "''")}'`;
  }
  return s;
}

for (const f of files) {
  stats.scanned++;
  const txt = readFileSync(f, 'utf8');
  if (!txt.includes('<EditorNote')) { stats.skipped++; continue; }

  // Match the import + JSX tag (multiline)
  const importMatch = txt.match(/import EditorNote from [^\n]+\n+/);
  const jsxMatch = txt.match(/<EditorNote\s+([^>]*)>([\s\S]*?)<\/EditorNote>\s*\n*/);
  if (!jsxMatch) { stats.skipped++; continue; }

  // Extract props
  const propsStr = jsxMatch[1];
  const levelMatch = propsStr.match(/level="(\w+)"/);
  const titleMatch = propsStr.match(/title="([^"]+)"/);
  const sourceFileMatch = propsStr.match(/sourceFile="([^"]+)"/);

  const level = levelMatch ? levelMatch[1] : 'info';
  const title = titleMatch ? titleMatch[1] : '';

  // Body — MDX inline markdown text (preserve **bold**, _italic_)
  let text = jsxMatch[2]
    .replace(/\s+/g, ' ')
    .trim();

  // Pro hodinari medailony chceme noteKey 'hodinar-stub'
  const noteKey = 'hodinar-stub';

  // Remove import statement (if there's only one EditorNote import)
  let newTxt = txt;
  if (importMatch) newTxt = newTxt.replace(importMatch[0], '');
  // Remove JSX tag
  newTxt = newTxt.replace(jsxMatch[0], '');
  // Cleanup blank lines after frontmatter
  newTxt = newTxt.replace(/^---\n([\s\S]*?\n---\n)\n+/, '---\n$1\n');

  // Inject editorNotes do frontmatter
  const fmMatch = newTxt.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fmMatch) { stats.skipped++; continue; }
  const fm = fmMatch[1];
  if (/^editorNotes:/m.test(fm)) {
    console.log(`  ⚠ ${f.replace(root + '/', '')}: editorNotes already exists, skipping`);
    stats.skipped++;
    continue;
  }

  let yaml = 'editorNotes:\n';
  yaml += `  - level: ${level}\n`;
  if (title) yaml += `    title: ${escapeYaml(title)}\n`;
  yaml += `    text: ${escapeYaml(text)}\n`;
  yaml += `    noteKey: ${escapeYaml(noteKey)}\n`;

  const newFm = fm + '\n' + yaml.trimEnd();
  newTxt = `---\n${newFm}\n---\n` + newTxt.slice(fmMatch.index + fmMatch[0].length);

  console.log(`${apply ? '✓' : '○'} ${f.replace(root + '/', '')}`);
  if (apply) writeFileSync(f, newTxt);
  stats.migrated++;
}

console.log('');
console.log(`Scanned: ${stats.scanned}`);
console.log(`Migrated: ${stats.migrated}`);
console.log(`Skipped: ${stats.skipped}`);
if (!apply) console.log('\nDry-run. Spusť s --apply.');
