# Styl ilustrací pro `/kroky/` — technické výkresy 19. století

Vizuální systém pro animace a schémata hodinářských kroků na webu
hodinarium-eu, v rubrice `/kroky/`. Cílem je **jednotný styl
inspirovaný francouzskými technickými akvarely 19. století**
(viz reference: Breguetův tourbillon, Janvier, Saunier, Britten,
Beillard atd.).

Aplikuje se na nové ilustrace i na **derivativní úpravy** převzaté
z Wikimedia Commons (po překreslení do tohoto stylu — viz „Atribuce"
níže).

## Barevná paleta

Inspirováno akvarelem na béžovém papíře, kde:

- **mosaz / zlato** (mosazná soukolí, hlavní kola, pouzdra) = pastelová
  okrová žluť
- **ocel / železo** (kotvy, hřídele, planžety, pružiny) = pastelová
  ocelová modř
- **rubíny / palety / ložiskové kameny** = rubínová červeň
- **safíry / pomocné kameny** = sytá tmavá cobalt blue
- **pozadí** = krémový starý papír
- **obrysy a popisky** = tmavá sépie

### Hex kódy + CSS proměnné

```css
:root {
  /* Pozadí + papír */
  --kroky-paper:        #F0E4C8;  /* světlý krémový papír */
  --kroky-paper-edge:   #E8DBB8;  /* tmavší okraj papíru */

  /* Mosaz / zlato (krokové kolo, soukolí, lůžka) */
  --kroky-brass:        #E6C97A;  /* světlá pastelová mosaz */
  --kroky-brass-shade:  #C9A961;  /* tmavší mosaz (stín, hloubka) */
  --kroky-brass-edge:   #8A6E35;  /* okraj / kresba mosazi */

  /* Ocel / železo (kotvy, hřídele, planžety, pružiny) */
  --kroky-steel:        #88A8C8;  /* světlá pastelová ocel */
  --kroky-steel-shade:  #6585A8;  /* tmavší ocel */
  --kroky-steel-edge:   #3D5878;  /* okraj / kresba oceli */

  /* Kameny (palety, ložiska) */
  --kroky-ruby:         #B85068;  /* rubín (palety, hlavní kameny) */
  --kroky-ruby-shade:   #8A3850;  /* tmavší rubín */
  --kroky-sapphire:     #3D5A8A;  /* safír (pomocné kameny, čepy) */

  /* Akcentní */
  --kroky-jewel-glow:   #F0C4D0;  /* odraz na rubínu (highlight) */

  /* Obrysy a popisky */
  --kroky-outline:      #3A2818;  /* tmavá sépie — obrysy */
  --kroky-outline-soft: #6B4A2E;  /* sépie pro šrafy / hatching */
  --kroky-label:        #3A2818;  /* popisky (text) */
  --kroky-leader:       #6B4A2E;  /* leader lines (popisové vodítka) */
}

/* Dark mode (volitelné, pokud bude aktivní) */
@media (prefers-color-scheme: dark) {
  :root {
    --kroky-paper:        #2D2418;  /* tmavý „spálený papír" */
    --kroky-paper-edge:   #3A2E20;
    --kroky-brass:        #C9A961;
    --kroky-brass-shade:  #A88845;
    --kroky-steel:        #6585A8;
    --kroky-steel-shade:  #4A6788;
    --kroky-ruby:         #C86878;
    --kroky-sapphire:     #5878B0;
    --kroky-outline:      #E8D8C0;
    --kroky-outline-soft: #B89878;
    --kroky-label:        #E8D8C0;
    --kroky-leader:       #B89878;
  }
}
```

V SVG buď **inline** barvy z palety výše, nebo `class` přes CSS
proměnné (lepší pro theming):

```svg
<circle class="krok-kolo" cx="100" cy="100" r="40"/>

<style>
  .krok-kolo { fill: var(--kroky-brass); stroke: var(--kroky-outline); stroke-width: 1; }
  .krok-kotva { fill: var(--kroky-steel); stroke: var(--kroky-outline); }
  .krok-paleta { fill: var(--kroky-ruby); stroke: var(--kroky-ruby-shade); }
  .krok-popisek { font: italic 12px Georgia, serif; fill: var(--kroky-label); }
</style>
```

## Typografie popisků

Jednoduché technické sans-serif písmo (ne rukopisná kurzíva — pro
moderní web čitelnější + nebudí kýčovitý dojem):

- **Font**: `font-family: 'Inter', 'Helvetica Neue', 'Arial', sans-serif; font-style: normal; font-weight: 400;`
- **Velikost**: 11–13px v běžné kompozici, 9–10px pro vedlejší popisky
- **Barva**: `var(--kroky-label)` (tmavá sépie — drží jednotu s
  obrysovou paletou, ne studeně černá)
- **Označení**: A, B, C / I, II, III pro hlavní díly; sans-serif
  capitals
- **Příklad popisku**: *„A — Krokové kolo (mosaz)"* → česky, pomlčka
  s mezerami, velkým písmenem na začátku
- **Číselné rozměry** (pokud potřeba): `font-variant-numeric: tabular-nums;`
  (proporcionální cifry pro zarovnání)

```css
.krok-popisek {
  font: 12px/1.3 'Inter', 'Helvetica Neue', 'Arial', sans-serif;
  font-weight: 400;
  fill: var(--kroky-label);
}

.krok-popisek-mensi {
  font-size: 10px;
}

.krok-popisek-cislo {
  font-variant-numeric: tabular-nums;
}
```

> **Pozn.:** Sans-serif drží **technický charakter** a moderní
> čitelnost. Sépia barva místo studené černé zachovává návaznost na
> akvarelovou paletu z 19. století, takže celek nepůsobí jako
> sterilní CAD výkres, ale ani jako kýčovitá imitace ručního písma.

## Leader lines (popisové vodítka)

Šrafovaná čára od popisku k odkazované součásti:

```svg
<line x1="..." y1="..." x2="..." y2="..."
      class="krok-leader" />

<style>
  .krok-leader {
    stroke: var(--kroky-leader);
    stroke-width: 0.5;
    stroke-dasharray: 2 1;  /* jemné šrafování */
    fill: none;
  }
</style>
```

## Tloušťky čar

| Účel | Tloušťka |
|---|---|
| Hlavní obrysy součástí | 1.0 px |
| Vnitřní detail (zuby kola, výřez) | 0.6 px |
| Šrafy / hatching pro stínování | 0.3 px |
| Leader lines (popisová vodítka) | 0.5 px |
| Středové osy, pomocné | 0.3 px (dasharray) |

## Stínování (hatching)

Pro hloubkový efekt používat jemné **paralelní šrafy** podle stylu
19. století (ne plné výplně se stínem):

```svg
<defs>
  <pattern id="hatch-steel" patternUnits="userSpaceOnUse" width="3" height="3">
    <line x1="0" y1="0" x2="0" y2="3" stroke="var(--kroky-steel-edge)" stroke-width="0.3"/>
  </pattern>
</defs>

<rect ... fill="url(#hatch-steel)" />
```

## Animace (SMIL nebo CSS)

Pro pohybové komponenty (kotva, krokové kolo, kyvadlo):

```svg
<!-- Kyvadlo (oscilace ±5°) -->
<g class="krok-kyvadlo">
  <animateTransform attributeName="transform" type="rotate"
                    values="-5 50 0; 5 50 0; -5 50 0"
                    dur="2s" repeatCount="indefinite"
                    calcMode="spline" keySplines="0.4 0 0.6 1; 0.4 0 0.6 1"/>
  <line x1="50" y1="0" x2="50" y2="150" class="krok-kotva"/>
  <circle cx="50" cy="150" r="15" class="krok-brass"/>
</g>

<!-- Krokové kolo (skoky o 1 zub při každé hraně kyvadla) -->
<g class="krok-kolo">
  <animateTransform attributeName="transform" type="rotate"
                    values="0 100 100; 0 100 100; 12 100 100; 12 100 100; 24 100 100"
                    dur="2s" repeatCount="indefinite"
                    keyTimes="0; 0.4; 0.5; 0.9; 1"
                    calcMode="discrete"/>
  <!-- zuby kola -->
</g>
```

**Princip:** kyvadlo má **plynulou sinusoidu** (`calcMode="spline"`),
krokové kolo **skáče** o jeden zub (`calcMode="discrete"` v keyTimes
shodné s extremy kyvadla).

## Kompozice

- **Hlavní pohled**: frontální průmět mechanizmu, středově na canvasu
- **Vedlejší pohled** (volitelně): boční řez vpravo nebo dole, menší
- **Popisky**: po obvodu kompozice (vlevo/vpravo/dole), nikoli přes
  mechanizmus
- **Poměr stran**: 4:3 nebo 16:9 podle zaměření
- **viewBox**: `0 0 400 300` (nebo násobky) — umožňuje libovolné měřítko
- **Šířka v renderu**: typicky `max-width: 600px`, na mobilu `100%`

## Atribuce derivative works

Pokud ilustrace je **odvozená z Wikimedia Commons** (CC BY / CC BY-SA),
v `::photo` directive uvádět:

```mdx
::photo{
  src="/img/kroky/grahamuv-krok-animace.svg"
  alt="Animace Grahamova kroku — krokové kolo …"
  author="Upraveno dle: Chetvorno (Wikimedia Commons)"
  authorUrl="https://commons.wikimedia.org/wiki/File:Anchor_escapement_animation_217x328px.gif"
  license="CC0"
  note="Překresleno do stylu 19. století (paleta okrová mosaz / ocelová modř / rubín)"
}
```

Pro **CC BY-SA** materiál (Verge, Cylinder, Paletteanker) MUSÍ být
derivative výstup taky **CC BY-SA 4.0** (share-alike copyleft) +
licence per-foto override (Photo komponenta umí).

Pro **vlastní original** (žádná Wikipedia předloha) jen:

```mdx
::photo{
  src="/img/kroky/mannhardtuv-krok-animace.svg"
  alt="..."
  author="Český spolek horologický"
}
```

(license default CC BY 4.0 dle site)

## Reference (visual)

- **Breguetův tourbillon** (Swiss Watches Magazine):
  https://swisswatches-magazine.com/uploads/2025/12/the-breguet-tourbillon-invention.webp
- **Saunier — Traité d'Horlogerie moderne** (1875, Paris) — kresby
- **Britten — Watch and Clockmaker's Handbook** (1899, London) — drawings
- **Janvier — Traité d'Horlogerie moderne** (1820) — early reference

## Postup pro novou ilustraci

1. **Najít předlohu** — Wikipedia Commons (priorita SVG), pak Špatný
   1882 / Bureš 1965 (Zotero `G8KJDSAC`), pak vlastní kresba
2. **Ověřit licenci** předlohy (PD / CC0 / CC BY / CC BY-SA / fair use)
3. **Překreslit do tohoto stylu**:
   - Použít CSS proměnné z palety
   - Italic serifové popisky cs („krokové kolo", „kotva", „paleta")
   - Leader lines pro popisové vodítka
   - Animace SMIL nebo CSS pro pohybové komponenty
4. **Atribuovat** v `::photo` directive (autor + licence + note o úpravě)
5. **Uložit** do `apps/hodinarium-eu/public/img/kroky/<slug>-animace.svg`
6. **Aktualizovat** `apps/hodinarium-eu/src/data/image-sizes.json`
   (přidat entry s rozměry)

## Pomocné šablony

V `apps/hodinarium-eu/public/img/kroky/_templates/` budou (až vznikne
pilot) k dispozici:

- `_template-static.svg` — kostra pro statické schéma
- `_template-animated.svg` — kostra s animovaným kyvadlem + krokovým kolem
- `_template-styles.css` — CSS proměnné připravené k include
