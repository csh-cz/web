#!/usr/bin/env node
/**
 * Migruje stávající `<aside class="editor-note">` bloky tak, aby
 * obsahovaly:
 *   - `data-source-file="content/...mdx"` — cesta k souboru pro JS resolve
 *   - `data-note-key="<key>"` — identifikátor typu poznámky (jeden soubor
 *     může mít víc různých EditorNote, JS resolveuje jen tu konkrétní)
 *   - `<button class="editor-note-resolve">` — "✓ Vyřízeno (smazat z MDX)"
 *     na konci .editor-note-body
 *
 * Idempotentní: pokud aside už má data-source-file, přeskočí.
 *
 * Pro znalost note-key migrace dedukuje z aria-label / třídy:
 *   - editor-note-todo + "Hellichova seznamu"  → hellich-stub  (71×)
 *   - editor-note-warn + "legacy PHP"          → manual-edit-false  (233×)
 *
 * Pozn.: 40 hodinařských stubů používá Astro `<EditorNote>` JSX komponentu,
 * ne plain `<aside>` HTML — tento skript je nezasáhne. Sourcefile prop tam
 * řeší create-hodinari-stubs.mjs při generování.
 *
 * Použití:
 *   node scripts/upgrade-editor-notes.mjs        # dry-run
 *   node scripts/upgrade-editor-notes.mjs --apply
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, relative } from 'path';
import { walk } from './_lib.mjs';

const apply = process.argv.includes('--apply');
const root = process.cwd();

const files = walk(join(root, 'content'));

const RESOLVE_BUTTON = `    <button type="button" class="editor-note-resolve" data-action="resolve-editor-note">✓ Vyřízeno (smazat tuto poznámku z MDX)</button>
  </div>
</aside>`;

let upgraded = 0;
let skipped = 0;
let alreadyDone = 0;

for (const f of files) {
  const txt = readFileSync(f, 'utf8');
  // Najdi všechny aside.editor-note bloky v souboru
  const asideRe = /<aside class="editor-note[^"]*"([^>]*)>([\s\S]*?)<\/aside>/g;
  let newTxt = txt;
  let changed = false;
  let m;
  // Iterujeme přes všechny matche (rebuild txt postupně)
  const matches = [...txt.matchAll(asideRe)];
  if (matches.length === 0) continue;

  for (const match of matches) {
    const fullMatch = match[0];
    const attrs = match[1];

    // Skip pokud už je upgradnutý
    if (attrs.includes('data-source-file')) {
      alreadyDone++;
      continue;
    }

    // Detect note-key
    let noteKey = 'unknown';
    if (fullMatch.includes('Hellichova seznamu')) noteKey = 'hellich-stub';
    else if (fullMatch.includes('legacy PHP')) noteKey = 'manual-edit-false';
    else if (fullMatch.includes('Medailon je stub')) noteKey = 'hodinar-stub';

    // Path relative to repo root (POSIX form for GitHub API)
    const sourceFile = relative(root, f).replace(/\\/g, '/');

    // Inject data attrs on opening tag + add resolve button before closing tag
    const newOpenTag = `<aside class="editor-note${fullMatch.match(/editor-note-(todo|warn|info)/) ? ' editor-note-' + fullMatch.match(/editor-note-(todo|warn|info)/)[1] : ''}" data-source-file="${sourceFile}" data-note-key="${noteKey}"${attrs.replace(/class="[^"]*"/, '').trim() ? ' ' + attrs.replace(/class="[^"]*"/, '').trim() : ''}>`;

    // Replace the whole aside: new open tag + body + button + close
    const bodyContent = match[2];
    // Strip closing </div> right before </aside> and inject button
    const updatedBody = bodyContent.replace(/(<\/div>\s*)$/, `\n    ${RESOLVE_BUTTON.split('\n').slice(0, -2).join('\n').trim()}\n  </div>`);

    const newAside = `${newOpenTag}${updatedBody}</aside>`;
    newTxt = newTxt.replace(fullMatch, newAside);
    changed = true;
    upgraded++;
  }

  if (changed) {
    if (apply) writeFileSync(f, newTxt);
    console.log(`${apply ? '✓' : '○'}  ${relative(root, f)}`);
  } else {
    skipped++;
  }
}

console.log('');
console.log(`Upgraded asides: ${upgraded}`);
console.log(`Already had data-source-file: ${alreadyDone}`);
console.log(`No aside (skipped):  ${skipped}`);
console.log('');
if (!apply) console.log('Dry-run. Pro aplikaci spusť s --apply.');
