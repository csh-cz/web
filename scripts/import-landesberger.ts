/**
 * Import Landesbergerové Google Sheet → content/soupis-veznich-hodin/*.mdx
 *
 * Sheet: 1vvbee9UzSZa1LLK4_Mytpv38GAitLrK9A-0_Mbbzhd8 (admin@horologie.cz)
 * Multi-table layout:
 *   1. Sebastian Landesberger main records (rows 2-11)
 *      header: Rok | Původní místo | Původní budova | Místo | Stav | sbírka |
 *              Cena | Prameny | Restaurátor
 *   2. Small inline "Signatura | Krok | Poznámka" stub (1 row, ignored)
 *   3. Ferdinand Landesberger records
 *      header: Rok | číslo | Původní místo | Původní budova | Místo | Stav |
 *              sbírka | Cena | Prameny | Restaurátor
 *      (extra "číslo" col → shifts right)
 *
 * Slug: <rok>-<obec>-landesberger-(s|f) — 's' for Sebastian, 'f' for Ferdinand
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';

const SHEET_ID = '1vvbee9UzSZa1LLK4_Mytpv38GAitLrK9A-0_Mbbzhd8';
const RANGE = 'List 1!A1:K30';
const RAW_MD_PATH = 'tmp/landesbergerove-raw.md';

interface RowGroup {
  hodinar: 'sebastian-landesberger' | 'ferdinand-landesberger';
  schema: 'sebastian' | 'ferdinand';
  rows: string[][];
}

interface ParsedRow {
  rok: string;
  obec: string;
  budova: string;
  misto: string;
  stav: string;
  sbirka: string;
  cena: string;
  prameny: string;
  restaurator: string;
}

/**
 * Sheet je sdílený s admin@horologie.cz a se mnou (osobně), ale ne s SA.
 * Použiju surový markdown výstup z personal Drive MCP, uložený v
 * tmp/landesbergerove-raw.md, a parsnu ho do row-array formátu.
 */
function parseMarkdownTables(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.split('\n')) {
    if (!line.startsWith('|')) continue;
    // Strip leading/trailing pipes and split
    const cells = line.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    // Skip alignment rows (--- or :-: cells)
    if (cells.every((c) => /^[:\-\s]*$/.test(c))) continue;
    rows.push(cells);
  }
  return rows;
}

async function fetchSheet(): Promise<string[][]> {
  // Shortcut: read pre-saved markdown export (from personal Drive MCP).
  // To refresh: re-run mcp__a1fcc34f-...__read_file_content on sheet ID
  // and overwrite tmp/landesbergerove-raw.md with the .fileContent.
  if (existsSync(RAW_MD_PATH)) {
    const md = readFileSync(RAW_MD_PATH, 'utf-8');
    return parseMarkdownTables(md);
  }
  // Fallback: SA channel (will fail if not shared)
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['-y', 'mcp-gdrive-workspace'], {
      env: {
        ...process.env,
        GOOGLE_SERVICE_ACCOUNT_KEY: '/Users/dknespl/.config/csh-gdrive-sa.json',
        MCP_GDRIVE_ACCESS_MODE: 'read_only',
      },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    let buf = '';
    proc.stdout.on('data', (d) => (buf += d.toString()));
    proc.stderr.on('data', () => {});
    proc.on('error', reject);
    proc.on('close', () => {
      const lines = buf.split('\n').filter((l) => l.trim().startsWith('{'));
      for (const l of lines) {
        try {
          const j = JSON.parse(l);
          if (j.id === 2 && j.result) {
            const data = JSON.parse(j.result.content[0].text);
            resolve(data.values as string[][]);
            return;
          }
        } catch {}
      }
      reject(new Error('No valid sheet response'));
    });
    proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'land-import', version: '1.0' } } }) + '\n');
    proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
    proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'gsheets_read', arguments: { spreadsheet_id: SHEET_ID, range: RANGE } } }) + '\n');
    setTimeout(() => proc.kill(), 30000);
  });
}

function partitionGroups(rows: string[][]): RowGroup[] {
  const groups: RowGroup[] = [];
  let current: RowGroup | null = null;
  for (const row of rows) {
    const cellA = (row[0] || '').trim();
    const cellB = (row[1] || '').trim();

    // Detect headers
    if (cellA === 'Rok') {
      if (cellB === 'číslo') {
        // Ferdinand sub-table header
        if (current) groups.push(current);
        current = { hodinar: 'ferdinand-landesberger', schema: 'ferdinand', rows: [] };
      } else {
        // Sebastian header (or the very first one)
        if (current) groups.push(current);
        current = { hodinar: 'sebastian-landesberger', schema: 'sebastian', rows: [] };
      }
      continue;
    }
    if (cellA === 'Signatura') {
      // Small inline header — close current group, ignore until next "Rok" header
      if (current) {
        groups.push(current);
        current = null;
      }
      continue;
    }

    // Skip empty rows
    if (row.every((c) => !c?.trim())) continue;
    // If we have current group, append
    if (current) current.rows.push(row);
  }
  if (current) groups.push(current);
  return groups;
}

function parseRow(row: string[], schema: 'sebastian' | 'ferdinand'): ParsedRow {
  if (schema === 'sebastian') {
    return {
      rok: (row[0] || '').trim(),
      obec: (row[1] || '').trim(),
      budova: (row[2] || '').trim(),
      misto: (row[3] || '').trim(),
      stav: (row[4] || '').trim(),
      sbirka: (row[5] || '').trim(),
      cena: (row[6] || '').trim(),
      prameny: (row[7] || '').trim(),
      restaurator: (row[8] || '').trim(),
    };
  }
  // Ferdinand: shifted by 1 (cislo at row[1])
  return {
    rok: (row[0] || '').trim(),
    obec: (row[2] || '').trim(),
    budova: (row[3] || '').trim(),
    misto: (row[4] || '').trim(),
    stav: (row[5] || '').trim(),
    sbirka: (row[6] || '').trim(),
    cena: (row[7] || '').trim(),
    prameny: (row[8] || '').trim(),
    restaurator: (row[9] || '').trim(),
  };
}

function slugify(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parsePlace(s: string): { obec: string; cast?: string } {
  const parts = s.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return { obec: parts[0], cast: parts.slice(1).join(', ') };
  return { obec: s.trim() };
}

function inferStav(misto: string): {
  stav: 'in_situ' | 'preneseno' | 'ztracene' | 'znicene' | 'neznamy';
  prenos?: { do: string };
} {
  const m = misto.trim();
  if (!m) return { stav: 'neznamy' };
  if (/^in situ$/i.test(m)) return { stav: 'in_situ' };
  if (/^ztracen/i.test(m)) return { stav: 'ztracene' };
  if (/^zniceno|^zničen/i.test(m)) return { stav: 'znicene' };
  if (/(NTM|Hodinárium|muzeum|expozice|sbírc|sbírka)/i.test(m)) return { stav: 'preneseno', prenos: { do: m } };
  return { stav: 'neznamy' };
}

function inferChod(stav: string): string | undefined {
  const s = stav.trim().toLowerCase();
  if (!s) return undefined;
  if (s.includes('v chodu') || s === 'funkční') return 'v_chodu';
  if (s.includes('restaur')) return 'restaurovano';
  if (s.includes('nefunk') || s === 'nerestaurováno') return 'nefunkcni';
  if (s.includes('zničen')) return 'znicene';
  return undefined;
}

interface Pramen {
  url?: string;
  citace?: string;
}

function parsePrameny(s: string): Pramen[] {
  if (!s.trim()) return [];
  const out: Pramen[] = [];
  const urls = s.match(/https?:\/\/[^\s,)]+/g) || [];
  for (const u of urls) out.push({ url: u });
  const plain = s.replace(/https?:\/\/[^\s,)]+/g, '').replace(/\s{2,}/g, ' ').trim();
  if (plain.length > 5) {
    const segs = plain.split(/[;\n]/).map((p) => p.trim()).filter((p) => p.length > 5);
    for (const seg of segs) out.push({ citace: seg });
  }
  return out;
}

function yamlString(s: string): string {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}

interface Record {
  slug: string;
  rok: string;
  hodinar: string;
  obec: string;
  cast?: string;
  budova?: string;
  stav: string;
  prenos?: { do: string };
  chod?: string;
  cenaDobova?: string;
  restaurator?: string;
  prameny: Pramen[];
  poznamka?: string;
  zdrojDat: string;
}

function renderMdx(r: Record): string {
  const lines: string[] = ['---'];
  lines.push(`slug: ${yamlString(r.slug)}`);
  if (/^\d{1,4}$/.test(r.rok)) lines.push(`rok: ${r.rok}`);
  else lines.push(`rok: ${yamlString(r.rok)}`);
  lines.push(`hodinar: ${yamlString(r.hodinar)}`);
  lines.push('puvodniMisto:');
  lines.push(`  obec: ${yamlString(r.obec)}`);
  if (r.cast) lines.push(`  cast: ${yamlString(r.cast)}`);
  if (r.budova) lines.push(`  budova: ${yamlString(r.budova)}`);
  lines.push(`  zeme: "CZ"`);
  lines.push(`stav: ${yamlString(r.stav)}`);
  if (r.prenos) {
    lines.push(`prenos:`);
    lines.push(`  do: ${yamlString(r.prenos.do)}`);
  }
  if (r.chod) lines.push(`chod: ${yamlString(r.chod)}`);
  if (r.cenaDobova) lines.push(`cenaDobova: ${yamlString(r.cenaDobova)}`);
  if (r.restaurator) lines.push(`restaurator: ${yamlString(r.restaurator)}`);
  if (r.prameny.length) {
    lines.push('prameny:');
    for (const p of r.prameny) {
      lines.push('  -');
      if (p.url) lines.push(`    url: ${yamlString(p.url)}`);
      if (p.citace) lines.push(`    citace: ${yamlString(p.citace)}`);
    }
  }
  if (r.poznamka) lines.push(`poznamka: ${yamlString(r.poznamka)}`);
  lines.push(`zdrojDat: ${yamlString(r.zdrojDat)}`);
  lines.push(`posledniOvereni: ${yamlString(new Date().toISOString().slice(0, 10))}`);
  lines.push('---');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const WRITE = process.argv.includes('--write');
  console.log('Fetching Landesbergerové sheet...');
  const rows = await fetchSheet();
  console.log(`Got ${rows.length} rows.\n`);
  const groups = partitionGroups(rows);
  console.log(`Sub-tables found: ${groups.length}`);
  for (const g of groups) console.log(`  ${g.hodinar} (${g.schema}): ${g.rows.length} rows`);

  const records: Record[] = [];
  const slugCounts = new Map<string, number>();
  for (const g of groups) {
    for (const row of g.rows) {
      const r = parseRow(row, g.schema);
      // Skip if rok+obec+budova all empty
      if (!r.rok && !r.obec && !r.budova && !r.misto) continue;

      const place = parsePlace(r.obec || r.misto || 'neznámé');
      const { stav, prenos } = inferStav(r.misto);
      const chod = inferChod(r.stav);

      const obecSlug = slugify(place.obec || 'neznamy');
      const rokPart = r.rok ? r.rok.replace(/[^\d-]/g, '') || 'nedatovano' : 'nedatovano';
      const suffix = g.hodinar === 'sebastian-landesberger' ? 'landesberger-s' : 'landesberger-f';
      let slug = `${rokPart}-${obecSlug}-${suffix}`;
      const count = (slugCounts.get(slug) || 0) + 1;
      slugCounts.set(slug, count);
      if (count > 1) slug = `${slug}-${count}`;

      records.push({
        slug,
        rok: r.rok || '?',
        hodinar: g.hodinar,
        obec: place.obec,
        cast: place.cast,
        budova: r.budova || undefined,
        stav,
        prenos,
        chod,
        cenaDobova: r.cena || undefined,
        restaurator: r.restaurator || undefined,
        prameny: parsePrameny(r.prameny),
        zdrojDat: 'tabulka_landesbergerove',
      });
    }
  }

  console.log(`\nParsed ${records.length} records.\n`);
  if (!WRITE) {
    for (const r of records.slice(0, 3)) {
      console.log('---');
      console.log(renderMdx(r));
    }
    console.log(`(... a ${Math.max(0, records.length - 3)} dalších)\n`);
    console.log('Run with --write.');
    return;
  }

  if (!existsSync('content/soupis-veznich-hodin')) mkdirSync('content/soupis-veznich-hodin', { recursive: true });
  let written = 0;
  let skipped = 0;
  for (const r of records) {
    const path = `content/soupis-veznich-hodin/${r.slug}.mdx`;
    if (existsSync(path)) {
      skipped++;
      continue;
    }
    writeFileSync(path, renderMdx(r), 'utf-8');
    written++;
  }
  console.log(`Written: ${written} new MDX, ${skipped} skipped (already existed).`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
