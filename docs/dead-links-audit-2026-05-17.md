# Dead-link audit — 2026-05-17

Vygenerováno skriptem `scripts/audit-dead-links.mjs` 2026-05-17T11:43:56Z.

## Souhrn

- **Skenované adresáře:** 7 (content/hodinarium-eu, content/hodinari, content/kroky, content/slovnik, content/soupis-veznich-hodin, content/kronika, content/horologie-cz)
- **Unikátních URL:** 50
- **Funkční (2xx/3xx):** 46
- **Mrtvé / nedostupné:** 4
- **Z toho s Wayback Machine snapshotem:** 0

## Pro editora

Pro každý mrtvý odkaz níže vyberte:

- **REPLACE → Wayback** — nahradit URL za Wayback Machine snapshot (pokud existuje a obsah je zachován)
- **REPLACE → ekvivalent** — najít aktuální zdroj se stejným obsahem (např. archived → původní web v nové struktuře)
- **REMOVE** — odstranit odkaz (jeho obsah už není relevantní)

---

## Mrtvé odkazy (4 unikátních URL ve 3 souborech)

### `content/hodinarium-eu/akvizice-2015-2025.md`

- **HTTP 403** — http://dominanty.cz/pamatky-velka-chmelistna.php
  - Pole: `body:bare`
  - Kontext: …rchive.org/web/20160327202644/http://dominanty.cz/pamatky-velka-chmelistna.php). ![kostel sv. Bartoloměje V…
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/arduino-pps.md`

- **network error: fetch failed** — https://www.accubeat.com/rubidium-frequency-oscillators
  - Pole: `body:link`
  - Kontext: …edia.org. [cit. 2026-04-28] - [Rubidium Frequency Oscillators firmy AccuBeat](https://www.accubeat.com/rubidium-frequenc…
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

### `content/hodinarium-eu/atomove-kapesni.md`

- **network error: timeout** — https://www.microsemi.com/product-directory/embedded-clocks-frequency-references/5570-miniature-atomic-clock-mac-sa5x
  - Pole: `body:link`
  - Kontext: …turního čipu atomových hodin: [MAC-SA5X](https://www.microsemi.com/product-directory/embedded-clocks-frequency-reference…
  - Rozhodnutí: _REPLACE / REMOVE — doplň_

- **network error: timeout** — https://www.microsemi.com/images/gallery/new_products/EvalKit%20Cartoon.png
  - Pole: `body:link`
  - Kontext: …kačních pinů rs232 nebo USB. [Obrázek vývojového kitu](https://www.microsemi.com/images/gallery/new_products/EvalKit%20C…
  - Rozhodnutí: _REPLACE / REMOVE — doplň_
