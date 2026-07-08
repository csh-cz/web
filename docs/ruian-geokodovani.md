# RÚIAN (ČÚZK) — rozpoznávání obcí, adres a geolokace

Návod na použití **RÚIAN** (Registr územní identifikace, adres a nemovitostí) přes
veřejný ArcGIS REST ČÚZK. RÚIAN je autoritativní tam, kde OSM/Nominatim selhává:
u ulic, které v OSM vůbec nejsou, a u staveb bez adresy (kostely, kaple).

Sepsáno na základě reálného nasazení při stavbě mapy
[`/hainz-1904`](../apps/hodinarium-eu/src/pages/hainz-1904.astro) (2026-07-08) —
včetně pastí, na které jsme narazili.

## Endpoint a vrstvy

Služba:

```
https://ags.cuzk.cz/arcgis/rest/services/RUIAN/Vyhledavaci_sluzba_nad_daty_RUIAN/MapServer
```

| vrstva | obsah | klíčová pole |
|---|---|---|
| `1` | **AdresniMisto** (adresní body) | `kod`, `cislodomovni` (čp.), `cisloorientacni` (č.or.), `cisloorientacnipismeno`, `psc`, `ulice` (kód ulice), `stavebniobjekt` (kód SO), `adresa` |
| `3` | **StavebniObjekt** (budovy, půdorysy) | `kod`, `zpusobvyuzitikod`, `dokonceni`, `cisladomovni`, `identifikacniparcela` |
| `4` | **Ulice** | `kod`, `nazev`, `obec` |
| `12` | Obec | |

`minScale` u vrstev omezuje jen **vykreslování**, nikoli `/query`. Dotazovat lze
v libovolném měřítku.

## ⚠️ Past č. 1 — projekce (Křovák)

**RÚIAN nativně pracuje v S-JTSK / Křovák (EPSG:5514).** Pokud nevynutíš
souřadnicový systém, vrátí ti křovákovy metry (velká **záporná** čísla,
řádově −750 000 / −1 050 000). Kdo je pak vloží jako `lat/lon`, dostane pin
někde v Africe.

> **Vždy posílej `inSR=4326` (bod dotazu) i `outSR=4326` (výstup).**

Kontrolní pojistka po importu: každá česká souřadnice musí padnout do
`lat ∈ ⟨48; 51,5⟩`, `lon ∈ ⟨12; 19⟩`. Cokoli mimo = Křovák prosákl.

## ⚠️ Past č. 2 — GeocodeServer nefunguje

Endpoint `.../MapServer/exts/GeocodeServer/findAddressCandidates?SingleLine=…`
vrací **0 kandidátů i na existující adresu**. Nepoužívat — jdi přímo na `/query`
jednotlivých vrstev.

## ⚠️ Past č. 3 — zkrácené názvy ulic

RÚIAN vede ulici jako **„B. Němcové"**, ne „Boženy Němcové". Přesná shoda proto
selže (a proto ji nenajde ani Nominatim). Hledej `LIKE`, ne rovnost:

```
GET /4/query
  where=nazev LIKE '%Němcov%'
  geometry=14.40,48.93,14.54,49.02        # bbox: lonmin,latmin,lonmax,latmax
  geometryType=esriGeometryEnvelope&inSR=4326
  outFields=*&returnGeometry=false&f=json
→ kod ulice (např. 73423)
```

## ⚠️ Past č. 4 — „číslo 3" je orientační, ne popisné

V běžném úzu znamená „B. Němcové 3" **číslo orientační**. RÚIAN rozlišuje
`cislodomovni` (čp.) a `cisloorientacni` (č.or.); adresa se tiskne `čp/č.or.`:

> „B. Němcové **49/3**" = čp. 49, č.or. 3

Nehledej čp. 3 — to je úplně jiný dům.

```
GET /1/query
  where=ulice=73423
  outFields=kod,cislodomovni,cisloorientacni,adresa
  returnGeometry=true&outSR=4326&f=json
```

## Reverzní dotaz (bod → adresa / budova)

```
GET /1/query          # nebo /3/query pro budovu
  geometry=<lon>,<lat>&geometryType=esriGeometryPoint
  inSR=4326&outSR=4326
  distance=<metry>&units=esriSRUnit_Meter
  spatialRel=esriSpatialRelIntersects
  outFields=…&returnGeometry=true&f=json
```

- `distance=0` (přísný bod v polygonu) v praxi **vrací prázdno** — piny z OSM/wiki
  bývají pár metrů mimo půdorys RÚIAN. Dej fallback `≤ 15 m`.
- Vzdálenost si dopočítej sám (haversine) a **ulož ji** — je to kvalitativní signál.

## ⚠️ Past č. 5 — „nejbližší" ≠ „vlastní"

Nejbližší adresní bod nemusí patřit tvé budově:

- **Kostely, kaple, zámky bez čp.** adresní místo vůbec nemají → nejbližší adresa
  leží na **sousedním domě** (typicky 25–40 m). Přiřadit ji = chyba.
- **Velké areály** (nádraží, továrny, nemocnice) mají vlastní adresu **30–66 m**
  od centroidu → tam naopak nejbližší bod bývá správný.

### Správné řešení: jdi přes budovu, ne přes vzdálenost

`AdresniMisto.stavebniobjekt` je cizí klíč na `StavebniObjekt.kod`:

```
bod → /3/query (StavebniObjekt)          → kod budovy
    → /1/query where=stavebniobjekt=<kod> → VLASTNÍ adresní místa té budovy
```

Tím past odpadá úplně.

### Nouzové řešení: heuristika vzdálenosti

Když jdeš přes vzdálenost, buď konzervativní a **typově uvědomělý** — např.
přiřazuj do 25 m, u sakrálních staveb jen do 15 m. Radši žádný kód než cizí.

## Stavby bez adresy: použij StavebniObjekt

Kostely **v RÚIAN jsou** — jako stavební objekty (`kod`, půdorys, definiční bod),
jen bez čísla popisného. Když tě zajímá „na jaké budově to stojí", je
`StavebniObjekt.kod` lepší a univerzálnější identifikátor než adresní místo.

Bonusová pole vrstvy 3:

- `zpusobvyuzitikod` — druh využití (u kostelů se vyskytlo `19`),
- `dokonceni` — rok dokončení. U starých budov **často `null`**, ale kde je vyplněn,
  funguje jako **datovací kontrola**: pokud je dnešní budova mladší než historická
  událost, tehdejší stavba byla jiná.

## Historická data ≠ RÚIAN

RÚIAN popisuje **dnešní stav**. Nedokládá, že budova stála v roce X, ani že jde
o tutéž stavbu. U zaniklých staveb pin na bývalém místě **chytne cizí dnešní
adresu** — takové záznamy z přiřazování vynech.

## Provoz

- Posílej rozumný `User-Agent` s kontaktem.
- Mezi dotazy `sleep ~0,2 s`. Při rate-limitu vrací služba **ne-JSON** (HTML/400) —
  ošetři parsování a zpomal.
- U `where` dotazů hlídej `exceededTransferLimit` a stránkuj.

## Kontrolní seznam před importem

1. Mám `inSR=4326` **a** `outSR=4326` (všude, kde vracím geometrii)?
2. Padají všechny souřadnice do českého WGS84 rozsahu?
3. Hledal jsem ulici přes `LIKE`, ne rovností?
4. Nepletu čp. × č.or.?
5. Přiřazuji adresu **vlastní budovy** (přes `stavebniobjekt`), ne nejbližší?
6. Vynechal jsem zaniklé stavby?

## Kde to používáme

- `zdroje/Hainz/pipeline/ruian-check.py` — reverzní dohledání adresních míst
  (pole `ruian` v `hainz1904.ts`).
- `zdroje/Hainz/pipeline/ruian-so-check.py` — reverzní dohledání stavebních objektů
  (pole `ruianSo`; pokrývá i kostely).
