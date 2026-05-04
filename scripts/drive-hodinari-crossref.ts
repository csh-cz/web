/**
 * Cross-reference Drive Knihovna/Hodináři/ folders ↔ MDX repo content/hodinari/*.mdx.
 *
 * Output: tmp/hodinari-crossref-report.md  — markdown report with three sections:
 *   1. ✓ Matched     — pair (Drive folder, MDX file) + content stats per Drive folder
 *   2. ⊕ Drive-only — Drive folder exists, no MDX → candidate for new medailon
 *   3. ⊖ MDX-only   — MDX exists, no Drive folder → no rich source archive
 *
 * Matching uses surname extraction with fuzzy fallback.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

interface DriveNode {
  id: string;
  name: string;
  mimeType: string;
  size?: number;
  isFolder: boolean;
  children?: DriveNode[];
  path?: string;
}

const tree = JSON.parse(
  readFileSync('tmp/drive-walk-0B-_VcQyC6J3.json', 'utf-8'),
) as DriveNode;

// ─── Find Hodináři/ folder ──────────────────────────────────────────────

function nfc(s: string): string {
  return s.normalize('NFC');
}

const hodinari = (tree.children || []).find((c) => nfc(c.name) === 'Hodináři');
if (!hodinari) {
  console.error('Hodináři folder not found in Drive walk');
  process.exit(1);
}

interface DriveHodinarFolder {
  name: string;
  id: string;
  totalFiles: number;
  totalBytes: number;
  byMime: Record<string, number>; // mime → count
  topFiles: { name: string; size: number; mime: string }[];
}

function summarizeFolder(folder: DriveNode): DriveHodinarFolder {
  let totalFiles = 0;
  let totalBytes = 0;
  const byMime: Record<string, number> = {};
  const allFiles: { name: string; size: number; mime: string }[] = [];

  function recurse(node: DriveNode) {
    for (const c of node.children || []) {
      if (c.isFolder) {
        recurse(c);
      } else {
        totalFiles++;
        const sz = c.size || 0;
        totalBytes += sz;
        byMime[c.mimeType] = (byMime[c.mimeType] || 0) + 1;
        allFiles.push({ name: c.name, size: sz, mime: c.mimeType });
      }
    }
  }
  recurse(folder);
  // Top 5 files by size
  allFiles.sort((a, b) => b.size - a.size);
  return {
    name: folder.name,
    id: folder.id,
    totalFiles,
    totalBytes,
    byMime,
    topFiles: allFiles.slice(0, 5),
  };
}

const driveFolders: DriveHodinarFolder[] = (hodinari.children || [])
  .filter((c) => c.isFolder)
  .map(summarizeFolder)
  .sort((a, b) => b.totalFiles - a.totalFiles);

// ─── Read MDX repo ──────────────────────────────────────────────────────

interface MdxRecord {
  slug: string;
  title: string;
  surname: string;
  givenName: string;
  obdobi?: string;
  shrnuti?: string;
  filePath: string;
}

function extractSurname(title: string): { surname: string; given: string } {
  // Strip "z Kadaně", "z Litomyšle" etc — keep personal name
  // Examples:
  //   "Jan Prokeš" → surname=Prokeš, given=Jan
  //   "Edmund Kinšner" → surname=Kinšner, given=Edmund
  //   "Mikuláš z Kadaně" → surname=Mikuláš (it's a personal name without family surname), given=
  //   "Ferdinand Landesberger" → surname=Landesberger, given=Ferdinand
  //   "L. Hainz" → surname=Hainz, given=L.
  //   "Datumatic" → surname=Datumatic (single token), given=
  const tokens = title.trim().split(/\s+/);
  if (tokens.length === 1) return { surname: tokens[0], given: '' };
  // Detect "z/von/de" preposition — keep token BEFORE it as surname
  for (let i = 1; i < tokens.length; i++) {
    if (/^(z|von|de|della|dela|della)$/i.test(tokens[i])) {
      return {
        surname: tokens[i - 1],
        given: tokens.slice(0, i - 1).join(' '),
      };
    }
  }
  // Default: last token = surname
  return {
    surname: tokens[tokens.length - 1],
    given: tokens.slice(0, -1).join(' '),
  };
}

const mdxDir = 'content/hodinari';
const mdxFiles = readdirSync(mdxDir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
const mdxRecords: MdxRecord[] = [];
for (const f of mdxFiles) {
  const text = readFileSync(join(mdxDir, f), 'utf-8');
  if (!text.startsWith('---')) continue;
  const end = text.indexOf('\n---', 3);
  if (end < 0) continue;
  let fm: Record<string, unknown>;
  try {
    fm = yaml.load(text.slice(3, end)) as Record<string, unknown>;
  } catch {
    continue;
  }
  const title = String(fm.title || '');
  const slug = String(fm.slug || f.replace(/\.mdx?$/, ''));
  const { surname, given } = extractSurname(title);
  mdxRecords.push({
    slug,
    title,
    surname,
    givenName: given,
    obdobi: fm.obdobi as string | undefined,
    shrnuti: fm.shrnuti as string | undefined,
    filePath: `${mdxDir}/${f}`,
  });
}

// ─── Matching ──────────────────────────────────────────────────────────

function norm(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

interface Match {
  driveFolder: DriveHodinarFolder;
  mdxRecord: MdxRecord;
  score: number;
  reason: string;
}

function scoreMatch(d: DriveHodinarFolder, m: MdxRecord): { score: number; reason: string } {
  const dn = norm(d.name);
  const ms = norm(m.surname);
  const mg = norm(m.givenName);
  const mt = norm(m.title);

  // Exact surname match
  if (dn === ms) return { score: 100, reason: `exact surname "${m.surname}"` };
  // Drive name = MDX title (e.g. compound names)
  if (dn === mt) return { score: 100, reason: 'exact title' };
  // Drive surname (last word) matches MDX surname
  const dlast = norm(d.name.split(/\s+/).pop() || '');
  if (dlast === ms && ms.length >= 4) {
    return { score: 95, reason: `drive last-word ${dlast} = surname` };
  }
  // Drive name = surname-pluralized form (Czech: Božek → Božkové, Hainz → Hainzové)
  // Stem rule: drop -ové, -ovi, -i, -ů suffix; check both directions
  const dstem = dn.replace(/(ove|ovi|u|ouvi)$/, '');
  if (
    dstem.length >= 4 &&
    (dstem === ms || ms.startsWith(dstem) || dstem.startsWith(ms))
  ) {
    return { score: 90, reason: `pluralized form: ${d.name} → ${m.surname}` };
  }
  // Czech "pohyblivé e" — vowel elision in plural:
  //   Bozek → Bozkové (stem "Bozk")
  //   "Bozek".replace(/e([^aeiou]*)$/, '$1') → "Bozk"
  const msEelision = ms.replace(/[eěo]([^aeiouy]*)$/, '$1');
  if (
    msEelision.length >= 3 &&
    msEelision !== ms &&
    (msEelision === dstem || dstem === msEelision || dstem.startsWith(msEelision))
  ) {
    return { score: 88, reason: `e-elision: "${m.surname}" → "${d.name}"` };
  }
  // Surname is substring of Drive name (e.g. Drive "Pacovský Plánička" ↔ MDX "Plánička")
  if (ms.length >= 4 && dn.includes(ms)) {
    return { score: 75, reason: `surname "${m.surname}" in Drive name` };
  }
  // Drive name is substring of surname (e.g. shorter Drive name)
  if (dn.length >= 4 && ms.includes(dn)) {
    return { score: 70, reason: `Drive "${d.name}" in surname "${m.surname}"` };
  }
  // Given name match (rare — for single-name historical figures like "Mikuláš z Kadaně")
  if (mg && dn === mg && mg.length >= 4) {
    return { score: 65, reason: `given name "${m.givenName}"` };
  }
  // Drive name appears anywhere in title
  if (dn.length >= 4 && mt.includes(dn)) {
    return { score: 60, reason: `"${d.name}" anywhere in title` };
  }
  return { score: 0, reason: '' };
}

// Best-match per Drive folder
const matches: Match[] = [];
const matchedMdxSlugs = new Set<string>();
const driveOnly: DriveHodinarFolder[] = [];

for (const d of driveFolders) {
  let best: Match | null = null;
  for (const m of mdxRecords) {
    const { score, reason } = scoreMatch(d, m);
    if (score >= 50 && (!best || score > best.score)) {
      best = { driveFolder: d, mdxRecord: m, score, reason };
    }
  }
  if (best) {
    matches.push(best);
    matchedMdxSlugs.add(best.mdxRecord.slug);
  } else {
    driveOnly.push(d);
  }
}

// Resolve case where multiple Drive folders match same MDX (e.g. "Prokeš" + "Jan Prokeš" → both → jan-prokes)
// Keep all matches but dedupe MDX slug counter
const mdxOnly = mdxRecords.filter((m) => !matchedMdxSlugs.has(m.slug));

// ─── Render report ─────────────────────────────────────────────────────

function fmtBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  if (n < 1024 ** 3) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / 1024 ** 3).toFixed(2)} GB`;
}

function mimeShort(m: string): string {
  if (m === 'application/pdf') return 'PDF';
  if (m.startsWith('image/jpeg')) return 'JPG';
  if (m.startsWith('image/png')) return 'PNG';
  if (m.startsWith('image/tiff')) return 'TIFF';
  if (m.startsWith('image/')) return m.split('/')[1].toUpperCase();
  if (m === 'application/msword') return 'DOC';
  if (m.includes('wordprocessingml')) return 'DOCX';
  if (m === 'application/vnd.ms-excel') return 'XLS';
  if (m.includes('spreadsheetml')) return 'XLSX';
  if (m.includes('presentationml')) return 'PPTX';
  if (m === 'text/plain') return 'TXT';
  if (m.includes('google-apps.document')) return 'GDOC';
  if (m.includes('google-apps.spreadsheet')) return 'GSHEET';
  return m.split('/').pop() || m;
}

function mimeBreakdown(byMime: Record<string, number>): string {
  return Object.entries(byMime)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([m, n]) => `${n}× ${mimeShort(m)}`)
    .join(', ');
}

function driveLink(id: string): string {
  return `https://drive.google.com/drive/folders/${id}`;
}

const lines: string[] = [];
lines.push(`# Crossref report: Knihovna/Hodináři/ ↔ content/hodinari/`);
lines.push('');
lines.push(`Generated: ${new Date().toISOString().slice(0, 10)}`);
lines.push('');
lines.push(`## Souhrn`);
lines.push('');
lines.push(`| Stav | Počet |`);
lines.push(`|---|---|`);
lines.push(`| Drive složek pod \`Hodináři/\` | ${driveFolders.length} |`);
lines.push(`| MDX medailionů v repu | ${mdxRecords.length} |`);
lines.push(`| ✓ Matched (Drive ↔ MDX) | ${matches.length} |`);
lines.push(`| ⊕ Pouze v Drive (kandidáti na nový medailon) | ${driveOnly.length} |`);
lines.push(`| ⊖ Pouze v MDX (chybí Drive archiv) | ${mdxOnly.length} |`);
lines.push('');

// ─── Section 1: Matched ─────────────────────────────────────────────────
lines.push(`## ✓ Matched (${matches.length})`);
lines.push('');
lines.push('Existuje jak Drive složka s materiály, tak MDX medailon v repu. Drive obsahuje materiál, který může obohatit medailon.');
lines.push('');
lines.push(`| Drive složka | Obsah | MDX | Match |`);
lines.push(`|---|---|---|---|`);
for (const m of matches.sort((a, b) => b.driveFolder.totalFiles - a.driveFolder.totalFiles)) {
  const d = m.driveFolder;
  const r = m.mdxRecord;
  const drive = `[${d.name}](${driveLink(d.id)})`;
  const obsah = `${d.totalFiles}× / ${fmtBytes(d.totalBytes)} (${mimeBreakdown(d.byMime)})`;
  const mdx = `\`${r.slug}.mdx\``;
  lines.push(`| ${drive} | ${obsah} | ${mdx} | ${m.score} (${m.reason}) |`);
}
lines.push('');

// ─── Section 2: Drive-only ──────────────────────────────────────────────
lines.push(`## ⊕ Pouze v Drive — kandidáti na nový medailon (${driveOnly.length})`);
lines.push('');
lines.push('Drive obsahuje archivní materiál, ale na webu Hodinária není medailon. Pro každého z těchto hodinářů by šel založit `content/hodinari/<slug>.mdx`.');
lines.push('');
lines.push(`| Drive složka | Obsah | Top soubory |`);
lines.push(`|---|---|---|`);
for (const d of driveOnly.sort((a, b) => b.totalFiles - a.totalFiles)) {
  if (d.totalFiles === 0) continue;
  const drive = `[${d.name}](${driveLink(d.id)})`;
  const obsah = `${d.totalFiles}× / ${fmtBytes(d.totalBytes)} (${mimeBreakdown(d.byMime)})`;
  const topFiles = d.topFiles
    .map((f) => `${f.name.slice(0, 40)} (${fmtBytes(f.size)})`)
    .join('; ');
  lines.push(`| ${drive} | ${obsah} | ${topFiles.slice(0, 200)} |`);
}
const emptyDrive = driveOnly.filter((d) => d.totalFiles === 0).map((d) => d.name);
if (emptyDrive.length) {
  lines.push('');
  lines.push(`Prázdné Drive složky (bez souborů): ${emptyDrive.map((n) => `\`${n}\``).join(', ')}`);
}
lines.push('');

// ─── Section 3: MDX-only ────────────────────────────────────────────────
lines.push(`## ⊖ Pouze v MDX — bez Drive archivu (${mdxOnly.length})`);
lines.push('');
lines.push('Medailon na webu existuje, ale Drive nemá samostatnou složku s materiály. Týká se to typicky novodobých výrobců a firem.');
lines.push('');
lines.push(`| Slug | Titul | Období |`);
lines.push(`|---|---|---|`);
for (const r of mdxOnly.sort((a, b) => a.slug.localeCompare(b.slug))) {
  lines.push(`| \`${r.slug}\` | ${r.title} | ${r.obdobi || '—'} |`);
}
lines.push('');

// ─── Action plan ────────────────────────────────────────────────────────
lines.push(`## Doporučené akce`);
lines.push('');
lines.push(`### 1. Obohatit existující medailony (${matches.length})`);
lines.push('');
lines.push('Pro každý matched řádek vyvolat per-hodinář revizi: stáhnout PDF/skeny z Drive, projít, doplnit `references:` v MDX, případně portrét.');
lines.push('');
const richMatches = matches.filter((m) => m.driveFolder.totalFiles >= 10);
if (richMatches.length) {
  lines.push(`Top kandidáti (≥10 souborů v Drive):`);
  for (const m of richMatches.sort((a, b) => b.driveFolder.totalFiles - a.driveFolder.totalFiles)) {
    lines.push(`- **${m.mdxRecord.title}** — ${m.driveFolder.totalFiles} souborů (${fmtBytes(m.driveFolder.totalBytes)}) v Drive složce \`${m.driveFolder.name}\``);
  }
  lines.push('');
}

lines.push(`### 2. Založit nové medailony (${driveOnly.filter((d) => d.totalFiles > 0).length})`);
lines.push('');
lines.push('Pro 42 hodinářů s archivem v Drive, ale bez medailonu na webu. Doporučený postup:');
lines.push('1. Vybrat top-N podle bohatství archivu (níže) a důležitosti pro CSH narativ');
lines.push('2. Pro každého: vytvořit `content/hodinari/<slug>.mdx` se základní hlavičkou + perex z dostupných materiálů');
lines.push('3. Postupně doplňovat z Drive zdrojů');
lines.push('');
const richDriveOnly = driveOnly.filter((d) => d.totalFiles >= 5).sort((a, b) => b.totalFiles - a.totalFiles);
lines.push(`Top kandidáti (≥5 souborů v Drive):`);
for (const d of richDriveOnly) {
  lines.push(`- **${d.name}** — ${d.totalFiles} souborů, ${fmtBytes(d.totalBytes)}`);
}
lines.push('');

const reportPath = 'tmp/hodinari-crossref-report.md';
writeFileSync(reportPath, lines.join('\n'));

console.log(`Report written: ${reportPath}`);
console.log(`  Matched:   ${matches.length}`);
console.log(`  Drive-only: ${driveOnly.length} (${driveOnly.filter((d) => d.totalFiles > 0).length} non-empty)`);
console.log(`  MDX-only:  ${mdxOnly.length}`);
console.log('');
console.log('Top matches with rich Drive content:');
for (const m of matches
  .filter((m) => m.driveFolder.totalFiles >= 10)
  .sort((a, b) => b.driveFolder.totalFiles - a.driveFolder.totalFiles)) {
  console.log(
    `  ${m.driveFolder.name.padEnd(30)} ↔ ${m.mdxRecord.slug.padEnd(25)} — ${m.driveFolder.totalFiles} files (${fmtBytes(m.driveFolder.totalBytes)})`,
  );
}
console.log('');
console.log('Top Drive-only with rich archive (no medailon yet):');
for (const d of driveOnly
  .filter((d) => d.totalFiles >= 5)
  .sort((a, b) => b.totalFiles - a.totalFiles)) {
  console.log(`  ${d.name.padEnd(30)} — ${d.totalFiles} files (${fmtBytes(d.totalBytes)})`);
}
