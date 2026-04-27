/**
 * Vyrobí _redirects soubor pro Cloudflare Pages.
 * Všechny staré .htm URL z hodinarium.eu redirectne 301 na nové slugy.
 *
 * Vstup:  raw/hodinarium-eu/_index.json (z scrape skriptu)
 * Výstup: apps/hodinarium-eu/public/_redirects
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const INDEX_PATH = join(ROOT, 'raw', 'hodinarium-eu', '_index.json');
const OUT_PATH = join(ROOT, 'apps', 'hodinarium-eu', 'public', '_redirects');

interface Index {
  pages: Record<string, { url: string; slug: string; title: string | null }>;
}

const SPECIAL: Record<string, string> = {
  '/index.htm': '/',
  '/mapa.htm': '/clanky',
  '/spolek.htm': '/spolek',
  '/kontakt.htm': '/spolek#kontakt',
  '/stanovy.htm': '/clanky/stanovy',
  '/hledej.htm': '/clanky',
  '/novinky.htm': '/',
  '/decin_zamek.htm': '/decin',
  '/decin_koncepce.htm': '/clanky/decin_koncepce',
};

async function main() {
  const raw = await readFile(INDEX_PATH, 'utf-8');
  const index: Index = JSON.parse(raw);

  const lines: string[] = [
    '# Cloudflare Pages redirects — generated from raw/_index.json',
    '# Format: <source> <destination> <status>',
    '',
    '# Specifické přesměrovky',
  ];
  for (const [src, dst] of Object.entries(SPECIAL)) {
    lines.push(`${src} ${dst} 301`);
  }
  lines.push('', '# Generované přesměrovky všech *.htm → /clanky/<slug>');

  const seen = new Set<string>(Object.keys(SPECIAL));
  for (const [path, meta] of Object.entries(index.pages)) {
    if (seen.has(path)) continue;
    if (!path.endsWith('.htm')) continue;
    seen.add(path);
    lines.push(`${path} /clanky/${meta.slug} 301`);
  }

  // Splat fallback — všechno na /img/* zůstane na svém místě (servíruje se ze static)
  // Cokoli jiného nepoznané → 404
  lines.push('', '# Fallback — neznámé .htm cesty', '/*.htm /404 404');

  const out = lines.join('\n') + '\n';
  await writeFile(OUT_PATH, out, 'utf-8');

  console.log(`=== _redirects vyrobeno ===`);
  console.log(`Pravidel: ${seen.size + 1} (z toho ${Object.keys(SPECIAL).length} specifických)`);
  console.log(`Výstup:   ${OUT_PATH}`);
  console.log(`Velikost: ${out.length} bytů`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
