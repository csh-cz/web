# Hero/index design critique — hodinarium.eu

**Datum auditu:** 2026-05-12
**URL:** https://hodinarium-eu.pages.dev/
**Soubor:** [`apps/hodinarium-eu/src/pages/index.astro`](../apps/hodinarium-eu/src/pages/index.astro)

Read-only kritika hero + úvodní stránky pro tři audience segmenty + obecné technické pozorování. **Žádné změny** nejsou součástí tohoto auditu — pouze observace a doporučení.

---

## 1. Audience segmenty — návštěvní intent vs. stránka

### 🚌 Segment A: Návštěvník muzea Děčín

**Hypotetický scénář:** Babička s vnukem našla letáček s adresou `hodinarium.eu`. Přijde se podívat, jestli má smysl jet do Děčína.

**Co tady chce najít:**
- Kdy je otevřeno? Vstupné?
- Jak se tam dostat?
- Co konkrétně uvidí v Děčíně (na rozdíl od jiných muzeí hodin)?

**Co reálně najde:**
- Hero text *„Sbírka, expozice a projekty obdivovatelů hodinařiny — od věžních strojů 15. století…"* — abstraktní, žádný geographical anchor. Nikde se nepoznám, **kde** je Hodinárium.
- CTA *„Procházet sbírku"* + *„Mapa horologie →"* — obě vedou do virtuálního obsahu, ani jedna na **„Naplánuj návštěvu"** nebo **„Otevírací doba"**.
- Pojem „Hodinárium" jako proper noun se v hero textu nedefinuje. Návštěvník neví, jestli „Hodinárium" = expozice v Děčíně, jméno webu, nebo název spolku.
- *About* section se zmiňuje o Děčíně **až úplně dole** (po featured + explore + random + …), s 1 větou jako odbočka: *„o vzniku a koncepci expozice na Zámku Děčín v sekci O Hodináriu"*. Z mobilu = ~6 viewportů scroll než to zaregistruje.

**Friction:** Vysoký. Návštěvník musí explicitně proklikem do menu (`Návštěva` v top nav) najít praktické info. Pokud sem narazil přes search/Google nebo jiný letáček, hero nepotvrdí, že je „ve správné stránce".

### 🔍 Segment B: Cs amatér hodinářství

**Hypotetický scénář:** Restaurátor v Plzni hledá detail Grahamova kroku v 19. století. Najde web přes Google.

**Co najde:**
- Hero text je poetický a vyznáčuje rozpětí obsahu (*„15. století → mikroprocesor"*) — dobré pro **lift** zájmu.
- *Featured exponáty* obsahuje 4 ručně vybrané články; pro restaurátora užitečné jako objevitelný point (`astro2_NTP` mu sice nepomůže, ale `švarcvaldky` nebo `decin_koncepce` ano).
- *Tagy + Mapa* (sekce „Najdi si svoji cestu") = dobrý a srozumitelný entry point. **221+ článků podle vlastností** je konkrétní číslo.
- *Náhodný výběr* — discovery pattern. Standardní web by možná místo random měl „Nejnovější", ale random funguje pro evergreen muzejní obsah.

**Friction:** Nízký. Pro tohoto návštěvníka stránka funguje dobře.

**Drobnost:** *„obdivovatelů hodinařiny"* — slovo *hodinařina* je hovorové. Pro odbornou audienci by místo toho mohlo být *„hodinařiny"* → *„hodinářství"* (formálnější), ale charm. Petr by mohl rozhodnout.

### 🌍 Segment C: EN enthusiast

**Hypotetický scénář:** Sběratel astrolábů ze San Franciska narazí na web přes Wikipedia link na orloj.eu sister site.

**Co najde:**
- Top nav má `EN` jako odkaz vedoucí na `/en` — funkční.
- **Ale hero text je celý v češtině** — návštěvník bez kontextu neví, kam kliknout pro anglickou verzi.
- Sister web Orloj.eu (sekce dole) zmíněn, ale zase v češtině.

**Friction:** Střední. EN link je tam, ale není visually privileged. Vlajka nebo prominentnější umístění by pomohlo. Anebo automatický redirect při `Accept-Language: en`.

---

## 2. Hero — vlastní kritika

### Co funguje

- **Typografie:** Velký serif title (`clamp(2.5, 8vw, 5rem)`) + serif eyebrow + sans body. Klasická editorial sazba.
- **Dvě CTA tlačítka:** Primary „Procházet sbírku" (mosazné) + secondary „Mapa horologie →". Vizuální hierarchie zřejmá.
- **Lede max-width 36ch:** Optimální čtecí délka.

### Co je k diskuzi

#### a) Prázdná pravá polovina na desktop

```css
.hero-grid {
  grid-template-columns: 1fr auto;  /* >= 900px */
}
```

Right column je `auto`, ale nemá obsah → zůstává prázdná. Cca 50 % desktop viewportu nevyužito. Možnosti:

1. **Hero foto** — jeden silný snímek (např. Pražský orloj sister hint, nebo Krečmerova Měšice, nebo kalendářní deska Mánesa). „Vůně historie" navozená vizuálem.
2. **Hero stats** (`.hero-stats` styles už v CSS existují, ale nikde se neaplikuje!) — 4 čísla typu „494 článků / 410 strojů / 104 hodinářů / 135 slovníkových hesel". Dokládá rozsah obsahu.
3. **Featured exponát č. 1** — promoted „card" s jedním obrázkem, nahrazuje featured grid #1.

#### b) CTA pokrytí

Současné CTA cílí jen na **virtuální průchod** (sbírka + mapa). Chybí:

- **„Návštěva v Děčíně"** → `/pro-navstevniky` (existuje!). Tlačítko 3. priority pro Segment A.
- **„Anglicky / English"** → `/en`. Drobné, ale zmírní friction pro EN návštěvníky.

Aktuálně CTA neuvádí žádný indikátor `→` u primary „Procházet sbírku" (secondary má). Konzistence — buď obě s arrow, nebo žádné.

#### c) Eyebrow nadrazenost

`Český spolek horologický` je v eyebrow nad „Hodinárium" titulem. Pro nového návštěvníka to může znít zaměnitelně: „Český spolek… co je to Hodinárium?". Krátký podtext typu **„Webová expozice Českého spolku horologického"** přímo pod title (= subtitle) by to vyjasnil.

---

## 3. Featured grid

```js
const featuredSlugs = ['astro2_NTP', 'sobeslav3', 'svarcvaldky', 'decin_koncepce'];
```

Slugy jsou **hardcoded v `index.astro`** — ne v configu nebo content frontmatter. Při D6 slug migraci (kebab-case) byly tyto slugy možná chybně staré (snake_case s podtržítkem). Verify:

**⚠️ POTVRZENÝ BUG (verify provedeno):**

| Hardcoded slug | V catalog.json? | Status |
|---|---|---|
| `astro2_NTP` | ne (po D6 je `astro2-ntp`) | 💥 broken |
| `sobeslav3` | ne | 💥 broken (smazáno?) |
| `svarcvaldky` | ano | ✓ |
| `decin_koncepce` | ne | 💥 broken (smazáno?) |

**Featured grid dnes ukazuje pouze 1 kartu** (`svarcvaldky`) místo 4! Ostatní 3 hardcoded slugy se po D6 slug standardizaci (snake_case → kebab-case) nepřejmenovaly. `entries.find` vrátí undefined, `.filter(Boolean)` je zahodí.

To je vizuálně viditelné na live (poslední screenshot výše ukazuje 1 kartu v sekci „Stojí za prohlídku").

**Quick fix (3 minuty):**

```diff
- const featuredSlugs = ['astro2_NTP', 'sobeslav3', 'svarcvaldky', 'decin_koncepce'];
+ const featuredSlugs = ['astro2-ntp', '<NOVY>', 'svarcvaldky', '<NOVY>'];
```

Kde `<NOVY>` = nový výběr od Petra. Mé doporučení: `prs10-mdx`, `kappa`, `casovy-zamek`, `kvetinove` jako objevitelně silné karty. Ale to je rozhodnutí Petra.

**Doporučení:** přesunout featured config do `apps/hodinarium-eu/src/data/featured.json` nebo do frontmatteru s flag `featured: true` v `content/hodinarium-eu/*.md`. Petr by pak mohl rotovat featured z editoru bez kódu.

---

## 4. Scroll fatigue

Stránka má **5 sekcí** v hlavním sloupci:

1. **Hero** (1 viewport)
2. **Featured "Stojí za prohlídku"** (1–2 viewports, 4 karty)
3. **Explore "Dva způsoby procházení"** (1 viewport, 2 explore-cards)
4. **Random "Náhodný výběr"** (1–2 viewports, 4 karty)
5. **About + Sister site** (1 viewport, 2 col)

= **5–7 viewportů scroll** k patičce. **Není to dlouhé.** Jen drobné pozorování:

- *Featured* + *Random* jsou strukturálně identické (oba grid karet z článků). Návštěvník mezi nimi rychle ztratí context — „už jsem to nečetl?". **Vizuální odlišení** by pomohlo: jiný card design pro random (méně vizuální, víc text-based), jiná barva pozadí sekce, jiný background pattern.

---

## 5. Mobile 320 px clamp

### featured-grid: `minmax(260px, 1fr)`

Na 320 px viewport má `body` cca 320 − 32 padding = **288 px** prostor. `minmax(260px, 1fr)` → 1 sloupec o šířce 288 px (`280px ≤ X ≤ 1fr`). **OK na 320 px.**

### explore-grid: `minmax(240px, 1fr)`

Stejně OK.

### Hero title `clamp(2.5rem, 8vw, 5rem)`

Na 320 px: `clamp(40px, 25.6px, 80px)` → minimum 40 px (2.5rem). Title „Hodinárium" by se nemělo lámat — má 10 znaků. OK.

### Hero CTA — `.hero-cta { gap: 1rem; flex-wrap: wrap }`

Dvě tlačítka 1 rem gap. Na 320 px se zalomí na 2 řádky. OK.

---

## 6. Konkrétní akční doporučení (k diskuzi s Petrem)

Setříděné podle (přibližného) ROI:

### Vysoký impact, nízká cena

1. **Přidat „Naplánuj návštěvu / Open today" CTA do hero** — třetí tlačítko v `.hero-cta`, ne-primary styling, vede na `/pro-navstevniky`. Pomůže Segment A.
2. **Subtitle pod hero title** — krátká věta vysvětlující „Hodinárium = co". Např.: *„Webová expozice Českého spolku horologického. Sbírka v Děčíně, sesterský orloj.eu pro pražský orloj."*
3. **Auto-update featured slugy** — přesunout z hardcoded do `featured.json` nebo content frontmatter. Petr je dnes nemůže rotovat.

### Střední impact, střední cena

4. **Hero stats / hero foto** v právé polovině — využít prázdné místo na desktop. Stats jsou levnější (CSS už existuje), foto vyžaduje výběr.
5. **EN switcher v hero** — drobné tlačítko vedle CTA pro pásmo EN enthusiast.
6. **Vizuální odlišení Featured vs. Random** — jiný card layout pro Random (= text-list místo image-card).

### Nízký impact, vysoká cena (postpone)

7. **Auto-redirect Accept-Language** — vyžaduje SSR/edge functions; aktuálně Astro static site. Spíš ne.
8. **Carousel pro featured** — žádný carousel není v projektu. Grid funguje, nepřidávat.

---

## Závěr

Stránka **funguje pro audience B** (cs amatéři hodinářství) dobře. Pro **A (návštěvníci Děčína)** a **C (EN enthusiasts)** je tu friction.

**Jeden konkrétní quick win:** v hero přidat třetí CTA „Naplánuj návštěvu" → `/pro-navstevniky`. ~3 minuty práce, vyřeší 80 % Segment A friction.

**Druhý quick win:** subtitle „Webová expozice ČSH. Sbírka v Děčíně." přímo pod hero title (před lede). ~5 minut. Definuje pojem.

Žádný z těchto bodů není **breaking** — současný stav je funkční a estetický. Jde o iterativní polish.
