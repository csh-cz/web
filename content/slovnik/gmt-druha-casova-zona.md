---
title: GMT / druhá časová zóna
slug: gmt-druha-casova-zona
kategorie: hodinky
prekladyDe:
  - term: GMT
  - term: Zweite Zeitzone
  - term: Weltzeit
prekladyEn:
  - term: GMT
  - term: dual time
  - term: second time zone
  - term: world time
prekladyFr:
  - term: GMT
  - term: deuxième fuseau horaire
definice: "Komplikace hodinek umožňující **současné zobrazení dvou časových pásem** (typicky lokální + GMT/UTC). Realizováno **24-hodinovou ručkou** (s odlišnou rychlostí 1 otáčka / 24 h místo 1 otáčka / 12 h) a obvykle bezelem se 24-h stupnicí. Některé varianty zobrazují **všech 24 zón** (world timer)."
pribuzne:
  - casova-rovnice
---

## Výklad

Termín **GMT** = **Greenwich Mean Time**, historický referenční čas
nultého poledníku v Greenwich (Anglie). Po roce 1972 nahrazen **UTC**
(Coordinated Universal Time, atomová stupnice), ale v hodinářské
nomenklatuře zůstává **„GMT"** (značkový tag, Rolex GMT-Master 1955).

**Vznik komplikace** je svázaný s **letectvím**:

- **Pan American Airways** v 1955 zadala Rolexu poptávku po hodinkách
 pro **transkontinentální piloty** — potřeba současně sledovat domácí
 čas (rozhodování) i lokální (pristání). Rolex odpověděl
 **GMT-Master ref. 6542** (1955) — první komerční GMT.
- **IATA** standard: piloti mají na palubě GMT (UTC) jako jediný
 jednoznačný referenční čas pro flight plánování, weather routings.

**Tři typy implementace:**

1. **Caller GMT** (older, ETA 2893) — 24-h ručka **synchronizovaná**
 s 12-h, **ale nezávisle nastavitelná**. Lokální čas se nastavuje
 normálně, druhá zóna posunutím 24-h ručky.
 Vhodné pro **„volajícího" v jiné zóně** (ví, kolik je tam, ale
 sám necestuje).

2. **Traveler GMT / „True GMT"** (Rolex 3185, Glashütte Original) —
 **hodinová ručka** je nezávislá (skok po 1 h), 24-h drží **home
 time**. Při příletu uživatel posune hodinovou ručku na lokální čas
 (bez ovlivnění minut) → 24-h ukazuje **původní home time**.
 Vhodné pro **cestovatele**.

3. **World timer** (Patek Philippe 5110, 5230) — celá rotující číselníková
 plocha s 24 městy, 24-h ručka. Stisk korunky posune čas o **1 hodinu**
 napříč všemi 24 displaying zónami.

**Standardní layout:**
- **24-h marker** v pozici 0/24 (horní polovina = noc, dolní = den)
- **Dvoubarevný bezel** (Rolex „Pepsi" červeno-modrý, „Batman" modro-černý) —
 vizuální oddělení noci a dne
- **Subdial 6 h** s druhou zónou (alternativní layout, Glashütte
 Original Senator Cosmopolite)

## Příbuzné termíny

[časová rovnice](#časová-rovnice),
[chronometr](#chronometr), [korunka](#korunka)

## Reference

Sladkovský 1947 GMT komplikaci nezmíňuje (vzniká až 1955). Dokumentuje
ale **základní astronomický koncept** ekvivalentu nultého poledníku:

> „Pro jistotu chodu chronometrů tím, že hvězdárna v Greenwichi vysílá
> v určitých hodinách radiem správný střední čas nultého poledníku.
> Na lodích, jež plují v širých vodách, může službu konající námořník
> porovnati podle signálu chod chronometrů a případnou odchylku pak
> poznamená."
> — SLADKOVSKÝ, Josef. *Učebnice odborné nauky hodinářské.* 1947.

> „Royal KonTiki Chronograph GMT s vlastním manufakturním chronografem na bázi kalibru Eterna 39"
> — BÖHM, Ondřej a KNESPL, David. *Eterna. Návrat manufaktury.* HodinyKlenoty 2015.

> Standardní novodobý popis: „Mechanické hodinky se samonátahem | kalibr X | hodiny, minuty, vteřinovka, GMT, datum"
> — KNESPL, David. *HodinyKlenoty* časopisové reviews 2014–2015.

## Obrázky

*(zatím chybí — návrh: srovnání caller × traveler × world-timer schéma; foto Rolex GMT-Master „Pepsi")*
