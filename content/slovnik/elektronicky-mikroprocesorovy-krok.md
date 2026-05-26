---
title: elektronický (mikroprocesorový) krok
slug: elektronicky-mikroprocesorovy-krok
kategorie: mechanika
prekladyDe:
  - term: elektronische Hemmung
    genus: f
    zdroj: "moderní DE odborný termín"
  - term: Mikroprozessor-Hemmung
    genus: f
    zdroj: "DE pro mikroprocesorové řízení"
  - term: Quarzhemmung
    genus: f
    zdroj: "DE užší termín — krystalovým oscilátorem řízený krok"
prekladyEn:
  - term: electronic escapement
    zdroj: 'Berner FHS ID 1248 — sekce „electric escapement'
  - term: microprocessor escapement
    zdroj: "EN explicit mikroprocesorové řešení"
  - term: quartz escapement
    zdroj: "EN — quartz watch typical implementation"
prekladyFr:
  - term: échappement électronique
    genus: m
    zdroj: "FR odborný"
  - term: échappement à quartz
    genus: m
    zdroj: "FR — krystalové řízení"
varianty:
  - term: elektronický krok
    status: preferred
    note: "Generický cs termín pro celou třídu (od jednoduchých kontaktních přes quartz po GPS-synchronizované)."
  - term: mikroprocesorový krok
    status: admitted
    note: "Specifický termín pro digitální řízení mikroprocesorem."
  - term: kvarcový krok
    status: admitted
    note: "Užší — quartz watch / clock implementation."
pribuzne:
  - krok
  - hippuv-prerusovac
definice: "Moderní ekvivalent mechanického kroku. Pohyb ručky řídí elektronický obvod (mikroprocesor) místo mechanického oscilátoru s paletkami. Referenční signál: krystalový oscilátor 32 768 Hz, GPS, DCF77, NTP server přes Internet. Mikroprocesor v daný okamžik vydá impulz krokovému motorku, který přesune ručku o krok dále."
crossRefs:
  kroky:
    - elektronicky-mikroprocesorovy-krok
references:
  - bibKey: bernerFHS
    title: "Berner G.-A., *Illustrated Professional Dictionary of Horology*."
    pages: 'ID 1248, sekce „electric escapement'
    url: "https://dictionary.fhs.swiss/?l=en"
    key: berner-fhs
  - bibKey: kralovstviHodin
    title: "Království hodin — Slovníček"
    url: "https://kralovstvihodin.cz/slovnicek/"
    note: 'Heslo „motorek krokový" — související komponenta.'
    key: kh-elektronicky
---

## Výklad

**Moderní ekvivalent mechanického kroku** — místo mechanického oscilátoru a paletek řídí pohyb ručky **elektronický mikroprocesor**, který v daný okamžik vydá impulz krokovému motoru. Referenčním zdrojem signálu obvykle:

- **Krystalový oscilátor 32 768 Hz** (= 2^15 — standard pro quartz hodinky/hodiny od 1969)
- **GPS** (atomový čas přes družice)
- **DCF77** (rádiový signál z německé Mainflingen pro střední Evropu)
- **NTP server přes Internet** (chytré hodiny, počítače)

V Berner FHS dictionary spadá pod sekci **electric escapement** v rámci kategorie *detached escapements*. Není to krok v klasickém mechanickém smyslu, ale **funkční ekvivalent** — řeší tytéž úkoly:
- **Udržuje frekvenci** (krystal nebo externí signál místo oscilátoru)
- **Předává energii** (elektromagnetický pulz místo paletky)
- **Rytmuje pohyb** (krokový motor místo soukolí s krokem)

V Čechách elektronický krok masivně rozšířen od **70. let 20. století** v interiérových hodinách (Prim, Chronotechna) a v elektrických věžních hodinách dodávaných firmami **Elektročas, Pragotron** aj. Většinou se používá ve **podružných** strojích (slave clocks), kdy je hlavní hodiny mechanické a referenční signál se přenáší elektricky.

## Konstrukce a princip činnosti

Detailní popis → **[Elektronický (mikroprocesorový) krok v sekci Kroky](/kroky/elektronicky-mikroprocesorovy-krok)**.

## Související

- [krok](/slovnik/krok) — obecný termín
- [Hippův přerušovač](/slovnik/hippuv-prerusovac) — předchůdce z 19. století (mechanicko-elektrický)
- *(k doplnění)* podružné hodiny (slave clocks) — typická implementace
