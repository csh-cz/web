#!/usr/bin/env node
// Aktualizace `posledniOvereni` ve všech kartách soupisu
// na **datum posledního ověření zjištěného stavu** (per source v prameny / body).
//
// Pravidla (priorita seshora dolů):
//   1) Speciální známé datace: Sv. Vít 2014-10-29, Dobříš 2009-04-02,
//      Bečváry 2003-06-28, Měšice 2006-12-31, Hradešice 2019-06-18.
//   2) `rokRestaurovani` ve frontmatteru → "{rokRestaurovani}-12-31"
//   3) Sekce „Hodnocení v Skálově zprávě 2004" v body s textem
//      „v roce **YYYY**" → "{YYYY}-12-31"
//   4) Krečmerova dokumentace „ke dni DD. M. YYYY" v body → tento datum
//   5) Hellichův seznam Janatovy produkce (1917) → "1917-01-01"
//   6) Skálovo osobní vyjádření 2026-05 → "2026-05-05"
//   7) Pokud žádné z výše uvedeného → ponechat existující hodnotu

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const DIR = path.join(ROOT, 'content', 'soupis-veznich-hodin');

const KNOWN_SPECIFIC_DATES = {
  'skala-realizace-svaty-vit': '2014-10-29',
  '1791-dobris-landesberger-f': '2009-04-02',
  'nedatovano-becvary-landesberger': '2003-06-28',
  '1774-mesice-u-prahy-landesberger-s': '2006-12-31',
  '1898-hradesice-krecmer': '2019-06-18',
  'nedatovano-chlumec-nad-cidlinou-landesberger-f': '2026-05-05',
  '1902-hrob-evangelicky-kostel-zacharia': '2015-05-29',
  '1850-brezno-u-chomutova-summerecker': '2015-04-10',
};

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.mdx'));
let updated = 0, unchanged = 0;
const log = [];

for (const file of files) {
  const slug = file.replace(/\.mdx$/, '');
  const fp = path.join(DIR, file);
  let src = fs.readFileSync(fp, 'utf8');

  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) continue;
  const fm = m[1];
  const body = m[2];

  // --- Determine new date ---
  let newDate = null;
  let reason = null;

  // Rule 1: known specific dates
  if (slug in KNOWN_SPECIFIC_DATES) {
    newDate = KNOWN_SPECIFIC_DATES[slug];
    reason = 'specific';
  }

  // Rule 2: rokRestaurovani in frontmatter
  if (!newDate) {
    const rr = fm.match(/^rokRestaurovani:\s*("?(\d{4})"?|(\d{4}))/m);
    if (rr) {
      const year = rr[2] || rr[3];
      newDate = `${year}-12-31`;
      reason = `rokRestaurovani ${year}`;
    }
  }

  // Rule 3: Skála 2004 zpráva — extract docYear from body
  if (!newDate) {
    const sk = body.match(/Hodnocení v Skálově zprávě 2004[\s\S]*?v roce \*\*(\d{4})\*\*/);
    if (sk) {
      newDate = `${sk[1]}-12-31`;
      reason = `Skála 2004 dokumentace ${sk[1]}`;
    } else {
      // Stuby vytvořené ze Skála 2004 — body obsahuje "zdokumentováno [Petrem Skálou] v roce **YYYY**"
      const sk2 = body.match(/zdokumentováno \[Petrem Skálou\][^\n]*v roce \*\*(\d{4})\*\*/);
      if (sk2) {
        newDate = `${sk2[1]}-12-31`;
        reason = `Skála 2004 dokumentace ${sk2[1]} (stub)`;
      }
    }
  }

  // Rule 4: Krečmerova dokumentace — datum "ke dni DD. M. YYYY"
  if (!newDate) {
    const kd = body.match(/ke dni \*\*?(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})\*\*?/);
    if (kd) {
      const dd = kd[1].padStart(2, '0');
      const mm = kd[2].padStart(2, '0');
      newDate = `${kd[3]}-${mm}-${dd}`;
      reason = `Krečmer dokumentace ${newDate}`;
    }
  }

  // Rule 5: Hellich 1917
  if (!newDate && /HELLICH, Jan\. Příspěvek k slovníku/.test(fm + body)) {
    newDate = '1917-01-01';
    reason = 'Hellich 1917';
  }

  // Rule 6: Skálovo osobní vyjádření 2026-05 (např. v textu prameny)
  if (!newDate && /Sk[áa]l[aoy].*komunikace 2026|osobní komunikace 2026|Sk[áa]la \(2026\)/i.test(fm + body)) {
    newDate = '2026-05-05';
    reason = 'Skála komunikace 2026';
  }

  // Rule 7: pokud nic, ponecháme existující — ale chceme ho mít aspoň neobsahující "2026-05-04"
  if (!newDate) {
    // ponechat
    unchanged++;
    continue;
  }

  // Update frontmatter — fix-bug: detekuj nejprve, jestli existující entry je
  const hasField = /^posledniOvereni:/m.test(fm);
  const alreadyCorrect = fm.includes(`posledniOvereni: "${newDate}"`);

  if (alreadyCorrect) {
    unchanged++;
    continue;
  }

  let updatedFm;
  if (hasField) {
    updatedFm = fm.replace(/^posledniOvereni:\s*"?[\d-]+"?$/m, `posledniOvereni: "${newDate}"`);
  } else if (/^zdrojDat:/m.test(fm)) {
    updatedFm = fm.replace(/^zdrojDat:/m, `posledniOvereni: "${newDate}"\nzdrojDat:`);
  } else {
    updatedFm = fm.trimEnd() + `\nposledniOvereni: "${newDate}"`;
  }
  src = `---\n${updatedFm}\n---\n${body}`;

  fs.writeFileSync(fp, src, 'utf8');
  updated++;
  log.push({ slug, newDate, reason });
}

console.log(`\n=== SUMMARY ===`);
console.log(`Updated: ${updated}`);
console.log(`Unchanged: ${unchanged}`);
console.log(`Total: ${updated + unchanged}`);

// Group by reason
const byReason = {};
for (const e of log) {
  byReason[e.reason] = (byReason[e.reason] || 0) + 1;
}
console.log('\nBy reason:');
for (const [reason, count] of Object.entries(byReason).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${reason}: ${count}`);
}
