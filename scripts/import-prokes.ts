/**
 * Import Prokeš Google Sheet → content/soupis-veznich-hodin/*.mdx
 *
 * Sheet: 1s2PtX1VI-RCD9wkgFzXLORJi796rIg1aX0OHrgMzd2E
 *   "Věžní hodiny Jana Prokeše a jeho žáků"
 *
 * Markdown source: tmp/prokes-raw.md (saved manually from personal Drive
 * MCP read_file_content output; SA does not have access).
 *
 * Schema (20 cols):
 *   #, Místo Obec, Okres/Kraj, Původní umístění, Poloha, Typ budovy,
 *   Autor, Vznik/Instalace, Vznik/Instalace, Cena Zlatých, Krok,
 *   signováno, existuje, Stav, Datum restaurování, Restaurátor,
 *   Umístění dnes, Vlastník, Poznámka, Zdroj
 *
 * Sons mapped:
 *   "Jan Prokeš"        → jan-prokes
 *   "Jan Prokeš jr."    → jan-prokes-jr (Kopidlno)
 *   "Leopold Prokeš"    → leopold-prokes (Jičín)
 *   "Josef Prokeš"      → josef-prokes (Sobotka)
 *
 * Slug format: <rok>-<obec>-prokes(-jr|-leopold|-josef)
 *
 * Special handling:
 *   - Bychory 1868 (#15) — existing record from earlier stub; merge instead of overwrite.
 *   - Some rows have lat/lon in "Poloha" column — parse DMS or decimal.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const RAW_PATH = 'tmp/prokes-raw.md';

interface ProkesRow {
  rok: string;
  obec: string;
  okresKraj: string;
  budova: string;
  poloha: string;
  typBudovy: string;
  autor: string;
  cena: string;
  krok: string;
  signovano: string;
  existuje: string;
  stav: string;
  datumRestaur: string;
  restaurator: string;
  umisteniDnes: string;
  vlastnik: string;
  poznamka: string;
  zdroj: string;
}

interface Pramen {
  url?: string;
  citace?: string;
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
  souradnice?: [number, number];
  stav: string;
  prenos?: { do: string };
  chod?: string;
  krok?: string;
  signatura?: string;
  cenaDobova?: string;
  restaurator?: string;
  rokRestaurovani?: string;
  prameny: Pramen[];
  poznamka?: string;
  zdrojDat: string;
  relatedKarty?: string[];
}

// ─── Markdown table parser ──────────────────────────────────────────────

function parseMarkdownRows(text: string): string[][] {
  const rows: string[][] = [];
  for (const line of text.split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
    if (cells.every((c) => /^[:\-\s]*$/.test(c))) continue;
    rows.push(cells);
  }
  return rows;
}

// ─── DMS / decimal coords ───────────────────────────────────────────────

function parseCoords(s: string): [number, number] | undefined {
  if (!s.trim()) return undefined;
  // Decimal: "49.9043625N, 14.7827322E"
  let m = s.match(/(-?\d+\.\d+)\s*([NS])\s*,\s*(-?\d+\.\d+)\s*([EW])/i);
  if (m) {
    let lat = parseFloat(m[1]);
    let lon = parseFloat(m[3]);
    if (m[2].toUpperCase() === 'S') lat = -lat;
    if (m[4].toUpperCase() === 'W') lon = -lon;
    return [lat, lon];
  }
  // DMS: "50°33′29.76″ N, 15°2′8.47″ E" or with quotes/primes mixed
  // Normalize quote chars
  const norm = s.replace(/[′']/g, "'").replace(/[″"″]/g, '"').replace(/\s+/g, ' ');
  m = norm.match(/(\d+)°(\d+)'([\d.]+)"\s*([NS]),?\s*(\d+)°(\d+)'([\d.]+)"\s*([EW])/i);
  if (m) {
    const lat = (parseInt(m[1]) + parseInt(m[2]) / 60 + parseFloat(m[3]) / 3600) * (m[4].toUpperCase() === 'S' ? -1 : 1);
    const lon = (parseInt(m[5]) + parseInt(m[6]) / 60 + parseFloat(m[7]) / 3600) * (m[8].toUpperCase() === 'W' ? -1 : 1);
    return [lat, lon];
  }
  return undefined;
}

// ─── Author mapping ─────────────────────────────────────────────────────

function autorToSlug(autor: string): string {
  const a = autor.trim();
  if (/jan prokeš jr\.|jan prokeš ml\.|prokeš jr\.|prokeš ml\./i.test(a)) return 'jan-prokes-jr';
  if (/leopold prokeš/i.test(a)) return 'leopold-prokes';
  if (/josef prokeš/i.test(a)) return 'josef-prokes';
  if (/jan prokeš|prokeš/i.test(a)) return 'jan-prokes';
  return 'jan-prokes'; // fallback
}

// ─── Misc helpers ───────────────────────────────────────────────────────

function slugify(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function splitObec(s: string): { obec: string; cast?: string } {
  // "Loukov (u Mnichova Hradiště)" → obec="Loukov", drop parens
  // "Praha 10, Praha" → leave as is (kraj is separate column)
  // "Hradec Králové - Pouchov" → obec="Hradec Králové", cast="Pouchov"
  // "Studenec - Zálesní Lhota (Hüttendorf)" → obec="Studenec", cast="Zálesní Lhota"
  let obec = s.trim();
  let cast: string | undefined;
  // Strip parens (e.g. "(Hüttendorf)" alternative German name)
  obec = obec.replace(/\s*\([^)]*\)\s*$/, '').trim();
  // Split on " - "
  if (obec.includes(' - ')) {
    const [a, b] = obec.split(' - ', 2);
    obec = a.trim();
    cast = b.trim();
  }
  return { obec, cast };
}

function splitOkresKraj(s: string): { okres?: string; kraj?: string } {
  // "Mladá Boleslav, Středočeský"
  if (!s) return {};
  const parts = s.split(',').map((p) => p.trim());
  return { okres: parts[0], kraj: parts[1] };
}

function inferStav(existuje: string, stav: string, umisteniDnes: string): {
  stav: 'in_situ' | 'preneseno' | 'ztracene' | 'znicene' | 'neznamy';
  prenos?: { do: string };
} {
  const ud = umisteniDnes.trim().toLowerCase();
  const sl = stav.trim().toLowerCase();
  const ex = existuje.trim();
  if (ex === '0' || sl.includes('zaniklý') || sl.includes('zničen')) return { stav: 'znicene' };
  if (sl.includes('ztracen')) return { stav: 'ztracene' };
  if (ud.includes('na původním místě') || ud.includes('vystaven na radnici')) return { stav: 'in_situ' };
  if (ud && !ud.startsWith('-')) {
    return { stav: 'preneseno', prenos: { do: umisteniDnes.trim() } };
  }
  if (ex === '1') return { stav: 'in_situ' }; // default if exists but no umisteniDnes
  return { stav: 'neznamy' };
}

function inferChod(stav: string): string | undefined {
  const s = stav.trim().toLowerCase();
  if (!s || s === '-') return undefined;
  if (s.includes('v provozu') || s.includes('funkční')) return 'v_chodu';
  if (s.includes('restaurován') && !s.includes('nerestaur')) return 'restaurovano';
  if (s.includes('nerestaur')) return 'nefunkcni';
  if (s.includes('odložený') || s.includes('zachován')) return 'nefunkcni';
  if (s.includes('zaniklý') || s.includes('zničen')) return 'znicene';
  if (s.includes('ztracen')) return 'znicene';
  if (s.includes('demontován')) return 'nefunkcni';
  return undefined;
}

function parsePrameny(s: string): Pramen[] {
  if (!s.trim()) return [];
  const out: Pramen[] = [];
  const urls = s.match(/https?:\/\/[^\s,)]+/g) || [];
  for (const u of urls) out.push({ url: u });
  const plain = s.replace(/https?:\/\/[^\s,)]+/g, '').replace(/\s{2,}/g, ' ').trim();
  if (plain.length > 10) {
    // Split only on semicolon or strong newline-like markers, NOT every period
    const segs = plain.split(/\s*[;]\s*/).map((p) => p.trim()).filter((p) => p.length > 10);
    if (segs.length === 0) {
      out.push({ citace: plain });
    } else {
      for (const seg of segs) out.push({ citace: seg });
    }
  }
  return out;
}

function clean(v: string | undefined): string | undefined {
  if (!v) return undefined;
  const t = v.trim();
  if (!t || t === '?' || t === '-' || t === 'neznámo' || t === 'nečitelná') return undefined;
  return t;
}

function yamlString(s: string): string {
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
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
  if (r.okres) lines.push(`  okres: ${yamlString(r.okres)}`);
  if (r.kraj) lines.push(`  kraj: ${yamlString(r.kraj)}`);
  lines.push(`  zeme: "CZ"`);
  if (r.souradnice) {
    lines.push(`souradnice: [${r.souradnice[0].toFixed(6)}, ${r.souradnice[1].toFixed(6)}]`);
  }
  lines.push(`stav: ${yamlString(r.stav)}`);
  if (r.prenos) {
    lines.push('prenos:');
    lines.push(`  do: ${yamlString(r.prenos.do)}`);
  }
  if (r.chod) lines.push(`chod: ${yamlString(r.chod)}`);
  if (r.krok) lines.push(`krok: ${yamlString(r.krok)}`);
  if (r.signatura) lines.push(`signatura: ${yamlString(r.signatura)}`);
  if (r.cenaDobova) lines.push(`cenaDobova: ${yamlString(r.cenaDobova)}`);
  if (r.restaurator) lines.push(`restaurator: ${yamlString(r.restaurator)}`);
  if (r.rokRestaurovani) lines.push(`rokRestaurovani: ${yamlString(r.rokRestaurovani)}`);
  if (r.prameny.length) {
    lines.push('prameny:');
    for (const p of r.prameny) {
      lines.push('  -');
      if (p.url) lines.push(`    url: ${yamlString(p.url)}`);
      if (p.citace) lines.push(`    citace: ${yamlString(p.citace)}`);
    }
  }
  if (r.relatedKarty?.length) {
    lines.push('relatedKarty:');
    for (const k of r.relatedKarty) lines.push(`  - ${yamlString(k)}`);
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
  const WRITE = process.argv.includes('--write');
  const text = readFileSync(RAW_PATH, 'utf-8');
  const rawRows = parseMarkdownRows(text);
  // Skip header (first row is column names)
  const dataRows = rawRows.filter((r) => r[0] !== '' && /^\d+$/.test(r[0]));
  console.log(`Parsed ${dataRows.length} data rows.\n`);

  const records: Record[] = [];
  const slugCounts = new Map<string, number>();
  const skipped: string[] = [];

  for (const row of dataRows) {
    const r: ProkesRow = {
      rok: row[7] || row[8] || '',
      obec: row[1] || '',
      okresKraj: row[2] || '',
      budova: row[3] || '',
      poloha: row[4] || '',
      typBudovy: row[5] || '',
      autor: row[6] || '',
      cena: row[9] || '',
      krok: row[10] || '',
      signovano: row[11] || '',
      existuje: row[12] || '',
      stav: row[13] || '',
      datumRestaur: row[14] || '',
      restaurator: row[15] || '',
      umisteniDnes: row[16] || '',
      vlastnik: row[17] || '',
      poznamka: row[18] || '',
      zdroj: row[19] || '',
    };

    if (!r.obec) continue; // Skip empty
    const place = splitObec(r.obec);
    const ok = splitOkresKraj(r.okresKraj);
    const hodinar = autorToSlug(r.autor);
    const { stav, prenos } = inferStav(r.existuje, r.stav, r.umisteniDnes);
    const chod = inferChod(r.stav);
    const souradnice = parseCoords(r.poloha);

    const obecSlug = slugify(place.obec || 'neznamy');
    const rokPart = r.rok ? r.rok.replace(/[^\d]/g, '').slice(0, 4) || 'nedatovano' : 'nedatovano';
    const suffix =
      hodinar === 'jan-prokes-jr' ? 'prokes-jr' :
      hodinar === 'leopold-prokes' ? 'prokes-leopold' :
      hodinar === 'josef-prokes' ? 'prokes-josef' :
      'prokes';
    let slug = `${rokPart}-${obecSlug}-${suffix}`;
    const count = (slugCounts.get(slug) || 0) + 1;
    slugCounts.set(slug, count);
    if (count > 1) slug = `${slug}-${count}`;

    // Cross-link: existing Bychory record + Hodinárium kusy
    const relatedKarty: string[] = [];
    if (slug === '1868-bychory-prokes' && existsSync(`content/soupis-veznich-hodin/${slug}.mdx`)) {
      // Already exists — merge instead. For now: skip and log to keep manual stub.
      skipped.push(`${slug}: existuje, ponecháno původní`);
      continue;
    }

    // Trim signature — strip extraneous text
    let sig = r.signovano.trim();
    if (sig.toLowerCase() === 'nečitelná' || sig === '-') sig = '';

    // Combine vlastnik into prenos.do if applicable
    let mergedPrenos = prenos;
    if (r.vlastnik && stav === 'preneseno' && mergedPrenos) {
      // Don't merge — keep prenos.do clean
    }

    // Format cena: skip if "?", append " zl." if number-only
    let cenaFormatted: string | undefined;
    const cenaT = clean(r.cena);
    if (cenaT) {
      if (/^\d/.test(cenaT) && !cenaT.toLowerCase().includes('zl') && !cenaT.toLowerCase().includes('fl')) {
        cenaFormatted = cenaT + ' zl.';
      } else {
        cenaFormatted = cenaT;
      }
    }

    records.push({
      slug,
      rok: r.rok || '?',
      hodinar,
      obec: place.obec,
      cast: place.cast,
      budova: clean(r.budova),
      okres: ok.okres,
      kraj: ok.kraj,
      souradnice,
      stav,
      prenos: mergedPrenos,
      chod,
      krok: clean(r.krok),
      signatura: clean(sig),
      cenaDobova: cenaFormatted,
      restaurator: clean(r.restaurator),
      rokRestaurovani: clean(r.datumRestaur),
      prameny: parsePrameny(r.zdroj),
      poznamka: clean(r.poznamka),
      zdrojDat: 'tabulka_prokes',
    });
  }

  console.log(`Records to write: ${records.length}`);
  if (skipped.length) {
    console.log(`Skipped: ${skipped.length}`);
    for (const s of skipped) console.log(`  ${s}`);
  }

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
  let alreadyExists = 0;
  for (const r of records) {
    const path = `content/soupis-veznich-hodin/${r.slug}.mdx`;
    if (existsSync(path)) {
      alreadyExists++;
      continue;
    }
    writeFileSync(path, renderMdx(r), 'utf-8');
    written++;
  }
  console.log(`Written: ${written} new MDX, ${alreadyExists} already existed.`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
