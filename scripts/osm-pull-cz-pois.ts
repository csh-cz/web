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

const QUERY = `
[out:json][timeout:600];
area["ISO3166-1"="CZ"]->.cz;
(
  // Sacred buildings with name
  way["amenity"="place_of_worship"]["name"](area.cz);
  relation["amenity"="place_of_worship"]["name"](area.cz);
  way["building"="church"]["name"](area.cz);
  way["building"="cathedral"]["name"](area.cz);
  way["building"="chapel"]["name"](area.cz);
  way["building"="monastery"]["name"](area.cz);
  // Castles, fortresses
  way["historic"="castle"]["name"](area.cz);
  relation["historic"="castle"]["name"](area.cz);
  way["building"="castle"]["name"](area.cz);
  // Town halls, civic buildings
  way["amenity"="townhall"]["name"](area.cz);
  way["building"="townhall"]["name"](area.cz);
  way["building"="civic"]["name"](area.cz);
  // Explicit clock towers
  way["tower:type"="clock"];
  node["tower:type"="clock"];
  way["man_made"="clock"];
  node["man_made"="clock"];
);
out center tags;
`;

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

async function main() {
  console.log('Querying Overpass API for CZ POIs (this may take ~30-60s)...');
  const r = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'CSH-Hodinarium/1.0 (admin@horologie.cz)',
    },
    body: 'data=' + encodeURIComponent(QUERY),
  });
  if (!r.ok) {
    throw new Error(`Overpass error: ${r.status} ${await r.text().then((t) => t.slice(0, 500))}`);
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
  console.log(`Got ${data.elements.length} raw elements.`);

  const pois: POI[] = [];
  for (const el of data.elements) {
    const lat = el.center?.lat ?? el.lat;
    const lon = el.center?.lon ?? el.lon;
    if (lat === undefined || lon === undefined) continue;
    const tags = el.tags || {};
    pois.push({
      osmId: `${el.type}/${el.id}`,
      type: classifyPOI(tags),
      name: tags.name || tags['name:cs'] || tags['name:de'] || '',
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
      rawTags: tags,
    });
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
