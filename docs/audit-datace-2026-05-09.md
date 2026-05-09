# Audit datace článků — podezřelé roky < 1500

Vygenerováno 2026-05-09 skriptem `scripts/audit-datace.ts` (heuristika
`extractYear` v `scripts/build-catalog.ts` najde **nejdřívější** 4místné
číslo v rozmezí 1300–2030 v titulku + prvních 2000 znaků body).

Funkce předpokládá, že nejdřívější rok je nejpravděpodobněji historický
kontext článku. U **11** článků extracted year < 1500.
Některé jsou skutečně středověké (Mikuláš z Kadaně 1410, Hanuš 1493 atd.),
jiné mohou být false-match (technické číslo, ID, stránkování).

David/Petr — pro každý článek rozhodněte:

- **OK** = rok je správně, žádná akce
- **FIX** = rok je false-match, doplnit explicitní `year:` field do
  frontmatteru (přepíše heuristiku v `build-catalog.ts`) nebo upravit
  text aby skutečný rok byl první výskyt
- **REMOVE** = článek nemá rok (nepatří na časovou osu)

## Podezřelé záznamy

### `decin_velika_ves` — rok **1340**

- **Title:** Torzo gotického stroje z Veliké Vsi
- **Kategorie:** sbirka
- **Soubor:** [content/hodinarium-eu/decin_velika_ves.md](content/hodinarium-eu/decin_velika_ves.md)
- **Kontext (kde se 1340 objevuje):**
  > …hem husitských válek. Podle Dobroslava Líbala byl kostel vystavěn až kolem roku 1340. Sakristie měla být připojena až na konci 14. století. Kostel prošel renesanční…
- **Rozhodnutí:** _OK / FIX / REMOVE — doplň_

### `decin_chronulator` — rok **1353**

- **Title:** Chronulátor
- **Kategorie:** sbirka
- **Soubor:** [content/hodinarium-eu/decin_chronulator.md](content/hodinarium-eu/decin_chronulator.md)
- **Kontext (kde se 1353 objevuje):**
  > …tor&source=lnms&tbm=isch&sa=X&ved=0ahUKEwjfgoWq9ZXOAhUIKsAKHeGbB9cQ_AUICCgB&biw=1353&bih=652&dpr=0.9#imgrc=_)".  Podrobnější popis [https://bastlirna.hwkitchen.cz/r…
- **Rozhodnutí:** _OK / FIX / REMOVE — doplň_

### `vez_Budislav` — rok **1357**

- **Title:** Stroj věžních hodin - Budislav
- **Kategorie:** sbirka
- **Soubor:** [content/hodinarium-eu/vez_Budislav.md](content/hodinarium-eu/vez_Budislav.md)
- **Kontext (kde se 1357 objevuje):**
  > …ně od Soběslavi směrem ke Kamenici nad Lipou. První zmínka o vsi pochází z roku 1357, kdy na tomto místě byla založena osada vladykou Budislavem. Od té doby nese jm…
- **Rozhodnutí:** _OK / FIX / REMOVE — doplň_

### `kinsner-astronomicke-hodiny` — rok **1364**

- **Title:** Kinšnerovy astronomické hodiny pro salón
- **Kategorie:** zajimavosti
- **Soubor:** [content/hodinarium-eu/kinsner-astronomicke-hodiny.mdx](content/hodinarium-eu/kinsner-astronomicke-hodiny.mdx)
- **Kontext (kde se 1364 objevuje):**
  > …(pražský orloj 1410, padovské [Astrarium Giovanniho de Dondi](/hodinari/dondi) 1364, štrasburský orloj) do měřítka pokoje.  Tento článek shrnuje, co o těchto hodin…
- **Rozhodnutí:** _OK / FIX / REMOVE — doplň_

### `muzeum_beyer_zurich` — rok **1364**

- **Title:** Uhrenmuseum Beyer — Curych
- **Kategorie:** muzea
- **Soubor:** [content/hodinarium-eu/muzeum_beyer_zurich.md](content/hodinarium-eu/muzeum_beyer_zurich.md)
- **Kontext (kde se 1364 objevuje):**
  > …Dondi** — replika legendárního astronomického orloje Giovanniho de Dondi z roku 1364 - **Věžní hodiny** — historické exempláře evropského věžního hodinářství - **Br…
- **Rozhodnutí:** _OK / FIX / REMOVE — doplň_

### `muzeum_kadan_orloj` — rok **1410**

- **Title:** Kadaňský orloj — pocta Mikulášovi z Kadaně
- **Kategorie:** muzea
- **Soubor:** [content/hodinarium-eu/muzeum_kadan_orloj.md](content/hodinarium-eu/muzeum_kadan_orloj.md)
- **Kontext (kde se 1410 objevuje):**
  > …e společně s Janem Šindelem uváděn jako spolutvůrce **Pražského orloje** (kolem 1410).  Kadaň je rodným městem Mikuláše z Kadaně a moderní orloj připomíná tuto význ…
- **Rozhodnutí:** _OK / FIX / REMOVE — doplň_

### `literatura` — rok **1410**

- **Title:** Použitá i nepoužitá literatura
- **Kategorie:** zajimavosti
- **Soubor:** [content/hodinarium-eu/literatura.md](content/hodinarium-eu/literatura.md)
- **Kontext (kde se 1410 objevuje):**
  > …008 - Macháček, Stanislav - [Nález zprávy o vytvoření orloje Starého města roku 1410](/download/MachacekS.pdf) - Zprávy Komise pro dějiny přírodních, lékařských a t…
- **Rozhodnutí:** _OK / FIX / REMOVE — doplň_

### `zvon_petr_pavel` — rok **1440**

- **Title:** zvon Velký později zvaný Petr Pavel
- **Kategorie:** sbirka
- **Soubor:** [content/hodinarium-eu/zvon_petr_pavel.md](content/hodinarium-eu/zvon_petr_pavel.md)
- **Kontext (kde se 1440 objevuje):**
  > …** ** SPODNÍ PRŮMĚR 144 CM** **HMOTNOST cca 1800 KG** (původní uváděná hmotnost 1440 kg) **HMOTNOST SRDCE** **cca 100 KG**  Tento zvon byl znovu ulit na soběslavské…
- **Rozhodnutí:** _OK / FIX / REMOVE — doplň_

### `prehled_zvonu` — rok **1440**

- **Title:** Zvony na soběslavské věži
- **Kategorie:** sbirka
- **Soubor:** [content/hodinarium-eu/prehled_zvonu.md](content/hodinarium-eu/prehled_zvonu.md)
- **Kontext (kde se 1440 objevuje):**
  > …(později zvaný [Petr Pavel](/clanky/zvon_petr_pavel)) – vysvěcený v roce 1492, 1440 kg     **(v roce 1663 po poškození bleskem nově přelit)  V roce 1716 byl nově v…
- **Rozhodnutí:** _OK / FIX / REMOVE — doplň_

### `kalendar_rimsky` — rok **1465**

- **Title:** Římský kalendář
- **Kategorie:** zajimavosti
- **Soubor:** [content/hodinarium-eu/kalendar_rimsky.md](content/hodinarium-eu/kalendar_rimsky.md)
- **Kontext (kde se 1465 objevuje):**
  > …ius. Římský čtyřletý cyklus měl tak 355 + 378 + 355 + 377 dnů, což je dohromady 1465 dnů a po vydělení čtyřmi dojdeme k průměru 366,25 dne, což je v podstatě správn…
- **Rozhodnutí:** _OK / FIX / REMOVE — doplň_

### `kardasova_recice` — rok **1493**

- **Title:** Jsou v Kardašově Řečici hodiny mistra Hanuše ??
- **Kategorie:** virtualni-muzeum
- **Soubor:** [content/hodinarium-eu/kardasova_recice.md](content/hodinarium-eu/kardasova_recice.md)
- **Kontext (kde se 1493 objevuje):**
  > …**V** letech roce 1493-4 udělal pro město Jindřichův Hradec hodiny Jan Růže - mistr Hanuš, se kterým s…
- **Rozhodnutí:** _OK / FIX / REMOVE — doplň_

---

## Předběžná doporučení (Claude, k revizi)

Z kontextu odhaduji:

| Slug | Rok | Doporučení | Důvod |
|---|---|---|---|
| `decin_velika_ves` | 1340 | **OK** | Gotický kostel kolem 1340 — historicky validní |
| `decin_chronulator` | 1353 | **FIX** | Číslo `1353` z Google search URL params (`biw=1353`), ne rok |
| `vez_Budislav` | 1357 | **OK?** | První zmínka o vsi 1357 — relevantní k lokaci, ale samotný stroj je novější. Zvážit FIX na rok stroje. |
| `kinsner-astronomicke-hodiny` | 1364 | **FIX** | Článek je o salonních hodinách 19. století; 1364 je rok Astrarium de Dondi (zmínka v intro) |
| `muzeum_beyer_zurich` | 1364 | **FIX** | Muzeum hodin v Curychu (otevřené 1976); 1364 je datace exponátu (replika Astrarium) |
| `muzeum_kadan_orloj` | 1410 | **OK** | Pocta Mikulášovi z Kadaně, spolutvůrci pražského orloje (kolem 1410) |
| `literatura` | 1410 | **REMOVE** | Index literatury, ne datovaný článek — odstranit z časové osy |
| `zvon_petr_pavel` | 1440 | **FIX** | `1440 kg` je původní hmotnost, ne rok. Zvon vysvěcen 1492. |
| `prehled_zvonu` | 1440 | **FIX** | Stejně jako u Petr Pavel — `1440 kg` hmotnost. Přehled je o zvonech 1492+. |
| `kalendar_rimsky` | 1465 | **FIX** | `1465` je počet dní římského čtyřletého cyklu, ne rok |
| `kardasova_recice` | 1493 | **OK** | Mistr Hanuš dělal hodiny pro Jindřichův Hradec 1493–4 |

**Souhrn:** 3 OK, 7 FIX, 1 REMOVE.

**Jak provést FIX:**

1. Přidat do frontmatteru explicitní `year:` field se správným rokem
   (přepíše heuristiku v `build-catalog.ts`).
2. Nebo upravit `extractYear` aby ignoroval URL-like patterns
   (`biw=`, `bih=`, `?q=` atd.) — to ošetří `decin_chronulator`.
3. Pro `1440 kg` / `1465 dnů` — buď doplnit explicit `year:`,
   nebo přepsat aby skutečný rok (1492 / 0001) byl první match.

**Jak provést REMOVE:**

Přidat `year: null` (explicit) do frontmatteru. Build-catalog respektuje
explicit value (extractYear se nepustí) a TimeSlider/timeline článek
přeskočí.

