# Pomocníci v editoru — handbook pro editory

Krátký průvodce volitelnými funkcemi, které jsme přidali do Sveltia
editoru pro snadnější psaní hodinářských článků a karet.

**Aktivace:** otevři `/admin/`, vlevo dole klikni **⚙ Pomocníci**.
Default je vše vypnuté (kromě „Vkládání odkazů") — uživatel zapne
co chce. Settings se uloží v prohlížeči (`localStorage`), takže se
zachovají mezi návštěvami.

## 📋 Úkolovník (editorial workflow)

Stránka [`/admin/tasks/`](/admin/tasks/) zobrazuje rozpracované články
napříč všemi content collections (clanky, hodinari, kroky, slovnik,
soupis-veznich-hodin). V Sveltia toolbaru je tlačítko **📋 Úkoly**
vlevo nahoře.

**Stavy článku** (workflow.status):

| Stav | Význam | Co s tím |
|---|---|---|
| `todo` | k zabrání | Někdo by ho měl začít upravovat |
| `in-progress` | rozpracováno (zabráno editorem) | Sám nedělej, domluvte se |
| `review` | k recenzi | Někdo má přečíst a schválit |
| `ready` | hotovo, publikováno | Zmizí z úkolovníku |

**Default:** žádný `workflow` field = `ready` = backwards-compatible
(stejné chování jako dnes — všechny existing články fungují bez
změny).

### Frontmatter struktura

```yaml
---
title: "..."
draft: false               # existing — pokud true, jen editoři vidí
workflow:                  # NEW — opt-in
  status: 'in-progress'    # 'todo' | 'in-progress' | 'review' | 'ready'
  lockedBy: 'petr'         # editor zabírající článek
  lockedAt: '2026-05-10T08:00:00Z'  # ISO timestamp
  reviewers: ['david']     # kdo má přečíst před uvolněním
  reviewedBy: []           # kdo to schválil
  publicDuringEdit: false  # zda viditelný i v rozpracovaném stavu
  notes: |
    Petr: chybí foto stroje, čekám na NPÚ
---
```

### Lock model (advisory)

Lock je **advisory** — Sveltia commits přímo na main, technicky
nelze enforce. Pro CSH (5 editorů, sotva někdy 2 najednou na same
article) je dohoda dostatečná:

1. Editor klikne **📋 Úkoly** → najde článek → **Editovat**
2. V Sveltia formuláři pod sekcí *Workflow status* nastaví:
   - `status: in-progress`
   - `lockedBy: <jméno>`
   - `lockedAt: <aktuální timestamp>` (ISO 8601)
3. Save → commit → ostatní editoři v úkolovníku vidí lock
4. Když edituje další editor článek se zabraným locked stavem,
   v Sveltia banner upozorní (V2 — zatím nutno zkontrolovat ručně
   v úkolovníku)

### Workflow přechody (V1 manuální)

V V1 jsou stavy nastavovány **ručně v Sveltia formuláři**.
V2 (TODO A.23.4) přidá tlačítka „Zabrat / Pošli k review /
Schvaluji" v úkolovníku, které volají API endpoint pro automatickou
změnu.

```
todo → in-progress    : editor nastaví status + lockedBy + lockedAt
in-progress → review  : smaže lockedBy, status: review, doplň reviewers
review → ready        : reviewer přidá své jméno do reviewedBy,
                        editor smaže workflow field nebo nastaví
                        status: ready (zmizí z úkolovníku)
```

### Public visibility logic

| draft | status | publicDuringEdit | Veřejnost | Editor |
|---|---|---|---|---|
| true | (any) | (any) | ❌ 404 | ✅ s draft banner |
| false | ready / null | (any) | ✅ | ✅ |
| false | in-progress / review / todo | true | ✅ s WIP banner | ✅ |
| false | in-progress / review / todo | false | ❌ 404 | ✅ s status banner |

**Příklad workflow:**

```yaml
# Začínám psát článek o nové akvizici, zatím skrytý:
workflow:
  status: in-progress
  lockedBy: petr
  lockedAt: '2026-05-10T08:00:00Z'
  publicDuringEdit: false  # default — veřejnost nevidí

# Hotov, posílám Davidovi k recenzi:
workflow:
  status: review
  reviewers: [david]

# David schvaluje a uvolňuje:
workflow:
  status: ready
  reviewedBy: [david]
  reviewers: [david]

# Nebo prostě smazat workflow field — = ready, default
```

## 📖 Spell-check — 3 režimy (vyber jeden)

V Pomocníci jsou tři vzájemně exclusive volby:

| Režim | Co umí | Co neumí | Cena |
|---|---|---|---|
| **Browser nativní (cs)** *(výchozí)* | Co umí prohlížeč — běžnou češtinu (potřebuje cs jazyk v OS / browser settings). Žádný extra download. | Hodinářské termíny (Krečmer, setrvačka, Holešovice). | 0 KB stažení. |
| **CSH hodinářský** | Cs Hunspell s morfologií (kyvadlu / kyvadlem / kyvadly) **+ 1242 hodinářských termínů a jmen** z CSH slovníku, medailonů a soupisu obcí. Vypne browser native (jen jeden naráz). | Cizojazyčné pasáže (vše bude flagged) — pak mode **Vypnuto**. | ~6 MB stažení 1×. |
| **Vypnuto** | — | — | 0. Užitečné pro psaní cizojazyčných pasáží (citace, něm. v hist. dokumentech). |

Default je **Browser nativní** — žádný surprise download, ale taky
neflagne `balanc` jako anglicismus. Editoři, kteří chtějí kontrolu
hodinářské terminologie, přepnou na **CSH hodinářský**.

> **Pozn.:** Browser native a CSH **se nemíchají** — předchozí verze
> měla bug, kdy obě podtrhávaly paralelně. Teď je to mode picker, jen
> jedna engine současně.

## 📖 CSH hodinářský — detail

**Co dělá:** podtrhne nepravopisná slova v editačních polích vlnitou
červenou linkou (CSS gradient mřížka, ne plné podtržení).

### Aktivace + co se stáhne

Klik **⚙ Pomocníci** → vyber radio button **CSH hodinářský**.

Při **prvním zapnutí** se stáhne (po síti, jednorázově):

| Soubor | Velikost | Zdroj |
|---|---:|---|
| `nspell` knihovna | ~50 KB | esm.sh CDN |
| `cs_CZ.aff` (gramatická pravidla) | ~1.2 MB | unpkg.com (`dictionary-cs@2.0.0`) |
| `cs_CZ.dic` (slovník 200k+ slov) | ~5 MB | unpkg.com |
| `csh-spell-dict.json` (CSH terms 1242) | ~50 KB | tento web (`/admin/`) |
| **Celkem** | **~6.3 MB** | (cached browser pro další session) |

**Časová náročnost:**

- 1× zapnutí: stažení 3–10 s (podle připojení) + parsování 3–5 s
- Další zapnutí v session: < 100 ms (soubory v browser cache)
- Check jednoho slova: < 1 ms (vše v paměti)
- Heap memory: ~10 MB

**Vše offline:** žádný server-side API call při psaní. Tvůj text
nikam neodchází (na rozdíl od AI našeptávače).

### Co podtrhne / nepodtrhne

**Slovník obsahuje:**

- Plný **český Hunspell slovník** s morfologií (skloňování:
  kyvadlu / kyvadlem / kyvadly / o kyvadle…) — ~200 000 slov
- **1242 hodinářských termínů a jmen** z CSH:
  - 57 hesel slovníku (setrvačka, kotva, čtvrťové bití, invar, …)
  - 104 medailonů hodinářů (Krečmer, Hainz, Janata, Prokeš, …)
  - 396 obcí ze soupisu věžních hodin (Holešovice, Sušice, Vimperk, …)
  - + české aliasy a historicky validní cizí jména
    (Schöpperle, München, Glashütte, Würtembersko)

**Co se podtrhne (špatně):**

- Anglicismy: `balanc` → správně **„setrvačka"**
- Nestandardní formy: `vlasová pružinka` → **„vlásek"**
- `escapement` → **„krok"** / **„úchopový mechanismus"**
- Překlepy: `kyvadlu` ✓ vs `kyvadelm` ✗ (chybný pád)

**Co se nepodtrhne (správně):**

- České slovo s diakritikou: `kyvadlové soukolí`, `čtvrťový stroj`
- Hodináři (custom dict): `Krečmer`, `Hainz`, `Janata`
- Místa ze soupisu: `Holešovice`, `Sušice`, `Vimperk`
- Historická cizí jména: `München`, `Schöpperle`, `Glashütte`

### Kde funguje + kde ne

✅ **Funguje:** velké textareas (≥ 60 px výška) — typicky tělo
článku v Sveltia editoru, případně markdown source view.

❌ **Nefunguje:** malá single-line input pole (slug, title, autor,
inv. číslo, …) — tam by overlay nesedělo.

⚠ **Sveltia rich-text WYSIWYG mode** (TipTap/ProseMirror) — overlay
nemusí sedět přesně, protože to není čistý `<textarea>` element.
**Workaround:** přepni do *Markdown source* view (ikona/přepínač
v editoru, typicky vpravo nahoře). Tam funguje overlay přesně.

### Limity a workarounds

**Slovo je správně, ale podtrhává se:**

1. Zkontroluj, že je v cs Hunspell slovníku — zkus si ho [na
   webu Hunspell](https://www.languagetool.org/)
2. Pokud je hodinařské / vlastní jméno + není v naší custom dict,
   pošli e-mail **info@orloj.eu** s ukázkou. Při dalším buildu
   slovník přibude.
3. Ignorovat lze prostým `localStorage.setItem('csh-ignore-words',
   JSON.stringify(['slovo1', 'slovo2']))` v Console (V2: UI
   tlačítko „Přidat do osobního slovníku").

**Spell-checker se zasekl / nezapne:**

1. F12 → tab **Console**: hledat `[csh-spell] …` zprávy. Pokud
   není `Activated`, ale je `Loading`, čekej 5–10 s (parsování).
2. Pokud `Failed to activate: …`, jde o stažení / network. Zkus
   znovu zapnout v Pomocníci, případně reload stránky.
3. Vyčištění browser cache: **F12 → Application → Storage → Clear
   site data** (Chrome/Edge), nebo **Storage → Clear All** (Firefox)
   → reload → zapni znovu (stažení proběhne znovu).

**Performance issue (delší texty):**

- Spell-check má 300 ms debounce — při psaní rychle se overlay
  nepřekresluje při každém znaku.
- Pro extrémně dlouhé texty (>10 kB) může re-render trvat ~50 ms.
  Akceptable pro běžné articles.

### Co dělat když najdeš podtržené slovo

1. **Pravdivá chyba** (typo, anglicismus): oprav v textu — overlay
   se hned překreslí.
2. **Slovník to nezná, ale je to správně** (např. nové jméno
   hodináře, místní název): nech být, hlas redaktorovi přes
   info@orloj.eu — slovník rozšíříme.
3. **Ignorovat dočasně** (jen v této session): aktuálně nelze
   per-word; reset settings vrátí do default.

### Kompatibilita prohlížečů

| Prohlížeč | Verze | Spell-check | AI | Link picker | Poznámka |
|---|---|---|---|---|---|
| **Chrome** / Edge / Brave | 79+ (2020) | ✅ | ✅ | ✅ | Plně funkční, doporučeno |
| **Firefox** | 79+ (2020) | ✅ | ✅ | ✅ | Plně funkční |
| **Safari** | 14+ (2020) | ✅ | ✅ | ✅ | Funguje, DevTools je třeba zapnout v Settings → Advanced |
| **Safari iOS** | 14+ | ⚠ | ⚠ | ⚠ | Sveltia editor není mobile-friendly, overlay positioning může být off |
| **Chrome mobile** | 79+ | ⚠ | ⚠ | ⚠ | Stejné jako iOS — Sveltia není primárně mobile |
| Internet Explorer 11 | — | ❌ | ❌ | ❌ | Sveltia ani Astro nepodporují IE |

**Co konkrétně potřebujeme:**

- ESM dynamic `import()` (Chrome 63, Firefox 67, Safari 11.1)
- `fetch()`, `AbortController`, `AbortSignal.timeout()` (Safari 16+)
- `TextDecoder`, `MutationObserver`, `ResizeObserver`
- `WeakMap`, `WeakSet`, `localStorage`

**Známé problémy:**

- **Firefox private mode:** `localStorage` per-tab, settings se nezachovají
  mezi sessions. Workaround: použít normal mode nebo nastavit po každé.
- **Safari < 16:** `AbortSignal.timeout()` chybí — link picker NPÚ search
  může zaseknout request. Workaround: aktualizovat Safari na 16+.
- **Sveltia rich-text mode:** v některých Sveltia verzích je markdown
  body v `contenteditable` div místo `<textarea>`. Tam náš overlay
  nesedí. **Workaround:** přepni na *Markdown source* view.
- **Žádné CORS issues** identifikovány — všechny 4 search backends
  (internal, Wikipedia, Wikidata, NPÚ) podporují CORS pro public API.

### Chrome / Firefox extension (V2 plán)

Aktuální V1 funguje **jen v `/admin/` na hodinarium-eu.pages.dev** —
scripts se loadují z `/admin/csh-*.js`. Pokud editor pracuje s
markdown jinde (lokální editor, GitHub web edit, Notion, …),
spell-check + slovník nejsou k dispozici.

**Plánovaná CSH browser extension** (PBI A.22 — viz [TODO.md](../TODO.md))
to vyřeší:

- **Distribuce:** Chrome Web Store + Firefox Add-ons (~$5 one-time
  poplatek pro Chrome, free pro Firefox)
- **Funguje napříč weby:** kdekoli editor píše do `<textarea>` nebo
  `[contenteditable]` — Sveltia, GitHub editor, Confluence, Notion,
  generic forms
- **Sdílený slovník:** stejný `csh-spell-dict.json` v extension
  bundle, periodicky updateovaný přes auto-update Chrome Web Store
- **Right-click „Přidat do CSH slovníku"** — editor sám přidává
  per-word, sync přes GitHub Issue Davidovi pro permanent dict update
- **AI našeptávač** přes existing `/api/ai/suggest` endpoint
  (s CORS allow rule)
- **Cross-browser:** WebExtension API (single codebase Chrome+Firefox)

**Effort:** ~2-3 dny. **Hosting:** $0 (extension běží lokálně,
Chrome Web Store $5 one-time pro publish).

**Use case rozdíl:**

| Scenario | V1 (current) | V2 (extension) |
|---|---|---|
| Sveltia admin/ | ✅ | ✅ |
| GitHub web editor | ❌ | ✅ |
| Lokální editor (VS Code, Sublime) | ❌ | ❌ (ne browser-based) |
| Notion / Confluence | ❌ | ✅ |
| Discord / Slack | ❌ | ✅ |

V2 zatím čeká na implementaci — když uživatel reálně edituje obsah
mimo Sveltia (např. GitHub web editor pro emergency fix), V1 je
limitující.

## 🤖 AI našeptávač

**Co dělá:** po pauze ~1.2 s v psaní AI navrhne pokračování věty
jako *ghost-text* — lehce průhledný zelený italic text za kurzorem.

**Klávesy:**

| Akce | Klávesa |
|---|---|
| Přijmout návrh | **Tab** |
| Odmítnout návrh | **Esc** |
| Pokračuj psát | (návrh zmizí, po další pauze přijde nový) |

**Status indikátor** vpravo dole:

| Stav | Vzhled |
|---|---|
| ⋯ AI přemýšlí | žlutý |
| ✎ AI navrhuje (Tab přijme) | zelený |
| ⚠ Chyba | červený, fade po 4 s |

**Trigger conditions:**

- Kontext před kurzorem ≥ 30 znaků
- Poslední znak **není** `.` `!` `?` `\n` (nepřerušíme dokončenou větu)
- Pauza 1.2 s od posledního stisku klávesy

**Co AI ví:**

- Náš slovník (krokové kolo → Steigrad, ne Triebrad)
- Hodinařské konvence (formální cs, vyhýbat se anglicismům)
- Style guide CSH (žádné „balanc" v cs textu)

**Privacy:**

⚠ Text odchází na Cloudflare při každém požadavku. Modelu Mistral 24B
trvá ~1-3 s odpověď. Pokud je obsah citlivý / důvěrný (draft, neover-
ená data), vypni AI v Pomocníci.

**Backend:** `Cloudflare Workers AI` (model
`@cf/mistralai/mistral-small-3.1-24b-instruct`). Free tier 10 000
neuronů/den = ~280 calls/den. Pro 5 editorů × 50 calls/měsíc =
~3 % free quota / měsíc. Bezpečně ve free.

## 🔗 Vkládání odkazů (Cmd+K / Ctrl+K)

**Co dělá:** sjednocený modal pro vkládání odkazů z 5 zdrojů.

**Workflow:**

1. V textarea **označ slovo** (např. „Krečmer") nebo nech kurzor
2. Stiskni **⌘K** (Mac) / **Ctrl+K** (Win/Lin)
3. Modal otevřen, search input pre-filled selection
4. Po 250 ms throttle → 4 paralelní queries → výsledky postupně přicházejí
5. Klik (nebo Enter) vloží markdown link nahrazením selection

**Klávesy v modalu:**

| Akce | Klávesa |
|---|---|
| Otevřít modal | **⌘K** / **Ctrl+K** |
| Navigace mezi výsledky | **↑** / **↓** |
| Vložit vybraný | **Enter** |
| Zavřít | **Esc** |

**Sekce výsledků:**

- **📍 Hodinárium** — bge-m3 semantic search nad cross-collection
  corpus (1100+ stránek): medailony hodinářů, slovník, soupis věžních
  hodin, články, sbírkové karty
- **ⓦ Wikipedia (cs)** — heslo z české Wikipedie (opensearch API)
- **🏛 Wikidata** — entity Q-id s cs label (wbsearchentities API)
- **🏛 Památkový katalog NPÚ** — kulturní památky (ArcGIS REST)
- **🔗 Vlastní URL** — manuální vstup do pole pod sekcemi

**Ukázka:**

| Vstup | Vloží |
|---|---|
| `Krečmer` (klik na medailon) | `[Krečmer](/hodinari/vaclav-krecmer)` |
| `pražský orloj` (klik na Wikipedii) | `[Pražský orloj](https://cs.wikipedia.org/wiki/Pra%C5%BEsk%C3%BD_orloj)` |
| `Budova celní expozitury` (klik na NPÚ) | `[Budova celní expozitury](https://www.pamatkovykatalog.cz/...)` |
| `https://example.com` (vlastní URL) | `[example.com](https://example.com)` |

**Default ON** — žádný stažený asset, žádný runtime overhead.
Globální keybinding aktivní jen když je v Pomocníci zaškrtnuto.

## ⚙ Diagnostika

Pokud něco nefunguje, otevři DevTools console:

- **Chrome / Edge:** **F12** → tab Console
- **Firefox:** **F12** nebo **Ctrl+Shift+J** (Mac: **Cmd+Opt+K**)
- **Safari:** Settings → Advanced → „Show features for web developers" →
  pak **⌘ Opt I**

Po zapnutí pomocníků v Console uvidíš:

```
[csh-spell] Loading nspell + cs_CZ Hunspell dict…
[csh-spell] Ready. Base cs dict + 1242 custom CSH words.
[csh-spell] Activated.
[csh-ai] Activated.
[csh-link] Activated. ⌘K v textarea otevře link picker.
```

**Reset všech nastavení** (do Console):

```js
localStorage.removeItem('csh-editor-settings'); location.reload();
```

Pak ⚙ Pomocníci budou opět default — vše vypnuté (kromě link picker).

## 📚 Citace ze Zotera (plánováno A.15.1)

**Důležité:** editoři **nepotřebují Zotero account ani přístup** —
hotový picker (až bude implementován) bude pracovat jen s lokálním
snapshotem `references.json`, který spravuje David. Editor vidí
existující reference, klik vloží `<Ref bibKey="..." />` + auto-doplní
frontmatter.

**Aktuálně (před A.15.1):** vkládání citací je manuální:

1. Pokud znáš `bibKey` (např. `buresKonstrukceMechanickychHodin1965`),
   napiš v textu `<Ref bibKey="buresKonstrukceMechanickychHodin1965" pages="87" />`
2. Doplň do frontmatter:
   ```yaml
   references:
     - bibKey: buresKonstrukceMechanickychHodin1965
       type: kniha
   ```

**Citace, která chybí v `references.json`:**

Pošli e-mailem na **info@orloj.eu** (nebo přes „Nahlásit problém"):
- Title, autor(i), rok
- URL nebo DOI nebo ISBN
- Krátká nota proč ji potřebuješ

David ji přidá do Zotera, příští sync přinese do `references.json`,
budeš ji moci použít.

## 🚧 Známé limity V1

- Spell-checker overlay heuristika je **přibližná** — pokud Sveltia
  editor používá rich-text widget (TipTap / ProseMirror) místo plain
  `<textarea>`, overlay nesedí. V tom případě V2 fix s editor API
  integrací.

- AI našeptávač funguje jen pro `<textarea>` (markdown source mode
  v Sveltia). Pro WYSIWYG mode V2 follow-up.

- Žádný rate limiting per-uživatel — relevantní až při více editorech.

- Foto upload validation (povinný credit field) zatím není — viz
  [TODO A.16](../TODO.md).

## 🧩 Vkládání interaktivních prvků — direktivy

V některých článcích (např. *Mysteriózní hodiny*, *Kostky*, *Židovské hodiny*) jsou **interaktivní prvky** — PDF prohlížeč, virtuální ciferník, YouTube video s hezkým náhledem, foto s creditem. Dřív tyhle prvky vyžadovaly „programátorský" zápis (`import` + JSX), na kterém Sveltia padala. **Nově je píšeš jednoduchou direktivou** — Sveltia ji vidí jen jako text, takže nic nepadá.

### Syntax

```markdown
::name-direktivy
::name-direktivy{atribut1="hodnota1" atribut2="hodnota2"}
```

**Pravidla:**
- Začíná dvojtečkou `::` (dvě dvojtečky)
- Bez argumentů → samostatný řádek (např. `::tabor-orloj`)
- S argumenty → vše **na jeden řádek**, hodnoty v uvozovkách
- Mezi direktivou a okolním textem nech **prázdný řádek**
- Když direktivu rozbiješ na víc řádků, **nebude fungovat**

### Přehled dostupných direktiv

| Direktiva | Co dělá | Atributy |
|---|---|---|
| `::prs10-live` | Tabule živých dat z rubidiového oscilátoru PRS10 | — |
| `::cas-slovem` | Aktuální čas vypsaný slovy („za pět tři čtvrtě na deset") | — |
| `::cas-segmentovky` | Segmentovky s rébusovým překladem | — |
| `::slunecni-klementinum` | Virtuální sluneční hodiny Klementina | — |
| `::tabor-orloj` | Virtuální táborský orloj | — |
| `::zidovske-hodiny` | Virtuální ciferník židovské radnice | — |
| `::youtube` | YouTube video s náhledem (zachová privacy, načte se až po kliknutí) | `id`, `title`, `align`, `ratio` |
| `::pdf-pager` | PDF prohlížeč přímo v článku (page-by-page navigace) | `src`, `title`, `pages` |
| `::photo` | Obrázek s creditem (autor, licence, zdroj) v rohu | `src`, `alt`, `class`, `author`, `authorUrl`, `license`, `licenseUrl`, `sourceUrl`, `year`, `caption` |

### Příklady

**YouTube video** s vlastním titulkem, vpravo plovoucí, vertikální poměr:

```markdown
::youtube{id="RMyYnnAPIV8" title="Podružný strojek — režim nastavení času" align="right" ratio="9/16"}
```

**PDF brožura** (76 stran):

```markdown
::pdf-pager{src="/download/brozura_miniatury.pdf" title="Brožura — Výtvarné miniatury" pages="76"}
```

**Fotografie s creditem** (autor, licence, zdroj na Wikimedia Commons):

```markdown
::photo{src="/img/zidovske/holmstad_2014_cifernik.jpg" alt="Hebrejský ciferník Židovské radnice" class="img-hero" author="Øyvind Holmstad" license="CC BY-SA 3.0" licenseUrl="https://creativecommons.org/licenses/by-sa/3.0/" sourceUrl="https://commons.wikimedia.org/wiki/File:Prague_Praha_2014_Holmstad..."}
```

### Umístění obrázku — `class` atribut

Atribut `class` na `::photo` nebo přímo na `<img>` určuje, kde se obrázek na stránce zobrazí. Můžeš jich uvést víc oddělených mezerou (`class="img-medium img-float-left"`).

| Třída | Layout | Šířka | Kdy použít |
|---|---|---|---|
| `img-hero` | Plná šířka, nahoře pod nadpisem | 100 % | Hlavní reprezentativní fotka (první v článku, automaticky) |
| `img-full` | Plná šířka, kdekoliv | 100 % | Velký obrázek uprostřed textu, žádné obtékání |
| `img-standalone` | Na střed, žádné obtékání | max 480 px | Screenshot, schéma, ilustrace uprostřed |
| `img-small` | Plovoucí vpravo (default), drobný | max 220 px | Drobná ilustrace co obtéká text |
| `img-medium` | Plovoucí vpravo (default), střední | max 320 px | Střední ilustrace v textu |
| `img-tall` | Plovoucí vpravo, vysoký portrét | max 240 × 480 px | Portrét, vertikální detail |
| `img-float-left` | Vynutí obtékání **vlevo** | (dědí) | Když chceš explicitně levé obtékání |
| `img-float-right` | Vynutí obtékání **vpravo** | (dědí) | Když chceš explicitně pravé obtékání |

**Příklady:**

```markdown
::photo{src="/img/detail.jpg" alt="Detail kotvy" class="img-small"}

Text obtéká drobnou ilustraci kotvy zprava. Pokračuje normálním tokem…
```

```markdown
::photo{src="/img/schema.jpg" alt="Schéma" class="img-standalone"}
```

```markdown
::photo{src="/img/portret.jpg" alt="Hodinář" class="img-medium img-float-left"}

Text obtéká portrét hodináře zleva…
```

**Automatika bez class:**

- **První obrázek v článku** dostane automaticky `img-hero` (full width nahoře).
- **Další obrázky** bez explicit class plovou střídavě vpravo / vlevo (časopisecký rytmus). Když chceš jiné chování, doplň class ručně.
- **Mobile** (≤ 600 px) — všechny plovoucí obrázky se automaticky srovnají do středu a roztáhnou na plnou šířku.

**Grid 2+ obrázků vedle sebe** — dej víc obrázků na **jeden řádek** (markdown):

```markdown
![pohled 1](url1) ![pohled 2](url2) ![pohled 3](url3)
```

CSS automaticky srovná do mřížky (2-3 sloupce podle šířky).

**Bez atributů** (čistě interaktivní widget):

```markdown
## Mysteriózní hodiny

::cas-slovem

Pod tímhle widgetem pokračuje text…
```

### Tipy a tricky

- **`::photo` vs. markdown `![alt](src)`** — používej `::photo` jen když potřebuješ credit nebo specific class (`img-hero`, …). Pro běžný obrázek bez creditu stačí markdown.
- **Číselné atributy v uvozovkách** — `year="2014"`, `pages="76"`. Píšeš to jako text, komponenta si to převede.
- **Více atributů** — odděluj **mezerou**, ne čárkou.
- **Když uvozovky uvnitř hodnoty** — momentálně neumíme. Pokud potřebuješ uvozovky uvnitř atributu, napiš to v plain HTML entity `&quot;` nebo to napiš jinak.
- **Když direktiva nefunguje** — zkontroluj že je celá na jednom řádku a okolo má prázdný řádek. Když text okolo „nalepí" rovnou na direktivu, parser ji nepozná.

### Když chceš novou direktivu

Napiš Davidovi (nebo do GitHub issue) — nová interaktivní komponenta musí být přidaná do dvou míst v kódu (registrace pluginu + Astro komponenta). Není to nic složitého, ale editor to udělat nemůže.

## 📩 Hlášení problémů

Cokoli rozbité nebo zmatené — buď:

1. **„Nahlásit problém"** tlačítko v editoru (založí GitHub Issue
   automaticky s kontextem stránky a info o prohlížeči)
2. E-mail na **info@orloj.eu**
3. Direct mention v Czech Spolek Horologický discussion
