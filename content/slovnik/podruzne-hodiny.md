---
title: podružné hodiny
slug: podruzne-hodiny
conceptId: HORO-SLAVE-001
kategorie: mechanika
varianty:
  - podružné hodiny
  - vedlejší hodiny
  - sekundární hodiny
  - dceřinné hodiny
  - slave clock
prekladyDe:
  - term: Nebenuhr
    genus: f
  - term: Tochteruhr
    genus: f
prekladyEn:
  - term: slave clock
  - term: secondary clock
prekladyFr:
  - term: horloge secondaire
    genus: f
  - term: horloge esclave
    genus: f
definice: "Hodiny bez vlastního oscilátoru, jejichž **ručky postupují podle elektrických impulsů** vysílaných z hlavních (master) hodin. Tvoří **distribuovaný časový systém** — jeden přesný master udržuje desítky až stovky podružných hodin v synchronní stejné poloze (nádraží, školy, továrny, města)."
pribuzne:
  - synchronni-motor
  - centralni-prevodovka
references:
  - bibKey: 'knesplJanProkesHodinar2018'
    type: clanek
    note: "Vývoj cs elektrochronie 1950+ (Pragotron, Elektročas)."
---

## Princip funkce

**Podružné hodiny nemají vlastní oscilátor** (kyvadlo, [setrvačku](/slovnik/setrvacka) ani křemenný krystal). Jejich ručky postupují **diskrétními kroky** podle elektrických impulsů přicházejících po dvou drátech z hlavního (master) hodinového stroje. Mezi dvěma impulsy stojí.

**Typický minutový impuls:**

- doba trvání: cca **1 sekunda**
- polarita se s každým impulsem **mění** (kladný/záporný střídavě) — zabraňuje magnetizaci kotvy krokového motoru
- napětí: typicky **24 V**, někdy 12 V nebo 60 V (větší rozvody, dlouhá vedení)
- kabeláž: dva vodiče (živý + neutrál), čtyřvodičové systémy pro půlminutový posun

Krokový motor podružných hodin se otočí o **6° na impuls** (1/60 plné otáčky minutové ručky), nebo o jiný úhel podle převodu.

## Historický vývoj

| Rok | Vynálezce | Princip |
|---|---|---|
| **1839** | Alexander Bain (Skot) | první elektromagnetické hodiny — kyvadlo udržováno elektromagnetem |
| **1840–50** | Charles Wheatstone | první **podružné hodiny** — master hodiny posílají proud elektromagnetu, který posunuje ručku |
| **1862** | Matthäus Hipp (Švýcar) | **Hippův přerušovač** — mechanický spínač generující polaritou střídající impuls; standard pro Mobatime, Schauer, atd. |
| **1923–** | Synchronní motor | alternativa: hodiny řízené **frekvencí síťového napětí** (50 Hz EU, 60 Hz USA), netřeba master clock — viz [synchronní motor](/slovnik/synchronni-motor) |
| **1960+** | Křemenné hodiny | postupné nahrazení synchronních motorů; podružné systémy přežívají v institucionálním nasazení |

## Český kontext

V Československu byl distribuovaný čas standardem v institucích od 50. let:

- **Pragotron** (Praha, 1953+) — domácí výrobce; vyráběl i master + podružné stroje pro školy, nádraží, továrny
- **Elektročas** (1959+) — pokračovatel firmy [L. Hainz](/hodinari/l-hainz); věžní stroje s automatickým nátahem + podružné odečty ciferníků
- **MOBATIME** (Mobatime AG, Švýcarsko) — od 90. let dominantní dodavatel pro česká nádraží (ČD), Pražské metro a další distribuované systémy

## Rozvod více ciferníků

Věžní stroje s mechanickým rozvodem od **královské hřídele** (vertikálního táhla od stroje k ciferníkům) nejsou technicky „podružné hodiny" — všechny ciferníky sdílí **stejný stroj přes mechanický převod**, ne přes elektrický impuls.

**Rozdíl mezi:**

- **Mechanický rozvod** — jeden stroj, mechanická distribuce (např. zámek Poděbrady: 1 stroj → 4 ciferníky přes královskou hřídel)
- **Podružný systém** — jeden master + N podružných hodin propojených dráty

## Příbuzné termíny

[synchronní motor](/slovnik/synchronni-motor), [centrální převodovka](/slovnik/centralni-prevodovka), [číselník](/slovnik/ciselnik), [hřídelík](/slovnik/hridelik-orloje)
