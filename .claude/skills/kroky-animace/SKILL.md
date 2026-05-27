---
name: kroky-animace
description: Konvence pro tvorbu schematických SVG animací hodinových kroků (escapements) v rubrice `/kroky/` na hodinarium-eu. Aktivuje se při zakládání nové animace pro některý z 25+ kroků v `apps/hodinarium-eu/public/img/kroky/<slug>-animace.svg`, při úpravě existující animace, při řešení vizuální nebo didaktické konzistence napříč pilotů (Graham, Robert, kotvový, vretenový, magnetický, atd.), při debug Chrome `<object>` cache/rendering, nebo když uživatel chce další krok ve stejném stylu jako Graham pilot. Triggery: "animace kroku", "SVG pro krok X", "udělej Robert/kotvový/vretenový krok animovaně", "nová karta krok v `/kroky/`", "stejný styl jako Graham". Pokrývá: barevnou paletu, geometrii (viewBox, pivot, helper arcs), SMIL animace (tick, oscillation, palet highlight, fázový text), Photo komponentu embed přes `<object>`, cache-bust query, speed control v article template, atribuci PD/CC, didaktické fáze lock/release/impulse/drop podle Airy 1826.
---

# Animace hodinových kroků — konvence pro `/kroky/`

Skill vychází z **lessons learned na Graham pilotu** (2026-05-26, commits `73c71ea3` → `dc1336eb`). Pilot prošel 8 iteracemi (v1 → v6+) než dosáhl stabilního stavu vizuálně, didakticky i technicky. Tento skill kondenzuje výsledek tak, aby další z plánovaných **25 animací kroků** vznikaly konzistentně, didakticky správně a vypadaly "z jednoho pera".

## 1. Hlavní zásady

### 1.1 Předlohy a atribuce

| Zdroj předlohy | Postup | License výstupu |
|---|---|---|
| **Wikimedia Commons PD** (např. Chetvorno) | Stáhnout originál → překreslit do palety hodinarium-eu → atribuce v `::photo` note | **CC BY 4.0 ČSH** + note "Schematicky inspirováno: [autor], '[název]' (Wikimedia Commons, Public Domain)" |
| **Wikimedia Commons CC BY-SA** | Stejný postup, ale OUTPUT musí být **CC BY-SA 4.0** (share-alike) | **CC BY-SA 4.0** + per-foto license override v `::photo` |
| **Reference Saunier/Britten/Reid** (historická literatura, PD vinou stáří) | Re-draw podle ilustrace | **CC BY 4.0 ČSH** + bibliografická citace v note |
| **Vlastní original** (žádná předloha) | Free hand kresba | **CC BY 4.0 ČSH** (default site license) |

**NIKDY** přebírat originál SVG bez překreslení — vždy projít stylem hodinarium-eu (paleta, popisky, animace).

### 1.2 Soubor a path

- **Cesta**: `apps/hodinarium-eu/public/img/kroky/<slug>-animace.svg`
- **Slug**: stejný jako MDX (`grahamuv-krok`, `kotvovy-krok`, `vretenovy-krok`, ...)
- **image-sizes.json**: přidat entry `{w: 475, h: 625, size: "large", tone: "light"}` (rozměry dle viewBox)
- **NEPROCHÁZÍ R2 CDN** — imgvariants-r2-sync.yml syncuje jen rastr (jpg/png), SVG zůstává v `public/`

### 1.3 Embed mechanismus

Photo.astro detekuje `.svg` extension a:
1. Renderuje přes `<object type="image/svg+xml">` (NIKOLI `<img>` — SMIL animace v `<img>` Chrome ignoruje!)
2. SVG src obchází R2 CDN rewrite (`/img/...` z pages.dev origin)
3. **Cache-bust query param** `?v=<buildHash>` — kritické, pages.dev cache-control je 30 dní

Tj. v MDX použij standardní `::photo{}` directive:
```mdx
::photo{src="/img/kroky/grahamuv-krok-animace.svg" alt="…" author="Český spolek horologický" authorUrl="/docs/kroky-illustration-style" note="Schematicky inspirováno: Chetvorno, „Graham Escapement" (Wikimedia Commons, Public Domain)…"}
```

### 1.4 MDX visibility

`content/kroky/<slug>.mdx` musí mít **`workflow.publicDuringEdit: true`** aby se MDX Detail renderoval i při `status: todo` (jinak `isPubliclyBuildable=false` → 404 logika přeskočí Detail).

```yaml
workflow:
  status: todo
  publicDuringEdit: true
  notes: "Stub — k rozšíření o detail mechaniky…"
```

## 2. Vizuální konzistence (paleta, geometrie)

### 2.1 Barevná paleta — POVINNÁ

```
#F0E4C8  pozadí (krémový papír)
#E6C97A  mosaz — krokové kolo, soukolí, čočka kyvadla            stroke: #8A6E35
#88A8C8  ocel — kotva, hřídel, planžeta, kyvadlová tyč           stroke: #3D5878
#B85068  rubín — palety, ložiskové kameny, active highlights     stroke: #8A3850
#3A2818  sépia — popisky, středové čepy (filled black)
#6B4A2E  sépia soft — helper lines, leader lines, soft text
```

Plné CSS proměnné viz `docs/kroky-illustration-style.md`. Vždy konzistentní napříč všemi 25 kroky.

### 2.2 viewBox a rozměry

```svg
<svg xmlns="http://www.w3.org/2000/svg"
     viewBox="0 0 475 625"
     width="475"
     height="625"
     preserveAspectRatio="xMidYMid meet"
     role="img"
     aria-labelledby="title desc">
```

- **viewBox**: `0 0 475 625` (portrait 475×625, převzato z Wikipedia Chetvorno Graham SVG)
- **width + height attributes**: POVINNÉ. Bez nich Chrome `<object>` nedělá intrinsic sizing a SVG zaplaví viewport.
- **preserveAspectRatio**: `xMidYMid meet` (default, ale explicit pro jistotu)

### 2.3 Kompozice

| Element | Pozice | Pozn. |
|---|---|---|
| Pivot kotvy / horní pivot | cca (240, 40-50) | Centrum osy oscilace |
| Krokové kolo | center cca (240, 370), outer radius ~165-235 | Velké, dominuje obrazu |
| Tyč kyvadla | svisle dolů od pivotu | Pro úsporu místa schematicky přes osu kola |
| Čočka kyvadla | dole cca (240, 590-620) | Mosaz, malá vzhledem k oblasti |
| CW/CCW arrow | dolní pravý roh (425, 480-510) | Statická, opacity 0.55, popisek "CW" / "CCW" |
| Labels A/B/C/D | po obvodu, ne přes mechanizmus | Inter sans-serif, viz §2.5 |
| Fázový text | top center (237, 25) | "LOCK" ↔ "IMPULSE → DROP", weight 600, 16px |
| Spodní atribuce | dole střed (237, 615) | "[Název] krok (G. Graham, 1715) — schematická animace" |

### 2.4 Pallet kontaktní pozice — CAD-correct výpočet

⚠️ **NESPOLÉHEJ na Wikipedia helper arcs!** Wikipedia SVG (Chetvorno) má pal lock arcs na asymetrických r=243/222 — to jsou JEN DECORATIVE čáry odpovídající V tip OUTER/INNER edges, NE skutečné lock face arcs.

**Skutečná lock arc geometrie** (per Saunier 1875, CAD Journal Vol.4 2007 Fig.15):

1. **Anchor span**: standardně 90° z wheel center = 7.5 zubů (z 30zubého kola)
2. **Tooth tip kde paleta chytá zub**: at angle 45° from vertical z wheel center
3. **Lock arc radius** r_lock = distance from anchor pivot to tooth tip position:
   ```
   tooth_pos = (wheel_cx − R_t·sin45°, wheel_cy − R_t·cos45°)
   r_lock = √((tooth_x − pivot_x)² + (tooth_y − pivot_y)²)
   ```
4. **Symmetric** — `r_left = r_right` (Wikipedia asymmetrické je BUG)

Pro Graham reference: R_t=236.3, D=329.9 → r_lock = **235.09** (NE 243/222)

Pal contact positions:
- Left: (72.41, 205.51) — `wheel_cx − R_t·sin45°, wheel_cy − R_t·cos45°`
- Right: (406.59, 205.51) — mirror

Pomocný skript: `reference/pal-contact.py` ALE jeho původní default byl založen na Wikipedia r=243/222 (chyba). Updated version vrací paper-correct values pro anchor span 90°.

⚠️ NEUMÍSŤOVAT highlight markery na "inner edge V tipu" či "vrchol V" — vizuálně blízko ale fyzicky off o 20-25 px. Vždy spočítat průsečík kruhů ze správného r_lock.

### 2.5 Helper arcs (lock geometry)

KRITICKÉ pro pochopení principu — kruhové oblouky soustředné s pivotem kotvy ukazují **dráhu, po které klouže zub během lock fáze** (definice deadbeat: kruhový oblouk = tečná síla 0 = kolo stojí).

```svg
<!-- Lock arcs (sepia dashed, opacity ~0.45) -->
<g stroke="#6B4A2E" stroke-width="1.4" fill="none" stroke-dasharray="6 4" opacity="0.45">
  <path d="M [start_x],[start_y] C [bezier control points] [end_x],[end_y]"/>
  <path d="M [right_arc_start] c [right_arc_data]"/>
</g>
```

Pro Graham: arcs jsou na poloměru ~243 (left, OUTER edge palety) a ~222 (right, INNER edge palety) od pivotu (242, 42.7). Geometrie z původní Wikipedia path6132. Pro jiné kroky: vypočítat dle pozic palet vlastní geometrie.

### 2.5 Typografie popisků

```css
.krok-popisek      { font: 400 12px/1.3 'Inter', 'Helvetica Neue', 'Arial', sans-serif; fill: #3A2818; }
.krok-popisek-cislo { font: 600 12px/1.3 ...; fill: #3A2818; }  /* "A", "B", "C", "D" markers */
.krok-popisek-mensi { font: 400 10px/1.3 ...; fill: #3A2818; opacity: 0.7; }  /* atribuce */
.krok-popisek-faze  { font: 600 16px/1.3 ...; letter-spacing: 0.05em; }  /* LOCK / IMPULSE */
```

**NIKDY** italic ani serif rukopis — kýčovité. Sans-serif technický styl.

## 3. Didaktická konzistence (fáze, časování)

### 3.1 Fáze cyklu deadbeat eskapementu (per Airy 1826, Saunier 1875, Britten 1899)

| Fáze | Trvání | Popis |
|---|---|---|
| **LOCK** | ~80–90% periody | Zub klouže po lock face (kruhový oblouk soustředný s pivot). Tečná síla 0. **Kolo STOJÍ.** Kotva volně osciluje (supplementary arc) |
| **UNLOCK + IMPULSE** | ~10–15% periody | Zub klouže po impulse face (úkos). Tečná síla → moment kotvě. **Kolo se posune o ~10°** za 0,4 s |
| **DROP** | ~2–5% periody | Zub uklouzne z hrany palety, volně letí o ~2°. Slyšitelný **TIK** |
| **LOCK** druhé palety | instant | Nový zub udeří do lock face druhé palety. Cyklus opakuje na opačné straně |

### 3.2 Airyho teorém

**Impulse se odehrává PŘI PRŮCHODU KYVADLA NULOVOU POLOHOU** (max rychlost, min citlivost na poruchy). Tj. impulse okna v t=0.25 a t=0.75 cyklu (kyvadlo prochází 0°). NIKDY impulse u extrému kyvadla — to bylo bug ve v4 který opravil v5.

### 3.3 Timing animace — standardní

Pro pilot animace (didakticky čitelnější než reálné):
- **Perioda kyvadla: 4 s** (2× pomalejší než reálné regulátory s 2 s periodou)
- **Amplituda kotvy: ±2°** (REÁLNÁ; NESMÍ se zvětšovat na ±6° pro "čitelnost"!)
- **Tick každé 2 s** (= 1 zub za 2 s)
- **Celá otáčka kola: 60 s** (15 period × 24°)

⚠️ **POZOR — amplituda kotvy:** zub v lock fázi LEŽÍ NA PALETE (fyzický kontakt). Paleta = kruhový oblouk soustředný s pivot kotvy, takže při rotaci kotvy zub klouže po této ploše bez kolize. ALE: vizuálně palety (V tipy) se rotují podle pivot kotvy, a pokud amplituda je VĚTŠÍ než pásmo lock face contact, paleta VYJEDE z zubního pole a vypadá to jako že kotva "prochází skrz zub" → vizuální kolize.

**Pravidlo**: amplituda kotvy musí být dostatečně malá aby V tipy palet zůstávaly v zubním poli (kolem r=235 od pivot u Graham geometrie). ±2° je horní hranice pro Graham; ±1,5° pro precision regulátory. NIKDY ±6° nebo víc — zub se nesmí "propíchnout" paletou.

### 3.4 Vizuální vrstvy didaktické čitelnosti

POVINNÉ pro každou animaci:

1. **Rubínový highlight palety v lock fázi** — bliká nad paletou která drží zub
2. **Fázový text LOCK ↔ IMPULSE → DROP** nahoře, mění se synchronně s fází
3. **Helper arcs** (sepia dashed) vizualizující lock face geometrii
4. **Šipka CW/CCW** v dolním rohu indikující směr rotace kola

## 4. SMIL animace — sablona

### 4.1 Krokové kolo (discrete tick BEZ `accumulate="sum"`)

**Chrome v `<object>` má bug** s `<animateTransform type="rotate" accumulate="sum">` + center coords (element zmizí). Workaround: **explicit values list pokrývající celou otáčku** (60s, 30 ticks × 2 keyframes = 61 keyframes).

Generovat skriptem (skill obsahuje `reference/wheel-ticks.py`) nebo ručně:

```svg
<g>
  <animateTransform
    attributeName="transform"
    type="rotate"
    values="0 [cx] [cy]; 0 [cx] [cy]; 12 [cx] [cy]; 12 [cx] [cy]; 24 [cx] [cy]; ... 348 [cx] [cy]; 360 [cx] [cy]"
    keyTimes="0; 0.03; 0.03333; 0.06333; ... 0.99667; 1"
    calcMode="linear"
    dur="60s"
    begin="0s"
    repeatCount="indefinite"/>

  <path d="…wheel teeth…" fill="#E6C97A" stroke="#8A6E35" stroke-width="1.4"/>
  <circle cx="[cx]" cy="[cy]" r="16.7" fill="#3A2818"/>
</g>
```

**Logika per tick interval** (1/30 = 0.03333 cyklu = 2s @ dur=60s):
- 0..0.9 of interval: hold (lock fáze, kolo stojí)
- 0.9..1.0 of interval: jump from N° to (N+12)° (impulse + drop)

Pattern: `(i/30, N*12)`, `((i+0.9)/30, N*12)` pro `i ∈ 0..29` + final `(1, 360°)`.

### 4.2 Kotva + kyvadlo (sinusoidální oscilace)

```svg
<g>
  <animateTransform
    attributeName="transform"
    type="rotate"
    values="6 [pivot_x] [pivot_y]; -6 [pivot_x] [pivot_y]; 6 [pivot_x] [pivot_y]"
    keyTimes="0; 0.5; 1"
    dur="4s"
    begin="0s"
    repeatCount="indefinite"
    calcMode="spline"
    keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"/>

  <path d="…kyvadlová tyč…" fill="#88A8C8" stroke="#3D5878"/>
  <path d="…kotva V tvar…" fill="#88A8C8" stroke="#3D5878"/>
  <circle cx="[pivot_x]" cy="[pivot_y]" r="13.78" fill="#3A2818"/>  <!-- pivot -->

  <!-- Pallet highlights uvnitř kotvy groupy (rotují s ní) -->
  <circle cx="[left_pallet_x]" cy="[left_pallet_y]" r="11" fill="#B85068" opacity="0">
    <animate attributeName="opacity"
      values="0.8; 0.8; 0; 0; 0; 0.8; 0.8"
      keyTimes="0; 0.45; 0.46; 0.95; 0.96; 0.97; 1"
      dur="4s" repeatCount="indefinite"/>
  </circle>
  <circle cx="[right_pallet_x]" cy="[right_pallet_y]" r="11" fill="#B85068" opacity="0">
    <animate attributeName="opacity"
      values="0; 0; 0.8; 0.8; 0; 0"
      keyTimes="0; 0.46; 0.47; 0.95; 0.96; 1"
      dur="4s" repeatCount="indefinite"/>
  </circle>
</g>
```

### 4.3 Fázový indikátor (alternující LOCK / IMPULSE → DROP)

```svg
<g text-anchor="middle">
  <text x="237.5" y="25" class="krok-popisek-faze" fill="#3A2818" opacity="1">
    LOCK
    <animate attributeName="opacity"
      values="1; 1; 0; 0; 1; 1; 0; 0; 1"
      keyTimes="0; 0.44; 0.45; 0.51; 0.52; 0.94; 0.95; 0.99; 1"
      dur="4s" repeatCount="indefinite"/>
  </text>
  <text x="237.5" y="25" class="krok-popisek-faze" fill="#B85068" opacity="0">
    IMPULSE → DROP
    <animate attributeName="opacity"
      values="0; 0; 1; 1; 0; 0; 1; 1; 0"
      keyTimes="0; 0.44; 0.45; 0.51; 0.52; 0.94; 0.95; 0.99; 1"
      dur="4s" repeatCount="indefinite"/>
  </text>
</g>
```

## 5. Speed control v article template

`kroky/[slug].astro` má built-in speed control panel (Graham commit `dc1336eb`):
- Buttons: 0,25× / 0,5× / 1× / 2× / ⏸ pauza
- JS handler modifikuje `dur` všech `<animateTransform>`/`<animate>` v `<object>.contentDocument` (same-origin = plný access)
- Pauza přes `documentElement.pauseAnimations()`
- Panel se odhaluje JS-em jen pokud animované SVG existuje

Pro nové kroky: NIC NEPŘIDÁVAT — panel je už globální pro celou rubriku. Stačí dát animovaný SVG do `/img/kroky/`.

## 6. Časté problémy a debug

### 6.1 `<object>` cache (KRITICKÉ)

pages.dev cache-control je `public, max-age=2592000` = **30 dní**. Chrome `<object>` honor cache extrémně agresivně. Pokud měníš SVG, user vidí stará verzi.

**Řešení**: Photo.astro automaticky appendá `?v=<buildHash>` do SVG src. **NIKDY nezavádět SVG bez cache-bust** — strávíš hodiny debugem fantómových bugů které neexistují.

Pro lokální debug: vždy fetch s `?nocache=` query param při testu v Chromu.

### 6.2 Chrome render bugs

| Symptom | Příčina | Řešení |
|---|---|---|
| Celé SVG zaplaví viewport | Chybí `width`/`height` na `<svg>` root | Přidat explicit width="475" height="625" |
| Žádné animace v Chrome | SVG embed přes `<img>` | Switch na `<object type="image/svg+xml">` |
| Animace v `<object>` neaktualizují | Cache | Cache-bust query param (Photo.astro řeší) |
| `<g>` zmizí po animaci | Možná Chrome bug s `accumulate="sum"` u rotate s center coords | Nejdřív verify že není cache; pak fallback na continuous rotation (from/to bez accumulate) |

### 6.3 `accumulate="sum"` v Chrome — POTVRZENÝ BUG

**Chrome v `<object>` má REÁLNÝ bug** s `<animateTransform type="rotate" accumulate="sum">` + center coords (`X cx cy` format). Element úplně zmizí — potvrzeno přes JS query (path je v DOMu, fill OK, bbox OK, ale renderer ho přeskočí).

Workaround:
- **NEPOUŽÍVAT** accumulate="sum" pro rotace s center
- Místo toho **explicit values list pro celou otáčku** (60s, 61 keyframes pro 30 ticků) — viz §4.1

Pozn: bez center (jen `from="0" to="360"`) accumulate funguje, ale center je potřeba pro správnou rotation kolem středu kola.

### 6.4 Verifikace renderingu

`rsvg-convert -w 800 file.svg -o out.png` **NEDETEKUJE Chrome bugs** — používá libRSVG renderer který je tolerantnější. Vždy ověřit v real browser (Chrome MCP) před commit + push.

## 7. Workflow nového kroku

1. **Najít předlohu** — Wikipedia Commons (priorita SVG), pak Špatný 1882, Bureš 1965 (Zotero kolekce), Saunier, Britten
2. **Ověřit licenci** předlohy (PD / CC0 / CC BY / CC BY-SA)
3. **Stáhnout** + porovnat geometrii s ostatními kroky v rubrice
4. **Překreslit do palety**:
   - Použít template z `reference/template.svg`
   - Pře barvit fill/stroke podle §2.1
   - Strip annotation overlays (red labels, atd.)
5. **Přidat SMIL animace**:
   - Wheel: discrete tick + `accumulate="sum"` (§4.1)
   - Anchor/pendulum: sinusoidal (§4.2)
   - Pallet highlights: opacity alternating (§4.2)
   - Phase text: opacity alternating (§4.3)
6. **Helper arcs**: vypočítat lock geometry, nakreslit sepia dashed (§2.4)
7. **Verifikovat v Chromu** (NE jen rsvg-convert) — viz §6.4
8. **Atribuovat** v `::photo` directive (autor + licence + note o úpravě + úpravy)
9. **Uložit** do `apps/hodinarium-eu/public/img/kroky/<slug>-animace.svg`
10. **Aktualizovat** `apps/hodinarium-eu/src/data/image-sizes.json` (entry s rozměry)
11. **Update MDX** `content/kroky/<slug>.mdx` — přidat `::photo` directive před `## Stručně`, nastavit `workflow.publicDuringEdit: true`
12. **Build** lokálně (`pnpm --filter hodinarium-eu build`) — validate MDX/Astro errors
13. **Commit + push** + ověřit deploy + Chrome screenshot

## 8. Per-krok geometrické poznámky

Některé kroky mají odlišnou geometrii než Graham:

| Krok | Hlavní specifika |
|---|---|
| **Vretenový (verge)** | 2 palety v kolmé orientaci (vertical balance), bez kyvadla — foliot s vahadly |
| **Kotvový vratný (recoil)** | Podobný Graham, ALE palety mají PLOCHÉ lock face → kolo COUVÁ při lock = "recoil" (vizualizovat jako mírný zpětný posun kola po každém ticku) |
| **Grahamův klidový (deadbeat)** | Reference implementace — viz pilot SVG |
| **Robertův** (CZ varianta) | Kolíčková varianta Grahamova — místo zubů palety drží KOLÍKY v kole |
| **Mannhardtův** | Specifická konstrukce s gravitační regulací (free escapement) — kotva + zachycovací rameno |
| **Chronometrový (detent)** | Pružinová detent paleta, energie přenášena jednou za období |

Pro každý krok vyhledat **2-3 reference** (Wikipedia + literatura) než začít kreslit.

## 9. Reference

### Klíčové zdroje
- **Headrick, M. V.** — *Clock and Watch Escapement Mechanics* (1997) — **THE canonical drawing reference**. Step-by-step CAD instructions pro každý krok. Dostupné PDF: https://www.abbeyclock.com/EscMechanics.pdf
- **Tam, L. C., Fu, Y., Du, R.** — *Virtual Library of Mechanical Watch Movements* (CAD Journal Vol.4 No.1-4, 2007, pp 127-136) — SolidWorks 3D modely, geometricky přesný. Confirms Headrick parameters.
- **Saunier, C.** — *Traité d'Horlogerie moderne* (1875) — kapitola XII Escapements
- **Britten, F. J.** — *Watch & Clockmaker's Handbook* (1899) — heslo "Dead-beat"
- **Reid, T.** — *Treatise on Clock and Watch Making* (1826) — early reference
- **Headrick, M.** — *Origin and Evolution of the Anchor Clock Escapement* (IEEE 2002, doi:10.1109/MCS.2002.993199) — moderní matematická analýza
- **Rawlings, A. L.** — *The Science of Clocks and Watches* (3. vyd. 1993)

### Headrick design rules — Graham (sekce 3)

Pro 30zubý wheel s radius R (= 3" v Headrick orig.):
1. **Pivot anchor**: na svislé z wheel center, distance **D = R × √2** (≈ 1.414 R)
2. **r_pal**: lock arc radius = **R** (= wheel radius!)
3. **r_inner**: pal V tip inner = R × (5.69/6) ≈ 0.948 R
4. **r_outer**: pal V tip outer = R × (6.31/6) ≈ 1.052 R
5. **Anchor span**: 7.5 zubů = 90° na wheelu (pal contact at ±45° z vertikály od wheel center)
6. **Pal V tip span**: ±3° kolem contact angle (= 6° per palette na pal arc)

⚠️ Wikipedia Chetvorno SVG je **SCHEMATIC**, ne CAD-correct. Wikipedia pal V tipy jsou nadměrně dlouhé a zasahují do zubního pole. Pro nové animace vždy generovat pal podle Headrick (pomocný skript `reference/pal-contact.py`).

### Online reference
- **Volker Vyskocil — uhrentechnik.de**: http://uhrentechnik.vyskocil.de/index.php?id=54 — PROFI Flash animace s krásnými boot pallets, crutch piece, screw rivets. SWF lze dekompilovat (viz workflow níže) na vector paths a použít jako základ.
- Wikipedia Commons: https://commons.wikimedia.org/wiki/Category:Escapement_mechanisms
- Wolfram Demo Graham: https://demonstrations.wolfram.com/TheGrahamClockEscapement/
- Hessmer Deadbeat Builder: https://hessmer.org/gears/DeadbeatEscapementBuilder.html
- Style guide hodinarium-eu: `docs/kroky-illustration-style.md`

### SWF dekompilační workflow (pro Vyskocil + jiné Flash animace)

Mnoho starých horologických webů má Flash animace s profesionální vector geometrií. Dekompilace přes JPEXS Free Flash Decompiler 26.2.1:

```bash
# 1. Stáhnout SWF
curl -sL "http://uhrentechnik.vyskocil.de/fileadmin/ani/Graham_0701.swf" -o /tmp/anim.swf

# 2. Inspect via swftools (volitelné, pro orientaci)
brew install swftools swfmill
swfdump /tmp/anim.swf | head -30
swfmill swf2xml /tmp/anim.swf /tmp/anim.xml  # full XML

# 3. Export shapes jako SVG přes JPEXS
curl -sL "https://github.com/jindrapetrik/jpexs-decompiler/releases/download/version26.2.1/ffdec_26.2.1.zip" -o /tmp/ffdec.zip
unzip -q /tmp/ffdec.zip -d /tmp/ffdec
java -jar /tmp/ffdec/ffdec.jar -export shape,frame,sprite /tmp/export /tmp/anim.swf

# Output:
# /tmp/export/shapes/*.svg  — individual shape paths as SVG
# /tmp/export/frames/*.png  — rendered frames (for reference)
# /tmp/export/sprites/*/    — animation sprites
```

Per-shape SVG má local `<g transform="translate(X, Y)">` (Vyskocil's internal coordinate origin). Pro embed do našeho SVG:
1. Extract filled paths only (ignore stroke-only outline duplicates) — Python regex
2. Wrap v outer `<g transform="translate(my_x, my_y) scale(s)">` aby pivot/center sedělo
3. Pal pivot is typically at local (0, 0) → outer translate = desired position
4. Vyskocil uses scale 1.199 v PlaceObject2 — apply same pro original proportions

Skill obsahuje pomocný skript pro batch konverzi: `reference/swf-to-svg.sh` (TODO).

### Atribuce
Pokud SVG paths pocházejí z dekompilované 3rd party animace:
- `author=` plné jméno autora (např. "Volker Vyskocil")
- `authorUrl=` URL na původní stránku
- `license=` např. "© s laskavým svolením" nebo specifická CC licence
- `note=` detail o překreslení: "Předloha: ... Flash animation. SWF dekompilován přes JPEXS. Animace SMIL doplněna vlastní."

### Komplet seznam plánovaných kroků
Viz `apps/hodinarium-eu/src/data/kroky.ts` — 25 kroků. Pilot udělán pro **Graham**. Další priorita per TODO.md SL4 task.
