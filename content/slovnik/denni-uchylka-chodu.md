---
title: denní úchylka chodu
slug: denni-uchylka-chodu
kategorie: mechanika
varianty:
  - term: denní úchylka chodu
    status: preferred
    note: 'Moderní cs odborný termín pro **denní zpoždění nebo předbíhání hodin** v sekundách za den (s/d). Klíčový parametr přesnosti hodinového stroje. Martínek-Řehoř 1964 systematicky používá (tab. 1, s. 19); Hajn 1953 odvozuje matematické vzorce.'
    doloženo: 'MR 1964 s. 19; Hajn 1953 (R = 1,65·ϕ² s/d); Boukal 1958'
  - term: chod hodin
    status: admitted
    note: 'Synonymum (Hajn 1953: „V hodinářství je zvykem chod hodin udávat počtem sekund, oč se hodiny denně zpožďují nebo předbíhají"). Méně specifický termín — „chod" znamená i obecně provoz, „denní úchylka chodu" je konkrétní měření.'
  - term: denní zpoždění / předbíhání
    status: admitted
    note: 'Hajn 1953 specificky používá pro pozitivní a negativní hodnoty (zpoždění = pozitivní R, předbíhání = negativní R).'
prekladyDe:
  - term: Gangabweichung
    genus: f
    zdroj: 'Mezinárodní hodinářský termín (Berner FHS).'
  - term: tägliche Gangabweichung
    genus: f
    zdroj: 'DE plný — denní úchylka chodu.'
prekladyEn:
  - term: rate deviation
    zdroj: 'Berner FHS.'
  - term: daily rate
    zdroj: 'EN — denní chod (pozitivní nebo negativní hodnota).'
prekladyFr:
  - term: marche diurne
    genus: f
    zdroj: 'Berner FHS.'
  - term: écart de marche
    genus: m
    zdroj: 'FR — odchylka chodu.'
definice: 'Denní zpoždění nebo předbíhání hodin **v sekundách za den (s/d)** vzhledem ke skutečnému (referenčnímu) času. **Klíčový parametr přesnosti** hodinového stroje. Hajn 1953: *„V hodinářství je zvykem chod hodin udávat počtem sekund, oč se hodiny denně zpožďují nebo předbíhají."* Měření denní úchylky chodu je standardní součást **regulace** stroje a **chronometrové certifikace** (norma ISO 3159, COSC certifikace: -4 až +6 s/d). Typické hodnoty: přesný observatorní regulátor (Riefler) ±0,01 s/d, mechanický náramkový chronometr ±2 s/d, běžné mechanické hodinky ±20–30 s/d, věžní hodiny ±5–60 s/d podle kvality.'
pribuzne:
  - amplituda
  - cirkularni-chyba
  - regulace
  - chronometr
  - isochronismus
references:
  - bibKey: hajn1953dennichod
    title: 'Hajn M., *Základy jemné mechaniky a hodinářství*. 1953.'
    citace: '„V hodinářství je zvykem chod hodin udávat počtem sekund, oč se hodiny denně zpožďují nebo předbíhají. Zpoždění hodin, zaviněné útlumem bude R = 86400·(λ-1)·c/(4·D) = 4380·(λ-1)² (rovnice 47). Místo poměru λ můžeme zavést percentuální úbytek amplitudy (každým kyvem amplituda se zmenší o q procent) a pak R = 4380·(q/100)² = 0,438·q² (rovnice 48)."'
    note: 'Hajn odvozuje denní úchylku chodu z fyziky kmitání — souvislost s útlumem (viskózní tření, prosté tření), nestabilitou amplitudy, cirkulární chybou.'
    key: hajn-1953
    zoteroKey: 9MK4QIHS
  - bibKey: martinekRehor1964dennichod
    title: 'Martínek B., Řehoř J., *Základy hodinářství*. SNTL, Praha 1964, s. 19.'
    citace: 'Tab. 1: „Úchylky chodu způsobené proměnlivou velikostí vratné síly. Základní amplituda × úchylka chodu v s/dan vyvolaná nestálostí amplitudy v rozsahu ±0,5° / ±1° / ±2°."'
    note: 'Tabulka denní úchylky chodu v sekundách za den (s/d) pro různé amplitudy a jejich kolísání.'
    key: mr-1964
    zoteroKey: LXZWE6KE
  - bibKey: boukal1958regulace
    title: 'Boukal J., *Opravy hodinek*. SPN 1958.'
    note: 'Kap. *Regulace hodinek* — měření denní úchylky chodu, používání chronografu (timegrapher) pro detekci tempa.'
    key: boukal-1958
    zoteroKey: KQVUX5CB
---

## Výklad

**Denní úchylka chodu** je **denní zpoždění nebo předbíhání hodin v sekundách za den (s/d)** vzhledem ke skutečnému (referenčnímu) času. Hajn 1953 explicitně uvádí: *„V hodinářství je zvykem chod hodin udávat počtem sekund, oč se hodiny denně zpožďují nebo předbíhají."*

### Konvence znaménka

- **R = +5 s/d** → hodiny **zpožďují** o 5 sekund za den
- **R = -5 s/d** → hodiny **předbíhají** o 5 sekund za den (jdou rychleji)

V některé literatuře (anglické, švýcarské) se používá opačná konvence:
- **+5 s/d** = předbíhání (fast)
- **-5 s/d** = zpoždění (slow)

Při čtení odborné literatury proto **kontrolujte konvenci** podle kontextu.

### Typické hodnoty denní úchylky chodu

| Stroj | Typická úchylka | Použití |
|---|---|---|
| **Atomové hodiny** (cesiové) | ±10⁻¹⁰ s/d (= 1 s za 30 milionů let) | Vědecký standard |
| **Křemenné hodinky** (běžné) | ±0,5 s/d | Spotřební elektronika |
| **Riefler observatorní regulátor** | ±0,01 s/d | Hvězdárny 1890–1950 |
| **COSC mechanický chronometr** | -4 až +6 s/d | Luxusní hodinky (Rolex, Omega) |
| **ISO 3159** | ±10 s/d | Mechanický chronometr |
| **Běžné mechanické hodinky** | ±20–30 s/d | Spotřební mechanika |
| **Věžní hodiny — kvalitní (Mannhardt, Skála)** | ±5–10 s/d | Restaurované |
| **Věžní hodiny — typické historické** | ±30–60 s/d | Většina venkovských kostelů |
| **Lidové hodiny (Schwarzwald)** | ±60–300 s/d (až 5 min/d) | 19. století, levné |

### Hajnovy vzorce (1953)

Hajn matematicky odvozuje denní úchylku chodu jako součet několika příspěvků:

1. **Cirkulární chyba** (rovnice 72): R = 1,65·ϕ² s/d
2. **Kolísání amplitudy** (rovnice 73): ΔR = 0,033·q·ϕ² s/d
3. **Útlum** viskózním třením (rovnice 47): R = 4380·(λ-1)² s/d
4. **Útlum** prostým třením (rovnice 48): R = 0,438·q² s/d
5. **Teplotní změna délky** kyvadla — kompenzace [invarem](/slovnik/invar)
6. **Změny tlaku vzduchu** — vakuová pouzdra Rieflerů

### Měření

V praxi se denní úchylka chodu měří:

| Metoda | Doba měření | Přesnost |
|---|---|---|
| **Stopky proti referenčnímu signálu** | 24 hodin | ±0,5 s/d |
| **Chronograph (timegrapher)** — analýza akustického signálu kroku | 5–10 minut | ±0,1 s/d |
| **Kvarcový komparátor** | 1 hodina | ±0,01 s/d |
| **Optické porovnání s referenční hodinou** | 1–7 dní | ±0,001 s/d |

### Standardní chronometrové certifikace

| Certifikace | Norma | Hraniční hodnoty |
|---|---|---|
| **COSC** (Switzerland) | ISO 3159 | -4 až +6 s/d v 5 polohách, 3 teplotách |
| **METAS** (Master Chronometer, Omega) | ISO 3159 + magnetická odolnost | 0 až +5 s/d |
| **Patek Philippe Seal** | vlastní | -3 až +2 s/d |

### Regulace

Cílem **regulace hodin** je dosáhnout přijatelné denní úchylky chodu. Postup:

1. **Naměřit** úchylku za 24 hodin (proti referenci)
2. **Spočítat** odchylku v s/d
3. **Korigovat** posunem regulační matice (kyvadlo) nebo regulátorové páčky (hodinky)
4. **Opakovat** měření za 24 hodin
5. **Iterovat** dokud úchylka nesplní toleranci

## Příbuzné termíny

[amplituda](/slovnik/amplituda) · [cirkulární chyba](/slovnik/cirkularni-chyba) · [regulace](/slovnik/regulace) · [chronometr](/slovnik/chronometr) · [isochronismus](/slovnik/isochronismus)
