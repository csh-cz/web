---
title: doba kyvu
slug: doba-kyvu
kategorie: mechanika
varianty:
  - term: doba kyvu
    status: preferred
    note: 'Moderní cs odborný termín pro **periodu jednoho kyvu** oscilátoru ([kyvadla](/slovnik/kyvadlo) nebo [setrvačky](/slovnik/setrvacka)) — čas mezi dvěma průchody nulovou polohou stejným směrem. Martínek-Řehoř 1964 systematicky používá; Hajn 1953 odvozuje matematicky.'
    doloženo: 'MR 1964; Hajn 1953'
  - term: perioda
    status: admitted
    note: 'Mezinárodní fyzikální termín — synonymum k „doba kyvu" v širším smyslu.'
  - term: čas kyvu
    status: admitted
    note: 'Hovorové synonymum.'
  - term: T (perioda)
    status: admitted
    note: 'V matematických rovnicích označení T (z lat. tempus).'
prekladyDe:
  - term: Schwingungsdauer
    genus: f
    zdroj: 'DE standardní (Berner FHS).'
  - term: Periodendauer
    genus: f
    zdroj: 'DE moderní.'
prekladyEn:
  - term: period
    zdroj: 'Mezinárodní fyzikální termín (Berner FHS).'
  - term: time of oscillation
    zdroj: 'EN popisný.'
prekladyFr:
  - term: période
    genus: f
    zdroj: 'Mezinárodní fyzikální termín.'
  - term: durée d''oscillation
    genus: f
    zdroj: 'FR popisný.'
definice: 'Perioda jednoho úplného kmitu (kyvu) oscilátoru — čas mezi dvěma průchody nulovou polohou **stejným směrem**, případně mezi dvěma stejnými fázemi pohybu. **Klíčový parametr** oscilátoru. Pro **kyvadlo** se počítá podle rovnice T = 2π·√(L/g) (kde L je [aktivní délka kyvadla](/slovnik/kyvadlo), g tíhové zrychlení). Pro **setrvačku** T = 2π·√(J/D) (kde J je moment setrvačnosti, D direkční moment vlásku). Typické hodnoty: vteřinové kyvadlo má T = 2 s (1 s tam, 1 s zpět); hodinková setrvačka 21 600 bph má T ≈ 0,333 s. **Doba kyvu se prodlužuje s rostoucí [amplitudou](/slovnik/amplituda)** ([cirkulární chyba](/slovnik/cirkularni-chyba)). Pojem **„půldoba kyvu"** (T/2) označuje čas jedné polovinou pohybu — od úvrati do úvrati.'
pribuzne:
  - kyvadlo
  - setrvacka
  - amplituda
  - cirkularni-chyba
  - isochronismus
references:
  - bibKey: martinekRehor1964dobakyvu
    title: 'Martínek B., Řehoř J., *Základy hodinářství*. SNTL, Praha 1964, s. 18.'
    citace: '„Doba kyvu se prodlužuje (hodiny se zpožďují), a to tím více, čím více se zvětšuje amplituda."'
    note: 'MR explicitně mluví o „době kyvu" jako standardním termínu. Souvislost s cirkulární chybou.'
    key: mr-1964
    zoteroKey: LXZWE6KE
  - bibKey: hajn1953dobakyvu
    title: 'Hajn M., *Základy jemné mechaniky a hodinářství*. 1953.'
    citace: '„Pohybová rovnice dostane nový člen, vyjadřující útlum a zní pak J·d²ϕ/dt² + D·ϕ + c·dϕ/dt = 0 (rovnice 43). Řešení této rovnice vede k těmto výsledkům: Předně pohyb zůstává harmonickým, ale amplituda klesá podle exponenciální křivky ϕ = ϕ₀·e^(-ct/2J). Za druhé útlum prodlouží dobu kyvu na T_t = T·√(1 + c²/4·D·J) (rovnice 45)."'
    note: 'Hajn odvozuje dobu kyvu z pohybové rovnice oscilátoru — vliv útlumu (viskózní + prosté tření), vliv amplitudy (cirkulární chyba).'
    key: hajn-1953
    zoteroKey: 9MK4QIHS
  - bibKey: bures1965cinnaDelka
    title: 'Bureš J., *Hodinové stroje I*. SPN, Praha 1965, s. 52.'
    citace: '„Činnou délku fyzického kyvadla tvoří vzdálenost od bodu otáčení (tj. závěsu) do středního bodu kyvu. Střední bod kyvu se nachází u kyvadla fyzického uprostřed mezi středem (těžištěm) čočky a těžištěm kyvadla."'
    note: 'Bureš definuje „činnou délku kyvadla" L pro výpočet doby kyvu T = 2π√(L/g).'
    key: bures-1965
---

## Výklad

**Doba kyvu** je **perioda jednoho úplného kmitu (kyvu)** oscilátoru — čas mezi dvěma průchody nulovou polohou **stejným směrem**, případně mezi dvěma stejnými fázemi pohybu. **Klíčový parametr** každého hodinového oscilátoru.

### Matematický popis

**Pro kyvadlo** (Galilei + Huygens):

> **T = 2π · √(L/g)**

kde:
- **T** = doba kyvu (s)
- **L** = [aktivní délka kyvadla](/slovnik/kyvadlo) (m) — Bureš 1965 s. 52
- **g** = tíhové zrychlení (9,80665 m/s² na rovníku, 9,832 m/s² na pólu)

**Pro setrvačku** s vláskem (Bureš 1974):

> **T = 2π · √(J/D)**

kde:
- **J** = moment setrvačnosti setrvačky (kg·m²)
- **D** = direkční moment vlásku (N·m/rad)

### Typické hodnoty doby kyvu

| Stroj | Doba kyvu T | Frekvence f = 1/T |
|---|---|---|
| **Vteřinové kyvadlo** (Riefler, Big Ben) | **2,000 s** | 0,5 Hz |
| **Půlsekundové kyvadlo** | **1,000 s** | 1 Hz |
| **Čtvrťsekundové kyvadlo** | **0,500 s** | 2 Hz |
| **Setrvačka 18 000 bph** | 0,400 s | 2,5 Hz |
| **Setrvačka 21 600 bph** (běžné) | 0,333 s | 3 Hz |
| **Setrvačka 28 800 bph** (Hi-Beat) | 0,250 s | 4 Hz |
| **Setrvačka 36 000 bph** (Zenith El Primero) | 0,200 s | 5 Hz |

**bph** = beats per hour = počet polovičních kyvů za hodinu (každý kyv = tik + tak = 2 polovičky)

### Vteřinové kyvadlo — klasika přesných hodin

**Vteřinové kyvadlo** (T = 2 s) je standardní pro **velké přesné stojací hodiny** (regulator) a **velké věžní hodiny**:

- **Aktivní délka L ≈ 994 mm** (pro g = 9,81 m/s²)
- Jeden půldobový kyv = **1 sekunda** (přímo ukazuje sekundu)
- Big Ben (Westminster Great Clock 1859): T = 2 s, čočka 14 kg
- Riefler observatorní (1890): T = 2 s, kompenzační invarové kyvadlo
- Klementinum (Praha 1900): T = 2 s

### Cirkulární chyba

**Skutečná doba kyvu** se prodlužuje s rostoucí amplitudou (cirkulární chyba). Hajn 1953 (rovnice 71):

> **T(ϕ) = T₀ · (1 + ϕ²/52520)**

kde ϕ je amplituda ve stupních, T₀ ideální doba kyvu (matematické řešení pro infinitesimální amplitudu). Příklady:

| Amplituda ϕ | Prodloužení doby kyvu | Denní zpoždění |
|---|---|---|
| 1° | 0,0019 % | 1,65 s/d |
| 5° | 0,048 % | 41 s/d |
| 10° | 0,19 % | 165 s/d |
| 20° | 0,76 % | 660 s/d |

Detail viz heslo [cirkulární chyba](/slovnik/cirkularni-chyba).

### Vliv útlumu

Hajn 1953 (rovnice 45): tlumený oscilátor má **delší dobu kyvu** než ideální:

> **T_tlumený = T_ideální · √(1 + c²/(4·D·J))**

kde c je koeficient viskózního tření. V praxi je vliv nepatrný (řádu 10⁻⁶), ale **kolísání útlumu** (změny teploty, tlaku, vlhkosti) způsobuje **nestabilitu doby kyvu** — což je hlavní zdroj chyb u kvalitních hodin.

### Vliv teploty

Doba kyvu závisí na **délce L kyvadla**, která se mění s teplotou (teplotní roztažnost oceli, mosazi). Kompenzační kyvadla ([Invar](/slovnik/invar), rošťové) tuto závislost minimalizují.

### Vliv zeměpisné polohy

**Tíhové zrychlení g** se mění s **zeměpisnou šířkou** (na pólu o 0,5 % větší než na rovníku) a **nadmořskou výškou** (na 1000 m o 0,03 % menší). Proto:

- **Přesné astronomické hodiny** se musí **kalibrovat in situ** pro konkrétní lokaci
- **Lodní chronometry** se kompenzují pomocí korekčních tabulek pro různé zeměpisné šířky
- Pražský orloj kalibrován pro **Klementinum** (50°5' s. š., g ≈ 9,8105 m/s²)

## Příbuzné termíny

[kyvadlo](/slovnik/kyvadlo) · [setrvačka](/slovnik/setrvacka) · [amplituda](/slovnik/amplituda) · [cirkulární chyba](/slovnik/cirkularni-chyba) · [isochronismus](/slovnik/isochronismus)
