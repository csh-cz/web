# Design critique — Soupis věžních hodin

**Datum:** 2026-05-09
**Rozsah:** `/soupis-veznich-hodin/` (index + detail + mapa)
**Autor:** Claude (FU3 z TODO A.4)

Cílem je kritický pohled na 3 stránky soupisu z hlediska 2 typických
use-case scénářů + obecné UX kvality. Doporučení jsou prioritizovaná —
P1 = blocker / nepříjemnost, P2 = nice-to-have, P3 = polish.

## Kontext

- Soupis 396 záznamů (post-import 2026-04, dál narůstá)
- 3 stránky: index (tabulka s filtry), detail karta, mapa (Leaflet)
- Aktuální data v repu: `content/soupis-veznich-hodin/*.mdx`
- Schema: `apps/hodinarium-eu/src/content.config.ts` → `soupisVeznichHodin`

## Use case A: „Hledám hodiny v severních Čechách"

**Path:** Návštěvník otevře `/soupis-veznich-hodin/` → najde filter „Kraj"
→ vybere „Liberecký kraj" → tabulka se zužuje. Funguje.

**Friction:**

- **P1 — žádný link na mapu zúženého výběru.** Když je filter aktivní,
  uživatel chce přepnout do mapového pohledu se stejným filtrem. Mapa
  je samostatná stránka bez share state s indexem (ani query string,
  ani localStorage).
  - **Akce:** Přidat tlačítko „Zobrazit filtrovaný výběr na mapě" které
    přečte aktivní filtry, naserializuje je do query stringu
    (`?kraj=Liberecký`) a otevře mapu. Mapa pak při loadingu přečte
    query a aplikuje stejný filter před fitBounds.

- **P2 — neexistující kombinace filtrů.** Pokud návštěvník vybere
  hodináře + kraj kde nemá záznam, dostane prázdnou tabulku bez
  vysvětlení. Stat cards „396 z 396" se přepne na „0 z 396" ale
  bez poznámky proč. Mohlo by říct: „Žádný záznam neodpovídá. Zkus
  uvolnit některý filtr." s tlačítkem reset.

- **P3 — kraje jsou jen CZ.** Filter „Kraj (jen CZ)" plus „Stát" — když
  vyberu „AT" v Stát, kraj filter se neoznačí jako disabled / hidden.

## Use case B: „Hledám práci konkrétního hodináře"

**Path:** Filter „Hodinář" → výběr „Václav Krečmer" → tabulka řazena
podle roku → klik na konkrétní záznam → detail karta.

**Friction:**

- **P2 — chybí kontext hodináře v zúženém výběru.** Při filtru „Václav
  Krečmer" by hlavička tabulky / stat cards mohla říct: „Krečmer:
  10 záznamů, z toho 6 in situ, 1 zničený, 3 neznámé. → Otevřít
  medailon Václava Krečmera". Současně dlouhá URL bez breadcrumb
  návratu, uživatel netuší kde je.

- **P3 — sortování defaultem `rok ASC`.** Pro use case „díla hodináře"
  je to OK, ale kombinace s filtrem hodinář by mohla naznačit i další
  default — sortování podle roku DESC (nejnovější dílo nahoře).

## Index ↔ mapa redundance

Obě stránky zobrazují stejná data. Mapa je opt-in přes CTA v hlavičce.

- **P1 — žádný shared state.** Filtr v indexu se nepřenese do mapy
  (viz Use case A P1). Naopak: po klepnutí na pin v mapě se otevře
  detail, ale návrat na mapu není „zachovaný viewport / zoom" —
  uživatel se vrátí na default ČR overview.
  - **Akce:** Při kliku na detail z mapy si uložit `lat,lng,zoom` do
    sessionStorage. Při návratu na mapu (z detail breadcrumb) zkusit
    obnovit. Bonus: fragment URL `/soupis-veznich-hodin/mapa/#15.5,49.8/8`
    pro share-by-link.

- **P2 — duplicate hlavička / lede.** Index i mapa mají vlastní eyebrow
  + h1 + lede. Lede texts jsou částečně překryvné. Pojďme ujasnit
  rozdíl: index = „strukturovaná tabulka pro filtrování / export",
  mapa = „prostorová geografická perspektiva".

## Tabulka — information density

8 sloupců (thumb + rok + hodinář + místo + budova + kraj/stát + stav +
krok) na desktop = 1200px+ width. Na mobile 320–480 px se nevejde.

- **P1 — mobile responzivita.** TODO říkalo „mobile column hide".
  Současně tabulka přetéká vodorovně, drobný text, scrollbar dole.
  - **Akce:** Pod 640 px schovat sloupce: thumb (P3 polish), kraj/stát
    (méně užitečné), krok (technical detail). Zachovat: rok, hodinář,
    místo, budova, stav. Případně přepnout na card layout: každý záznam
    = jeden box s rokem nahoře + hodinář + místo + stav badge.

- **P2 — sloupec „Krok" je často prázdný.** Z 396 záznamů má krok
  vyplněný cca <30 %. Sloupec na desktopu zabírá místo s minimální
  informací. Možná přesunout do detailu nebo zobrazit jen pokud je
  filter aktivní.

- **P2 — thumbnail nesoudržné.** Některé řádky mají thumb (foto stroje
  nebo budovy), většina ne. Sloupec se prázdný — ošklivé. Buď
  placeholder ikona (varhanická vlákna), nebo skrýt sloupec pokud
  hero foto je v `<10 %` záznamů. Aktuálně ~4–5 % má foto.

## Stav badges — scanability

5 stavů: in_situ (zelená), preneseno (modrá), ztracene (oranžová),
znicene (červená), neznamy (šedá).

- **P3 — neznamy je nejčastější (>50 %).** Šedá je správná barva
  „neutrální", ale když je to dominantní stav, šedá optická
  „prázdnota" tabulky vytváří dojem, že soupis je hodně neúplný.
  - **Akce:** Možná posunout neznamy na lehce teplejší (tan / béžovou)
    nebo přidat do tooltipu řádky badge: „N záznamů čeká na terénní
    výzkum (= příležitost k dohledání)". Pozitivní rámování.

- **P3 — překryv s axe contrast fixem 2026-05-09.** `tone-bad` text
  byl 3.28:1, opraveno na 5.4:1. Border zůstal sytější. Pro jednotnost
  zvážit postupně i pro `tone-warn` (#d9a05b) — `axe` zatím neflagged
  (ratio asi 4.5+ borderline), ale check explicit.

## Detail karta — observační záběr

Aktuálně struktura:
- Header (eyebrow + h1 + hodinář link)
- Karta (signatura, krok, pohon, počet ciferníků, rozměry, dobová cena,
  stav, chod, přemístění, restaurátor, lokace + GPS + PK badge)
- Foto-grid (full-width po nedávné `auto-fit` opravě)
- Editorské poznámky (jen editor)
- Prose body (volný markdown)
- Prameny (citations + wiki)
- Související

**Friction:**

- **P2 — citation export.** Tato karta je vědecky citovatelná, ale
  v `<head>` chybí `citation_*` meta tags pro Zotero/Mendeley auto-import
  (Article.astro je má, soupis [slug].astro asi ne). Akademik narazí
  na hodiny z roku 1791 v NTM, klikne „Zotero connector" a nedostane
  nic. **Akce:** Přidat citation_title, citation_author (Hodinárium
  / spolek), citation_publication_date, citation_publisher.

- **P3 — souradnicePribl visual signal.** Když je `souradnicePribl: true`,
  detail píše „(přibližné)" v textu. Mapa to ukazuje tečkovaným okrajem
  + menší fillOpacity. Detail by mohl mít taky vizuální signal —
  např. pulsující aura kolem souřadnice nebo „⚠ přibližné" badge
  vedle GPS čísel.

## Implementační priorita (návrh)

1. **P1 — Mobile column hide** + případně card layout < 640 px
2. **P1 — Index → mapa shared filter state** přes query string
3. **P2 — Empty state messaging** v indexu + návrh resetu
4. **P2 — Citation meta tags** na soupis detail kartě
5. **P2 — Krok sloupec collapse** (only when populated > 30 %)
6. **P3 — Stav badges contrast/tone audit** napříč variantami
7. **P3 — Souradnice approximate visual signal** v detailu

## Out of scope (samostatná témata)

- Pagination / virtualization tabulky (396 řádků zatím OK, při >2000
  začne render lag)
- Print stylesheet (badatel chce print PDF konkrétní karty)
- Cluster markery v mapě (>50 ks v jednom místě splývá)
- Detail karty inline embed na medailonu hodináře (cross-link už
  v hodinari/[slug].astro existuje, ale plný preview chybí)
