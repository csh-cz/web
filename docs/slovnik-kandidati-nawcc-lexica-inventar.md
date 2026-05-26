# Slovník — kandidáti termínů z NAWCC „The Index": Lexica

Zdroj: rozcestník <https://theindex.nawcc.org/Lexica.php> (NAWCC — National Association of Watch and Clock Collectors).

16 externích slovníků horologické terminologie, 7 jazyků. Tento dokument je inventarizace + status scrape (jednotlivé výtahy v `slovnik-kandidati-nawcc-<zdroj>.md`).

Stav: **vytěženo 2026-05-26**. Surové HTML/PDF v `raw/nawcc-lexica/` (gitignored).

---

## Stav scrape per zdroj

| # | Zdroj | Jazyk(y) | URL | Stav | Hesel | Soubor |
|---|---|---|---|---|---:|---|
| 1 | **Berner — Illustrated Professional Dictionary of Horology** (FHS Swiss, G.-A. Berner) | EN/FR/DE | <https://dictionary.fhs.swiss/> | ✅ scrape přes `xhr/list.php` API | 3 517 | `slovnik-kandidati-nawcc-berner.md` |
| 2 | **Uhrenh@nse Glossary** | EN/FR/DE | <http://www.uhrenhanse.de/sammlerecke/wissenswertes/dictionary/dict_e.htm> | ✅ scrape OK | 209 | `slovnik-kandidati-nawcc-uhrenhanse.md` |
| 3 | **Uhren Lexikon (uhrenlexikon.de)** | DE/EN/FR | <http://www.uhrenlexikon.de/> | ⏭️ jen uvítací stránka, obsah za search | — | — |
| 4 | **Watch-Collector's Paradise (datacomm.ch/rbu)** | EN | <http://www.datacomm.ch/rbu/A.html> | ✅ scrape OK (25 stránek konsolidováno) | 336 | `slovnik-kandidati-nawcc-datacomm.md` |
| 5 | **Web Horologists Dictionary** | EN | <http://www.web-horologists.com/dicpg1.html> | ✅ scrape OK (parser omezen) | 25 | `slovnik-kandidati-nawcc-webhorologists.md` |
| 6 | **Walt Odets — Illustrated Glossary of Watch Parts** | EN | <https://www.timezone.com/2002/10/10/illustrated-glossary-of-watch-parts/> | ⏭️ obsah jen v obrázcích | — | — |
| 7 | **Antiquorum Illustrated Horological Glossary** | EN | <https://theindex.nawcc.org/Articles/Antiquorum-Lexico.pdf> | ✅ PDF→pdftotext | 265 | `slovnik-kandidati-nawcc-antiquorum.md` |
| 8 | **Elevators.com — Motors, Gears, and More** | EN | <https://www.elevators.com/motors-gears-more-glossary-of-horological-terms/> | ✅ scrape OK | 155 | `slovnik-kandidati-nawcc-elevators.md` |
| 9 | **Le Calibre — Lexique Horloger** | FR | <https://www.lecalibre.com/lexique-horloger/> | ✅ scrape přes WP glossary plugin | 48 | `slovnik-kandidati-nawcc-lecalibre.md` |
| 10 | **antik-uhren.com Uhrenlexikon** | DE | <http://www.antik-uhren.com/uhrenlexikon/> | ❌ Wordpress/Elementor JS render | — | — |
| 11 | **Hederer Lexikon** (Juwelier Hederer München) | DE | <http://uhren-hederer.de/LEXIKON/A_W.HTM> | ✅ scrape OK | 65 | `slovnik-kandidati-nawcc-hederer.md` |
| 12 | **TrustedWatch Lexikon** | DE | <https://www.trustedwatch.de/wissen/uhren-lexikon> | ❌ HTTP 404 | — | — |
| 14 | **Adjora/Lazzini — Glossario d'Orologeria** | IT | <https://www.adjora.it/orologeria/glossario.html> | ✅ scrape OK | 105 | `slovnik-kandidati-nawcc-lazzini.md` |
| 15 | **Relojesaviador — Glosario Términos Relojes** | ES | <https://www.relojesaviador.es/es/contenido/14-glosario-de-relojeria-y-terminos-de-reloje> | ✅ scrape OK (heuristika) | 32 | `slovnik-kandidati-nawcc-aviador.md` |
| 16 | **Joyería Inter — Glosario de Relojería** | ES | <https://joyeriainter.com/blog/glosario-de-relojeria/> | ❌ HTTP 404 (Shopify obsah odstraněn) | — | — |

---

## Priority pro práci s daty

### Tier 1 — multilingvální, nejvyšší alignment-hodnota proti CZ

1. **Berner FHS** — 3 517 konceptů s plnou EN/FR/DE synonymií. Nejlepší dostupný zdroj pro doplnění `prekladyEn/De/Fr` u existujících hesel a pro objevení mezer v CZ taxonomii.
2. **Uhrenh@nse** — 209 čistých trojic, doplňkový alignment pro Berner mismatch.
3. **Antiquorum PDF** — 265 termínů s detailními definicemi a ilustracemi.

### Tier 2 — odborné jednojazyčné

- **Datacomm** EN (336) — detailní akademické definice
- **Hederer** DE (65) — kompaktní, vhodné pro DE varianty
- **Le Calibre** FR (48) — moderní FR průmyslový slovník
- **Elevators** EN (155) — krátké přehledné definice

### Tier 3 — pomocné

- **Lazzini** IT, **Aviador** ES — terminologie pro budoucí jazykové verze webu
- **Web Horologists** EN — parser cut, duplikuje obsah z lepších zdrojů

## Licence a citace

Všechny tyto zdroje jsou veřejně dostupné na webu. Termíny a definice nejsou samostatně chráněny autorským právem (faktické údaje), ale ucelené texty definic ano. Při použití do `content/slovnik/` přeformulovat vlastními slovy v češtině s odkazem na zdroj v `references[]`, neopisovat doslova.
