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

### Aktivace + co se stáhne

Klik **⚙ Pomocníci** → zaškrtni **Český spell-checker (hodinářský)**.

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

## 📩 Hlášení problémů

Cokoli rozbité nebo zmatené — buď:

1. **„Nahlásit problém"** tlačítko v editoru (založí GitHub Issue
   automaticky s kontextem stránky a info o prohlížeči)
2. E-mail na **info@orloj.eu**
3. Direct mention v Czech Spolek Horologický discussion
