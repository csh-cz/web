/**
 * Import Václav Krečmer Google Sheet → content/soupis-veznich-hodin/*.mdx
 *
 * Sheet ID: 1pAOtda3pyz5sZBu8J_-QIrcRB74vSN1yiMfhc5_5ILk (admin@horologie.cz)
 * 47 rows, schema:
 *   Rok | Původní místo | Původní budova | Místo | Stav | sbírka | Cena |
 *   Prameny | Restaurátor | (col 9) | (col 10) | Signatura | Krok | Poznámka
 *
 * Mapping:
 *   Rok                 → rok (number or string range)
 *   Původní místo       → puvodniMisto.obec (parse "Praha, Smíchov" → obec=Praha, cast=Smíchov)
 *   Původní budova      → puvodniMisto.budova
 *   Místo               → infer stav: "in situ" → in_situ, "ztracené" → ztracene,
 *                         "v soukr. sbírce, X" → preneseno + prenos.do = "soukromá sbírka, X",
 *                         "NTM" / "Hodinárium, Děčín" → preneseno + prenos.do
 *   Stav                → chod (v chodu / nefunkční / restaurováno / zničené)
 *   sbírka              → if preneseno && prenos.do is generic → use sbírka content for prenos.do
 *   Cena                → cenaDobova
 *   Prameny             → prameny[] (split on whitespace, parse URLs vs citations)
 *   Restaurátor         → restaurator
 *   Signatura           → signatura
 *   Krok                → krok
 *   Poznámka            → poznamka
 *
 * Slug: <rok>-<obec-slug>-krecmer (with disambig for same-year duplicates)
 *
 * Output: content/soupis-veznich-hodin/<slug>.mdx files
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';

const SHEET_ID = '1pAOtda3pyz5sZBu8J_-QIrcRB74vSN1yiMfhc5_5ILk';
const SHEET_RANGE = 'List 1!A2:N100'; // skip header row

interface KrecmerRow {
  rok: string;
  puvodniMisto: string;
  puvodniBudova: string;
  misto: string;
  stav: string;
  sbirka: string;
  cena: string;
  prameny: string;
  restaurator: string;
  // cols 9-10 — binary 1s, mostly skipped
  col9: string;
  col10: string;
  signatura: string;
  krok: string;
  poznamka: string;
}

async function fetchSheet(): Promise<string[][]> {
  // Use SA-based MCP gdrive-csh — needs direct call since SA can read Krečmer sheet
  // Actually Krečmer is shared with admin@horologie.cz personal Drive (and personal MCP saw it),
  // so use personal Drive MCP via fetch.
  // We saw the format with `read_file_content`. But for structured data, use gsheets_read via SA-MCP.
  const r = await fetch('http://127.0.0.1:23120/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'search_library', arguments: { q: 'placeholder', limit: 1 } },
    }),
  });
  // The above was just ping; actually we'll spawn gdrive-csh process for sheets read
  void r;
  // Spawn gdrive-csh stdio
  const { spawn } = await import('node:child_process');
  return new Promise((resolve, reject) => {
    const proc = spawn(
      'npx',
      ['-y', 'mcp-gdrive-workspace'],
      {
        env: {
          ...process.env,
          GOOGLE_SERVICE_ACCOUNT_KEY: '/Users/dknespl/.config/csh-gdrive-sa.json',
          MCP_GDRIVE_ACCESS_MODE: 'read_only',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );
    let buf = '';
    proc.stdout.on('data', (d) => (buf += d.toString()));
    proc.stderr.on('data', () => {}); // suppress server logs
    proc.on('error', reject);
    proc.on('close', () => {
      // Parse response — last full JSON-RPC line
      const lines = buf.split('\n').filter((l) => l.trim().startsWith('{'));
      for (const l of lines) {
        try {
          const j = JSON.parse(l);
          if (j.id === 2 && j.result) {
            const txt = j.result.content[0].text;
            const data = JSON.parse(txt);
            resolve(data.values as string[][]);
            return;
          }
        } catch {}
      }
      reject(new Error('No valid response from gsheets_read'));
    });
    // Send initialize + tools/call sequence
    proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'krecmer-import', version: '1.0' } } }) + '\n');
    proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
    proc.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'gsheets_read', arguments: { spreadsheet_id: SHEET_ID, range: SHEET_RANGE } } }) + '\n');
    setTimeout(() => proc.kill(), 30000);
  });
}

// ─── Slug helpers ───────────────────────────────────────────────────────

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ─── Place parser ───────────────────────────────────────────────────────

function parsePlace(s: string): { obec: string; cast?: string } {
  // "Praha, Smíchov" → obec="Praha", cast="Smíchov"
  // "Praha, Staré město" → obec="Praha", cast="Staré město"
  // "Vodňany" → obec="Vodňany"
  const parts = s.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return { obec: parts[0], cast: parts.slice(1).join(', ') };
  return { obec: s.trim() };
}

// ─── Stav inference ─────────────────────────────────────────────────────

function inferStav(misto: string, sbirka: string): {
  stav: 'in_situ' | 'preneseno' | 'ztracene' | 'znicene' | 'neznamy';
  prenos?: { do: string };
} {
  const m = misto.trim();
  if (!m) return { stav: 'neznamy' };
  if (/^in situ$/i.test(m)) return { stav: 'in_situ' };
  if (/^ztracen/i.test(m)) return { stav: 'ztracene' };
  if (/^zniceno|^zničen/i.test(m)) return { stav: 'znicene' };
  if (/^neznám/i.test(m)) return { stav: 'neznamy' };
  // Anywhere "v soukr. sbírce" / "NTM" / "Hodinárium" — preneseno
  if (/(v soukr\. sbírc|NTM|Hodinárium|Muzeu|muzejní|expozice|aukro|Atmos|Schröer|Time Works|Paichl)/i.test(m)) {
    return { stav: 'preneseno', prenos: { do: m } };
  }
  return { stav: 'neznamy' };
}

// ─── Chod ───────────────────────────────────────────────────────────────

function inferChod(stav: string): string | undefined {
  const s = stav.trim().toLowerCase();
  if (!s) return undefined;
  if (s.includes('v chodu')) return 'v_chodu';
  if (s.includes('restaur')) return 'restaurovano';
  if (s.includes('nefunk')) return 'nefunkcni';
  if (s.includes('zničen') || s.includes('znicen')) return 'znicene';
  if (s.includes('ztrac')) return 'znicene'; // sometimes used as "destroyed"
  return undefined;
}

// ─── Prameny parser ─────────────────────────────────────────────────────

interface Pramen {
  url?: string;
  citace?: string;
}

function parsePrameny(s: string): Pramen[] {
  if (!s.trim()) return [];
  // Split on whitespace + URL detection. Lines often mix URLs with citations.
  const out: Pramen[] = [];
  // First, extract all URLs
  const urls = s.match(/https?:\/\/[^\s,)]+/g) || [];
  for (const u of urls) out.push({ url: u });
  // Plain-text citation: anything not URL
  const plain = s.replace(/https?:\/\/[^\s,)]+/g, '').replace(/\s{2,}/g, ' ').trim();
  if (plain.length > 5) {
    // Split on multiple spaces, period+space, semicolons
    const segs = plain.split(/[;\n]/).map((p) => p.trim()).filter((p) => p.length > 5);
    for (const seg of segs) {
      out.push({ citace: seg });
    }
  }
  return out;
}

// ─── YAML render ────────────────────────────────────────────────────────

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
  okres?: string;
  kraj?: string;
  stav: string;
  prenos?: { do: string };
  chod?: string;
  krok?: string;
  signatura?: string;
  cenaDobova?: string;
  restaurator?: string;
  prameny: Pramen[];
  poznamka?: string;
  zdrojDat: string;
}

function renderMdx(r: Record): string {
  const lines: string[] = [];
  lines.push('---');
  lines.push(`slug: ${yamlString(r.slug)}`);
  // Rok: number if pure 4-digit, string otherwise
  if (/^\d{1,4}$/.test(r.rok)) lines.push(`rok: ${r.rok}`);
  else lines.push(`rok: ${yamlString(r.rok)}`);
  lines.push(`hodinar: ${yamlString(r.hodinar)}`);
  lines.push('puvodniMisto:');
  lines.push(`  obec: ${yamlString(r.obec)}`);
  if (r.cast) lines.push(`  cast: ${yamlString(r.cast)}`);
  if (r.budova) lines.push(`  budova: ${yamlString(r.budova)}`);
  if (r.okres) lines.push(`  okres: ${yamlString(r.okres)}`);
  if (r.kraj) lines.push(`  kraj: ${yamlString(r.kraj)}`);
  lines.push(`  zeme: "CZ"`);
  lines.push(`stav: ${yamlString(r.stav)}`);
  if (r.prenos) {
    lines.push(`prenos:`);
    lines.push(`  do: ${yamlString(r.prenos.do)}`);
  }
  if (r.chod) lines.push(`chod: ${yamlString(r.chod)}`);
  if (r.krok) lines.push(`krok: ${yamlString(r.krok)}`);
  if (r.signatura) lines.push(`signatura: ${yamlString(r.signatura)}`);
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

// ─── Main ───────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const WRITE = args.includes('--write');

  console.log('Fetching Krečmer sheet...');
  const rows = await fetchSheet();
  console.log(`Got ${rows.length} rows from sheet\n`);

  const records: Record[] = [];
  const slugCounts = new Map<string, number>();

  for (const row of rows) {
    // Empty rows
    const allEmpty = row.every((c) => !c || !c.trim());
    if (allEmpty) continue;

    const r: KrecmerRow = {
      rok: (row[0] || '').trim(),
      puvodniMisto: (row[1] || '').trim(),
      puvodniBudova: (row[2] || '').trim(),
      misto: (row[3] || '').trim(),
      stav: (row[4] || '').trim(),
      sbirka: (row[5] || '').trim(),
      cena: (row[6] || '').trim(),
      prameny: (row[7] || '').trim(),
      restaurator: (row[8] || '').trim(),
      col9: (row[9] || '').trim(),
      col10: (row[10] || '').trim(),
      signatura: (row[11] || '').trim(),
      krok: (row[12] || '').trim(),
      poznamka: (row[13] || '').trim(),
    };

    // Skip rows with no obec AND no rok (truly empty)
    if (!r.rok && !r.puvodniMisto && !r.misto) continue;

    const place = parsePlace(r.puvodniMisto || r.misto || 'neznámé');
    const { stav, prenos } = inferStav(r.misto, r.sbirka);
    const chod = inferChod(r.stav);

    // Build slug
    const obecSlug = slugify(place.obec || 'neznamy');
    const rokPart = r.rok ? r.rok.replace(/[^\d-]/g, '') || 'nedatovano' : 'nedatovano';
    let slug = `${rokPart}-${obecSlug}-krecmer`;
    const count = (slugCounts.get(slug) || 0) + 1;
    slugCounts.set(slug, count);
    if (count > 1) slug = `${slug}-${count}`;

    const rec: Record = {
      slug,
      rok: r.rok || '?',
      hodinar: 'vaclav-krecmer',
      obec: place.obec,
      cast: place.cast,
      budova: r.puvodniBudova || undefined,
      stav,
      prenos,
      chod,
      krok: r.krok || undefined,
      signatura: r.signatura || undefined,
      cenaDobova: r.cena || undefined,
      restaurator: r.restaurator || undefined,
      prameny: parsePrameny(r.prameny),
      poznamka: r.poznamka || undefined,
      zdrojDat: 'tabulka_krecmer',
    };
    records.push(rec);
  }

  console.log(`Parsed ${records.length} records.\n`);

  if (!WRITE) {
    // Dry-run: print first 3 + counts
    for (const r of records.slice(0, 3)) {
      console.log('---');
      console.log(renderMdx(r));
    }
    console.log(`(... a ${records.length - 3} dalších)\n`);
    console.log('Run with --write to materialize MDX files.');
    return;
  }

  if (!existsSync('content/soupis-veznich-hodin')) {
    mkdirSync('content/soupis-veznich-hodin', { recursive: true });
  }

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
  console.log(`Written: ${written} new MDX files, ${skipped} already existed (skipped).`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
