#!/usr/bin/env node
/**
 * build-image-hashes.mjs — plní per-app `src/data/image-hashes.json`
 * (`/img/path → krátký content-hash`) pro cache-bust rastrů na R2.
 *
 * Proč: R2 servíruje rastry s `Cache-Control: immutable, max-age=1 rok`
 * (předpoklad „stejný název = stejný obsah"). Když Sveltia/commit přepíše
 * obsah obrázku pod stejným filename, prohlížeč by držel rok starou verzi.
 * Photo.astro / rehype-picture / cdnImage.ts připojí `?v=<hash>` k URL —
 * mění se jen když se mění obsah, takže cache miss nastane jen u změněného
 * obrázku (immutable benefit u nezměněných zůstává).
 *
 * Spouští se v `imgvariants-r2-sync.yml` PŘED `git rm` zdrojů (zatímco
 * soubory ještě existují na disku). Hash NEMUSÍ odpovídat R2 ETagu — je to
 * jen cache-bust token, stačí že je deterministický a mění se s obsahem.
 *
 * Použití:
 *   node scripts/build-image-hashes.mjs --files "a.png,b.jpg"   # jen tyto
 *   node scripts/build-image-hashes.mjs                          # plný sken
 *
 * Sémantika: MERGE-ONLY. Nikdy nemaže existující záznamy (zdroje se po
 * R2-move `git rm`-ují, takže plný sken je nevidí — mazat by je zahodilo).
 */
import { createHash } from 'node:crypto';
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RASTER_RE = /\.(jpe?g|png|gif)$/i;
const HASH_LEN = 8;

// app → cesta k manifestu (relativně k ROOT)
const APPS = ['hodinarium-eu', 'horologie-cz'];
const manifestPath = (app) => join(ROOT, 'apps', app, 'src', 'data', 'image-hashes.json');
const publicImgDir = (app) => join(ROOT, 'apps', app, 'public', 'img');

/** repo-relativní cesta zdroje → { app, imgKey } nebo null */
function parseSourcePath(p) {
  // apps/<app>/public/img/<...>  → app, /img/<...>
  const m = /(?:^|\/)apps\/([^/]+)\/public(\/img\/.+)$/.exec(p.replace(/\\/g, '/'));
  if (!m) return null;
  const [, app, imgKey] = m;
  if (!APPS.includes(app)) return null;
  if (!RASTER_RE.test(imgKey)) return null;
  return { app, imgKey };
}

async function md5(file) {
  const buf = await readFile(file);
  return createHash('md5').update(buf).digest('hex').slice(0, HASH_LEN);
}

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // dir nemusí existovat
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else if (e.isFile() && RASTER_RE.test(e.name)) yield full;
  }
}

function imgKeyFromAbs(app, abs) {
  const base = publicImgDir(app);
  const rel = abs.slice(base.length).replace(/\\/g, '/');
  return '/img' + (rel.startsWith('/') ? rel : '/' + rel);
}

async function loadManifest(app) {
  try {
    return JSON.parse(await readFile(manifestPath(app), 'utf8'));
  } catch {
    return {};
  }
}

async function saveManifest(app, obj) {
  const sorted = {};
  for (const k of Object.keys(obj).sort()) sorted[k] = obj[k];
  await writeFile(manifestPath(app), JSON.stringify(sorted) + '\n');
}

async function main() {
  const argv = process.argv.slice(2);
  const fi = argv.indexOf('--files');
  const filesArg = fi >= 0 ? (argv[fi + 1] ?? '') : null;

  // app → { imgKey: hash } k zápisu
  const updates = Object.fromEntries(APPS.map((a) => [a, {}]));

  if (filesArg !== null) {
    // jen vyjmenované zdroje
    const files = filesArg.split(',').map((s) => s.trim()).filter(Boolean);
    for (const f of files) {
      const parsed = parseSourcePath(f);
      if (!parsed) continue;
      const abs = join(ROOT, f);
      try {
        await stat(abs);
      } catch {
        continue; // soubor už neexistuje (smazán) — přeskoč
      }
      updates[parsed.app][parsed.imgKey] = await md5(abs);
    }
  } else {
    // plný sken obou apps
    for (const app of APPS) {
      for await (const abs of walk(publicImgDir(app))) {
        updates[app][imgKeyFromAbs(app, abs)] = await md5(abs);
      }
    }
  }

  let total = 0;
  for (const app of APPS) {
    const keys = Object.keys(updates[app]);
    if (keys.length === 0) continue;
    const merged = { ...(await loadManifest(app)), ...updates[app] };
    await saveManifest(app, merged);
    total += keys.length;
    console.log(`[image-hashes] ${app}: +${keys.length} (celkem ${Object.keys(merged).length})`);
  }
  if (total === 0) console.log('[image-hashes] žádné rastry k zahashování');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
