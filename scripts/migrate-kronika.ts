/**
 * Přesun 23 efemérních článků (decin/vezni-hodiny → category kronika
 * v M1.b override) z content/hodinarium-eu/ do content/kronika/.
 *
 * Pro každý článek:
 *   - Přečte body
 *   - Transformuje frontmatter (kategorie → typ, doplní date, rok)
 *   - Zapíše do content/kronika/<slug>.{md,mdx}
 *   - Smaže původní soubor
 *
 * Run: npx tsx scripts/migrate-kronika.ts [--dry]
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const HODINARIUM = join(ROOT, 'content/hodinarium-eu');
const KRONIKA = join(ROOT, 'content/kronika');

interface KronikaItem {
  slug: string;
  date: string;
  rok: number;
  typ: string;
  misto?: string;
}

/**
 * Per-slug metadata pro Kronika items. Datum extrahováno z článku /
 * kontextu, typ podle obsahu.
 */
const KRONIKA_META: Record<string, KronikaItem> = {
  // === Děčín — eventy v expozici ===
  'decin_aktual0': { slug: 'decin_aktual0', date: '2015-09-04', rok: 2015, typ: 'historie-spolku', misto: 'Hodinárium Děčín' },
  'decin_toulava_kamera2016': { slug: 'decin_toulava_kamera2016', date: '2016-01-03', rok: 2016, typ: 'tv', misto: 'Hodinárium Děčín' },
  'decin_fotobrezen2017': { slug: 'decin_fotobrezen2017', date: '2017-03-10', rok: 2017, typ: 'fotoreport', misto: 'Hodinárium Děčín' },
  'decin_fotolistopad2018': { slug: 'decin_fotolistopad2018', date: '2018-11-15', rok: 2018, typ: 'fotoreport', misto: 'Hodinárium Děčín' },
  'decin_fotovernisaz2017': { slug: 'decin_fotovernisaz2017', date: '2017-07-15', rok: 2017, typ: 'vernisaz', misto: 'Hodinárium Děčín' },
  'nonsens2015': { slug: 'nonsens2015', date: '2015-06-01', rok: 2015, typ: 'tematicka-vystava', misto: 'Hodinárium Děčín' },
  'sezona2012': { slug: 'sezona2012', date: '2012-12-31', rok: 2012, typ: 'sezona', misto: 'Věžní muzejíčko Soběslav' },
  'sezona2013': { slug: 'sezona2013', date: '2013-12-31', rok: 2013, typ: 'sezona', misto: 'Věžní muzejíčko Soběslav' },
  'sezona2012_foto_marusak': { slug: 'sezona2012_foto_marusak', date: '2012-08-01', rok: 2012, typ: 'fotoreport', misto: 'Věžní muzejíčko Soběslav' },
  'dernisaz2013': { slug: 'dernisaz2013', date: '2013-10-31', rok: 2013, typ: 'vernisaz', misto: 'Věžní muzejíčko Soběslav' },
  'ohlednuti2011': { slug: 'ohlednuti2011', date: '2011-12-31', rok: 2011, typ: 'sezona', misto: 'Věžní muzejíčko Soběslav' },
  'vez_provoz2011': { slug: 'vez_provoz2011', date: '2011-07-01', rok: 2011, typ: 'sezona', misto: 'Věžní muzejíčko Soběslav' },
  'vez_instalace1': { slug: 'vez_instalace1', date: '2011-07-01', rok: 2011, typ: 'historie-spolku', misto: 'Věžní muzejíčko Soběslav' },
  'faust': { slug: 'faust', date: '2013-06-01', rok: 2013, typ: 'tematicka-vystava', misto: 'Věžní muzejíčko Soběslav' },
  'steampunk': { slug: 'steampunk', date: '2012-06-01', rok: 2012, typ: 'tematicka-vystava', misto: 'Věžní muzejíčko Soběslav' },
  'rozmberk1': { slug: 'rozmberk1', date: '2014-06-01', rok: 2014, typ: 'jine' },
  'rozmberk2': { slug: 'rozmberk2', date: '2014-06-15', rok: 2014, typ: 'historie-spolku' },

  // === Soběslav historie spolku (2009–2015) ===
  'vezni_muzejicko': { slug: 'vezni_muzejicko', date: '2015-12-31', rok: 2015, typ: 'historie-spolku', misto: 'Soběslav' },
  'vez1': { slug: 'vez1', date: '2009-01-01', rok: 2009, typ: 'historie-spolku', misto: 'Soběslav' },
  'sobeslav2': { slug: 'sobeslav2', date: '2010-01-01', rok: 2010, typ: 'historie-spolku', misto: 'Soběslav' },
  'sobeslav2b': { slug: 'sobeslav2b', date: '2010-06-01', rok: 2010, typ: 'historie-spolku', misto: 'Soběslav' },
  'sobeslav2c': { slug: 'sobeslav2c', date: '2010-09-01', rok: 2010, typ: 'historie-spolku', misto: 'Soběslav' },
  'sobeslav3': { slug: 'sobeslav3', date: '2010-12-01', rok: 2010, typ: 'historie-spolku', misto: 'Soběslav' },
  'vez_signatury': { slug: 'vez_signatury', date: '2011-03-01', rok: 2011, typ: 'historie-spolku', misto: 'Soběslav' },
};

const dry = process.argv.includes('--dry');

interface ParsedFile {
  fmText: string;
  body: string;
}

function parseFile(path: string): ParsedFile | null {
  const text = readFileSync(path, 'utf-8');
  const m = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  return { fmText: m[1], body: m[2] };
}

function rewriteFrontmatter(fmText: string, meta: KronikaItem): string {
  // Strip category line, replace with date/rok/typ
  const lines = fmText.split('\n').filter((l) => !/^category:/.test(l));
  // Insert kronika fields after slug:
  const out: string[] = [];
  let inserted = false;
  for (const line of lines) {
    out.push(line);
    if (!inserted && /^slug:/.test(line)) {
      out.push(`date: "${meta.date}"`);
      out.push(`rok: ${meta.rok}`);
      out.push(`typ: ${meta.typ}`);
      if (meta.misto) out.push(`misto: "${meta.misto}"`);
      inserted = true;
    }
  }
  return out.join('\n');
}

let migrated = 0;
let skipped = 0;
const candidates = readdirSync(HODINARIUM).filter((f) => f.endsWith('.md') || f.endsWith('.mdx'));
for (const file of candidates) {
  const slug = file.replace(/\.(md|mdx)$/, '');
  const meta = KRONIKA_META[slug];
  if (!meta) continue;

  const srcPath = join(HODINARIUM, file);
  const parsed = parseFile(srcPath);
  if (!parsed) {
    console.warn(`  SKIP (no frontmatter): ${file}`);
    skipped += 1;
    continue;
  }

  const newFm = rewriteFrontmatter(parsed.fmText, meta);
  const newContent = `---\n${newFm}\n---\n${parsed.body}`;
  const dstPath = join(KRONIKA, file);

  if (existsSync(dstPath)) {
    console.warn(`  SKIP (kronika existuje): ${file}`);
    skipped += 1;
    continue;
  }

  if (!dry) {
    writeFileSync(dstPath, newContent);
    unlinkSync(srcPath);
  }
  console.log(`  ${dry ? '[DRY] ' : ''}✓ ${file} → kronika/`);
  migrated += 1;
}

console.log(`\n${dry ? 'DRY-RUN: ' : ''}Migrated ${migrated}, skipped ${skipped}`);
