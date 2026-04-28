# TODO

Otevřené úkoly a odložená rozhodnutí pro CSH Web (hodinarium.eu, horologie.cz).

## Vysoká priorita — čeká na Petrovu odpověď z auditu

Plný audit: [`audit-pro-petra.txt`](audit-pro-petra.txt). Petr odpoví, pak doplníme.

- [ ] **A1 Licence obsahu** — schválit CC BY 4.0 (zatím nasazeno default)
- [ ] **A2 Hospodaření 2020–2025** — chce Petr na webu? Pokud ano, dodá PDF
- [ ] **A3 Maskovaná emailová adresa** — souhlasí Petr s nahrazením `info (kyselá ryba)` za `mailto:`?
- [ ] **B1 Časová osa** — ~~Petr odsouhlasil zrušit, smazáno~~ ✅ hotovo
- [ ] **B2 ASTRO2 ESP01S vs ESP10S** — překlep v textu? Petr ujasní
- [ ] **B3 Vybrané exponáty per sekce** — můj výběr 4×4, Petr potvrdí/změní
- [ ] **B4 Otazníky v titulcích** — opravdu musí být 2?
- [ ] **B5 Datace článků** — opravit ručně 14 podezřelých roků < 1500
- [ ] **B6 Aktuální info Hodinária Děčín** — sezóna 2026, otevírací doba, vstupné
- [ ] **B7 Kategorizace 124 nezařazených** — sporných ~30 článků k ručnímu zařazení
- [ ] **B8 NTPH a NTPH_st** — sloučit / vyhodit duplicity?
- [ ] **C1 Titulní obrázek** — Petr vybere foto pro hero
- [ ] **C2 Logo** — soutěž v plénu, nebo nechat textové
- [ ] **C3 Sponzoři** — patří do hodinaria nebo spolku?

## Střední priorita — naplnit obsah

- [ ] **Akce — fotografie** z Google Photos drop-zone do `apps/horologie-cz/public/img/akce/<slug>/`,
      pak doplnit `fotky: []` v `src/data/akce.ts`. Petr/David postupně.
- [ ] **Skript pro auto-import fotek z ZIP** — rozzipovat → přejmenovat → doplnit data file.
      Až bude první ZIP, naprogramuju.
- [ ] **Hospodaření 2020–2025** v `/dokumenty` — doplnit `href` v tabulce, jakmile dorazí PDF
- [ ] **Transparentní účet** v `/sponzoring` a `/dokumenty` — doplnit číslo účtu a banku
- [ ] **Příspěvky na členských schůzích** — Petr dodá PDF / přepisy / audio
- [ ] **Stanovy** — ~~plný text z PDF~~ ✅ hotovo

## Nízká priorita — Až bude reálná potřeba

### 🔒 Decap CMS / administrátorské rozhraní (odložené)

**Co**: Web admin pro Petra (nebo další členy) — drag-drop editace článků, fotek, dokumentů
bez nutnosti znalosti Markdownu/gitu.

**Status**: Odložené. Aktuálně edituje David přímo v gitu, Petr posílá podklady mailem.

**Až bude potřeba** (Petr/další chce sám editovat):

1. **Cloudflare Access** pro `/admin/*` URL — magic-link přes email
   - Allow list: `petr@…`, `david@…`, případně další z výboru
   - Free do 50 uživatelů
2. **Decap CMS** ([decapcms.org](https://decapcms.org)) nebo modernější **Sveltia CMS**
   - Single-page app, žádný backend
   - Pod kapotou commituje do gitu přes GitHub API
3. **Editorial workflow** — každá editace jako PR, schvaluje David před mergem
4. **Cloudflare Pages preview** automaticky pro každý PR

**Odhad práce**: ~3 hodiny setup, jednorázově.

### 🌐 Migrace orloj.eu

Po dokončení hodinaria + horologie pustit **stejný pipeline na orloj.eu**:
- Scrape (cca 200 stránek)
- Convert
- Build catalog
- Download assets
- Deploy

Petr explicitně řekl "zatím nedělat" — počkáme.

### 🤖 AI funkce

Připraveno, čeká na zelenou:

- **TL;DR generator** — pro každý článek 2-3 věty stručného shrnutí (Gemini Flash, free tier)
- **Sémantické vyhledávání** — embeddings při buildu, prohledávání přes Transformers.js v browseru (zdarma navždy)
- **Zeptej se Hodinária** — RAG chatbot přes Cloudflare Workers AI (free tier 10k Neuronů/den)
- **AI překlad CS → EN** — Claude/Gemini, glosář horologických termínů

Vyžaduje:
- Schválení licence A1 (kvůli odvozeným dílům z AI)
- Reálná poptávka (zatím čistě česky stačí)

### 🎨 Design pokračování

- [ ] **Live ciferník na titulce** — SVG zobrazující aktuální stav astrolábu (sun/moon position)
- [ ] **3D modely** vybraných hodin (až bude content)
- [ ] **Audio nahrávky** úderů věžních hodin (až bude content)

### 🌍 Vlastní domény

- [ ] **`hodinarium.eu`** přesměrovat na Cloudflare Pages (nyní `hodinarium-eu.pages.dev`)
- [ ] **`horologie.cz`** přesměrovat na Cloudflare Pages (nyní `horologie-cz.pages.dev`)

DNS přesun, TLS certifikát Let's Encrypt zdarma. ~30 minut každá doména.

### 📊 Analytics

- [ ] **Cloudflare Web Analytics** (free, GDPR-friendly, žádné cookies, žádný banner)
- [ ] Server-side metriky — kolik návštěv, odkud, které články nejvíc čtené

## Provoz

- [ ] **Zálohy** — repo na GitHubu je primární. Zvážit periodické archivy do ADO?
- [ ] **CI cleanup** — staré Cloudflare Pages preview deployments smazat (aby neplnily kvótu)
- [ ] **README pro nové členy** — jak se zapojit, jak commitnout, koho kontaktovat

## Technický dluh

- [ ] **OG images** — generuje se ručně přes `pnpm og:build`. Přidat do CI?
- [ ] **`build-og-images.ts`** stále vyrábí OG pro vyhozené spolkové slugy
      (`spolek`, `sponsor`, `stanovy` atd.) na hodinarium-eu — vyčistit
- [ ] **Cleanup unused script** `strip-dead-refs.ts` — už ne aktuální
- [ ] **`raw/`** soubor `.DS_Store` — měl by být v gitignore (i když celá složka je)
