#!/usr/bin/env node
/**
 * Pro každý no-match ref z `tmp/zotero-export/no-match-classified.json`
 * vytvoří Zotero item přes MCP `write_item` (Zotero local API běží na
 * 127.0.0.1:23120/mcp).
 *
 * Strategie:
 *   - wiki (12)              → itemType: encyclopediaArticle  (s URL)
 *   - web_with_url (7)       → itemType: webpage
 *   - bibliographic_full (9) → itemType: book / journalArticle (heuristika z type)
 *   - partial (25) / fragment (22) → skip (manual review needed)
 *
 * Po dokončení Better BibTeX vygeneruje citation-key pro každý nový
 * item. Pro re-export references.json je třeba spustit:
 *   curl http://127.0.0.1:23119/api/users/0/items/top?format=csljson... → references.json
 *
 * Usage:
 *   node scripts/add-no-match-to-zotero.mjs        # dry-run (jen ukáže co by udělalo)
 *   node scripts/add-no-match-to-zotero.mjs --apply
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const apply = process.argv.includes('--apply');
const root = process.cwd();

const classified = JSON.parse(
  readFileSync(join(root, 'tmp/zotero-export/no-match-classified.json'), 'utf8'),
);

// Auto-add classes
const autoClasses = ['wiki', 'web_with_url', 'bibliographic_full'];

function parseAuthor(authorStr) {
  if (!authorStr) return [];
  // "Jan Hellich" → { lastName: "Hellich", firstName: "Jan" }
  // "Jan Marek, Petr Skála" → multiple authors
  // "Český spolek horologický" → { name: "Český spolek horologický" } (org)
  const parts = authorStr.split(/\s*[,;]\s*/).filter(Boolean);
  return parts.map((p) => {
    const tokens = p.split(/\s+/);
    if (tokens.length === 1) {
      // Single name → likely org
      return { creatorType: 'author', name: p };
    }
    // Last name = last token, first name = rest
    const lastName = tokens[tokens.length - 1];
    const firstName = tokens.slice(0, -1).join(' ');
    return { creatorType: 'author', firstName, lastName };
  });
}

function buildItem(ref, cls) {
  const itemType =
    cls === 'wiki' ? 'encyclopediaArticle'
    : cls === 'web_with_url' ? 'webpage'
    : (ref.title || '').match(/journal|časopis|noviny|sborník/i) ? 'journalArticle'
    : 'book';

  const fields = {};
  fields.title = ref.title || '(untitled)';
  if (ref.url) fields.url = ref.url;
  if (ref.year) fields.date = String(ref.year);
  // Pro wiki: encyclopediaTitle = "Wikipedie" (heuristic)
  if (cls === 'wiki') {
    fields.encyclopediaTitle = ref.title.includes('Wikipedie') ? 'Wikipedie' : 'Wikipedia';
  }

  const creators = parseAuthor(ref.author);

  // Tag pro identifikaci auto-přidaných (pro pozdější cleanup)
  const tags = [{ tag: 'csh-auto-import' }, { tag: 'orlojWeb' }];

  return { itemType, fields, creators, tags };
}

async function callMcp(method, params) {
  const res = await fetch('http://127.0.0.1:23120/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Math.random().toString(36).slice(2), method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message || JSON.stringify(json.error));
  return json.result;
}

const allItems = [];
for (const cls of autoClasses) {
  for (const ref of classified[cls] || []) {
    allItems.push({ cls, ref, payload: buildItem(ref, cls) });
  }
}

console.log(`Auto-add candidates: ${allItems.length}`);
for (const cls of autoClasses) {
  console.log(`  ${cls}: ${(classified[cls] || []).length}`);
}
const skipped = ['bibliographic_partial', 'fragment'].reduce((acc, c) => acc + (classified[c]?.length || 0), 0);
console.log(`  (skipped — manual review): ${skipped}`);
console.log('');

if (!apply) {
  console.log('Dry-run. Sample payloads:\n');
  for (const it of allItems.slice(0, 3)) {
    console.log(`[${it.cls}]`);
    console.log(JSON.stringify(it.payload, null, 2));
    console.log();
  }
  console.log('Spusť s --apply pro skutečné submit.');
  process.exit(0);
}

const results = { added: [], failed: [] };

for (let i = 0; i < allItems.length; i++) {
  const { cls, ref, payload } = allItems[i];
  try {
    const result = await callMcp('tools/call', {
      name: 'write_item',
      arguments: { action: 'create', ...payload },
    });
    // Result je text content
    const text = result?.content?.[0]?.text || '';
    let parsed = null;
    try { parsed = JSON.parse(text); } catch {}
    const itemKey = parsed?.itemKey || parsed?.key || (text.match(/[A-Z0-9]{8}/)?.[0]);
    console.log(`✓ [${i + 1}/${allItems.length}] ${cls.padEnd(22)} ${(ref.title || '').slice(0, 50)}  → ${itemKey || '(no key)'}`);
    results.added.push({ cls, ref, itemKey, response: text });
  } catch (err) {
    console.log(`✗ [${i + 1}/${allItems.length}] ${cls.padEnd(22)} ${(ref.title || '').slice(0, 50)}  → ${err.message}`);
    results.failed.push({ cls, ref, error: err.message });
  }
  // Krátká pauza mezi requesty
  await new Promise((r) => setTimeout(r, 100));
}

writeFileSync(
  join(root, 'tmp/zotero-export/auto-add-results.json'),
  JSON.stringify(results, null, 2),
);
console.log(`\nAdded: ${results.added.length}, failed: ${results.failed.length}`);
console.log(`Saved to tmp/zotero-export/auto-add-results.json`);
