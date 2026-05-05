#!/usr/bin/env node
/**
 * Hromadně vloží `<aside class="editor-note">` do souborů které
 * spadají do předem definovaných kategorií. Idempotentní — pokud
 * soubor už `class="editor-note"` má, přeskočí.
 *
 * Plain HTML místo Astro komponenty (funguje v .md i .mdx bez importu).
 * CSS visibility řeší global.css `.editor-note { display:none }` +
 * `body[data-editor-mode] .editor-note { display:block }`.
 *
 * Kategorie (priorita):
 *   1. Hellich bulk-import stubs (slug startuje hellich-, body < 100 znaků)
 *      → level="todo"  "Stub z Hellichova seznamu (1917)"
 *   2. manualEdit: false (auto-scrape ze starých PHP stránek)
 *      → level="warn"  "Auto-import z legacy PHP, vyžaduje review"
 *
 * Použití:
 *   node scripts/add-editor-notes.mjs        # dry-run
 *   node scripts/add-editor-notes.mjs --apply
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'fs';
import { join } from 'path';

const apply = process.argv.includes('--apply');
const root = process.cwd();

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.md') || p.endsWith('.mdx')) out.push(p);
  }
  return out;
}

const files = walk(join(root, 'content'));

function splitFrontmatter(txt) {
  const m = txt.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  return { fm: m[1], body: m[2] };
}

const NOTE_HELLICH = `<aside class="editor-note editor-note-todo" data-editor-only role="note" aria-label="Stub z Hellichova seznamu">
  <header class="editor-note-head">
    <span class="editor-note-icon" aria-hidden="true">☐</span>
    <span class="editor-note-title">Stub z Hellichova seznamu (1917)</span>
    <span class="editor-note-meta" aria-hidden="true">viditelné jen přihlášenému editorovi</span>
  </header>
  <div class="editor-note-body">
    <p>Tato karta byla vytvořena bulk importem ze seznamu Janatovy produkce, který sestavil <strong>Jan Hellich (1917)</strong> podle poznámek Václava Cepka. Konkrétní budova, rok výroby a dnešní stav stroje <strong>vyžadují dohledání</strong> v místních pramenech (kroniky obcí, regionální muzea, weby měst).</p>
  </div>
</aside>
`;

const NOTE_MANUAL_FALSE = `<aside class="editor-note editor-note-warn" data-editor-only role="note" aria-label="Auto-import z legacy PHP">
  <header class="editor-note-head">
    <span class="editor-note-icon" aria-hidden="true">⚠</span>
    <span class="editor-note-title">Auto-import z legacy PHP webu</span>
    <span class="editor-note-meta" aria-hidden="true">viditelné jen přihlášenému editorovi</span>
  </header>
  <div class="editor-note-body">
    <p>Tato karta byla automaticky importována ze starých PHP stránek ČSH (frontmatter <code>manualEdit: false</code>). Obsah a metadata <strong>nebyly manuálně zkontrolovány</strong> — mohou obsahovat HTML/PHP artefakty, špatně zlomené citace, neúplné údaje. Po manuální revizi nastav <code>manualEdit: true</code>, aby tato hláška zmizela.</p>
  </div>
</aside>
`;

const stats = { hellich: 0, manualFalse: 0, skipped: 0, alreadyHave: 0 };

for (const f of files) {
  const txt = readFileSync(f, 'utf8');
  const split = splitFrontmatter(txt);
  if (!split) continue;
  const { fm, body } = split;

  // Idempotentní guard — pokud editor-note už je, neměníme
  if (body.includes('class="editor-note') || body.includes('<EditorNote')) {
    stats.alreadyHave++;
    continue;
  }

  const isHellich = /\/hellich-[^/]+\.mdx?$/.test(f) && body.trim().length < 100;
  const isManualFalse = /^manualEdit:\s*false\s*$/m.test(fm);

  let note = null;
  let label = null;
  if (isHellich) {
    note = NOTE_HELLICH;
    label = 'hellich';
    stats.hellich++;
  } else if (isManualFalse) {
    note = NOTE_MANUAL_FALSE;
    label = 'manualFalse';
    stats.manualFalse++;
  } else {
    stats.skipped++;
    continue;
  }

  // Vlož note hned po frontmatter (před body content)
  const newTxt = `---\n${fm}\n---\n\n${note}${body.startsWith('\n') ? '' : '\n'}${body}`;

  console.log(`${apply ? '✓' : '○'} [${label}]  ${f.replace(root + '/', '')}`);
  if (apply) writeFileSync(f, newTxt);
}

console.log('');
console.log(`Hellich bulk stubs:   ${stats.hellich}`);
console.log(`manualEdit:false:     ${stats.manualFalse}`);
console.log(`Already have note:    ${stats.alreadyHave}`);
console.log(`No signal (skipped):  ${stats.skipped}`);
console.log('');
if (!apply) console.log('Dry-run. Pro aplikaci spusť s --apply.');
