/**
 * Parser KML exportu z Google My Maps na strukturovaný JSON.
 *
 * Zdroj: raw/gmaps/horologicke-zajimavosti.kml (Davidova mapa)
 * Výstup: apps/hodinarium-eu/src/data/gmaps-horologie.json
 *
 * Mapuje folder hierarchii (Orloje / Muzea / Výrobci / Hodinky / Další).
 * Pro každý Placemark extrahuje name, description (HTML) → text,
 * coords [lng, lat], folder, raw HTML description (pro pozdější obrázky).
 *
 * Run: pnpm gmaps:parse
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const KML_PATH = join(ROOT, 'raw', 'gmaps', 'horologicke-zajimavosti.kml');
const OUT_PATH = join(ROOT, 'apps', 'hodinarium-eu', 'src', 'data', 'gmaps-horologie.json');

interface Placemark {
  name: string;
  description: string;
  descriptionHtml: string;
  coords: { lng: number; lat: number };
  folder: string;
}

function unescapeHtml(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'");
}

function htmlToText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Filtr / remap pravidla per folder. Aplikuje se při parsování — nech raw
 * KML beze změny, ale výsledný JSON už obsahuje jen relevantní data.
 *
 * keep:     pokud existuje, zachová JEN položky, jejichž name je v listu
 * remapTo:  zachované položky se přesunou do jiného folderu
 * skip:     true → celý folder vyhodit
 */
const FOLDER_FILTERS: Record<string, { keep?: string[]; remapTo?: string; skip?: boolean }> = {
  'Výlet Kassel': {
    // Zrušený výlet — z položek zachovat jen muzeum
    keep: ['Astronomisch-physikalisches Kabinett'],
    remapTo: 'Muzea',
  },
};

async function main() {
  const xml = await readFile(KML_PATH, 'utf-8');

  // Najít všechny Folder bloky (případně zachycujeme hierarchii — root Folder
  // má <name>, vnořené Placemark patří k němu).
  const placemarks: Placemark[] = [];
  const folderRe = /<Folder>([\s\S]*?)<\/Folder>/g;
  let folderMatch;
  while ((folderMatch = folderRe.exec(xml)) !== null) {
    const folderBlock = folderMatch[1];
    const folderName = (folderBlock.match(/<name>([\s\S]*?)<\/name>/)?.[1] ?? 'Bez složky').trim();
    const placemarkRe = /<Placemark>([\s\S]*?)<\/Placemark>/g;
    let pmMatch;
    while ((pmMatch = placemarkRe.exec(folderBlock)) !== null) {
      const pmBlock = pmMatch[1];
      const name = (pmBlock.match(/<name>([\s\S]*?)<\/name>/)?.[1] ?? '').trim();
      const descHtml = unescapeHtml((pmBlock.match(/<description>([\s\S]*?)<\/description>/)?.[1] ?? '').trim());
      const description = htmlToText(descHtml);
      const coordsStr = (pmBlock.match(/<coordinates>([\s\S]*?)<\/coordinates>/)?.[1] ?? '').trim();
      const [lng, lat] = coordsStr.split(',').map((n) => parseFloat(n));
      if (!isFinite(lng) || !isFinite(lat)) continue;
      // Aplikuj per-folder filter
      const filter = FOLDER_FILTERS[folderName];
      if (filter?.skip) continue;
      if (filter?.keep && !filter.keep.includes(name)) continue;
      const finalFolder = filter?.remapTo ?? folderName;
      placemarks.push({
        name,
        description,
        descriptionHtml: descHtml,
        coords: { lng, lat },
        folder: finalFolder,
      });
    }
  }

  // Group by folder pro report
  const byFolder: Record<string, number> = {};
  for (const p of placemarks) {
    byFolder[p.folder] = (byFolder[p.folder] ?? 0) + 1;
  }

  await writeFile(OUT_PATH, JSON.stringify(placemarks, null, 2), 'utf-8');

  console.log('=== Parser KML ===');
  console.log(`Celkem placemarks: ${placemarks.length}`);
  console.log('Per složka:');
  for (const [f, n] of Object.entries(byFolder).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${f.padEnd(40)} ${n}`);
  }
  console.log(`\nVýstup: ${OUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
