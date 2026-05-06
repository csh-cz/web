#!/usr/bin/env node
/**
 * Migrace editorských poznámek z body MDX do frontmatter pole `editorNotes[]`.
 *
 * Před:
 *   ---
 *   title: ...
 *   ---
 *   <aside class="editor-note editor-note-todo" data-source-file="..."
 *          data-note-key="hellich-stub" data-editor-only role="note"
 *          aria-label="Stub z Hellichova seznamu">
 *     <header>...</header>
 *     <div class="editor-note-body">
 *       <p>Tato karta byla vytvořena bulk importem...</p>
 *       <button class="editor-note-resolve">...</button>
 *     </div>
 *   </aside>
 *
 *   <body content...>
 *
 * Po:
 *   ---
 *   title: ...
 *   editorNotes:
 *     - level: todo
 *       title: 'Stub z Hellichova seznamu (1917)'
 *       text: 'Tato karta byla vytvořena bulk importem...'
 *       noteKey: 'hellich-stub'
 *   ---
 *
 *   <body content...>
 *
 * Idempotentní: pokud aside už migrováno, je v body.
 *
 * Použití:
 *   node scripts/move-editor-notes-to-frontmatter.mjs        # dry-run
 *   node scripts/move-editor-notes-to-frontmatter.mjs --apply
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { walk } from './_lib.mjs';

const apply = process.argv.includes('--apply');
const root = process.cwd();
const files = walk(join(root, 'content'));

const stats = { scanned: 0, migrated: 0, asidesMovedTotal: 0, skipped: 0 };

function escapeYaml(s) {
  // YAML safe quoting — preferuj single-quote, escape vnitřních '' (YAML způsob)
  if (s.includes('\n')) {
    // Multi-line block scalar |
    const indented = s.split('\n').map((l) => `    ${l}`).join('\n');
    return `|\n${indented}`;
  }
  if (/[:#&*!|>'"%@`{}\[\]]/.test(s) || /^[?!\-]/.test(s)) {
    return `'${s.replace(/'/g, "''")}'`;
  }
  return s;
}

for (const f of files) {
  stats.scanned++;
  const txt = readFileSync(f, 'utf8');
  // Match all <aside class="editor-note ..."> blocks v body
  const asideRegex = /<aside class="editor-note(?:[^"]*)"[^>]*>[\s\S]*?<\/aside>\s*\n*/g;
  const asides = [...txt.matchAll(asideRegex)];
  if (asides.length === 0) { stats.skipped++; continue; }

  const notes = [];
  for (const m of asides) {
    const block = m[0];
    // Level z classy editor-note-{level}
    const levelMatch = block.match(/editor-note-(info|warn|todo)/);
    const level = levelMatch ? levelMatch[1] : 'info';
    // Title z .editor-note-title text
    const titleMatch = block.match(/<span class="editor-note-title">([\s\S]*?)<\/span>/);
    const title = titleMatch ? titleMatch[1].trim() : '';
    // Body text — extract from .editor-note-body, strip <p> wrappers + <button>
    const bodyMatch = block.match(/<div class="editor-note-body">([\s\S]*?)<\/div>/);
    let bodyHtml = bodyMatch ? bodyMatch[1] : '';
    // Strip resolve button
    bodyHtml = bodyHtml.replace(/<button class="editor-note-resolve"[^>]*>[\s\S]*?<\/button>/g, '');
    // Strip <p> wrappers (multi-paragraph → single line for YAML brevity)
    let text = bodyHtml
      .replace(/<\/p>\s*<p[^>]*>/g, ' ')   // <p>...</p><p>...</p> → ... ...
      .replace(/<\/?p[^>]*>/g, '')         // strip remaining <p>
      .replace(/<\/?strong>/g, '**')
      .replace(/<\/?em>/g, '*')
      .replace(/<code>/g, '`').replace(/<\/code>/g, '`')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();

    const noteKeyMatch = block.match(/data-note-key="([^"]+)"/);
    const noteKey = noteKeyMatch ? noteKeyMatch[1] : null;

    notes.push({ level, title, text, noteKey });
  }

  // Strip aside blocks z body
  let newTxt = txt.replace(asideRegex, '');

  // Inject editorNotes do frontmatter před closing ---
  const fmMatch = newTxt.match(/^---\n([\s\S]*?)\n---\n/);
  if (!fmMatch) continue;
  const fmEnd = fmMatch.index + fmMatch[0].length;
  const fm = fmMatch[1];

  // Pokud již existuje editorNotes, neduplikuj — append by byl spam
  if (/^editorNotes:/m.test(fm)) {
    console.log(`  ⚠ ${f.replace(root + '/', '')}: editorNotes already exists, merging both old + body asides`);
    // For safety, just skip this file — manual review
    stats.skipped++;
    continue;
  }

  // Build YAML
  let yamlNotes = 'editorNotes:\n';
  for (const n of notes) {
    yamlNotes += `  - level: ${n.level}\n`;
    if (n.title) yamlNotes += `    title: ${escapeYaml(n.title)}\n`;
    yamlNotes += `    text: ${escapeYaml(n.text)}\n`;
    if (n.noteKey) yamlNotes += `    noteKey: ${escapeYaml(n.noteKey)}\n`;
  }

  // Insert before closing ---
  const newFm = fm + '\n' + yamlNotes.trimEnd();
  newTxt = `---\n${newFm}\n---\n` + newTxt.slice(fmEnd);

  // Cleanup excessive blank lines at body start
  newTxt = newTxt.replace(/^---\n([\s\S]*?\n---\n)\n{2,}/, '---\n$1\n');

  console.log(`${apply ? '✓' : '○'} ${f.replace(root + '/', '')}  +${notes.length} notes`);
  if (apply) writeFileSync(f, newTxt);
  stats.migrated++;
  stats.asidesMovedTotal += notes.length;
}

console.log('');
console.log(`Scanned:  ${stats.scanned}`);
console.log(`Migrated: ${stats.migrated} files`);
console.log(`Notes moved: ${stats.asidesMovedTotal}`);
console.log(`Skipped (no aside / has frontmatter): ${stats.skipped}`);

if (!apply) console.log('\nDry-run. Spusť s --apply.');
