/**
 * Pull all relevant POIs from OpenStreetMap Czech Republic via Overpass API.
 *
 * Targets: anything that COULD host a tower clock — churches, castles,
 * town halls, cathedrals, monasteries, plus explicit clock-tower POIs.
 *
 * Output: tmp/osm-cz-pois.json — array of:
 *   { osmId, name, lat, lon, obec, addrCity, type, tags }
 *
 * Idempotent: cached by date in filename, refresh ad-hoc.
 *
 * Free, no API key. Overpass rate limit: respect it (one-shot query).
 */
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';

/**
 * Pulled countries: CZ + sousedi + UK + UA + IT (Habsburg historický kontext
 * + cíle exportu — Krečmerovy hodiny v UK private sbírkách, Schröer Bocholt
 * Německo / Švýcarsko, Kolomyja UA, atd.)
 *
 * V dotazu nedáváme `area[ISO3166-1]` per-country (omezuje výkon Overpassu),
 * ale bbox velkých rozměrů. Filtr na country podle `addr:country` na klientu
 * po stažení.
 */
/** Pulled countries:
 * - CZ: domácí
 * - DE, AT, PL, SK: bezprostřední sousedi
 * - CH: časté cíle exportu (Schröer Bocholt, Beyer Zürich, Patek Geneve)
 * - GB: Krečmerovy hodiny v UK private sbírkách (Time Works UK)
 * - HU, SI, IT: bývalé Rakousko-Uhersko, kulturní kontext
 * - UA, RO: také bývalé Rakousko-Uhersko (Krečmer Kolomyja 1915, sedmihradské orloje)
 */
const COUNTRIES = ['CZ', 'DE', 'AT', 'CH', 'SK', 'PL', 'GB', 'UA', 'IT', 'HU', 'SI', 'RO'];

function buildQuery(country: string): string {
  return `
[out:json][timeout:900];
area["ISO3166-1"="${country}"]->.cc;
(
  way["amenity"="place_of_worship"]["name"](area.cc);
  relation["amenity"="place_of_worship"]["name"](area.cc);
  way["building"="church"]["name"](area.cc);
  way["building"="cathedral"]["name"](area.cc);
  way["building"="chapel"]["name"](area.cc);
  way["building"="monastery"]["name"](area.cc);
  way["historic"="castle"]["name"](area.cc);
  relation["historic"="castle"]["name"](area.cc);
  way["building"="castle"]["name"](area.cc);
  way["amenity"="townhall"]["name"](area.cc);
  way["building"="townhall"]["name"](area.cc);
  way["building"="civic"]["name"](area.cc);
  way["tower:type"="clock"](area.cc);
  node["tower:type"="clock"](area.cc);
  way["man_made"="clock"](area.cc);
  node["man_made"="clock"](area.cc);
);
out center tags;
`;
}

interface POI {
  osmId: string;             // way/123 or node/456 or relation/789
  type: string;              // 'church' | 'castle' | 'townhall' | 'clock_tower' | 'other'
  name: string;
  lat: number;
  lon: number;
  addrCity?: string;
  addrStreet?: string;
  addrHousenumber?: string;
  wikidata?: string;
  wikipedia?: string;
  startDate?: string;
  denomination?: string;
  religion?: string;
  rawTags: Record<string, string>;
}

function classifyPOI(tags: Record<string, string>): string {
  if (tags['tower:type'] === 'clock' || tags.man_made === 'clock') return 'clock_tower';
  if (tags.historic === 'castle' || tags.building === 'castle') return 'castle';
  if (tags.amenity === 'townhall' || tags.building === 'townhall') return 'townhall';
  if (tags.building === 'cathedral') return 'cathedral';
  if (tags.amenity === 'place_of_worship' || tags.building === 'church') {
    if (tags.building === 'monastery') return 'monastery';
    return 'church';
  }
  if (tags.building === 'chapel') return 'chapel';
  if (tags.building === 'monastery') return 'monastery';
  if (tags.building === 'civic') return 'civic';
  return 'other';
}

// Multiple Overpass endpoints — fall back if one fails
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

async function fetchWithRetry(country: string): Promise<Response | null> {
  for (const endpoint of ENDPOINTS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 480_000); // 8 min per attempt
      try {
        const r = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'CSH-Hodinarium/1.0 (admin@horologie.cz)',
          },
          body: 'data=' + encodeURIComponent(buildQuery(country)),
          signal: ctrl.signal,
        });
        clearTimeout(timer);
        if (r.ok) return r;
        const errText = await r.text();
        console.error(`  ${country} via ${new URL(endpoint).host} HTTP ${r.status}: ${errText.slice(0, 100)}`);
      } catch (e) {
        clearTimeout(timer);
        console.error(`  ${country} via ${new URL(endpoint).host} attempt ${attempt}: ${String(e).slice(0, 120)}`);
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return null;
}

async function fetchCountry(country: string): Promise<POI[]> {
  console.log(`  Querying ${country}...`);
  const r = await fetchWithRetry(country);
  if (!r) {
    console.error(`  ${country}: all endpoints failed`);
    return [];
  }
  const data = (await r.json()) as {
    elements: {
      type: string;
      id: number;
      lat?: number;
      lon?: number;
      center?: { lat: number; lon: number };
      tags: Record<string, string>;
    }[];
  };
  const out: POI[] = [];
  for (const el of data.elements) {
    const lat = el.center?.lat ?? el.lat;
    const lon = el.center?.lon ?? el.lon;
    if (lat === undefined || lon === undefined) continue;
    const tags = el.tags || {};
    out.push({
      osmId: `${el.type}/${el.id}`,
      type: classifyPOI(tags),
      name: tags.name || tags['name:cs'] || tags['name:de'] || tags['name:en'] || '',
      lat,
      lon,
      addrCity: tags['addr:city'] || tags['addr:place'] || undefined,
      addrStreet: tags['addr:street'] || undefined,
      addrHousenumber: tags['addr:housenumber'] || undefined,
      wikidata: tags.wikidata,
      wikipedia: tags.wikipedia,
      startDate: tags.start_date,
      denomination: tags.denomination,
      religion: tags.religion,
      rawTags: { ...tags, _country: country },
    });
  }
  console.log(`    ${country}: ${out.length} POIs`);
  return out;
}

async function main() {
  console.log(`Querying Overpass for ${COUNTRIES.length} countries (will take ~10-20 min)...`);
  const pois: POI[] = [];
  // Save incrementally to avoid losing all progress on failure
  const partialPath = 'tmp/osm-cz-pois-PARTIAL.json';
  if (existsSync(partialPath)) {
    try {
      const cached = JSON.parse(require('node:fs').readFileSync(partialPath, 'utf-8')) as POI[];
      pois.push(...cached);
      console.log(`Resuming from ${cached.length} cached POIs in ${partialPath}`);
    } catch {}
  }
  const doneCountries = new Set(pois.map((p) => (p.rawTags?._country as string) || '').filter(Boolean));
  for (const c of COUNTRIES) {
    if (doneCountries.has(c)) {
      console.log(`  ${c}: cached, skipping`);
      continue;
    }
    try {
      const part = await fetchCountry(c);
      pois.push(...part);
      // Save partial after each country
      writeFileSync(partialPath, JSON.stringify(pois));
      console.log(`    saved partial: ${pois.length} POIs`);
      // Be polite — pause between countries
      await new Promise((r) => setTimeout(r, 2000));
    } catch (e) {
      console.error(`  ${c} unexpected error:`, e);
    }
  }

  // Stats
  const byType = new Map<string, number>();
  for (const p of pois) byType.set(p.type, (byType.get(p.type) || 0) + 1);
  const withAddr = pois.filter((p) => p.addrCity).length;
  const withWikidata = pois.filter((p) => p.wikidata).length;

  console.log(`\nTotal POIs: ${pois.length}`);
  console.log('By type:');
  for (const [t, n] of [...byType.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${t.padEnd(15)} ${n}`);
  }
  console.log(`With addr:city tag: ${withAddr} (${((withAddr / pois.length) * 100).toFixed(0)}%)`);
  console.log(`With wikidata link: ${withWikidata} (${((withWikidata / pois.length) * 100).toFixed(0)}%)`);

  if (!existsSync('tmp')) mkdirSync('tmp', { recursive: true });
  writeFileSync('tmp/osm-cz-pois.json', JSON.stringify(pois, null, 2));
  console.log(`\nWritten: tmp/osm-cz-pois.json (${(JSON.stringify(pois).length / 1024 / 1024).toFixed(1)} MB)`);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
