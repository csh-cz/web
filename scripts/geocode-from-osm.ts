/**
 * Geocode soupis-veznich-hodin records by spatial-fuzzy matching against
 * OSM POI dataset (tmp/osm-cz-pois.json, pulled by osm-pull-cz-pois.ts).
 *
 * Algorithm:
 *   1. Resolve obec → center coordinates (Nominatim, with diacritic retry)
 *   2. Find POIs within RADIUS km of obec center
 *   3. Fuzzy-match POI.name against record.budova
 *   4. Best match (score ≥ THRESHOLD): use POI.lat/lon, store osmId
 *      Otherwise: use obec center, mark souradnicePribl=true
 *
 * Cache: tmp/obec-coords-cache.json — Nominatim obec lookups
 *
 * Usage:
 *   pnpm tsx scripts/geocode-from-osm.ts             # dry-run
 *   pnpm tsx scripts/geocode-from-osm.ts --write     # patch MDX frontmatter
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const CONTENT_DIR = 'content/soupis-veznich-hodin';
const POIS_PATH = 'tmp/osm-cz-pois.json';
const OBEC_CACHE_PATH = 'tmp/obec-coords-cache.json';
const RADIUS_KM = 4; // search POIs within 4 km of obec center
const SCORE_THRESHOLD = 60; // fuzzy match minimum
const USER_AGENT = 'CSH-Hodinarium/1.0 (admin@horologie.cz)';

interface POI {
  osmId: string;
  type: string;
  name: string;
  lat: number;
  lon: number;
  addrCity?: string;
  wikidata?: string;
}

interface Frontmatter {
  slug: string;
  rok: number | string;
  hodinar?: string;
  puvodniMisto: { obec: string; budova?: string; cast?: string; [k: string]: unknown };
  souradnice?: [number, number];
  souradnicePribl?: boolean;
  osmId?: string;
  wikidataId?: string;
  [k: string]: unknown;
}

// ─── Helpers ────────────────────────────────────────────────────────────

function norm(s: string): string {
  return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function haversineKm(la1: number, lo1: number, la2: number, lo2: number): number {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(la2 - la1);
  const dLon = toRad(lo2 - lo1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(la1)) * Math.cos(toRad(la2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function fuzzyScore(query: string, target: string): number {
  const q = norm(query);
  const t = norm(target);
  if (!q || !t) return 0;
  // Avoid matches against very short OSM names (single-letter labels, abbreviations)
  if (t.length < 5) return 0;
  if (q === t) return 100;
  // Substring: only count if shorter is significant fraction of longer
  // (avoids "B" matching everything)
  if (t.includes(q) && q.length >= 5 && q.length / t.length > 0.4) return 85;
  if (q.includes(t) && t.length >= 5 && t.length / q.length > 0.4) return 80;
  // Multi-word overlap (Czech-style "kostel sv. Václava" vs "Kostel svatého Václava")
  const qw = new Set(q.split(' ').filter((w) => w.length >= 4));
  const tw = new Set(t.split(' ').filter((w) => w.length >= 4));
  if (qw.size === 0 || tw.size === 0) return 0;
  let overlap = 0;
  for (const w of qw) if (tw.has(w)) overlap++;
  // Require at least one significant word match
  if (overlap === 0) return 0;
  const score = (overlap / Math.max(qw.size, tw.size)) * 100;
  return Math.round(score);
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

// ─── Nominatim with diacritic-tolerance ─────────────────────────────────

interface ObecCoords {
  obec: string;
  lat: number;
  lon: number;
  display_name: string;
  source: 'nominatim' | 'manual';
}

let obecCache: Record<string, ObecCoords | null> = {};
try {
  obecCache = JSON.parse(readFileSync(OBEC_CACHE_PATH, 'utf-8'));
} catch {}

function saveObecCache() {
  if (!existsSync('tmp')) mkdirSync('tmp', { recursive: true });
  writeFileSync(OBEC_CACHE_PATH, JSON.stringify(obecCache, null, 2));
}

async function resolveObec(obec: string, hint?: string): Promise<ObecCoords | null> {
  const cacheKey = obec + (hint ? '|' + hint : '');
  if (cacheKey in obecCache) return obecCache[cacheKey];

  // Try original, then diacritic-stripped, then with hint (e.g. okres)
  const variants = [obec];
  const stripped = obec.normalize('NFD').replace(/\p{M}/gu, '');
  if (stripped !== obec) variants.push(stripped);
  if (hint) {
    variants.push(`${obec}, ${hint}`);
    if (stripped !== obec) variants.push(`${stripped}, ${hint}`);
  }

  for (const q of variants) {
    const params = new URLSearchParams({
      q: `${q}, Czech Republic`,
      format: 'json',
      limit: '3',
      'accept-language': 'cs',
      countrycodes: 'cz',
    });
    const r = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!r.ok) {
      await sleep(1100);
      continue;
    }
    const arr = (await r.json()) as { lat: string; lon: string; display_name: string; class?: string; addresstype?: string }[];
    // Prefer administrative results (village/town)
    const admin = arr.find((a) => a.class === 'boundary' || a.addresstype === 'village' || a.addresstype === 'town' || a.addresstype === 'city');
    const pick = admin || arr[0];
    if (pick) {
      const result: ObecCoords = {
        obec,
        lat: parseFloat(pick.lat),
        lon: parseFloat(pick.lon),
        display_name: pick.display_name,
        source: 'nominatim',
      };
      obecCache[cacheKey] = result;
      saveObecCache();
      await sleep(1100);
      return result;
    }
    await sleep(1100);
  }
  obecCache[cacheKey] = null;
  saveObecCache();
  return null;
}

// ─── Frontmatter patch ──────────────────────────────────────────────────

function parseFile(path: string): { fm: Frontmatter; raw: string; fmEnd: number } | null {
  const text = readFileSync(path, 'utf-8');
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  const fmText = text.slice(3, end);
  try {
    const fm = yaml.load(fmText) as Frontmatter;
    return { fm, raw: text, fmEnd: end };
  } catch {
    return null;
  }
}

function patchFile(
  path: string,
  lat: number,
  lon: number,
  pribl: boolean,
  osmId?: string,
  wikidataId?: string,
) {
  const parsed = parseFile(path);
  if (!parsed) return;
  const { raw, fmEnd } = parsed;
  let fmText = raw.slice(3, fmEnd);

  // Remove any existing souradnice/souradnicePribl/osmId/wikidataId lines
  fmText = fmText
    .split('\n')
    .filter((l) => !/^(souradnice|souradnicePribl|osmId|wikidataId):/.test(l.trimStart()))
    .join('\n');

  // Insert before puvodniMisto block (or after stav line)
  const lines = fmText.split('\n');
  const insertIdx = lines.findIndex((l) => /^stav:/.test(l.trimStart()));
  const newLines: string[] = [
    `souradnice: [${lat.toFixed(6)}, ${lon.toFixed(6)}]`,
  ];
  if (pribl) newLines.push('souradnicePribl: true');
  if (osmId) newLines.push(`osmId: "${osmId}"`);
  if (wikidataId) newLines.push(`wikidataId: "${wikidataId}"`);

  if (insertIdx >= 0) {
    lines.splice(insertIdx, 0, ...newLines);
  } else {
    lines.push(...newLines);
  }
  const newFm = lines.join('\n');
  const newRaw = `---${newFm}\n---${raw.slice(fmEnd + 4)}`;
  writeFileSync(path, newRaw, 'utf-8');
}

// ─── Main ───────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const WRITE = args.includes('--write');

  console.log('Loading OSM POIs...');
  const pois: POI[] = JSON.parse(readFileSync(POIS_PATH, 'utf-8'));
  console.log(`Loaded ${pois.length} POIs`);

  // Build spatial bucket index by lat-lon grid for fast nearest-neighbor
  const buckets = new Map<string, POI[]>();
  for (const p of pois) {
    const key = `${Math.floor(p.lat * 10)}:${Math.floor(p.lon * 10)}`;
    const list = buckets.get(key) || [];
    list.push(p);
    buckets.set(key, list);
  }

  function nearbyPois(lat: number, lon: number, radiusKm: number): POI[] {
    // Check 9 surrounding buckets (~11 km lat resolution = 0.1° lat ~11km)
    const out: POI[] = [];
    const cellLat = Math.floor(lat * 10);
    const cellLon = Math.floor(lon * 10);
    const span = Math.ceil(radiusKm / 11);
    for (let dy = -span; dy <= span; dy++) {
      for (let dx = -span; dx <= span; dx++) {
        const key = `${cellLat + dy}:${cellLon + dx}`;
        const arr = buckets.get(key);
        if (!arr) continue;
        for (const p of arr) {
          if (haversineKm(lat, lon, p.lat, p.lon) <= radiusKm) out.push(p);
        }
      }
    }
    return out;
  }

  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
  console.log(`Processing ${files.length} records...\n`);

  let exact = 0;       // POI matched precisely
  let approx = 0;      // only obec center (approximate)
  let missed = 0;      // could not resolve obec at all
  let skipped = 0;     // already had souradnice
  const log: string[] = [];

  for (const f of files) {
    const path = join(CONTENT_DIR, f);
    const parsed = parseFile(path);
    if (!parsed) continue;
    const { fm } = parsed;

    if (fm.souradnice) {
      skipped++;
      continue;
    }

    const obec = fm.puvodniMisto.obec;
    const budova = fm.puvodniMisto.budova;
    const okres = (fm.puvodniMisto as { okres?: string }).okres;

    const obecCoords = await resolveObec(obec, okres);
    if (!obecCoords) {
      missed++;
      log.push(`✗ ${fm.slug}: nelze najít obec "${obec}"`);
      continue;
    }

    let bestMatch: { poi: POI; score: number; distKm: number } | null = null;
    if (budova) {
      const candidates = nearbyPois(obecCoords.lat, obecCoords.lon, RADIUS_KM);
      for (const poi of candidates) {
        const score = fuzzyScore(budova, poi.name);
        if (score < SCORE_THRESHOLD) continue;
        const distKm = haversineKm(obecCoords.lat, obecCoords.lon, poi.lat, poi.lon);
        // Prefer higher score, then closer
        const composite = score - distKm * 2; // 2 points per km penalty
        if (!bestMatch || composite > bestMatch.score - bestMatch.distKm * 2) {
          bestMatch = { poi, score, distKm };
        }
      }
    }

    if (bestMatch) {
      exact++;
      log.push(`✓ ${fm.slug.padEnd(35)} → ${bestMatch.poi.name.slice(0, 30).padEnd(30)} (${bestMatch.poi.type}, score=${bestMatch.score}, ${bestMatch.distKm.toFixed(1)}km)`);
      if (WRITE) {
        patchFile(path, bestMatch.poi.lat, bestMatch.poi.lon, false, bestMatch.poi.osmId, bestMatch.poi.wikidata);
      }
    } else {
      approx++;
      log.push(`~ ${fm.slug.padEnd(35)} → obec center "${obec}" (no POI match)`);
      if (WRITE) {
        patchFile(path, obecCoords.lat, obecCoords.lon, true);
      }
    }
  }

  console.log('Per-record:');
  for (const l of log) console.log('  ' + l);
  console.log(`\n${exact} exact (POI match), ${approx} approximate (obec center), ${missed} missed (obec not found), ${skipped} already had coords`);
  if (!WRITE) console.log('\n(Dry-run — no files modified. Run with --write to patch MDX frontmatter.)');
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
