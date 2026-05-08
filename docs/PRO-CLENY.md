# Pro členy ČSH

Stručný runbook pro členy Českého spolku horologického, kteří chtějí
přispět nebo se zorientovat na webech spolku.

## Tři weby — co je co

| Web | URL | K čemu |
|---|---|---|
| **Hodinárium** | [hodinarium.eu](https://hodinarium.eu) (zatím `hodinarium-eu.pages.dev`) | Webová expozice — sbírka, články, hodináři, kroky, slovník. **Sem patří obsah o hodinách**. |
| **Horologie.cz** | [horologie.cz](https://horologie.cz) (zatím `horologie-cz.pages.dev`) | Identita spolku — stanovy, dokumenty, akce, sponzoring, kontakt. **Sem patří obsah o spolku samotném**. |
| **Orloj.eu** | [orloj.eu](https://www.orloj.eu) | Petrovy programy a legacy obsah (PRS10, atomic clock projekty). Mimo aktuální Astro pipeline. |

## Co můžeš udělat — bez gitu, bez kódu

### 1. Nahlásit chybu na webu

Vidíš překlep, špatné datum, rozbitý obrázek, divný odkaz?

- **Nejjednodušší:** napiš na **info@orloj.eu** s URL stránky a popisem
- **Pokud máš účet** (CF Access — pošli e-mail Davidovi): klikni na
  červené tlačítko **„Nahlásit problém"** v pravém dolním rohu
  hodinarium.eu (FAB). Vytvoří se GitHub issue, které vyřídí David.

### 2. Poslat fotky z akce

Spolková akce (vernisáž, výstava, setkání) — fotky chceme přidat do
`/akce/<slug>` na horologie.cz. Pošli ZIP nebo Google Photos drop-link
**Davidovi** (info@orloj.eu). Doplní je do galerie.

### 3. Doplnit obsah článku / medailonu

Článek o exponátu, medailon hodináře, záznam ve věžním soupisu — pokud
máš:

- **Archivní fotky** (digitalizované) → pošli s creditem (autor / rok / zdroj)
- **Dochované dokumenty** (objednávky, korespondence) → sken nebo foto
- **Rodinné svědectví** → text e-mailem, doplníme jako `editorNotes`
- **Opravy faktů** → přesný odkaz na URL + co je špatně + jak to má být

Vše na **info@orloj.eu**. Komplexnější doplnění (rozsáhlejší text) —
domluvíme přes mail editaci.

### 4. Hospodaření, stanovy, zápisy

Veřejně dostupné v **[/dokumenty](https://horologie-cz.pages.dev/dokumenty)**
přes oficiální spolkový rejstřík (Krajský soud v Českých Budějovicích,
spis L 4908). Kompletní účetní závěrky 2014–2025 plus stanovy a zápisy.

## Členské příspěvky

- **Transparentní účet:** 2801617704 / 2010 (FIO banka)
- **QR pro platbu:** [/sponzoring#qr](https://horologie-cz.pages.dev/sponzoring)
- Pohyby na účtu (veřejné):
  [ib.fio.cz/ib/transparent?a=2801617704](https://ib.fio.cz/ib/transparent?a=2801617704)

## Kdo dělá co

- **Petr Král** (předseda) — hlavní autor obsahu, kurátor sbírky
  Hodinária Děčín, kontakt s návštěvníky muzea
- **Miroslav Baudisch** (pokladník) — finance, transparentní účet
- **David Knespl** (člen výboru) — webová pipeline, IT, moderní rewrite
  webů (Astro, Cloudflare Pages)

Pro **obsahové** otázky (články, exponáty, hodináři) — Petr.
Pro **webové** otázky (rozbité odkazy, vzhled, technika) — David.

## Kontakt

- **E-mail:** [info@orloj.eu](mailto:info@orloj.eu)
- **Telefon:** +420 603 502 735 (Petr)
- **Spolkový rejstřík:** [or.justice.cz, IČO 26573008](https://or.justice.cz/ias/ui/rejstrik-firma.vysledky?subjektId=921906)
- **Sídlo:** nábřeží Otakara Ostrčila 273/6, 392 01 Soběslav III
- **Sídlo expozice:** Zámek Děčín (Hodinárium)

## Pro technické přispěvatele

Pokud umíš git nebo si chceš sáhnout na MDX zdroje článků: viz
[**docs/CONTRIBUTING.md**](CONTRIBUTING.md) (technický runbook s
frontmatter konvencemi, build pipeline, deploy gotchas).
