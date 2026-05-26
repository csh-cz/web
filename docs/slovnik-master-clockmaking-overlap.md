# Tier C × content/slovnik/ — analýza překryvu

Z **450 clock-relevantních Tier C konceptů** porovnání s **157 existujícími hesly** v `content/slovnik/`.

## Souhrn překryvu

| Typ překryvu | Počet | Co znamená |
|---|---:|---|
| 🎯 STRICT (přes CZ) | **16** | Modernizovaný Špatný CZ se shoduje s titulem existujícího slugu (auto-match přes EN/FR/DE byl slepý) |
| 🔗 FUZZY DE | **15** | Berner DE termín (nebo head-noun) je v `prekladyDe` některého existujícího hesla |
| 🔗 FUZZY EN | **0** | Berner EN termín je v `prekladyEn` některého existujícího hesla |
| 🔗 FUZZY FR | **0** | Berner FR termín je v `prekladyFr` některého existujícího hesla |
| 🆕 BEZ překryvu | **419** | Skutečně nové koncepty (nikde v `content/slovnik/`) |

**Překryv celkem: 31 z 450 (6 %)** — tyto Tier C koncepty patří k existujícímu heslu jako rozšíření překladů, ne jako nové heslo.

**Skutečně nové koncepty: 419 (93 %)**

---

## Existující hesla, která Tier C nejvíc rozšiřuje (top 30)

Tato hesla v `content/slovnik/` mají nejvíc Tier C kandidátů, kteří se k nim hodí jako další synonyma / překlady:

| Slug | Title | Tier C hitů | IDs |
|---|---|---:|---|
| `krok` | krok | 8 | 2476, 2316, 968, 677, 2704, 2222, 2002, 2901 |
| `vlasek` | vlásek | 3 | 2621, 765, 2364 |
| `stupnice` | stupnice | 2 | 573, 1478 |
| `vidlice` | vidlice | 2 | 1598, 1836 |
| `stroj-podsestava` | stroj (podsestava orloje) | 1 | 2053 |
| `kalibr` | kalibr | 1 | 287 |
| `vocel` | vocel (ocel) | 1 | 20 |
| `luozko` | lůžko (luožko měsícovo) | 1 | 905 |
| `vrub-zub` | vrub (vroubek, zub) | 1 | 721 |
| `soukoli` | soukolí | 1 | 1536 |
| `oblouk-orloje` | oblouk (vobloukek) | 1 | 191 |
| `vreteno-orloje` | vřeteno (orlojní) | 1 | 460 |
| `prut-orloje` | prut (rameno kola) | 1 | 435 |
| `tatrmani-aparat` | tatrmani / aparát (pohyblivé figurky) | 1 | 171 |
| `vos` | vos (osa) | 1 | 283 |
| `chronometr` | chronometr | 1 | 1065 |
| `kotvovy-krok` | kotvový krok (vratný) | 1 | 1074 |
| `kotva` | kotva | 1 | 1836 |
| `sklicko` | sklíčko | 1 | 2415 |
| `snek` | šnek (závitek) | 1 | 218 |
| `pero` | pero (tažné péro) | 1 | 450 |

---

## STRICT překryv — Špatný CZ → existující slug

**16 konceptů**. Modernizovaný Špatný CZ se shoduje s titulem nebo variantou existujícího hesla. Náš auto-match přes EN/FR/DE je nezachytil, protože tato hesla nemají odpovídající `prekladyXx` ve frontmatteru.

**Doporučení**: pro tato hesla doplnit Berner EN/FR/DE termíny do `prekladyEn/De/Fr` v existujícím slug souboru.

| Berner ID | EN | DE | Špatný CZ | → Slug |
|---|---|---|---|---|
| `20` | Bessemer steel; carbon steels; cementation steel | Automatenstähle; Bessemerstahl; Damaszenerstahl | ocel | `vocel` |
| `171` | apparatus | Apparat | přístroj, aparát | `tatrmani-aparat` |
| `191` | arc; arc of approach; arc of withdrawal | Annäherungsbogen; Auslaufbogen; Bogen | oblouk | `oblouk-orloje` |
| `283` | axis; balance-staff; pointed staff | Achse; Rotorwelle; Unruhwelle | osa; 2 | `vos` |
| `287` | bagnolet | Bagnolet-Kaliber | ráž, kalibr | `kalibr` |
| `435` | arm; sector | Arm; Branche | rameno; kleiner A | `prut-orloje` |
| `460` | brooch; runner | Brosche; Spindel | vřeteno; Spindel | `vreteno-orloje` |
| `573` | Celsius André (1701-1744); Celsius scale | Celsius André (1701-1744); Celsius-Skala | stupnice, skala | `stupnice` |
| `721` | notch | Kerbe | vrub | `vrub-zub` |
| `905` | bearing | Lager | lůžko, ložisko, ložiště | `luozko` |
| `1478` | Fahrenheit Gabriel-Daniel (1686-1736); Fahrenheit scale | Fahrenheit Gabriel-Daniel (1686-1736); Fahrenheit-Skala | stupnice, skala | `stupnice` |
| `1536` | finishing; finishing gear | „Finissage“; Finissage-Räderwerk | kolostroj, kola, soukolí, stroj kolový | `soukoli` |
| `1598` | fork | Gabel | vidlička; in Ankeruhren) hrot vodítka, h | `vidlice` |
| `2053` | Antikythera Machine; centring machine; circular graining machine | Abrundungsmaschine; CNC-Maschine; Elektro-Punktschweissmaschine | stroj; zubořez | `stroj-podsestava` |
| `2316` | negative; negative rate; negative temperature or below zero | negativ; negativer Gang; Temperatur unter null Grad | choď, krok | `krok` |
| `2476` | circular pitch of a gear; pitch; spacing of an electrical connector | Achsabstand eines Steckers; Schritt; Teilung in einem Getriebe | krok | `krok` |

## FUZZY překryv DE — Berner DE termín v `prekladyDe`

**15 konceptů**. Berner DE compound (např. `Hemmungsrad`) má head-noun, který je v `prekladyDe` některého existujícího hesla. Často kandidáti na rozšíření existujícího slugu.

| Berner ID | EN | DE | Špatný CZ | → Slug(y) |
|---|---|---|---|---|
| `218` | Breguet stopwork; fusee-stopwork; Jacot stopwork | Breguet-Gesperr; Gesperr; Gesperr der Schnecke | závitek, ulita | `snek` |
| `450` | battery bridle; carrier for pivoting; clamp | Batteriehaltefeder; Drehherz; Genfer Zaum | unášeč, vodič; pero | `pero` |
| `677` | drop; drop in an escapement; drop in an gear | Fall; Fall bei einer Hemmung; Fall in einem Getriebe | pád, padnutí; zdržování ; 2 | `krok` |
| `765` | count-point; counting; counting of a balance-spring | Abzählen der Spirale; sequenzielle Zählung; Zählen | f., Spiralfeder vlásek | `vlasek` |
| `968` | cylinder; escapement cylinder | Zylinder; Zylinder der Hemmung | zdržování ; 2 | `krok` |
| `1065` | half-chronometer | Halb-Chronometer | časoměr, chro- nometr | `chronometr` |
| `1074` | English lever escape-wheel tooth; pin-lever escape-wheel tooth; saw-tooth profile of ratchet-wheel teeth | Sägezahnung der Sperrräder; Wolfzahn; Zahn | für Taschenuhrwerke zpruha zpěrací s ozubem; runde Gesperrfeder (zuzwei- platinigen Taschenuhren) zpěrací zpruha okrouhlá; ge rade Gesperrfeder zpěrací zpruha přímá ; G; zub ; magerer, dicker | `kotvovy-krok` |
| `1836` | impulse; impulse given by the wheel to the lever; impulse given by the wheel to the pallets | Impuls; Impuls Rad auf Anker; Impuls Rad auf Paletten | popud, podnět, impuls; — Klang | `vidlice`, `kotva` |
| `2002` | ligne; line; lines of force | geradlinige Hemmung; Kraftlinien; Linie | zdržování ; 2; přímá čára, přimka | `krok` |
| `2222` | beat adjuster; earthing; grounding | Abfall einstellen; an Masse legen; Erdung | zdržování ; 2 | `krok` |
| `2364` | number; number of a balance-spring; number of a terminal curve | Nummer; Nummer einer Endkrümmung; Nummer einer Spirale | f., Spiralfeder vlásek | `vlasek` |
| `2415` | organic; organic glass; organic oil | organisch; organisches Glas; organisches Öl | ploché sklíčko; ‐ n | `sklicko` |
| `2621` | flat; flat balance spring; flatness | das Flachlaufen eines Rades prüfen; ebene Fläche; flach | plocha; nakloněná plocha | `vlasek` |
| `2704` | bracket for the winding-stem; bracket in the escapement; horse | Halter für die Aufzugswelle; Halter in der Hemmung; Treibnietmaschine | zdržování ; 2 | `krok` |
| `2901` | escapement in beat; guide-mark; to put a watch in beat | abgeglichene Hemmung; Merkzeichen | zdržování ; 2 | `krok` |

## FUZZY překryv EN — Berner EN termín v `prekladyEn`

**0 konceptů**.

| Berner ID | EN | DE | Špatný CZ | → Slug(y) |
|---|---|---|---|---|

---

## Závěr — co s tím

Z 450 Tier C konceptů je **31 (6 %) překryv** s existujícími hesly. Tyto by se měly v Fázi 1 zaškrtnout `[~]` (synonymum) a v Fázi 3 (auto-doplnění `prekladyXx`) jejich Berner termíny přidat do `prekladyDe/En/Fr` existujících hesel — žádné nové heslo.

Skutečně nových konceptů: **419 (93 %)** — tyto jsou kandidáti na nová hesla.
