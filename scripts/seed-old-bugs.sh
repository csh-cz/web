#!/usr/bin/env bash
# Založí v csh-cz/web historicky nahlášené bugy z e-mailových reportů
# z 2026-04-28 (před prvními opravnými commity). Každý se rovnou
# zavírá s odkazem na fixing commit, pokud je opravený.
#
# Spuštění:
#   gh auth login --web --hostname github.com   # jednou
#   bash scripts/setup-github-labels.sh          # jednou
#   bash scripts/seed-old-bugs.sh                # jednou
#
# Idempotence: skript hledá existující issue se stejným titulkem a
# přeskočí ho. Bezpečné spustit dvakrát.

set -euo pipefail

REPO="csh-cz/web"

if ! gh auth status >/dev/null 2>&1; then
  echo "✗ gh CLI není přihlášený. Spusť 'gh auth login --web' a pak znovu." >&2
  exit 1
fi

ensure_issue() {
  local title="$1"
  local body="$2"
  local labels="$3"

  local existing
  existing=$(gh issue list --repo "$REPO" --state all --search "$title in:title" --json number,title \
    --jq ".[] | select(.title == \"$title\") | .number" | head -1)

  if [[ -n "$existing" ]]; then
    echo "  ↻ existuje #$existing"
    echo "$existing"
    return
  fi

  local num
  num=$(gh issue create --repo "$REPO" --title "$title" --body "$body" --label "$labels" \
    | grep -oE '/issues/[0-9]+' | grep -oE '[0-9]+' | tail -1)
  echo "  ✓ vytvořen #$num"
  echo "$num"
}

close_issue() {
  local num="$1"
  local comment="$2"

  local state
  state=$(gh issue view "$num" --repo "$REPO" --json state --jq '.state')
  if [[ "$state" == "CLOSED" ]]; then
    echo "  ↻ #$num už je zavřený"
    return
  fi

  gh issue close "$num" --repo "$REPO" --comment "$comment" --reason completed >/dev/null
  echo "  ✓ zavřený #$num"
}

resolved() {
  local title="$1"
  local labels="$2"
  local body="$3"
  local closure="$4"

  echo "» $title"
  local num
  num=$(ensure_issue "$title" "$body" "$labels" | tail -1)
  if [[ -n "$num" ]]; then
    close_issue "$num" "$closure"
  fi
}

open_bug() {
  local title="$1"
  local labels="$2"
  local body="$3"

  echo "» $title (zůstává OTEVŘENÝ)"
  ensure_issue "$title" "$body" "$labels" >/dev/null
}

# ═════════════════════════════════════════════════════════════════════
# RESOLVED — bugy z první vlny hlášení (commit b400a26 a a1a2e2c)
# ═════════════════════════════════════════════════════════════════════

resolved \
  "Horní menu má nedostatečný kontrast — tmavý text na tmavém podkladu" \
  "bug,area:obojí,priority:normal,status:resolved" \
  "**Hlášeno:** 2026-04-28 (e-mail)
**URL:** všechny stránky, viditelné např. na https://hodinarium-eu.pages.dev/clanky/Kappa/

> Horní menu není moc viditelné, tmavý podklad a celkem tmavé písmo.

**Příčina:** default \`a\` color v navigaci byl \`var(--color-brass-bright)\` (#d9b274) na tmavém pozadí, kontrast 4.36:1 — borderline pro WCAG AA.

**Oprava:** \`.site-header nav a { color: var(--color-text); }\` (#f5ecd9, ~12:1), hover/focus → brass-bright, explicitní \`:visited\`. Změna v global.css obou apps." \
  "Opraveno v b400a26. Verifikováno \`tests/smoke/nav-contrast.hodinarium.spec.ts\`."

resolved \
  "/clanky/Kappa — chybí iframe s živým monitorem NTP jednotky" \
  "bug,area:hodinarium,priority:high,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** https://hodinarium-eu.pages.dev/clanky/Kappa/

> Dole na stránce bylo okno iframe, ve kterém byla stránka s aktuálními údaji
> https://www.orloj.eu/arduino2_polarizace_x.php?MAC=NTPi-C234

**Příčina:** turndown při HTML→Markdown převodu zahodil \`<iframe>\` (raw HTML jen v původním scrape). Pozn.: hlášený URL měl \`_x.php\`, reálný funkční je bez \`_x\`.

**Oprava:** přidán raw HTML iframe v Kappa.md směřující na \`orloj.eu/arduino2_polarizace.php?MAC=NTPi-C234\` + CSS \`.live-monitor\`." \
  "Opraveno v b400a26. Verifikováno \`tests/regression/iframes-and-components.hodinarium.spec.ts > Kappa: live monitor iframe\`."

resolved \
  "/podpora — text odkazu mizí na hover" \
  "bug,area:hodinarium,priority:normal,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** https://hodinarium-eu.pages.dev/podpora/

> Text při najetí myši zmizí. Aktivní text asi v barvě podkladu, což vyhovuje hornímu menu, ale ne stránce.

**Příčina:** společná s nav-kontrast bugem, plus chybějící \`a:visited\` rule (prohlížeče braly default visited barvu, na tmavém bg může splývat)." \
  "Opraveno v b400a26 (společný fix s nav-kontrast). Pokud uživatel pořád vidí staré chování, je to cache — Cmd+Shift+R."

resolved \
  "/clanky/slunecni_polarizacni — sidebar boilerplate uprostřed obsahu" \
  "bug,area:hodinarium,priority:high,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** https://hodinarium-eu.pages.dev/clanky/slunecni_polarizacni/

> Tady se špatně oddělil obsah div hlavní od ostatních.

**Příčina:** \`scripts/convert-hodinarium.ts\` extrakční regex \`<div class=\"hlavni\">\` nematchnul stránky kde \`class\` byla až po \`style\`. Fallback vzal celé \`<body>\` včetně sidebaru.

**Oprava:**
1. Regex teď tolerantní k pořadí atributů.
2. Manuálně očištěn markdown, doplněny chybějící filtr1—4 fotky." \
  "Opraveno v b400a26. Verifikováno regresním testem."

resolved \
  "/clanky/vodni_B_Gitton — sidebar boilerplate uprostřed obsahu" \
  "bug,area:hodinarium,priority:high,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** https://hodinarium-eu.pages.dev/clanky/vodni_B_Gitton/

> Rovněž tady se špatně oddělil obsah div hlavní od ostatních.

**Příčina:** identická s slunecni_polarizacni." \
  "Opraveno v b400a26. Verifikováno regresním testem."

resolved \
  "/clanky/slunecni_filler — chybí interaktivní JS sluneční hodiny" \
  "bug,area:hodinarium,priority:high,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** https://hodinarium-eu.pages.dev/clanky/slunecni_filler/

> Byla javascript aplikace v iframe, ale nyní není.

**Oprava (dvoukroková):**
1. **b400a26 (mezikrok):** zrcadlený \`slunecni2.htm\` do public + iframe.
2. **a1a2e2c (cílový):** přepis do nativní Astro komponenty \`SlunecniHodinyKlementinum\`. Equation-of-time fixed (legacy comma-operator bug), 200 dot-spritů → SVG, dark/light + responsive." \
  "Opraveno (b400a26 → a1a2e2c). Verifikováno regresním testem."

# ═════════════════════════════════════════════════════════════════════
# RESOLVED — druhá vlna (commit a1a2e2c)
# ═════════════════════════════════════════════════════════════════════

resolved \
  "/clanky/zidovske — tabulky ciferníků zploštěné do jednoho sloupce" \
  "bug,area:hodinarium,priority:high,status:resolved" \
  "**Hlášeno:** 2026-04-28 (druhá vlna)
**URL:** https://hodinarium-eu.pages.dev/clanky/zidovske/

> K vytváření židovských ciferníků bylo použito tabulek. Nyní vše v jednom sloupci.

**Oprava:** zidovske.md → zidovske.mdx, hebrejská abeceda jako řádná \`<table>\`, 3 ciferníky vedle sebe (CSS grid s kruhovými pozicemi 12 hodnoty). Bez původního obrázkového převodu — pozice se škálují responsive a zůstávají strojově čitelné." \
  "Opraveno v a1a2e2c. Verifikováno \`tests/regression/iframes-and-components.hodinarium.spec.ts\`."

resolved \
  "/clanky/zidovske — chybí iframe s živým hebrejským ciferníkem (zid.php)" \
  "bug,area:hodinarium,priority:high,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** https://hodinarium-eu.pages.dev/clanky/zidovske/

> Opět chybí iframe tentokrát s PHP \`<iframe src=\"zidovske/zid.php\" width=\"500\" height=\"362\">\`.

**Oprava:** místo iframu je teď nativní Astro komponent \`ZidovskeHodiny\` — SVG ručičky proti směru hodinových ručiček, JS update 30 s. Žádný cross-origin iframe, žádný server-side PHP. Mirror static assets (podklad.jpg + 2 GIF ručičky) v /public/img/zidovske/clock/." \
  "Opraveno v a1a2e2c. Verifikováno \`tests/regression/iframes-and-components.hodinarium.spec.ts > zidovske\`."

resolved \
  "/clanky/zvony_vyroba — chybí obrázek pruzez_zvonem.gif" \
  "bug,area:hodinarium,priority:normal,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** https://hodinarium-eu.pages.dev/clanky/zvony_vyroba/

**Příčina:** turndown nechal jen holé \`!\` místo \`![](src)\`. Soubor v /public byl, jen markdown referenci ztratil." \
  "Opraveno v a1a2e2c."

resolved \
  "/clanky/uspirku — chybí první dva obrázky (uspirku1+2)" \
  "bug,area:hodinarium,priority:normal,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** https://hodinarium-eu.pages.dev/clanky/uspirku/

> Místo nich je na stránce \`<p>!</p>\`.

**Příčina:** stejná jako u zvony_vyroba — turndown nechal \`!\`. Soubory v /public byly." \
  "Opraveno v a1a2e2c."

resolved \
  "/clanky/vodni_budik — v atlasu zúžený panel" \
  "bug,area:hodinarium,priority:low,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** https://hodinarium-eu.pages.dev/clanky/vodni_budik/

**Příčina:** dvě úzké portrétní fotky (195×260, 174×260) byly nalepeny v markdownu na sebe včetně bold textu, render byl divný." \
  "Opraveno v a1a2e2c — fotky teď v \`<div class=\"article-gallery\">\` mřížce."

resolved \
  "/clanky/youtube — v atlasu zúžený panel" \
  "bug,area:hodinarium,priority:low,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** https://hodinarium-eu.pages.dev/clanky/youtube/

**Příčina:** thumbnail \`/img/youtube.gif\` má 142×69 — moc malý pro 4:3 atlas card, dostal blurry upscale." \
  "Opraveno v a1a2e2c — logo z článku odstraněno, atlas teď ukazuje placeholder. Plus build-catalog.ts teď filtruje thumbnaily na /img/* (commit pending)."

# ═════════════════════════════════════════════════════════════════════
# RESOLVED — třetí vlna (tento commit)
# ═════════════════════════════════════════════════════════════════════

resolved \
  "Aktualizováno: Invalid Date — na všech stránkách článků" \
  "bug,area:hodinarium,priority:normal,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** všechny /clanky/* stránky

> Asi na všech stránkách Český spolek horologický … Aktualizováno Invalid Date.

**Příčina:** \`[slug].astro\` parsoval \`lastModified\` na český formát a pak ho předával do Article.astro v \`lastModified\` propu. Article.astro ho ale očekával jako raw ISO/RFC string a znovu volal \`new Date(...)\`. Druhý parse selhal protože český formát \"8. prosince 2025\" není valid Date input → \"Invalid Date\".

**Oprava:** \`[slug].astro\` teď předává raw \`entry.data.lastModified\`, Article.astro má vlastní isolated parser s \`isNaN\` guardem a generuje ISO string pro \`<time datetime=\"...\">\` + Czech locale string pro display."

resolved \
  "/clanky/astronomicke_Sauter — chybí obrázky Sauter1+2" \
  "bug,area:hodinarium,priority:normal,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** https://hodinarium-eu.pages.dev/clanky/astronomicke_Sauter/

> Chybějící obrázky i v původní verzi. Nyní tam již jsou.

**Příčina:** soubory \`/img/astronomicky_Sauter/f/Sauter1.jpg\` a \`Sauter2.jpg\` nebyly stažené z původního webu (pipe download asset přeskočil). Markdown na ně ani nereferencoval (manualEdit verze).

**Oprava:** stažen Sauter1.jpg a Sauter2.jpg z hodinarium.eu, doplněny markdown reference do astronomicke_Sauter.md."

resolved \
  "/clanky/brillie — atlas thumbnail moc portrétní (vypadá rozbitě)" \
  "bug,area:hodinarium,priority:low,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** https://hodinarium-eu.pages.dev/clanky/brillie/

> V atlasu není obrázek, ačkoliv na stránce je.

**Příčina:** první image v článku byl 275×560 (extrémně portrétní). Atlas card \`object-fit: cover\` na 4:3 ho vertikálně masivně cropoval — vizuálně vypadalo jako prázdný/divný panel.

**Oprava:** explicitní \`thumbnail: /img/elektrika/brillie/Brillie_x2_m.jpg\` v frontmatteru (275×225, landscape, sedne do 4:3). Plus build-catalog.ts teď podporuje \`thumbnail\` override field a filtruje na /img/ paths."

resolved \
  "/clanky/mystery — atlas thumbnail moc malý (140×132 → blurry)" \
  "bug,area:hodinarium,priority:low,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** https://hodinarium-eu.pages.dev/clanky/mystery/

> V atlasu není obrázek, ačkoliv na stránce je.

**Příčina:** první image \`/img/mystery1.jpg\` má 140×132 — moc malý pro 4:3 atlas card, dostal blurry upscale.

**Oprava:** thumbnail override na \`/img/mystery/clockincline1.jpg\` (414×230, landscape) v mystery.md frontmatteru."

resolved \
  "/clanky/prestavby — atlas thumbnail je /clanky/hinspirace (broken markdown)" \
  "bug,area:hodinarium,priority:high,status:resolved" \
  "**Hlášeno:** 2026-04-28
**URL:** https://hodinarium-eu.pages.dev/clanky/prestavby/

> V atlasu není obrázek, ačkoliv na stránce je. Na stránce chybí obrázky.

**Příčina:** turndown sloučil \`<a href=\"hinspirace.htm\"><img src=\"...\" /></a>\` do bizarního \`![](/clanky/hinspirace)\` — \"obrázek\" jehož src je URL článku. \`build-catalog.ts\` to vzal jako thumbnail. Plus celá galerie miniatur na začátku článku byla ztracená.

**Oprava:**
1. Manuálně přepsán markdown — galerie 8 miniatur jako \`[![alt](src)](href)\` linky, doplněn jezdecký a sloupkový obrázek.
2. \`build-catalog.ts\` regex omezen na \`/img/...(jpg|png|gif|webp|avif)\` — odmítá artefakty typu \`/clanky/...\`."

# ═════════════════════════════════════════════════════════════════════
# OPEN — bugy které tento commit částečně adresuje, ale ne všechny případy
# ═════════════════════════════════════════════════════════════════════

open_bug \
  "Iframe ztracený při HTML→MD konverzi — dotčených ~19 článků" \
  "bug,area:nástroje,priority:high,status:planned" \
  "**Hlášeno:** 2026-04-28
**Kontext:** turndown defaultně vyhazuje \`<iframe>\` tagy. Postupně se objevují konkrétní stránky kde to vadí.

**Co je opraveno:**
- Kappa (live NTP monitor)
- slunecni_filler (Klementinum komponent)
- zidovske (zid.php komponent)
- kostky (brozura_miniatury.pdf)
- zapis20190118 (Zápis volební schůze)
- zapis20200110

**Co zbývá** (raw obsahuje iframe, markdown ne):
- Arduino, Arduino_IBM (orloj.eu PHP monitory)
- PRS10 (PRS2.php)
- TimeSlider, fake_atomove_hodiny, mindelheim, Arduino (YouTube embedy)
- 12_24, cas_internet2, segmentovky_s_prekladem (různé)
- mystery_prg.htm, normalni_prg.htm, segmentovky_prg.htm, kniha_vez.htm, search.htm — sub-page iframes (potřeba zrcadlit do /public)
- tabor (muzeumhodin.info/tabor/tab.php), sezona2012, sezona2013

**Plán:**
1. \`scripts/convert-hodinarium.ts\` má teď turndown rule \`preserveIframe\` — budoucí re-konverze už nenastane. ✓
2. Per-article patch nutno udělat ručně (nebo skriptem který scanuje raw + porovnává s markdown). Otevřít sub-issue pro každou skupinu.

**Akceptační kritérium:** každý článek z výše uvedeného seznamu má v markdownu odpovídající iframe nebo explicitní rozhodnutí proč ne (např. komponent místo iframu)."

echo
echo "Hotovo. Seznam: gh issue list --repo $REPO --state all --label status:resolved"
echo "Otevřené: gh issue list --repo $REPO --label status:planned"
