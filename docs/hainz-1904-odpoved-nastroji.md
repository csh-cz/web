# Hainz 1904 — vyhodnocení připomínek nezávislého geokodéru

Odpověď na systematický průchod korpusu 425 lokalit nástrojem *historical-geocoding*
(shoda s naší mapou 63 %, u shodných medián odchylky 0,40 km). Nástroj vytřídil
kandidáty, kde je pravděpodobnější chyba na naší straně; níže je vyhodnocení
každého z nich.

Zapracováno v PR [#175](https://github.com/csh-cz/web/pull/175) (2026-07-08).

## Metodický klíč, který spor rozhodl

Leták je abecední a neuvádí okres, ale má dva silné vnitřní signály:

1. **Exonymové pravidlo.** U německojazyčných (sudetských) měst leták **důsledně**
   tiskne německá exonyma: `Asch` (Aš), `Bodenbach` (Podmokly),
   `Joachimsthal` (Jáchymov), `Graupen` (Krupka), `Böhmisch-Leipa` (Česká Lípa).
   ⇒ **Česky psané jméno v letáku znamená českojazyčnou obec.**
2. **Značka země u cizích položek.** `Budapest, Ungarn` · `Warschau, Russland` ·
   `Idria, Krain`. ⇒ **Absence značky = tuzemská položka.**

Obě pravidla lze zakódovat jako tvrdé filtry; samy o sobě vyřadí velkou část
homonymních kandidátů.

## Per kandidát

### Zamítnuto

**`Jesenik` → Jeseník (Q954611)** — *zamítnuto jako identifikace, připomínka přesto
užitečná.*
Jeseník byl **Freiwaldau**, německojazyčné Slezsko. Podle exonymového pravidla by
ho leták tiskl „Freiwaldau" — a **žádné „Freiwaldau" v letáku není**. „Jesenik"
tedy míří na českojazyčnou obec; argument „bez diakritiky ⇒ Jeseník" neplatí.
*Zapracováno jinak:* mapa měla Jesenici u Sedlčan jako **jistou**, což bylo
přeceněné (mezi českými Jesenicemi zůstává volba otevřená — u Sedlčan podle
clusteru dodávek × prominentnější Jesenice u Rakovníka). **Doplněn příznak
nejistoty** + rozbor.

**`Makov` → Makó (Q240504)** — *zamítnuto.*
`Makov` a `Makó` jsou různá jména (ne diakritická varianta). Chybí značka země,
kterou leták u uherských položek má (`Budapest, Ungarn`). A **Makov u Litomyšle
má kostel sv. Víta** — typ objektu z letáku (`Kirche`) sedí.
*Zapracováno:* identifikace potvrzena, **otazník odebrán**.

**`Niemtschitz` → Velké Němčice (Q1023862)** — *zamítnuto.*
Velké Němčice by leták tiskl jako **`Groß-Niemtschitz`**. Prosté `Niemtschitz`
míří na menší Němčice (exaktní exonymum nese Němčice u Blanska).
*Zapracováno:* zůstává **nelokalizované**, doplněno odůvodnění.

**`Lišnice` → Líšnice (Q2142591, okr. Ústí nad Orlicí)** — *zamítnuto.*
Ze tří Líšnic má kostel **jen Líšnice u Prahy** (Všech svatých, barokní 1730–35).
Navržená Líšnice u Ústí n. O. má podle OSM jen **bezejmennou kapli**, Lišnice
u Mostu nemá nic. Typ objektu z letáku (`Kirche`) rozhoduje.
*Zapracováno:* mapa potvrzena, **otazník odebrán**.

### Přijato / potvrzeno (otazník odebrán)

**`Bernartitz` → Bernartice (Q823134)** — souhlas. Q-idčko sedí na souřadnice mapy
(Bernartice u Milevska, městys, okres Písek; kostel sv. Martina). Nezávislé
potvrzení dovolilo odebrat nejistotu.

**`Ober-Grund` → Horní Podluží (Q1511268)** — souhlas, exonymum je jednoznačné.
Pozn.: typ objektu je `Vertretung` (**obchodní zastoupení**) — hodiny se tam
neinstalovaly, pin proto zůstává na středu obce.

**`Voslov` → Oslov** — souhlas, navíc nalezen **tvrdý doklad**: referenční seznam
L. Hainz uvádí opravu čtvrťového věžního stroje **kostela v Oslově** (11/2016),
tedy přímou stopu vlastní dodávky. Otazník odebrán.

**`Strenitz` → Strenice** (dvě položky: `Schule`, `Kirche`) — potvrzeno z jiného
zdroje: Hainzův stroj zdejšího kostela je doložen v **našem soupisu věžních hodin**
(L. Hainz 1896, dochován in situ). Otazník odebrán u obou.

### Zůstává nejisté

**`Johnsdorf, Villa`** — navržený Janov (Q1682947, okr. Děčín) i náš Janov
u Litvínova jsou legitimní. Typ objektu je však **vila** — konkrétní vilu nelze
určit ani v jedné. Alternativa doplněna do poznámky; otazník ponechán.

**`Neudorf`, `Franzensthal`, `Morowitz`, `Hurka`** — souhlas, že oba jen hádáme.
Bez doloženého Hainzova stroje / NPÚ zůstávají s otazníkem. Beze změny.

### Beze změny (mapa doložena)

**`Slatina`** → Slatina pod Hazmburkem, kostel sv. Jana Nepomuckého — identifikace
potvrzena Památkovým katalogem NPÚ a Nocí kostelů.

**`Cerekvic`** → Cerekvice nad Bystřicí — Cerekvice nad Loučnou dostala hodiny až
2005–14, leták z roku 1904 tam mířit nemůže.

## Bilance

- 6× identifikace potvrzena a zbavena otazníku (2× přímým dokladem Hainzova stroje)
- 1× dosud sebejistý pin správně zpochybněn (`Jesenik`)
- 3× doporučení zamítnuto s doloženým protiargumentem
- zbytek beze změny, s odůvodněním zapsaným v datech

## Co by nástroji nejvíc pomohlo

1. **Exonymové pravidlo** a **značka země** (viz výše) jako tvrdé filtry.
2. **Typ objektu jako filtr existence** — `Kirche` ⇒ obec musí mít kostel
   (Overpass `amenity=place_of_worship` s `building=church`, ne jen kapli);
   `Bahnhof` ⇒ obec na trati; `Rathaus` ⇒ městečko.
3. **Doložený stroj jako trumf** — reference L. Hainz a naše databáze věžních hodin
   přebijí jakoukoli lexikální podobnost. Kde je stroj doložen, není co řešit.
4. **Prominence až jako poslední kritérium.** U této firmy dodávky často míří do
   malých obcí (vesnické kostely, venkovské zámky), takže „větší obec je
   pravděpodobnější" tu platí slabě.
