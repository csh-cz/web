---
name: clanky-tldr
description: Pravidla pro pole `tldr` (perex / krátké shrnutí) ve frontmatteru článků hodinarium-eu. Aktivuje se při tvorbě nebo úpravě `tldr:` v content/hodinarium-eu/*.{md,mdx} a content/kroky/*.{md,mdx}, při auto-importu legacy textů, při SEO review (meta description, Twitter Card, Google snippet), při code review článků. Pravidla: (1) tldr doplňuje titulek, neopakuje ho; (2) 1–2 věty, max ~200 znaků; (3) aktivní hlas, konkrétní fakta; (4) nikdy „Stručně:", „V tomto článku", „Tento článek pojednává"; (5) nikdy utnuté výpustkou „…"; (6) bez markdown formátování (renderuje se i jako meta description); (7) nekončí pouhým názvem předmětu/místa, který je už v titulku. Skript `node scripts/audit-tldr.mjs` flagne porušení.
---

# Pravidla pro `tldr` pole

Pole `tldr` ve frontmatteru je **krátké shrnutí článku**, které:

- se zobrazuje v perex banneru pod titulkem na stránce článku (`<p class="tldr">`)
- jde do **`<meta name="description">`** (Google snippet, ~155 znaků)
- jde do **OG / Twitter Card** sociálního preview
- jde do **search index** a **RSS feedu**

Z toho plynou nároky: text musí stát samostatně, dávat smysl bez zbytku článku, neopakovat titulek, být **konkrétní** a **stručný**.

## 1. Co musí splnit

### Nezopakovat titulek

Když titulek říká **„Robertův krok — oprava chybného označení"**, tldr **NESMÍ** začínat:

- ❌ „Robertův krok je…"
- ❌ „Tento článek se zabývá Robertovým krokem a opravou…"
- ❌ „Oprava chybného označení Robertova kroku."

ALE může:

- ✓ „Klidový kotvový krok s kolíčkovým kolem, který zavedl roku 1852 Adolphe Robert ze Sancerre — v Čechách rozšíření zdokumentované od roku 1868 (J. Prokeš)."
- ✓ „Sancerre je město původu, nikoli příjmení autora. Plné jméno: Léon Émile Adolphe Robert."

Pravidlo: **přidej informaci, kterou titulek nedává**.

### Délka 1–2 věty, max ~200 znaků

| Délka | Hodnocení |
|---|---|
| ≤ 120 znaků | ideální (Twitter, FB preview, Google snippet, perex pod titulkem) |
| 120–200 znaků | OK |
| 200–300 znaků | příliš dlouhé, zlomit nebo zkrátit |
| > 300 znaků | určitě zkrátit — Google to ořízne |

Cíl: 1–2 plnohodnotné věty. Ne odstavec.

### Aktivní hlas, konkrétní fakta

- ❌ „V Hodináriu je vystaven zajímavý exponát z 19. století."
- ✓ „Věžní stroj Jana Prokeše ze Sobotky (1868) s ojedinělým Robertovým krokem."

Konkrétní = jméno autora, datace, technický typ, místo původu, něco identifikovatelného.

## 2. Co NESMÍ obsahovat

### Meta-zmínky o článku

- ❌ „V tomto článku popíšeme…"
- ❌ „Tento článek pojednává o…"
- ❌ „Stručně shrnujeme historii…"
- ❌ „Více se dozvíte níže."

Tldr je **shrnutí**, ne pozvánka k čtení. Nepotřebuje meta-vrstvu.

### Prefix „Stručně:"

UI label „Stručně:" byl odstraněn z `Article.astro` (commit 965faed). Pole `tldr` nesmí začínat slovem „Stručně:" — to byl chybný auto-import, kde label utekl do hodnoty.

### Utnuté výpustkou („…")

Auto-import z legacy hodinarium.eu PHP webu zachytil **prvních N znaků body** a zakončil výpustkou. Příklad:

- ❌ „Co byste řekli slunečním hodinám, které nemají žádný ukazatel vrhající stín? Hodinám, které správně ukazují čas, i když je Slunce zakryto mrakem, a které…"

Tohle není shrnutí, je to **uťatý začátek**. Vždy přepiš na vlastní 1–2 věty.

### Markdown formátování

- ❌ `tldr: "**Robertův krok** s [kolíčkovým kolem](#)…"`
- ✓ `tldr: "Robertův krok s kolíčkovým kolem…"`

Tldr jde do `<meta name="description">` jako čistý text. Markdown se tam nerendere a `**` zůstanou v Google snippetu.

### Atributy a citace

Tldr není místo na credit, citace, autora článku nebo zdroj — ty žijí ve vlastních polích (`author:`, `references:`, body).

## 3. Vzor

### Špatný (auto-import, opakuje titulek + utnutý)

```yaml
title: "Stroj věžních hodin - Budislav"
tldr: "Do expozice Věžního muzejíčka v Soběslavi byl v roce 2012 zapůjčen vřetenový stroj věžních hodin z kostela Nanebevzetí Panny Marie z nedaleké obce Budislav.…"
```

Problémy:
1. Opakuje titulek 100 % („Stroj věžních hodin Budislav")
2. Končí utnuté („…")
3. Říká kde je v expozici, ne **proč je zajímavý**

### Dobrý (přepsaný)

```yaml
title: "Stroj věžních hodin - Budislav"
tldr: "Vřetenový stroj z kostela Nanebevzetí P. Marie (zápůjčka 2012). Dochovaný příklad barokní konstrukce, jakou pražští hodináři opouštěli ve prospěch kotvového kroku."
```

Co se změnilo:
- Místo „kde je vystaven" → **co je na něm zajímavé** (vřetenový krok, barokní konstrukce, historický kontext)
- Krátké, žádná výpustka, žádné opakování titulku
- 175 znaků — vejde se do Google snippetu

## 4. Workflow

### Při psaní nového článku

Tldr napiš **až na konci** psaní, kdy víš, co je hlavní pointa. Drž 1–2 věty.

### Při review existujícího článku

Spusť `node scripts/audit-tldr.mjs` — flagne tldr s problémy. Output je v `tmp/tldr-audit.json` + sumář na stdout. Pak ručně přepiš.

### Při auto-importu / migraci

Auto-importer kopíruje prvních ~200 znaků body s výpustkou. **Vždy přepiš ručně** — auto-tldr je jen placeholder. Po přepisu nastav `manualEdit: true`.

### Při kontrole před publikací

Přečti tldr **bez titulku** — dává smysl? Doplňuje informaci? Pokud opakuje titulek nebo říká banalitu („zajímavý exponát"), přepiš.

## 5. SEO důsledky

`tldr` se renderuje jako:

```html
<meta name="description" content="..." />
<meta property="og:description" content="..." />
<meta name="twitter:description" content="..." />
```

Google v search snippetu zobrazí prvních ~155 znaků. Pokud tldr opakuje titulek, snippet vypadá:

```
Robertův krok — oprava chybného označení | Hodinárium
hodinarium.eu › clanky › ...
Robertův krok je hodinový krok, který…
```

Čtenář z toho nic nedostane. Naopak dobrý tldr:

```
Robertův krok — oprava chybného označení | Hodinárium
hodinarium.eu › clanky › ...
Sancerre je město původu autora, ne příjmení. Plné jméno
Léon Émile Adolphe Robert; v Čechách doloženo od 1868 (J. Prokeš).
```

Tj. čtenář dostane **něco navíc** a klikne s vědomím, co tam najde.

## 6. Validation

Skript `scripts/audit-tldr.mjs` heuristicky kontroluje:

- **opakuje-titulek-N%** — slovo z titulku se opakuje v tldr (≥ 60 % shoda)
- **dlouhe-Nznaku** — > 250 znaků
- **utnute** — končí `…` nebo `...`
- **meta-zminka** — obsahuje „v tomto článku", „tento článek pojednává"
- **strucne-prefix** — začíná „Stručně:" (legacy artefakt)

Skript NEpíše do souborů — jen reportuje. Tldr se přepisují ručně, případně přes batch agent (subagent run).
