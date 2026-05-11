# Image variants pipeline — Cloudflare R2

**Stav (2026-05-10):** Plán schválen (Varianta A — JPEG zdroj v gitu, AVIF/WebP varianty na R2). Čeká na user setup R2 bucketu.

## Proč R2 a ne git

GitHub free tier doporučuje repo < 1 GB. Náš repo by po commitu ~800 MB AVIF/WebP variant narostl na ~1.9 GB. Slow git clone, slow GitHub Actions, warning v UI.

R2 free tier má 10 GB storage + 1M writes/měs + 10M reads/měs + **neomezený egress přes CF**. Pro náš case ideální:
- AVIF + WebP varianty pro 2 878 raster obrázků = ~800 MB (8% R2 free)
- Čtení se servíruje přes CF edge (žádný bandwidth poplatek)
- Repo zůstává čisté

Source JPEG zůstává v gitu — verzování, atomic commit s článkem, Sveltia upload pipeline beze změny.

## Architektura

```
Petr v Sveltia editoru ──┐
                         │
                         ▼  upload via csh-cms-proxy
                       GitHub repo  (apps/*/public/img/X.jpg)
                         │
                         ├─→ CF Pages build → /img/X.jpg na hodinarium-eu.pages.dev
                         │
                         └─→ pnpm imgvariants:sync (ručně nebo GH Action)
                                ├─→ scripts/generate-image-formats.ts (lokálně)
                                │     └─→ X.avif + X.webp (gitignored)
                                └─→ scripts/upload-imgvariants-to-r2.mjs
                                      └─→ R2 bucket (csh-imgvariants)
                                              ↓
                                          imgcdn.<doména>.cz/img/X.avif
                                          imgcdn.<doména>.cz/img/X.webp


Browser request /clanky/X →
  Astro generated HTML obsahuje:
    <picture>
      <source type="image/avif" srcset="https://imgcdn.<doména>.cz/img/foto.avif">
      <source type="image/webp" srcset="https://imgcdn.<doména>.cz/img/foto.webp">
      <img src="/img/foto.jpg" loading="lazy" decoding="async" width=... height=...>
    </picture>

  Chrome → AVIF ze R2 (~30-50% menší než JPEG)
  Safari (no AVIF) → WebP ze R2
  Old IE → JPEG fallback z CF Pages
```

## Setup (jednorázově, David v CF dashboardu)

### 1. Aktivace R2

1. [https://dash.cloudflare.com/?to=/:account/r2/overview](https://dash.cloudflare.com/?to=/:account/r2/overview)
2. „Subscribe to R2" — přidá R2 plán (free, ale vyžaduje payment method na účtu)

### 2. Vytvoření bucketu

1. „Create bucket" → název `csh-imgvariants`
2. Location: Automatic (EU)
3. Default storage class: Standard

### 3. Public access + Custom domain

1. Settings → Public access → „Connect Domain"
2. Domain: `imgcdn.csh-cz.cz` *(nebo `imgcdn.hodinarium.eu` — záleží, kterou má David v CF)*
3. CF auto-přidá CNAME, propagace ~30 s
4. Test: `curl -I https://imgcdn.<doména>.cz/` → 404 (= bucket accessible, prázdný)

### 4. API token

1. [https://dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) → „Create Token"
2. Custom token:
   - Name: `csh-r2-upload`
   - Permissions: Account → Workers R2 Storage → **Edit**
   - Account Resources: Include current account
   - TTL: bez expirace nebo 1 rok
3. **Zkopírovat token hned** — CF ho zobrazí jen jednou

### 5. Předat údaje Claudovi

1. **Custom domain URL** (např. `https://imgcdn.csh-cz.cz`)
2. **Cloudflare Account ID** (32-znakový hex, vpravo dole v dashboardu)
3. **API token** (z bodu 4)

## Implementace (po user setup, Claude autonomně)

### A. Smazat CF_PAGES guard z generate-image-formats

```diff
// scripts/generate-image-formats.ts
- if (process.env.CF_PAGES === '1' && process.env.SKIP_IMAGE_VARIANTS !== '0') {
-   console.log('CF Pages / SKIP_IMAGE_VARIANTS detected — skipping AVIF/WebP generation.');
-   process.exit(0);
- }
```

Místo `prebuild` step (který CF Pages v free tieru přetáhne) bude generation jen lokální nebo přes GH Action.

### B. Nový skript `scripts/upload-imgvariants-to-r2.mjs`

Sync přes wrangler R2 SDK nebo S3-compatible API:

```javascript
// Pseudo-code
import { S3Client, PutObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: TOKEN_ID, secretAccessKey: TOKEN_SECRET },
});

// 1. List existing R2 objects (ETags)
const existing = new Map();  // key → etag
let continuationToken;
do {
  const res = await r2.send(new ListObjectsV2Command({
    Bucket: 'csh-imgvariants',
    ContinuationToken: continuationToken,
  }));
  for (const obj of res.Contents ?? []) existing.set(obj.Key, obj.ETag);
  continuationToken = res.NextContinuationToken;
} while (continuationToken);

// 2. Walk local AVIF/WebP files
for await (const file of walkVariants('apps/*/public/img')) {
  const key = file.relativePath;  // e.g. img/krecmer/foto.avif
  const localEtag = await md5(file.absPath);
  if (existing.get(key) === `"${localEtag}"`) continue;  // skip unchanged
  await r2.send(new PutObjectCommand({
    Bucket: 'csh-imgvariants',
    Key: key,
    Body: createReadStream(file.absPath),
    ContentType: file.mime,
    CacheControl: 'public, max-age=31536000, immutable',
  }));
}
```

Idempotentní — uploads jen co se změnilo. CacheControl 1 rok (immutable filename pattern: pokud editor nahradí foto.jpg novou verzí, fname stejné, ale obsah jiný; CF cache se invaliduje při PUT).

### C. Package.json scripts

```json
"imgvariants:build": "tsx scripts/generate-image-formats.ts",
"imgvariants:upload": "tsx scripts/upload-imgvariants-to-r2.mjs",
"imgvariants:sync": "pnpm imgvariants:build && pnpm imgvariants:upload"
```

### D. Rehype-picture cdnBase option

`packages/rehype-picture/index.mjs`:

```diff
- export default function rehypePicture(opts = {}) {
-   const sizes = opts.imageSizes ?? {};
-   const wrap = opts.wrapInPicture === true;
+ export default function rehypePicture(opts = {}) {
+   const sizes = opts.imageSizes ?? {};
+   const wrap = opts.wrapInPicture === true;
+   const cdnBase = opts.cdnBase ?? '';  // např. https://imgcdn.csh-cz.cz
```

V `<source>` srcset rewrite path: `${cdnBase}/img/X.avif` místo `/img/X.avif`. Fallback `<img>` zůstane na local CF Pages path.

### E. Astro config flip

`apps/hodinarium-eu/astro.config.mjs` + `apps/horologie-cz/astro.config.mjs`:

```diff
- [rehypePicture, { imageSizes }],
+ [rehypePicture, {
+   imageSizes,
+   wrapInPicture: true,
+   cdnBase: 'https://imgcdn.csh-cz.cz',
+ }],
```

### F. Live test

1. `pnpm imgvariants:sync` (~30-35 min poprvé, pak sekundy)
2. `pnpm --filter hodinarium-eu build` → ověřit `<picture>` v dist HTML
3. Push → CF Pages deploy
4. Chrome DevTools network: ověřit AVIF served pro Chrome (mime: image/avif)
5. Safari nebo `Disable AVIF` flag: ověřit WebP served
6. Throttling 3G: měřit page load time před/po

### G. V2 — GitHub Action automation (hotovo 2026-05-11)

Workflow `.github/workflows/imgvariants-r2-sync.yml` automatizuje generate
+ upload po každém pushi, který obsahuje nový/změněný JPG/PNG v `public/img/`.

**Jak funguje:**

1. `actions/checkout@v4` s `fetch-depth: 2` (pro `git diff HEAD^ HEAD`).
2. Step „Detect changed raster sources" filtruje diff na JPG/JPEG/PNG v
   `apps/*/public/img/` a sestaví comma-separated seznam.
3. Step „Generate variants (diff)" volá `pnpm imgvariants:build -- --files <list>`.
   Skript `scripts/generate-image-formats.ts` v `--files` módu procesuje jen
   uvedené soubory (skip walk přes 2867 zdrojů).
4. Step „Upload variants to R2" volá `pnpm imgvariants:upload`. Skript
   walkuje `apps/*/public/img/**/*.{avif,webp}`, ale na fresh checkout
   existují jen ty právě vygenerované varianty (=AVIF/WebP jsou v gitignore).
   Tak se nahraje jen diff.
5. Workflow_dispatch s `full_regen: true` udělá plný regen (recovery scenár).

**Doba běhu:**
- Push s 1 novou fotkou: ~2-3 min (install cached, generate <1s, upload <1s).
- Push s 50 novými fotkami: ~5-7 min.
- Plný regen: ~35 min (sharp je single-threaded, 2867 zdrojů × 2 formáty).

**Náklady:**
- Public GitHub repo má free Action minuty unlimited → 0 Kč.
- CF R2: 1M class A operací (PUT) / měs free → 5756 PUT z plného regenu = 0.6 %.
  Per push s 1 fotkou = 2 PUT, prakticky zdarma.

**GitHub secrets setup (David, jednorázově):**

1. https://github.com/csh-cz/web/settings/secrets/actions
2. „New repository secret" — přidat 3 secrets se stejnými hodnotami jako v `.dev.vars`:
   - `R2_ACCOUNT_ID` = `d5c001b051b45963d51ca37765b774c3`
   - `R2_ACCESS_KEY_ID` = (Access Key ID z R2 token)
   - `R2_SECRET_ACCESS_KEY` = (Secret z R2 token)
3. Hotovo. První push s novou fotkou Action vyzkouší.

**Selhání → fallback:**
Pokud Action selže (R2 outage, malformed JPG, sharp OOM), browser dostane JPEG
fallback z CF Pages — žádný viditelný problém pro návštěvníka, jen ztracený
AVIF benefit pro danou fotku. Retry: re-run Action manuálně přes GH UI.

## Po dokončení

- Repo zůstane na ~1 GB (žádný JPEG nebo varianty navíc nepřibývají)
- R2 bucket ~800 MB (= 8% free tier)
- Lighthouse score: očekávaný nárůst v Performance (~+5-10 bodů kvůli menším image transferům)
- Browser bandwidth saving: 30-50% per page (pro stránky bohaté na obrázky)

## Pokud něco selže

| Problem | Řešení |
|---|---|
| `pnpm imgvariants:build` failuje na out-of-memory | Sharp config `concurrency: 1` v skriptu |
| R2 upload error 403 | Token nemá Edit permission na R2 — recreate token |
| Browser dostává JPEG i v Chrome | `<source type="image/avif">` MIME mismatch — verify ContentType v R2 PUT |
| AVIF 404 | Variant nebyl uploadnutý (žádný blob na R2) — `pnpm imgvariants:upload` znovu |
| Custom domain DNS error | Propagace 1-5 min; pokud déle, ověřit CNAME v CF DNS |
