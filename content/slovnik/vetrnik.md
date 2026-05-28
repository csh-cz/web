---
title: větrník
slug: vetrnik
conceptId: HORO-FLY-001
kategorie: bici
varianty:
  - term: větrník
    status: preferred
    note: 'Primární cs odborný termín (Sladkovský 1947, Bureš 1965, Martínek–Řehoř 1964, Skála 2013+). Pozor: ne „větřík" (= vánek). Větrník je **vzduchová brzda** s lopatkami.'
    doloženo: 'Sladkovský 1947; Bureš 1965; Martínek–Řehoř 1964'
  - term: větrober
    status: archaic
    note: 'Špatný 1882 doložil paralelně s „větrníkem" jako synonymum (Windfang → větrník, větrober; Windfangsflügel → křídlo větroberu). Dnes ustoupil.'
    doloženo: 'Špatný 1882'
prekladyDe:
  - term: Windfang
    genus: m
    zdroj: 'Berner; Špatný 1882 (Windfang → větrník, větrober)'
  - term: Windflügel
    genus: m
    zdroj: 'Špatný 1882 (Windfangsflügel → křídlo větroberu)'
prekladyEn:
  - term: fly
    zdroj: 'Berner — standardní termín'
  - term: fan-fly
  - term: fly governor
prekladyFr:
  - term: volant
    genus: m
    zdroj: 'Berner — standardní FR termín'
  - term: volant régulateur
    genus: m
definice: 'Lopatkovité kolo (obvykle dvoukřídlé) na konci [soukolí](/slovnik/soukoli) [bicího stroje](/slovnik/bici-stroj), [zvonicího stroje](/slovnik/zvonici-stroj) nebo [apoštolského stroje](/slovnik/apostolsky-stroj), jehož **aerodynamický odpor** brzdí rychlost otáčení a tím **reguluje rychlost úderů kladívka**. **Není měřicí součást** — neudává čas, ale moderuje rychlost.'
pribuzne:
  - bici-stroj
  - zvonici-stroj
  - apostolsky-stroj
  - nabezne-kolo
  - kladivko
  - kotva
  - pastorek-vetrniku
---

## Výklad

Větrník není měřicí součást — neudává čas, ale **moderuje rychlost** bicího soukolí. Bez větrníku by bicí stroj odbil 12 úderů během několika sekund; větrník zpomalí úhlovou rychlost na praktických ~1 úder/sekunda. Martínek–Řehoř 1964: *„Regulátor rychlosti udržuje rychlost odbíjení. Obvykle jej tvoří větrník."*

### Konstrukce

Sladkovský 1947 popisuje větrník jako kombinaci **pastorku + lopatek**:

> *„Z větrniku, který řídí rychlost úderů kladívka. Pozůstává obyčejně z **pastorku o 6 tyčinkách a ze dvou lehkých křídel**."*

Bureš 1965 podrobněji:

> *„Větrník, který řídí rychlost úderů kladívka při odbíjení hodin. Je **pastorkem, který je opatřen ztuha otáčivým křídlem**."*

Typické provedení: **2 plochá kovová křídla (lopatky)** připevněná na hřídeli s **6–8zubým pastorkem**. Lopatky obvykle **dvoukřídlé**, ale konstrukce s 3–4 křídly se vyskytuje u zvonkoher.

### Fyzikální princip

Lopatky větrníku tříští vzduch — vzniká **aerodynamický odpor** úměrný:

$$F_{\text{odpor}} \propto \rho \cdot v^2 \cdot A$$

kde *ρ* = hustota vzduchu, *v* = obvodová rychlost lopatky, *A* = plocha lopatky. Vzhledem k *v ∝ ω·r*, je odpor **úměrný kvadrátu úhlové rychlosti**, takže větrník přirozeně **stabilizuje rychlost otáčení** — čím rychleji se točí, tím víc brzdí.

Martínek–Řehoř 1964: *„Otáčky větrníku závisí na jeho rozměrech (zejména na **vnějším průměru**) a na hnací síle."*

### Převodové poměry (Martínek-Řehoř 1964)

Větrník je **posledním kolem** bicího soukolí — má největší rychlost otáčení. Martínek-Řehoř 1964 (s. 93) zavádí vzorec pro celkový převod:

**Mezi hnacím kolem a pastorkem zdvižného kola** (vzorec 11):
$$\text{převod} = \frac{T_0 \cdot n_a}{k}$$
kde *T₀* = doba chodu ve dnech, *n_a* = celkový počet úderů za chod, *k* = počet zdvižných kolíků.

**Mezi zdvižným kolem a podávacím pastorkem** (vzorec 12):
$$\text{převod} = \frac{k}{p}$$
kde *p* = počet podávacích kolíků (obvykle 1).

**Mezi podávacím kolem a pastorkem větrníku**: **60 až 100** (podle konstrukce). Rozkládá se na dva dílčí převody:
- **podávací kolo → náběžný pastorek** — musí být celé číslo (kvůli přesné poloze náběžného kolíku)
- **náběžné kolo → pastorek větrníku** — libovolné

### Typové soustavy zubů (Bureš 1965)

Bureš 1965 (s. 240) uvádí konkrétní typovou soustavu pro **bicí stroj odbíjející 12 hodin**:

| Kolo | Počet zubů |
|---|---|
| hnací kolo | 84 |
| přísadní kolo | 72 |
| pastorek přísadního | 12 |
| zdvižné kolo | 70 |
| pastorek zdvižného | 8 |
| podávací kolo | 63 |
| pastorek podávacího | 7 |
| náběžné kolo | 56 |
| **pastorek větrníku** | **7** |

### Brzdění

Vedle aerodynamického odporu se používá také **třecí brzda** — pero přitlačené na hřídel větrníku. Sušický 1900: *„Brzdění provádí se pérem."*

Sušický popisuje neúspěšný pokus o **odstředivý větrník** (analogie Wattova regulátoru parního stroje):

> *„Byl učiněn pokus opatřiti větrník pohyblivými pákami, které by se za silněji působící síly hnací od osy vzdalovaly, čímž by se docílilo umenšení rychlosti pohybu. Tímto zařízením se měl účinek řidiče zvětšiti; **avšak nelze to patřičně provésti**."*

V hodinařině se tedy odstředivý regulátor neujal.

### Použití v remontoiru (Bureš 1974)

Bureš 1974 popisuje **specifické využití větrníku v remontoirním ústrojí** — kde větrník nevolá rychlost odbíjení, ale **brzdí periodické dotahování pružiny** krokového kola:

> *„Krokové kolo, poháněné pružinou, se otáčí s válečkem Z, až **zub větrníku 9 proklouzne zářezem válečku**. Větrník se otočí o **půl otáčky** a kolo 7 v záběru s pastorkem 4 zvětší napětí pružiny. Při každé otáčce je tedy větrník dvakrát vypuštěn a pružina dvakrát dotažena."*

Tj. v remontoiru má větrník stejný **aerodynamický princip**, ale jiný cíl — **plynulé dotahování konstantní síly** pro krokové kolo, bez ohledu na proměnnou hnací sílu vstupního závaží.

### Špatné varianty (Špatný 1882)

Špatný 1882 dokumentuje:
- **Windfangsanker** (u kapesních repetičních hodinek) = vrtítko
- **Windfangsfeder** = zpruha větrníku
- **Windfangsflügel** = křídlo větrníku (= křídlo větroberu v staročes.)

**Pozor:** větrník v hodinářství **není totéž** co aerodynamický větrník hracích strojů (např. flašinetů, hudebních automatů, kde slouží zase jen k regulaci tempa).

## Příbuzné termíny

[bicí stroj](/slovnik/bici-stroj) · [zvonicí stroj](/slovnik/zvonici-stroj) · [apoštolský stroj](/slovnik/apostolsky-stroj) · [náběžné kolo](/slovnik/nabezne-kolo) · [zdvižné kolo](/slovnik/zdvizne-kolo) · [kladívko](/slovnik/kladivko) · [remontoir](/slovnik/remontoir)

## Reference

> „Windfang m. větrník, větrober. Windfangsanker m. (bei Taschenrepetiruhren) vrtítko. Windfangsfeder f. zpruha větrníku. Windfangsflügel m. křídlo větroberu."
> — ŠPATNÝ, František. *Deutsch-böhmisches Wörterbuch.* 1882, heslo Wind–.

> „Z **větrniku, který řídí rychlost úderů kladívka**. Pozůstává obyčejně z pastorku o 6 tyčinkách a ze dvou lehkých křídel."
> — SLADKOVSKÝ, Josef. *Učebnice odborné nauky hodinářské.* 1947.

> „Brzdění provádí se pérem. Byl učiněn pokus opatřiti větrník pohyblivými pákami, které by se za silněji působící síly hnací od osy vzdalovaly, čímž by se docílilo umenšení rychlosti pohybu."
> — SUŠICKÝ, V. R. *Hodinářství.* 1900.

> „**Regulátor rychlosti udržuje rychlost odbíjení. Obvykle jej tvoří větrník.** Otáčky větrníku závisí na jeho rozměrech (zejména na vnějším průměru) a na hnací síle."
> — MARTÍNEK, Bohumil – ŘEHOŘ, Jaroslav. *Základy hodinářství.* SNTL, Praha 1964, s. 93–94.

> „**Větrník, který řídí rychlost úderů kladívka** při odbíjení hodin. Je pastorkem, který je opatřen ztuha otáčivým křídlem."
> — BUREŠ, Josef. *Hodinové stroje I.* SPN, Praha 1965, s. 234.

> „Krokové kolo, poháněné pružinou, se otáčí s válečkem, až zub větrníku proklouzne zářezem válečku. **Větrník se otočí o půl otáčky** a kolo v záběru s pastorkem zvětší napětí pružiny. Při každé otáčce je tedy větrník dvakrát vypuštěn a pružina dvakrát dotažena."
> — BUREŠ, Josef. *Hodinové stroje III.* SPN, Praha 1974, s. 127 (popis mechanického natahovacího ústrojí — remontoir).

## Obrázky

*(zatím chybí — návrh: foto větrníku věžních hodin z Hodinária, schéma z Sladkovského 1947)*
