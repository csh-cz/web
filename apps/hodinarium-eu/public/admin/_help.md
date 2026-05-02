# Hodinárium CMS — krátký návod pro editory

Tahle stránka je administrace Hodinária. Můžeš tu **upravovat články,
medailony hodinářů, evidenční karty sbírky a kroniku** přímo v prohlížeči,
bez znalosti gitu nebo Markdownu.

## Přihlášení

1. Otevři `https://hodinarium-eu.pages.dev/admin/` (po DNS switch
   `https://hodinarium.eu/admin/`).
2. Cloudflare tě přesměruje na Google login — přihlaš se svým
   Google účtem (tím, který nám dal David na allow-list).
3. Po loginu se objeví CMS s nabídkou 4 sekcí:
   - **Články** (sbírka, konstrukce, projekty, virtuální muzeum, muzea, zajímavosti)
   - **Sbírka — evidenční karty** (inv-NNN-…)
   - **Kronika**
   - **Hodináři (medailony)**

## Editace existujícího článku

1. Klikni na sekci → seznam položek.
2. Vyber článek, otevře se editor.
3. Uprav co chceš (text, perex, autor, tagy, reference, fotky).
4. **Save** vpravo nahoře — uloží se commit a za ~90 vteřin je to live.

## Tvoje jméno = `Autor článku`

Pole **„Autor článku"** vyplň svým jménem (např. „Petr Král"). Web ho
zobrazí v patičce článku jako „P. Král". **Není to GitHub login** — píšeš
sem prostě své jméno tak, jak ho chceš mít publikované.

Commit do gitu se vždy odešle pod identitou `cshbot` — v gitu pak
v commit message vidíme i tvůj email pro audit. Editoři git vůbec
nemusí znát.

## Vkládání fotek

V markdown editoru — tlačítko obrázku (📷) → drag-drop fotku → upload jde
do `apps/hodinarium-eu/public/img/<slug>/<file>.jpg`.

**Vždy uveď autora a licenci/copyright fotky** (sekce „Atribuce" pod
obrázkem nebo přímo v `<Photo>` komponentě). Pokud autor je neznámý,
napiš „autor neznámý" — nepublikuj fotku úplně bez atribuce.

## Tagy

Tagy si nemůžeš vymyslet libovolně — používej z whitelist v
`src/data/tags.json`. Když potřebuješ nový tag, napiš Davidovi.

## Co dělat když něco nejde

- **Login nejde:** ověř, že máš Google účet z allow-list (email, který
  jsi dal Davidovi). Jinak Cloudflare tě nepustí.
- **Save selže:** zkus znovu po pár vteřinách. Pokud trvá, screenshot
  chyby a pošli Davidovi.
- **Po Save se nic neděje na webu:** počkej 1–3 minuty. Cloudflare Pages
  rebuilduje na pozadí. Pokud po 5 minutách stále nic, něco se rozbilo —
  napiš Davidovi.

## Co NEdělat

- **Nemaž evidenční karty** sbírky — mazání je vypnuté úmyslně, karty
  představují evidenční záznamy. Když je karta špatně, oprav ji
  (nemaž → upravit).
- **Neměň `slug`** existujícího článku — rozbilo by to URL pro lidi,
  kteří článek viděli z Facebooku/Googlu. Pokud opravdu potřeba, napiš
  Davidovi (zařídí redirect).
- **Nepřidávej HTML** do markdown těla — používej běžnou typografii
  (`## Nadpis`, `**tučně**`, `*kurzíva*`, `[odkaz](url)`).

## Kontakt

David Knespl — david.knespl@knespl.com
