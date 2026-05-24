/**
 * Geocode tower-clock records in content/soupis-veznich-hodin/.
 *
 * Strategy (in order):
 *   1. If `souradnice` already set → skip.
 *   2. Try OSM Overpass POI lookup matching budova + obec exactly.
 *   3. Fallback to Nominatim with structured query.
 *   4. If still nothing, log to tmp/geocode-misses.txt for manual review.
 *
 * Cache: tmp/geocode-cache.json keyed by `<budova>|<obec>` to avoid
 * re-querying. Manual override possible by editing the cache file.
 *
 * Rate limits respected:
 *   - Nominatim: 1 req/s (User-Agent required)
 *   - Overpass: throttled at 2 req/s
 *
 * Usage:
 *   pnpm tsx scripts/geocode-soupis.ts             # dry-run, prints what would change
 *   pnpm tsx scripts/geocode-soupis.ts --write     # patches MDX frontmatter
 *   pnpm tsx scripts/geocode-soupis.ts --file <slug>  # only one file
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

const CONTENT_DIR = 'content/soupis-veznich-hodin';
const CACHE_PATH = 'tmp/geocode-cache.json';
const MISS_PATH = 'tmp/geocode-misses.txt';
const USER_AGENT = 'CSH-Hodinarium/1.0 (admin@horologie.cz)';

interface CacheEntry {
  query: string;
  source: 'osm-overpass' | 'nominatim' | 'manual' | 'miss';
  lat?: number;
  lon?: number;
  osmId?: string;
  pribl?: boolean;
  fetchedAt: string;
}

function loadCache(): Record<string, CacheEntry> {
  try {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function saveCache(cache: Record<string, CacheEntry>) {
  if (!existsSync('tmp')) mkdirSync('tmp', { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
}

function cacheKey(budova: string | undefined, obec: string): string {
  return `${(budova || '').trim()}|${obec.trim()}`;
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

// ─── OSM Overpass lookup ────────────────────────────────────────────────

async function overpassChurch(name: string, obec: string): Promise<CacheEntry | null> {
  // Build a fuzzy church/POI query in OSM around the obec
  // First find obec via Nominatim to get bbox, then query Overpass within that bbox
  const obecCoords = await nominatimQuery(obec, true);
  if (!obecCoords) return null;
  const [lat, lon] = [obecCoords.lat!, obecCoords.lon!];
  const bbox = `${lat - 0.05},${lon - 0.07},${lat + 0.05},${lon + 0.07}`;

  // Loose match: any place_of_worship / castle / townhall / cathedral with a name
  // We'll then string-match the name client-side.
  const query = `
    [out:json][timeout:25];
    (
      way["amenity"="place_of_worship"]["name"](${bbox});
      relation["amenity"="place_of_worship"]["name"](${bbox});
      way["historic"="castle"]["name"](${bbox});
      way["amenity"="townhall"]["name"](${bbox});
      way["building"="cathedral"]["name"](${bbox});
    );
    out center tags;
  `;
  const r = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
    body: 'data=' + encodeURIComponent(query),
  });
  if (!r.ok) return null;
  const data = (await r.json()) as { elements: { id: number; type: string; center?: { lat: number; lon: number }; lat?: number; lon?: number; tags: Record<string, string> }[] };

  // Normalize names for fuzzy match (NFD strip + lowercase + alphanum)
  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

  const target = norm(name);
  let best: { score: number; el: typeof data.elements[0] } | null = null;
  for (const el of data.elements) {
    const n = norm(el.tags.name || '');
    if (!n) continue;
    let score = 0;
    if (n === target) score = 100;
    else if (n.includes(target) || target.includes(n)) score = 80;
    else {
      // Word-overlap heuristic
      const tw = target.match(/.{4,}/g) || [];
      const nw = n.match(/.{4,}/g) || [];
      const overlap = tw.filter((w) => nw.includes(w)).length;
      if (overlap > 0) score = 40 + overlap * 10;
    }
    if (score > 0 && (!best || score > best.score)) best = { score, el };
  }
  if (!best || best.score < 60) return null;
  const el = best.el;
  const elLat = el.center?.lat ?? el.lat;
  const elLon = el.center?.lon ?? el.lon;
  if (elLat === undefined || elLon === undefined) return null;
  return {
    query: `${name} / ${obec}`,
    source: 'osm-overpass',
    lat: elLat,
    lon: elLon,
    osmId: `${el.type}/${el.id}`,
    pribl: false,
    fetchedAt: new Date().toISOString(),
  };
}

// ─── Nominatim fallback ─────────────────────────────────────────────────

async function nominatimQuery(query: string, _isObec = false): Promise<CacheEntry | null> {
  // Try the original query first; on miss, try diacritic-stripped variant
  // (Krečmer table writes "Bychory" but OSM has "Býchory")
  const variants = [query];
  const stripped = query.normalize('NFD').replace(/\p{M}/gu, '');
  if (stripped !== query) variants.push(stripped);

  for (const q of variants) {
    const params = new URLSearchParams({
      q: `${q}, Czech Republic`,
      format: 'json',
      limit: '1',
      'accept-language': 'cs',
    });
    const r = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!r.ok) continue;
    const data = (await r.json()) as { lat: string; lon: string; display_name: string }[];
    if (data[0]) {
      return {
        query,
        source: 'nominatim',
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        pribl: true,
        fetchedAt: new Date().toISOString(),
      };
    }
    await sleep(1100); // rate limit between variants
  }
  return null;
}

// ─── Frontmatter helpers ────────────────────────────────────────────────

interface Frontmatter {
  slug: string;
  rok: number | string;
  hodinar?: string;
  puvodniMisto: { obec: string; budova?: string; [k: string]: unknown };
  souradnice?: [number, number];
  souradnicePribl?: boolean;
  osmId?: string;
  [k: string]: unknown;
}

function parseFile(path: string): { fm: Frontmatter; raw: string; bodyStart: number } | null {
  const text = readFileSync(path, 'utf-8');
  if (!text.startsWith('---')) return null;
  const end = text.indexOf('\n---', 3);
  if (end < 0) return null;
  const fmText = text.slice(3, end);
  try {
    const fm = yaml.load(fmText) as Frontmatter;
    return { fm, raw: text, bodyStart: end + 4 };
  } catch {
    return null;
  }
}

function patchFile(path: string, lat: number, lon: number, pribl: boolean, osmId?: string) {
  const parsed = parseFile(path);
  if (!parsed) return;
  let { raw } = parsed;
  const fmEnd = raw.indexOf('\n---', 3);
  let fmText = raw.slice(3, fmEnd);

  // Remove existing souradnice / souradnicePribl / osmId lines
  fmText = fmText
    .split('\n')
    .filter((l) => !/^(souradnice|souradnicePribl|osmId):/.test(l.trim()))
    .join('\n');

  // Add new fields after slug or rok
  const lines = fmText.split('\n');
  const insertIdx = lines.findIndex((l) => /^puvodniMisto:/.test(l.trim()));
  const newLines = [
    `souradnice: [${lat.toFixed(6)}, ${lon.toFixed(6)}]`,
    pribl ? 'souradnicePribl: true' : null,
    osmId ? `osmId: "${osmId}"` : null,
  ].filter(Boolean) as string[];

  if (insertIdx > 0) {
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
  const FILE_FILTER = args.includes('--file') ? args[args.indexOf('--file') + 1] : null;

  const cache = loadCache();
  const misses: string[] = [];
  let processed = 0;
  let geocoded = 0;
  let cached = 0;
  let skipped = 0;

  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));

  for (const f of files) {
    if (FILE_FILTER && !f.includes(FILE_FILTER)) continue;
    const path = join(CONTENT_DIR, f);
    const parsed = parseFile(path);
    if (!parsed) continue;
    const { fm } = parsed;
    processed++;
    if (fm.souradnice) {
      skipped++;
      continue;
    }

    const key = cacheKey(fm.puvodniMisto.budova, fm.puvodniMisto.obec);
    let entry: CacheEntry | undefined = cache[key];

    if (!entry) {
      console.log(`Geocoding: ${key}`);
      // Try OSM Overpass first if we have budova
      if (fm.puvodniMisto.budova) {
        entry = (await overpassChurch(fm.puvodniMisto.budova, fm.puvodniMisto.obec)) || undefined;
        await sleep(500);
      }
      // Fallback: Nominatim with full structured query
      if (!entry) {
        const q = [fm.puvodniMisto.budova, fm.puvodniMisto.obec, fm.puvodniMisto.okres]
          .filter(Boolean)
          .join(', ');
        entry = (await nominatimQuery(q)) || undefined;
        await sleep(1100); // Nominatim 1 req/s rate limit
      }
      // Fallback 2: Nominatim obec only (+ okres/kraj) — village-level, approximate.
      // Catches entries whose budova name doesn't match OSM but whose obec is clear.
      if (!entry) {
        const qObec = [fm.puvodniMisto.obec, fm.puvodniMisto.okres, fm.puvodniMisto.kraj]
          .filter(Boolean)
          .join(', ');
        if (qObec) {
          entry = (await nominatimQuery(qObec)) || undefined;
          await sleep(1100);
        }
      }
      if (!entry) {
        entry = { query: key, source: 'miss', fetchedAt: new Date().toISOString() };
      }
      cache[key] = entry;
      saveCache(cache);
    } else {
      cached++;
    }

    if (entry.source === 'miss' || entry.lat === undefined || entry.lon === undefined) {
      misses.push(`${fm.slug}: ${key}`);
      continue;
    }
    geocoded++;
    console.log(
      `  ✓ ${fm.slug} → [${entry.lat.toFixed(5)}, ${entry.lon.toFixed(5)}] (${entry.source}${entry.pribl ? ', přibližné' : ''})`,
    );
    if (WRITE) {
      patchFile(path, entry.lat, entry.lon, !!entry.pribl, entry.osmId);
    }
  }

  console.log(`\nProcessed: ${processed}, geocoded: ${geocoded}, cached: ${cached}, already had coords: ${skipped}, missed: ${misses.length}`);
  if (misses.length) {
    if (!existsSync('tmp')) mkdirSync('tmp', { recursive: true });
    writeFileSync(MISS_PATH, misses.join('\n') + '\n', 'utf-8');
    console.log(`Misses logged to ${MISS_PATH}`);
  }
  if (!WRITE) {
    console.log('\n(Dry-run — no files modified. Run with --write to patch MDX frontmatter.)');
  }
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
