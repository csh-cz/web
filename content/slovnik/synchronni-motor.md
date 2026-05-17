---
title: synchronní motor
slug: synchronni-motor
kategorie: jine
varianty:
  - synchronní motor
  - elektrický synchronní motor
  - AC synchronous motor (en)
  - Warren-Telechron motor (en)
prekladyDe:
  - term: Synchronmotor
    genus: m
  - term: Wechselstromsynchronmotor
    genus: m
prekladyEn:
  - term: synchronous motor
  - term: AC synchronous motor
prekladyFr:
  - term: moteur synchrone
    genus: m
definice: "**Elektromotor jehož otáčky jsou pevně vázány na frekvenci napájecí sítě** (50 Hz v EU, 60 Hz v Severní Americe). V hodinařině se používá jako pohon **síťových elektrických hodin** od 20. let 20. století — typicky **Warren-Telechron** princip (1918, Henry Warren, USA). Přesnost takových hodin je dána přesností frekvence sítě (provozovatel sítě garantuje dlouhodobě průměrnou 50,000 Hz s denní integrací nuly chyby), což je v Evropě udržováno na úrovni **±10 sekund/měsíc** pro běžné účely."
pribuzne:
  - elektricke-hodiny
  - jednotny-cas
  - kyvadlo
isStub: true
references:
  - title: "Wikipedia — Synchronous motor"
    url: "https://en.wikipedia.org/wiki/Synchronous_motor"
    type: wiki
    note: "Obecný technický popis."
  - title: "Wikipedia — Telechron"
    url: "https://en.wikipedia.org/wiki/Telechron"
    type: wiki
    note: "Henry Warren a Warren Clock Co (1912) → Telechron (1926) — počátky komerčních síťových hodin v USA."
---

## Stručně

**Synchronní motor** pracuje na principu rotujícího magnetického pole vytvořeného střídavým proudem; rotor je magnetizovaný (permanentní magnet, nebo elektromagnet s budicím proudem) a **sleduje frekvenci pole pevně** — bez prokluzu (na rozdíl od **asynchronního / indukčního motoru**, kde rotor vždy mírně zaostává).

**Hlavní vlastnost pro hodinářství**: pokud známe frekvenci sítě (typicky 50 Hz v EU, 60 Hz v USA) a počet pólů motoru, **přesně známe otáčky** — a tedy přesný čas, pokud nakroutíme správně velké převody.

## Aplikace v hodinařině

### Warren-Telechron (1918)

V roce 1918 vyvinul **Henry E. Warren** v USA první komerčně úspěšný **synchronous motor clock**. Vyžadoval ovšem **dostatečně přesnou frekvenci sítě** — což v té době nebyl standard. Warren se proto v roce 1920 spojil s **General Electric** a přesvědčil je, aby provoz sítě ostře sledoval frekvenci. Od **1920** GE udržuje na své americké elektrické síti **dlouhodobě průměrnou frekvenci 60 Hz s nulovou denní chybou** — výhradně kvůli Warrenovým hodinám.

Tato dohoda položila základ pro **éru síťových (elektrických) hodin**, která dominovala 30.–70. letům 20. století (Telechron, GE, Westclox v USA; Junghans, Kienzle v Německu; v Československu mj. **Pragotron**).

### Princip přesnosti

Provozovatel evropské synchronní sítě (ENTSO-E) garantuje:

- **Krátkodobou stabilitu**: ±0,2 Hz okamžitě (max. ±200 ms za den)
- **Dlouhodobou integraci**: kumulovaná chyba synchronního času sítě **nepřesáhne ±20 sekund** za týden
- **Reset**: dispatcher provádí kompenzaci frekvenčním biásem (±0,01 Hz) tak, aby kumulovaná chyba „synchronního času" sítě byla průměrně nulová

To znamená, že **každé hodiny napájené přímo ze sítě s synchronním motorem mají měsíční chybu řádově ±10–20 sekund** — což pro běžnou domácí ani institucionální aplikaci stačí. Pro vyšší přesnost (telekomunikace, observatoře) se vyvinuly **krystaly** (od 30. let) a [atomové hodiny](https://en.wikipedia.org/wiki/Atomic_clock) (od 50. let).

## V Čechách

Hlavní výrobce: **[Pragotron](/hodinari/pragotron)** (Prahatron) — síťové hodiny 50.–80. let pro institucionální, kancelářské a domácí použití.

V síti **jednotného času** (sekundární hodiny řízené centrálním master clock) se synchronní motor uplatnil okrajově — většinou byly použité **impulsní mechanismy** (Bodet, Brillié, Mobatime). Synchronní motor zde figuruje jako pohon centrálních „master" hodin, kde precizní frekvence sítě určuje rytmus impulsů.

## Související

- [jednotný čas](/slovnik/jednotny-cas) — síťová synchronizace hodin
- [krystal](/slovnik/krystal) — alternativní oscilátor 30. let dále
- [Pragotron](/hodinari/pragotron) — český výrobce síťových hodin
- [elektrické hodiny](/slovnik/elektricke-hodiny) — širší pojem
