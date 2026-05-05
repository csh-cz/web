#!/usr/bin/env node
// Normalize majitel names + auto-fill pridanoDoSbirky from XLS Soupis 3.
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'content/hodinarium-eu';
const XLS_CSV = '/tmp/sup3.csv';

// Owner normalization map
const OWNER_MAP = {
  'Spolek': 'ČSH',
  'spolek': 'ČSH',
  'Český spolek horologický': 'ČSH',
  'Král': 'Petr Král',
  'Petr Král': 'Petr Král',
  'Baudisch': 'Miroslav Baudisch',
  'Miroslav Baudisch': 'Miroslav Baudisch',
  'Knespl': 'David Knespl',
  'David Knespl': 'David Knespl',
};

// Build inv. č. → year map from XLS (col4 = year for top section, col13 = inv. č. for sub-sections)
const yearByInv = new Map();
const csvText = fs.readFileSync(XLS_CSV, 'utf-8');
for (const line of csvText.split('\n')) {
  // Simple CSV split (handles quoted commas naïvely; XLS export uses quotes)
  const cells = [];
  let cur = '', inQuote = false;
  for (const ch of line) {
    if (ch === '"') inQuote = !inQuote;
    else if (ch === ',' && !inQuote) { cells.push(cur); cur = ''; }
    else cur += ch;
  }
  cells.push(cur);
  // Top section: col3 (idx 2) = inv, col4 (idx 3) = year
  // Sub-section (Vitrína/Panel): col13 (idx 12) = inv, col4 (idx 3) = year
  for (const [invCol, yearCol] of [[2, 3], [12, 3]]) {
    const inv = cells[invCol]?.trim();
    const year = cells[yearCol]?.trim();
    if (inv && /^[0-9]{1,3}$/.test(inv) && year && /^[12][0-9]{3}$/.test(year)) {
      // Only set if not already set (top section wins for top-section invs)
      if (!yearByInv.has(inv)) yearByInv.set(inv, year);
    }
  }
}
console.log(`Loaded ${yearByInv.size} (inv → year) mappings from XLS`);

const files = fs.readdirSync(DIR).filter(f => f.startsWith('inv-') && f.endsWith('.md'));

let ownerChanged = 0;
let yearAdded = 0;
const ownerStats = {};

for (const f of files) {
  const fp = path.join(DIR, f);
  let raw = fs.readFileSync(fp, 'utf-8');
  const orig = raw;

  // Extract inventarniCislo
  const invMatch = raw.match(/^\s*inventarniCislo:\s*"?([^\s"]+)"?\s*$/m);
  const inv = invMatch ? invMatch[1] : null;

  // Owner normalization
  const ownerMatch = raw.match(/^\s*majitel:\s*"([^"]+)"\s*$/m);
  if (ownerMatch) {
    const oldOwner = ownerMatch[1];
    const newOwner = OWNER_MAP[oldOwner] || oldOwner;
    if (newOwner !== oldOwner) {
      raw = raw.replace(/^(\s*majitel:\s*)"[^"]+"/m, `$1"${newOwner}"`);
      ownerChanged++;
      ownerStats[oldOwner] = (ownerStats[oldOwner] || 0) + 1;
    }
  }

  // Auto-fill pridanoDoSbirky if missing AND XLS has year
  if (inv && yearByInv.has(inv)) {
    const xlsYear = yearByInv.get(inv);
    const yrMatch = raw.match(/^\s*pridanoDoSbirky:\s*"?([^\s"]+)"?\s*$/m);
    if (!yrMatch) {
      // Insert after majitel: line (or umisteni: if no majitel)
      const insertAfter = /^(\s*)(majitel:\s*"[^"]+"\s*)$/m;
      const matched = insertAfter.exec(raw);
      if (matched) {
        const indent = matched[1];
        raw = raw.replace(insertAfter, `$1$2\n${indent}pridanoDoSbirky: "${xlsYear}"`);
        yearAdded++;
      }
    }
  }

  if (raw !== orig) fs.writeFileSync(fp, raw);
}

console.log(`Owner changes: ${ownerChanged} cards`);
for (const [k, v] of Object.entries(ownerStats).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`);
}
console.log(`Year auto-filled: ${yearAdded} cards`);
