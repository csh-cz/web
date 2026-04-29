---
name: horologie-stranky
description: Konvence pro psaní a editaci stránek v Astro projektu horologie-cz (web Českého spolku horologického, sesterský k hodinarium-eu). Aktivuje se při editaci .astro v apps/horologie-cz/src/pages/, při tvorbě/úpravě komponent v apps/horologie-cz/src/components/, při psaní akce/spolky/dokumenty data v src/data/, při řešení layoutu (logo, brand, perex full-width, akce mapa, /akce/[slug] detaily), při favicon/manifest úpravách, při odkazech na hodinarium-eu nebo orloj.eu sister sites.
---

# Konvence horologie-cz — web spolku ČSH

Sesterský projekt k hodinarium-eu. **Hodinarium-eu = velký katalog článků a Hodinárium expozice; horologie-cz = oficiální web spolku** (identita, dokumenty, akce, podpora). Některé konvence z `clanky-konvence` skillu přebíráme, jiné jsou specifické.

## 0. Přebrané konvence z `clanky-konvence`

Tyto konvence jsou identické pro oba projekty — viz `.claude/skills/clanky-konvence/SKILL.md`:

- **Title bez markdown** (frontmatter neparsuje)
- **Single `* * *` separator** (collapse duplicit)
- **Mezititulky `## Heading`** (h2/h3 globální styly)
- **Wiki odkazy** s ⓦ ikonkou — CSS rule pro `.prose-content a[href*="wikipedia.org/wiki/"]::after`
- **Mapové odkazy** s pin ikonkou — mapy.cz, google.com/maps, openstreetmap.org
- **Hodinarium-eu deployment URL** — `hodinarium-eu.pages.dev` ne `hodinarium.eu` (legacy)
- **Build:** `pnpm build` (= `astro check && astro build`), nikdy `npx astro build` lokálně — propustí ts chyby do CF
- **Cloudflare Pages** spouští `pnpm build`; failed `astro check` → deploy zaseknutý

V horologie-cz mám tyto pravidla **identické** — CSS rules pro wiki/mapa nejsou globálně sdílené, musí se přidat do `apps/horologie-cz/src/styles/global.css` zvlášť, pokud se rozhodne pro stejný styling napříč weby.

## 1. Struktura webu

Horologie-cz **není kolekce článků** (žádný `content.config.ts`, žádný `[slug].astro` v `clanky/`). Místo toho:

- `src/pages/index.astro` — homepage (identita spolku, „Účel spolku", výbor, kontakt)
- `src/pages/akce/index.astro` — přehled akcí + mapa míst konání + časová osa
- `src/pages/akce/[slug].astro` — detail jednotlivé akce (galerie fotek, popis)
- `src/pages/prispevky.astro` — členské příspěvky a info
- `src/pages/dokumenty.astro` — stanovy, zápisy, hospodaření
- `src/pages/spolky.astro` — sister organizace
- `src/pages/sponzoring.astro` — možnosti podpory
- `src/pages/kontakt.astro` — kontaktní údaje
- `src/pages/licence.astro` — licenční info
- `src/pages/en.astro` — anglické summary
- `src/pages/clanky/[slug].astro` — minor (pokud existuje, pro spolkové texty z hodinarium-eu legacy)

Při přidání nové sekce zvážit, jestli to patří sem (spolková identita), nebo do hodinarium-eu (popularizace expozice).

## 2. Datové soubory

Strukturovaná data jsou v `src/data/`:

- `akce.ts` — pole akcí spolku se slug, rok, datum, místo, lat/lon, popis, fotky (relativní k `/img/akce/<slug>/`)
- `sites.ts` — odkazy na sesterské weby (hodinarium-eu, orloj.eu)
- `spolky.ts` — sesterské organizace
- `sbirka-listin.ts` — historické dokumenty
- `image-sizes.json` — auto-generated index obrázků (skript `pnpm imgindex:build`)

**Při přidání akce:**
- Doplnit do `akce.ts` plný objekt
- Stáhnout fotky do `public/img/akce/<slug>/`
- Spustit `pnpm imgindex:build` (regeneruje image-sizes.json pro oba projekty)
- Pokud má akce lokaci, doplnit `lat`/`lon` (mapy.cz dává souřadnice)

## 3. Identita spolku — povinné údaje

V citacích / kontaktu / patičkách dodržovat:

- **Plný název:** Český spolek horologický z. s. (nebo „ČSH" zkráceně)
- **IČO:** 26573008
- **Sídlo:** nábřeží Otakara Ostrčila 273/6, 392 01 Soběslav III
- **Spolkový rejstřík:** L 4908 / KS České Budějovice (Fj 4845/2016/KSCB), zapsán 5. 3. 2016
- **Předchůdce:** Virtuální muzeum hodin o. s. (zapsáno 9. 1. 2009) — důležité pro datování (spolek de facto od 2009, právně přepsán 2014/2016)
- **Účel:** ze Stanov — „prezentovat a popularizovat technickou i uměleckou stránku vývoje hodin…"
- **Sídlo expozice:** Zámek Děčín (Hodinárium)
- **Kontakt:** info@orloj.eu, +420 603 502 735

Tato data jsou v `src/pages/index.astro` (identity blok). Při změnách aktualizovat **všude konzistentně** — index.astro, en.astro, footer (Base.astro).

## 4. Layout — full-width perex a hero

**Pravidlo:** žádné max-width omezení na hero/perex. Všechny `.lede`, `.hero`, `*-header { max-width: ... }` byly stripnuté (commits c4bf50e, a54e356, d1256ec). Perex se rozprostře přes celé textové pole (max-w-5xl wrapper v `<main>`).

Při přidání nové stránky **nepoužívat** `max-width: 720px` ani `max-width: NNch` na hlavičku/lede. Pokud je pasáž extrémně dlouhá a chce optická limit, použij obecnější `max-width: 80ch` na celý `<article>` (ne jen na header).

## 5. BrandLogo komponenta

`src/components/BrandLogo.astro` — **inline SVG s `currentColor`**. Build-time:

1. Načte `public/img/logo-csh.svg` přes Node `fs.readFileSync`
2. Strip vnitřních `<style>` blocků (originální `#ffffff` hardcoded)
3. Vleje SVG inline přes `set:html`

CSS `<style is:global>`:

```css
.brand-logo svg .C1, .brand-logo svg .C2 {
  fill: none;
  stroke: currentColor;
}
.brand-logo svg .C1 { stroke-width: 164; }
.brand-logo svg .C2 { stroke-width: 273; }
.brand-logo svg .C3 {
  fill: currentColor;
  stroke: none;
}
```

Logo dědí color z `.brand` (`color: var(--color-text)`). **Nepoužívat mask trick** — selhával na Cloudflare deploy (CSS scope problém uvnitř SVG `<style>`).

**Trade-off:** každá HTML stránka obsahuje ~97 KB inline SVG (514 paths). Pro produkční optimalizaci jednoho dne zvážit zjednodušený SVG (méně bodů na křivkách).

## 6. Favicon a homescreen ikony

Vygenerované scriptem `scripts/build-favicon.ts` (`pnpm favicon:build`) z `public/img/logo-csh.svg`. Outputy v `public/`:

- `favicon.svg` — theme-aware (`prefers-color-scheme` dark/light) — modern browsery
- `favicon-16/32.png` — desktop tab fallback
- `apple-touch-icon.png` (180×180) — iOS Add-to-Homescreen
- `icon-192/512.png` — Android Chrome homescreen (přes manifest)
- `icon-maskable-512.png` — Android Adaptive Icons (logo na 70% safe zone, brass-light pozadí)
- `manifest.webmanifest` — PWA manifest (display standalone, theme #6e4d1d)

Linky v `<head>` v Base.astro: `rel=icon` SVG + 32 + 16, apple-touch-icon, manifest.

**Když se změní logo SVG**, spustit `pnpm favicon:build`. Vše se přegeneruje.

## 7. Akce mapa (Leaflet)

`src/pages/akce/index.astro` má **vždy auto-fit bounds** mapy podle markerů. **Nepoužívat fixed `setView([lat, lon], zoom)`** — zaseknutý na střední Čechy by ořízl Rostock i Vídeň.

```js
const group = L.featureGroup(markery);
map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 8 });
```

**Popisek mapy** generovat dynamicky z dat (top 3 lokality podle počtu akcí + „a další N"), neukládat hardcodovaný text typu „2 lokality — Soběslav a Děčín".

**Klíč pro skupinu akcí na stejném místě** — `lat.toFixed(3)` + `,` + `lon.toFixed(3)` (~100 m přesnost). Více akcí na stejné lokalitě vytvoří circle marker s počtem (`many` class).

## 8. Sister site links

Horologie-cz odkazuje na hodinarium-eu a orloj.eu. Aktuálně v Base.astro nav:

```astro
<a href={SISTER_HODINARIUM} class="nav-sister" target="_blank" rel="noopener">
  Hodinárium ↗
</a>
<a href="https://orloj.eu" class="nav-sister" target="_blank" rel="noopener">
  Orloj.eu ↗
</a>
```

`SISTER_HODINARIUM` v `src/data/sites.ts` aktuálně cíli na `https://hodinarium-eu.pages.dev`. **Po přepnutí DNS** na finální `hodinarium.eu` aktualizovat na produkční doménu.

## 9. EN page

`src/pages/en.astro` — anglický summary spolku. Má vlastní lede (full-width — max-width 70ch byl odstraněn).

**Pravidla:**
- Aktualizovat **současně** s `index.astro` při změnách identity
- Plný text není pouhý překlad — je to summary pro neskutečné uživatele
- `<link rel="alternate" hreflang="en">` v Base.astro mezi en/cs

## 10. Licence a copyright

`<link rel="license" href="https://creativecommons.org/licenses/by/4.0/" />` v Base.astro.

Spolková díla na webu jsou pod **CC BY 4.0** (`<meta name="dcterms.rights">`). U externích obrázků zachovat jejich licenci (Commons CC BY-SA 3.0, atd.) — pro horologie-cz zatím není použita Photo komponenta z hodinarium-eu, ale pokud doplníme externí fotky (např. z akcí spolku, kde jsou autorské fotky cizích lidí), přenést Photo komponentu do `apps/horologie-cz/src/components/`. Vzor je v `apps/hodinarium-eu/src/components/Photo.astro`.

## 11. Specifika oproti hodinarium-eu

| Aspekt | hodinarium-eu | horologie-cz |
|---|---|---|
| Charakter | Velký archiv článků (200+) o sbírce, expozici, projektech | Oficiální web spolku — identita, dokumenty, akce |
| Struktura | Content collection (`content/hodinarium-eu/*.md`) → `[slug].astro` | Static pages (`src/pages/*.astro`) |
| Frontmatter schema | Bohaté (tldr, references, author, …) | Žádný — vše inline v .astro |
| Hero pattern | Auto-promote prvního `<img>` v článku | Hero typicky `.hero` block, žádný auto-img-hero |
| References | `references[]` v frontmatter, sekce „Literatura a odkazy" | Méně časté, ručně inline kde potřeba |
| Photo komponenta | `apps/hodinarium-eu/src/components/Photo.astro` | TODO portnout, když vznikne potřeba |
| Article perex | tldr / auto z catalog.excerpt | `.lede` paragraf inline ve stránce |
| Build target | 251 stránek | 36 stránek |

## 12. Cloudflare Pages — horologie-cz

Stejně jako hodinarium-eu má Cloudflare Pages projekt: `horologie-cz.pages.dev`. Build command `pnpm build`, output `dist/`. Webhook trigger na push do `main`.

**Při zaseknutém deploy** (TS error v check fáze): otevři `Cloudflare dashboard → Pages → horologie-cz → Deployments`, najdi failed build, oprav lokálně přes `pnpm build` + commit + push.

## 13. Při velkých refaktorech

Horologie-cz má **mnohem méně stránek** než hodinarium-eu (36 vs 251). Hromadné refaktory (např. perex full-width, brand color, schema změny) jsou rychlé a bezpečné — do hodiny si lze prohlédnout všechny stránky.

Při úpravě globálních patternů (typografie, kontejnery, color tokens) **vždy zkontroluj diff oproti hodinarium-eu** — pokud má smysl tam ji aplikovat taky, udělej to v jednom commit (sister sites mají sdílet vizuál, kde to dává smysl).
