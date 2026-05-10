# Pomocníci v editoru — handbook pro editory

Krátký průvodce volitelnými funkcemi, které jsme přidali do Sveltia
editoru pro snadnější psaní hodinářských článků a karet.

**Aktivace:** otevři `/admin/`, vlevo dole klikni **⚙ Pomocníci**.
Default je vše vypnuté (kromě „Vkládání odkazů") — uživatel zapne
co chce. Settings se uloží v prohlížeči (`localStorage`), takže se
zachovají mezi návštěvami.

## 📖 Český spell-checker (hodinářský)

**Co dělá:** podtrhne nepravopisná slova v editačních polích vlnitou
červenou linkou (CSS gradient mřížka, ne plné podtržení).

**Slovník obsahuje:**

- Plný **český Hunspell slovník** s morfologií (skloňování:
  kyvadlu / kyvadlem / kyvadly / o kyvadle…)
- **1242 hodinářských termínů a jmen** z CSH:
  - 57 hesel slovníku (setrvačka, kotva, čtvrťové bití, invar, …)
  - 104 medailonů hodinářů (Krečmer, Hainz, Janata, Prokeš, …)
  - 396 obcí ze soupisu věžních hodin (Holešovice, Sušice, Vimperk, …)
  - + české aliasy a historicky validní cizí jména (Schöpperle, München)

**Co se podtrhne (anglicismy):**

- „balanc" → správně **„setrvačka"** (klikni na heslo ve slovníku)
- „vlasová pružinka" → **„vlásek"**
- „escapement" → **„krok"** / **„úchopový mechanismus"**

**Co se nepodtrhne (s diakritikou + jména):**

- „Krečmer", „Hainz", „Holešovice" (custom CSH dict)
- „kyvadlové soukolí", „čtvrťový stroj" (cs morfologie + slovník)

**Vlastnosti:**

- Plně **offline** — slovník v prohlížeči, žádný API call při psaní
- První zapnutí stáhne ~6 MB cs Hunspell dict z CDN (jednorázově,
  cached browser pro další session)
- Init ~3-5 s (parsování slovníku), pak check tokenu < 1 ms

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

## 📩 Hlášení problémů

Cokoli rozbité nebo zmatené — buď:

1. **„Nahlásit problém"** tlačítko v editoru (založí GitHub Issue
   automaticky s kontextem stránky a info o prohlížeči)
2. E-mail na **info@orloj.eu**
3. Direct mention v Czech Spolek Horologický discussion
