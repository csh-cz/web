---
title: cirkulární chyba
slug: cirkularni-chyba
kategorie: mechanika
varianty:
  - term: cirkulární chyba
    status: preferred
    note: 'Moderní cs odborný termín pro **systematickou odchylku doby kyvu kyvadla** od ideální matematické hodnoty způsobenou tím, že kyvadlo kýve po kruhové dráze (na rozdíl od idealizovaného Huygensova cykloidního zavěšení). Martínek-Řehoř 1964 (kap. 1) explicitně používá.'
    doloženo: 'Martínek-Řehoř 1964 s. 18, obr. 11, tab. 1'
prekladyDe:
  - term: Zirkularfehler
    genus: m
    zdroj: 'DE standardní (Berner FHS).'
  - term: Kreisfehler
    genus: m
    zdroj: 'DE alternativní — doslovný „kruhová chyba".'
prekladyEn:
  - term: circular error
    zdroj: 'Berner FHS; mezinárodní fyzikální termín.'
prekladyFr:
  - term: erreur circulaire
    genus: f
    zdroj: 'Berner FHS.'
definice: 'Systematická odchylka **doby kyvu kyvadla** od ideální matematické hodnoty (rovnice T = 2π√(L/g)) způsobená tím, že **kyvadlo kýve po kruhové dráze**, zatímco zemská přitažlivost působí stále ve svislém směru. Vratná síla proto **nevzrůstá úměrně s výchylkou**, jak by vyžadovala čistá rovnice harmonického oscilátoru. **Doba kyvu se prodlužuje s rostoucí [amplitudou](/slovnik/amplituda)** — Hajn 1953 odvozuje vzorec R = 1,65·ϕ² s/d (kde ϕ je amplituda ve stupních a R denní zpoždění). Cirkulární chybu lze pro **určitou základní amplitudu** odstranit regulací (změnou polohy čočky kyvadla), ale **nelze odstranit jako celek** — proto přesné hodiny pracují s **malou amplitudou** (±1°). Christiaan Huygens 1673 navrhl cykloidní zavěšení, které cirkulární chybu eliminuje, ale je technicky obtížné a v praxi se nepoužívá.'
pribuzne:
  - kyvadlo
  - amplituda
  - doba-kyvu
  - regulace
references:
  - bibKey: martinekRehor1964cirkular
    title: 'Martínek B., Řehoř J., *Základy hodinářství*. SNTL, Praha 1964, s. 18.'
    citace: '„Proměnlivá velikost vratné síly vzniká tím, že kyvadlo je nuceno kývat po kruhové dráze, zatímco zemská přitažlivost působí stále ve svislém směru. V důsledku toho nevzrůstá vratná síla úměrně s výchylkou kyvadla, jak předpokládají rovnice (1) a (2). Obě tyto rovnice platí proto jen přibližně. Ve skutečnosti se doba kyvu prodlužuje (hodiny se zpožďují), a to tím více, čím více se zvětšuje amplituda. Tuto tzv. cirkulární chybu můžeme pro určitou základní amplitudu kyvadla odstranit, a to změnou polohy čočky (pomocí regulační matice). Vlivem nestálosti základní amplitudy dochází však ke kolísání chodu hodin, které je tím větší, čím větší má kyvadlo základní amplitudu."'
    note: 'Klíčová cs definice cirkulární chyby + důsledky pro regulaci hodin.'
    key: mr-1964
    zoteroKey: LXZWE6KE
  - bibKey: hajn1953cirkular
    title: 'Hajn M., *Základy jemné mechaniky a hodinářství*. 1953.'
    citace: '„Doba kyvu kyvadla rovnice (55) je zvýšena o ϕ²/52520 své hodnoty, tedy kyvadlo kývající s amplitudou ϕ stupňů se denně zpožďuje o R = 1,65·ϕ² s/d (rovnice 72)."'
    note: 'Hajn odvozuje vzorec cirkulární chyby z přesnějšího Taylor row pro sin(ϕ/2) ≈ ϕ/2 − ϕ³/48 a numericky vyčísluje pro hodinářské hodnoty.'
    key: hajn-1953
    zoteroKey: 9MK4QIHS
---

## Výklad

**Cirkulární chyba** je **systematická odchylka doby kyvu kyvadla** od ideální matematické hodnoty (Galileiho rovnice T = 2π√(L/g)) způsobená tím, že:

- **Kyvadlo kýve po kruhové dráze** (na kovovém závěsu)
- **Zemská přitažlivost** působí ve svislém směru (ne kolmo k dráze)
- **Vratná síla** proto **nevzrůstá úměrně** s výchylkou kyvadla, jak by vyžadovala rovnice ideálního harmonického oscilátoru

Důsledek: **kyvadla s větší amplitudou se zpomalují** — Hajn 1953 odvozuje vzorec:

> **R = 1,65 · ϕ² s/d**

kde **ϕ** je amplituda ve stupních, **R** denní zpoždění v sekundách za den.

### Praktické důsledky

Tab. 1 (Martínek-Řehoř 1964, s. 19) — úchylka chodu způsobená nestálostí amplitudy:

| Základní amplituda | Úchylka při kolísání ±0,5° | ±1° | ±2° |
|---|---|---|---|
| ±0,5° | 0,01 s/d | 0,02 s/d | 0,04 s/d |
| ±1° | 0,03 | 0,07 | 0,16 |
| ±2° | 0,13 | 0,26 | 0,66 |
| ±5° | 0,82 | 1,6 | 4,1 |
| ±10° | 3,3 | 6,6 | 16,5 |
| ±20° | 13,2 | 26,4 | 66 |

**Důležitý insight**: čím **větší základní amplituda**, tím **více se zhoršuje chod hodin** při sebemenším kolísání amplitudy. Proto se **přesné hodiny stavějí s velmi malou amplitudou** (1°–1,5°), kde i 100% kolísání amplitudy způsobí jen drobné kolísání chodu.

### Praktické řešení

1. **Volba malé amplitudy** — přesné astronomické hodiny pracují s amplitudou ±1° (Riefler)
2. **Stabilizace amplitudy** — konstantní hnací síla ([remontoir](/slovnik/remontoir))
3. **Regulace pro určitou amplitudu** — změnou polohy čočky kyvadla (regulační matice) lze cirkulární chybu **kompenzovat pro jednu konkrétní amplitudu**

### Huygensovo cykloidní zavěšení (1673)

Christiaan Huygens v *Horologium Oscillatorium* (1673) **matematicky dokázal**, že kyvadlo s **cykloidním zavěšením** (závěs sledující cykloidní křivku) je **přesně izochronní** bez ohledu na amplitudu. Tj. cykloidní kyvadlo nemá cirkulární chybu vůbec.

**Technické problémy** cykloidního zavěšení:
- Velmi přesné mechanické provedení
- Cykloidní vodítka se opotřebovávají
- Vyrovnává cirkulární chybu, ale **přidává tření**, které je horší
- V praxi se ukázalo, že **malé amplitudy + obyčejné kovové zavěšení** je lepší řešení

Proto se cykloidní zavěšení **prakticky nepoužívá** — všechny moderní přesné hodiny pracují s malými amplitudami a kovovými závěsy.

### Bod rovnodobosti

Martínek-Řehoř 1964 zavádějí pojem **bodu rovnodobosti** (obr. 12) — amplituda, ve které jsou různé rušivé vlivy (cirkulární chyba, vliv kroku, vliv závěsné pružiny) vyváženy a denní úchylka chodu má **minimum**. Pro každý hodinový stroj existuje optimální amplituda.

## Příbuzné termíny

[kyvadlo](/slovnik/kyvadlo) · [amplituda](/slovnik/amplituda) · [doba kyvu](/slovnik/doba-kyvu) · [regulace](/slovnik/regulace) · [remontoir](/slovnik/remontoir) (stabilizace hnací síly → stabilizace amplitudy)
