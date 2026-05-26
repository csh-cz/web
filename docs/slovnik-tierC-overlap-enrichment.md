# Tier C × content/slovnik/ — překryv: Berner definice + enrichment plán

**31 Berner FHS konceptů** mapuje na **20 existujících hesel** v `content/slovnik/` (32 mapping párů — některé koncepty pasují k více než jednomu slugu).

Pro každý koncept: Berner EN definice + návrh, co konkrétně doplnit do existujícího slugu.

## Souhrn

| Slug | Title | # Berner konceptů | isStub? |
|---|---|---:|:---:|
| [`krok`](../content/slovnik/krok.md) | krok | 9 | — |
| [`vlasek`](../content/slovnik/vlasek.md) | vlásek | 3 | — |
| [`stupnice`](../content/slovnik/stupnice.md) | stupnice | 2 | — |
| [`vidlice`](../content/slovnik/vidlice.md) | vidlice | 2 | ✅ |
| [`chronometr`](../content/slovnik/chronometr.md) | chronometr | 1 | — |
| [`kalibr`](../content/slovnik/kalibr.md) | kalibr | 1 | — |
| [`kotva`](../content/slovnik/kotva.md) | kotva | 1 | — |
| [`luozko`](../content/slovnik/luozko.md) | lůžko (luožko měsícovo) | 1 | ✅ |
| [`oblouk-orloje`](../content/slovnik/oblouk-orloje.md) | oblouk (vobloukek) | 1 | ✅ |
| [`pero`](../content/slovnik/pero.md) | pero (tažné péro) | 1 | — |
| [`prut-orloje`](../content/slovnik/prut-orloje.md) | prut (rameno kola) | 1 | ✅ |
| [`sklicko`](../content/slovnik/sklicko.md) | sklíčko | 1 | — |
| [`snek`](../content/slovnik/snek.md) | šnek (závitek) | 1 | — |
| [`soukoli`](../content/slovnik/soukoli.md) | soukolí | 1 | — |
| [`stroj-podsestava`](../content/slovnik/stroj-podsestava.md) | stroj (podsestava orloje) | 1 | ✅ |
| [`tatrmani-aparat`](../content/slovnik/tatrmani-aparat.md) | tatrmani / aparát (pohyblivé figurky) | 1 | ✅ |
| [`vocel`](../content/slovnik/vocel.md) | vocel (ocel) | 1 | ✅ |
| [`vos`](../content/slovnik/vos.md) | vos (osa) | 1 | ✅ |
| [`vreteno-orloje`](../content/slovnik/vreteno-orloje.md) | vřeteno (orlojní) | 1 | ✅ |
| [`vrub-zub`](../content/slovnik/vrub-zub.md) | vrub (vroubek, zub) | 1 | ✅ |

isStub ✅ = heslo má `isStub: true` → benefit z enrichment je velký (často chybí celá definice).

---

## `chronometr` — chronometr

**Soubor**: `content/slovnik/chronometr.md`
**Kategorie**: mechanika

**Existující definice:**

> Hodinkový stroj nejvyšší přesnosti, typicky s chronometrovým krokem (volným, s detentem); v užším smyslu lodní (mořský) chronometr pro určování zeměpisné délky.

**Existující překlady:** EN: chronometer · DE: Chronometer · FR: chronomètre

### Berner koncepty mapující na `chronometr` (1)

#### Berner ID `1065` — _half-chronometer_ n.

- **Aligned trio**: EN _half-chronometer_ · FR _demi-chronomètre n. m._ · DE _Halb-Chronometer m._
- **Špatný 1882 CZ**: časoměr, chro- nometr
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> Rarely used term from the 19th century referring to modestly priced watches, whose movements were submitted for consideration by an observatory to check their accuracy, but which, for commercial reasons, had not undergone the tests required to obtain chronometer certification.
>

**Berner všechny synonyma:**
- EN (1): half-chronometer
- DE (1): Halb-Chronometer
- FR (1): demi-chronomètre

**🎯 Doporučený enrichment do `chronometr.md`**:

- `prekladyEn` doplnit: `half-chronometer`
- `prekladyDe` doplnit: `Halb-Chronometer`
- `prekladyFr` doplnit: `demi-chronomètre`

---

## `kalibr` — kalibr

**Soubor**: `content/slovnik/kalibr.md`
**Kategorie**: hodinky

**Existující definice:**

> Označení **typu hodinového stroje** — jeho tvaru, rozměrů, uspořádání desek a součástek. V hodinkách kapesních a náramkových identifikuje konkrétní konstrukci (např. „kalibr ETA 2824\" nebo „kalibr Lange L901.0\"); manufaktury každý kalibr vyvíjí jako samostatnou platformu.

**Existující překlady:** EN: caliber, calibre · DE: Kaliber · FR: calibre

### Berner koncepty mapující na `kalibr` (1)

#### Berner ID `287` — _bagnolet_ n.

- **Aligned trio**: EN _bagnolet_ · FR _bagnolet n. m._ · DE _Bagnolet-Kaliber n._
- **Špatný 1882 CZ**: ráž, kalibr
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> Ultra-thin cylinder calibre, built around 1840 by Philippe-Samuel Meylan (1772–1845), a native of the Joux Valley. Its height does not exceed 1.5 or 2 mm thanks to the "reversal" of the components, fitted not on the plate-side, but on the dial-side. It is usually off-centre meaning that the wheel-train turns in the opposite direction in order to display the time in a conventional manner.
>

**Berner všechny synonyma:**
- EN (1): bagnolet
- DE (1): Bagnolet-Kaliber
- FR (1): bagnolet

**🎯 Doporučený enrichment do `kalibr.md`**:

- `prekladyEn` doplnit: `bagnolet`
- `prekladyDe` doplnit: `Bagnolet-Kaliber`
- `prekladyFr` doplnit: `bagnolet`

---

## `kotva` — kotva

**Soubor**: `content/slovnik/kotva.md`
**Kategorie**: mechanika

**Existující definice:**

> Součást kroku ve tvaru ramen, na jejichž koncích jsou palety; zachycuje krokové kolo a předává energii kyvadlu nebo setrvačce.

**Existující překlady:** EN: anchor, pallet bridge · DE: Anker · FR: ancre

### Berner koncepty mapující na `kotva` (1)

#### Berner ID `1836` — _impulse_ n.

- **Aligned trio**: EN _impulse_ · FR _impulsion n. f._ · DE _Impuls m._
- **Špatný 1882 CZ**: popud, podnět, impuls; — Klang; kotva
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> I. Thrust exerted by a moving body on a stationary body causing the latter to move. impulse given by the wheel to the lever or pallets: in watchmaking, in a lever escapement, the impulse is the action of the escape wheel tooth (impulse face a) on the pallet (impulse face b). In the Swiss lever escapement, the impulse is given on the two faces a and b. The impulse angle α is the angle through which the lever moves between the first contact (continuous lines) of the tooth on the impulse face and the last contact (dotted lines). This angle varies between 8 and 10°. The fork transmits the impulse to the impulse pin. The angle through which the balance travels during the impulse is the "angle of lift" of the balance, which is between 30 and 40°.
>
> II. pulse. In electronics, a pulse is a brief and rapid variation of an electrical state, often used as a signal. The motors of quartz watches are generally activated once per second by a short electric pulse with a duration of around 10 ms.
>

**Berner všechny synonyma:**
- EN (4): impulse, impulse given by the wheel to the lever, impulse given by the wheel to the pallets, pulse
- DE (3): Impuls, Impuls Rad auf Anker, Impuls Rad auf Paletten
- FR (3): impulsion, impulsion roue à ancre, impulsion roue à palettes

**🎯 Doporučený enrichment do `kotva.md`**:

- `prekladyEn` doplnit: `impulse`, `impulse given by the wheel to the lever`, `impulse given by the wheel to the pallets`, `pulse`
- `prekladyDe` doplnit: `Impuls`, `Impuls Rad auf Anker`, `Impuls Rad auf Paletten`
- `prekladyFr` doplnit: `impulsion`, `impulsion roue à ancre`, `impulsion roue à palettes`

---

## `krok` — krok

**Soubor**: `content/slovnik/krok.md`
**Kategorie**: mechanika

**Existující definice:**

> Mechanismus, který přerušuje pohyb soukolí v pravidelných intervalech a předává tak energii ze závaží nebo péra na oscilátor (kyvadlo nebo setrvačku).

**Existující překlady:** EN: escapement · DE: Hemmung, Gang · FR: échappement

### Berner koncepty mapující na `krok` (9)

#### Berner ID `677` — _drop_ n.

- **Aligned trio**: EN _drop_ · FR _chute n. f._ · DE _Fall m._
- **Špatný 1882 CZ**: pád, padnutí; zdržování ; 2
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> Action of letting something fall. The dropping of a watch on something hard usually entails breakage of the balance-staff pivots or other delicate components, e.g. the glass or the pivots. In horology, the term drop denotes certain functions that may be either defects or necessary safety precautions. drop in an escapement: arc or angle d through which the escape-wheel moves freely between the end of the impulse on one of the pallets and the next lock of a tooth on the other pallet. Depending on whether the drop occurs on the inside or on the outside of the pallets, it is called inside or outside shake. The drop is a necessary safety precaution whose linear value varies between 0.05 and 0.10 mm, i.e. an angular value of between 0° 30' and 1°. A drop is a loss of power. drop in a gear: abnormal, accelerated slide of a driver tooth on a driven tooth. The point c of the tooth a slides on the flank of the pinion-leaf. The preceding tooth d has its motion accelerated until it touches leaf e. The drop may be due to a wheel that is too large, to a distance of centres that is too short, or to a faulty profile.
>
> I. Small quantity of liquid that comes away in the form of a sphere. To apply a drop of oil to a jewel, a pallet stone.
>
> II. boss. Thickened area to strengthen the walls of a hole taking a moving part. The boss of the barrel recess or barrel cover. circular ridge: protuberance at the bottom of the recess taking a ratchet wheel or transmission wheel, to reduce the area of the rubbing surfaces. clearance ridge: protuberance to maintain space between a moving part and a fixed part, reducing the area of friction, made on one of the two parts. boss: in watchmaking, a convex profile made around a hole, either for ornament or for preventing oil from creeping. drip box: protrusion extending the back cover of a quality pocket watch, which is pressed against the body of the pendant to protect the movement from dust.
>

**Berner všechny synonyma:**
- EN (3): drop, drop in an escapement, drop in an gear
- DE (3): Fall, Fall bei einer Hemmung, Fall in einem Getriebe
- FR (3): chute, chute dans un échappement, chute dans un engrenage

**🎯 Doporučený enrichment do `krok.md`**:

- `prekladyEn` doplnit: `drop`, `drop in an escapement`, `drop in an gear`
- `prekladyDe` doplnit: `Fall`, `Fall bei einer Hemmung`, `Fall in einem Getriebe`
- `prekladyFr` doplnit: `chute`, `chute dans un échappement`, `chute dans un engrenage`

---

#### Berner ID `968` — _cylinder_ n.

- **Aligned trio**: EN _cylinder_ · FR _cylindre n. m._ · DE _Zylinder m._
- **Špatný 1882 CZ**: zdržování ; 2
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> Long straight body, with equal bases and parallel planes. escapement cylinder: in a cylinder escapement, a small steel tube that is acted upon by the teeth of the escape wheel, and which also serves as the balance staff.
>

**Berner všechny synonyma:**
- EN (2): cylinder, escapement cylinder
- DE (2): Zylinder, Zylinder der Hemmung
- FR (2): cylindre, cylindre de l'échappement

**🎯 Doporučený enrichment do `krok.md`**:

- `prekladyEn` doplnit: `cylinder`, `escapement cylinder`
- `prekladyDe` doplnit: `Zylinder`, `Zylinder der Hemmung`
- `prekladyFr` doplnit: `cylindre`, `cylindre de l'échappement`

---

#### Berner ID `1731` — _grasshopper_ n.

- **Aligned trio**: EN _grasshopper_ · FR _grasshopper n. m._ · DE _Grasshopper-Hemmung f._
- **Špatný 1882 CZ**: zdržování ; 2
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> Name of a recoil escapement that operates very regularly, without jerks or friction, having the benefit of not requiring lubrication. The pallets have a kicking action similar to the back legs of a grasshopper, hence its name. Difficult to regulate, it was not widely used. Invented by John Harrison around 1725.
>
> See grasshopper 1731.
>

**Berner všechny synonyma:**
- EN (1): grasshopper
- DE (1): Grasshopper-Hemmung
- FR (1): grasshopper

**🎯 Doporučený enrichment do `krok.md`**:

- `prekladyEn` doplnit: `grasshopper`
- `prekladyDe` doplnit: `Grasshopper-Hemmung`
- `prekladyFr` doplnit: `grasshopper`

---

#### Berner ID `2002` — _ligne_ n.

- **Aligned trio**: EN _ligne_ · FR _ligne n. f._ · DE _Linie f._
- **Špatný 1882 CZ**: zdržování ; 2; přímá čára, přimka; přímá čára, přímka; gerader Feilstrich přímý tah pilníkem ; gerade Feilstriche
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> I. (formerly) Symbol [''']; French unit of measurement, equal to one twelfth of a pouce du Roi (King's inch), or 2.2558 mm, still often used today to designate the size of a watch movement. It is expressed by a triple apostrophe and is associated with the diameter or the largest dimension of the calibre. A 12-ligne calibre (12'''). Watchmakers also use fractions such as ¼, ½ and ¾ of a ligne, as in e.g. 7 ¾''' or 10 ½''' calibres. One twelfth of a ligne (0.188 mm.) is a unit still used by case makers. The ligne used in the English-speaking countries measures 2.116 mm.
>
> II. line. Continuous stroke having only one dimension: length. A line may be either straight, bent or curved.straight line lever escapement: in which the centres of the escape wheel, the pallets and the balance lie on a straight line. Syn. or equiv.: centre line.path of contact: line of points of contact of gear wheel teeth.lines of force: lines that represent the direction of the phenomenon of magnetisation. The lines of force of a magnet or of a magnetic field.transfer line: group or line made up of several transfer machines that can, in certain cases, be coupled together in order to produce well-defined parts in large runs. All stations operate simultaneously and feature an accurate workpiece positioning system, enabling them to be transferred automatically from one station to another. Used in, for example, the machining of a watch plate.
>

**Berner všechny synonyma:**
- EN (5): ligne, line, lines of force, straight-line lever escapement, transfer line
- DE (4): geradlinige Hemmung, Kraftlinien, Linie, Transferstrasse
- FR (4): échappement ligne droite, ligne, ligne-transfert, lignes de force

**🎯 Doporučený enrichment do `krok.md`**:

- `prekladyEn` doplnit: `ligne`, `line`, `lines of force`, `straight-line lever escapement`, `transfer line`
- `prekladyDe` doplnit: `geradlinige Hemmung`, `Kraftlinien`, `Linie`, `Transferstrasse`
- `prekladyFr` doplnit: `échappement ligne droite`, `ligne`, `ligne-transfert`, `lignes de force`

---

#### Berner ID `2222` — _putting_ n.

- **Aligned trio**: EN _putting_ · FR _mise n. f._ · DE _Setzen n._
- **Špatný 1882 CZ**: zdržování ; 2
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> Action and result of putting or setting.putting into beat or setting upright:1. In a wall clock, the relative positions of the pendulum and the pallets must be adjusted to make the drops equal. If the two sounds made by the drops are not of equal intensity, the clock is said to limp. See beat 2901.2. beat adjuster. Term used by clockmakers to denote a device (small slide, eccentric or screw) used for adjusting the relative positions of the pendulum and the pallets.putting into poise: syn. or equiv.: poising. See poising 1393, poise 1395.putting into beat: see beat 2901.spring checking: operation of checking the functions of the balance spring when it has been fitted in position, together with the balance, in a watch. The spring should remain flat, unwind concentrically and affect no other part of the mechanism.fitting: in watchmaking, various operations including the fitting of the cock, the barrel drum, the hands, the train, or the movement in the case. See turning in 2019.trueing in the flat: ascertaining, by using a figure of eight calliper, whether a wheel or balance is true in the flat. Train setting. See out of truth in the flat 2068.jewelling: (Geneva) technical term in French: setting the jewels in which the train pivots of a watch rotate.earthing (US: grounding): In certain electrical appliances, to simplify the wiring, one of the poles of the power supply is connected to earth (US: ground), i.e. the metal framework of the apparatus. The framework acts as a conductor and simplifies other connections to the pole in question. In many quartz watches, the earth is formed by the metal plate of the movement and certain metal parts of the case, middle and back. E.g. a push button actuates a strip connected to earth that touches an area of the PCB connected to an input of the microcontroller. The latter detects the short circuit and performs an action accordingly. In watchmaking, the earth is often connected to the positive pole of the button cell, which simplifies construction.earthing (US: grounding): In electricity, a safety device in apparatus that may present a risk of electrocution for living beings due if the insulation is faulty. A wire, usually yellow and green in colour, connecting the frame of the device to earth, usually the earth contact of the mains power socket. In the event of an internal insulation fault, a short circuit may occur, but the frame or the housing of the device remains at the non-hazardous electrical potential of earth.
>

**Berner všechny synonyma:**
- EN (9): beat adjuster, earthing, grounding, putting, putting into beat, putting into poise, setting upright, spring checking, trueing in the flat
- DE (8): Abfall einstellen, an Masse legen, Erdung, Flachlegen, Ingangsetzen, lotrechtes Hängen, mise aux trous, Setzen der Hemmung
- FR (11): mise, mise à la masse, mise à la terre, mise au repère, mise aux trous, mise d'aplomb, mise d'échappement, mise d'équilibre, mise en marche, mise en place, mise plat

**🎯 Doporučený enrichment do `krok.md`**:

- `prekladyEn` doplnit: `beat adjuster`, `earthing`, `grounding`, `putting`, `putting into beat`, `putting into poise`, `setting upright`, `spring checking`, `trueing in the flat`
- `prekladyDe` doplnit: `Abfall einstellen`, `an Masse legen`, `Erdung`, `Flachlegen`, `Ingangsetzen`, `lotrechtes Hängen`, `mise aux trous`, `Setzen der Hemmung`
- `prekladyFr` doplnit: `mise`, `mise à la masse`, `mise à la terre`, `mise au repère`, `mise aux trous`, `mise d'aplomb`, `mise d'échappement`, `mise d'équilibre`, `mise en marche`, `mise en place`, `mise plat`

---

#### Berner ID `2316` — _negative_ adj.

- **Aligned trio**: EN _negative_ · FR _négatif, négative adj._ · DE _negativ Adj._
- **Špatný 1882 CZ**: choď, krok
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> Less than zero.negative setting: see negative setting 2223.negative rate of a watch or clock: according to the convention usually adopted by horologists, the rate is negative when the timepiece loses and positive when it gains.negative temperature or below zero: indicated by the minus sign. The thermometer goes down to -10°C.
>

**Berner všechny synonyma:**
- EN (4): negative, negative rate, negative temperature or below zero, negative-setting
- DE (3): negativ, negativer Gang, Temperatur unter null Grad
- FR (3): marche négative, négatif, négative, température au-dessous de zéro degré

**🎯 Doporučený enrichment do `krok.md`**:

- `prekladyEn` doplnit: `negative`, `negative rate`, `negative temperature or below zero`, `negative-setting`
- `prekladyDe` doplnit: `negativ`, `negativer Gang`, `Temperatur unter null Grad`
- `prekladyFr` doplnit: `marche négative`, `négatif, négative`, `température au-dessous de zéro degré`

---

#### Berner ID `2476` — _step_ n.

- **Aligned trio**: EN _step_ · FR _pas n. m._ · DE _Schritt m._
- **Špatný 1882 CZ**: krok
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> Periodic interval in space or time. The seconds hand of a quartz watch usually steps once per second. This may seem obvious, but some watches take a greater number of steps, e.g. sixteen steps per second, to give the impression that the hand is advancing continuously. circular pitch of a gear: the distance between two consecutive teeth, measured on the pitch circle. In a gear, the circular pitch P is the distance between two consecutive teeth, measured on the pitch circle a. If r is the radius of the pitch circle, d the pitch diameter, and z the number of teeth, then: metric pitch: pitch of metric threads, e.g. of a screw, expressed in millimetres.spacing of an electrical connector: distance between two contacts. E.g. a spacing of 0.5 mm for the connections of an LCD display module.
>

**Berner všechny synonyma:**
- EN (3): circular pitch of a gear, pitch, spacing of an electrical connector
- DE (3): Achsabstand eines Steckers, Schritt, Teilung in einem Getriebe
- FR (3): pas, pas d'un connecteur électrique, pas dans un engrenage

**🎯 Doporučený enrichment do `krok.md`**:

- `prekladyEn` doplnit: `circular pitch of a gear`, `pitch`, `spacing of an electrical connector`
- `prekladyDe` doplnit: `Achsabstand eines Steckers`, `Schritt`, `Teilung in einem Getriebe`
- `prekladyFr` doplnit: `pas`, `pas d'un connecteur électrique`, `pas dans un engrenage`

---

#### Berner ID `2704` — _bracket_ n.

- **Aligned trio**: EN _bracket_ · FR _console n. f._ · DE _Konsole f._
- **Špatný 1882 CZ**: zdržování ; 2
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> Shelf to support an object, usually fixed to a wall. Domestic clocks are often placed on brackets (bracket-clocks).
>
> Metal part nailed or screwed in pairs to the back of the base of a wall clock in order to fix it to the wall. Tabs may also be nailed or screwed to the back of pendulum cabinets to hold them against the wall.pads: the pallets of a recoil escapement for a clock.oil groove or oil channel: technical terms for a groove cut in the rubbing parts of certain machines to facilitate lubrication.
>
> Device or machine used to support, fix, suspend, or guide a tool. horse: support for placing or hanging clock movements while repairs are being carried out. staking tool: in watchmaking, tool consisting of a stay c carrying a vertical tool holder, into which a tool b (e.g. a milling cutter, punch, or riveting tool) is fitted. The workpieces are placed on the platform (anvil) p, on the drilled plate d which can usually rotate. There is a tool for each operation: e.g. driving stay, riveting stay, fitting stay (hands, watch glasses), driving-out stay, and case stay. bracket in the escapement: in crown wheel escapements, the part supporting the horizontal pivots of the escapement.bracket for the winding stem: in pocket watches, the part fixed to the plate of the movement, whose function is to guide the pivot of the winding stem without any need for a hole in the plate.
>

**Berner všechny synonyma:**
- EN (4): bracket for the winding-stem, bracket in the escapement, horse, staking-tool
- DE (4): Halter für die Aufzugswelle, Halter in der Hemmung, Treibnietmaschine, Werkhalter für Pendeluhren
- FR (5): potence, potence à river, potence dans l'échappement, potence pour pendule, potence pour tige de remontoir

**🎯 Doporučený enrichment do `krok.md`**:

- `prekladyEn` doplnit: `bracket for the winding-stem`, `bracket in the escapement`, `horse`, `staking-tool`
- `prekladyDe` doplnit: `Halter für die Aufzugswelle`, `Halter in der Hemmung`, `Treibnietmaschine`, `Werkhalter für Pendeluhren`
- `prekladyFr` doplnit: `potence`, `potence à river`, `potence dans l'échappement`, `potence pour pendule`, `potence pour tige de remontoir`

---

#### Berner ID `2901` — _guide mark_ n.

- **Aligned trio**: EN _guide mark_ · FR _repère n. m._ · DE _Merkzeichen n._
- **Špatný 1882 CZ**: zdržování ; 2
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> Stroke, dot, arrow, etc., making it possible to find, for example, an object, a location, or the relative position of two parts. In the striking mechanism of a clock, a guide mark is often made on the teeth of the wheels and pinions to fix their relative positions. In watches without seconds hands, a guide mark on the rim of the fourth wheel may be used instead of a hand. escapement in beat: in watches, the balance spring collet on the balance staff must be placed in such a way that, in the rest position, the centre of the impulse pin is on the line of centres between the balance and the pallet staff; the escapement is then in beat. Otherwise, the functions of the escapement are not symmetrical in relation to the rest position. to put a watch in beat: it is not necessary to make a guide mark on the balance; the watchmaker may use as guides one of the balance screws and a fixed point on the bottom plate or one of the bars. A clock is put in beat using the graduated scale opposite the lower point of the pendulum. The drops must occur at equal distances from the rest position. The noise made by the tooth as it strikes the locking face may also be used for hanging the clock vertically, as the intervals between consecutive ticks must always be the same. If the clock is not in beat, it will "limp".
>

**Berner všechny synonyma:**
- EN (3): escapement in beat, guide-mark, to put a watch in beat
- DE (2): abgeglichene Hemmung, Merkzeichen
- FR (4): échappement au repère, mettre d'échappement, mettre une montre au repère, repère

**🎯 Doporučený enrichment do `krok.md`**:

- `prekladyEn` doplnit: `escapement in beat`, `guide-mark`, `to put a watch in beat`
- `prekladyDe` doplnit: `abgeglichene Hemmung`, `Merkzeichen`
- `prekladyFr` doplnit: `échappement au repère`, `mettre d'échappement`, `mettre une montre au repère`, `repère`

---

## `luozko` — lůžko (luožko měsícovo)

**Soubor**: `content/slovnik/luozko.md`
**Kategorie**: mechanika
**isStub**: ✅ — heslo bez plné definice

**Existující definice:**

> Drobné lůžko / držák kotouče měsíce. V něm rotuje kulička měsíce, čímž se na pukle (terči uprostřed číselníku) ukazuje fáze měsíce.

**Existující překlady:** EN: — · DE: — · FR: —

### Berner koncepty mapující na `luozko` (1)

#### Berner ID `905` — _bearing_ n.

- **Aligned trio**: EN _bearing_ · FR _coussinet n. m._ · DE _Lager n._
- **Špatný 1882 CZ**: lůžko, ložisko, ložiště
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> Ring-shaped part in which a journal or pivot turns. The jewels of a watch are bearings. Jewel bearing. Brass bearing. Watchmakers prefer the term jewel.
>
> In engineering, set of parts supporting the driving shafts of a machine. The jewel hole is one of the parts of the bearing. Syn. or equiv.: bearing-block. ball bearing: in watchmaking, this type of bearing is used for certain pivots and for mounting the rotors (oscillating weights) of self-winding watches. The balls b, made of steel, ceramic or ruby, roll on the sleeve t and the bushing m which carries the rotor v. The bushing ends in a gear wheel d that drives the winding train. Ball bearings reduce friction. roller bearing: the constructional principle is the same, but with rollers instead of ball bearings.
>

**Berner všechny synonyma:**
- EN (1): bearing
- DE (1): Lager
- FR (1): coussinet

**🎯 Doporučený enrichment do `luozko.md`**:

- `prekladyEn` doplnit: `bearing`
- `prekladyDe` doplnit: `Lager`
- `prekladyFr` doplnit: `coussinet`
- **Definice**: heslo je `isStub` — Berner výklad výše obsahuje plnou EN definici, kterou lze přeformulovat česky

---

## `oblouk-orloje` — oblouk (vobloukek)

**Soubor**: `content/slovnik/oblouk-orloje.md`
**Kategorie**: mechanika
**isStub**: ✅ — heslo bez plné definice

**Existující definice:**

> Železný díl ve tvaru oblouku spojující dva pruty trojprutého kola; nese ryklík a drobné ložisko (kštudlici). U Staroměstského orloje vyrobený v rámci Táborského oprav 16. století.

**Existující překlady:** EN: — · DE: — · FR: —

### Berner koncepty mapující na `oblouk-orloje` (1)

#### Berner ID `191` — _arc_ n.

- **Aligned trio**: EN _arc_ · FR _arc n. m._ · DE _Bogen m._
- **Špatný 1882 CZ**: oblouk
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> Part of the circumference of a circle or of any curve. The arcs of a circle are measured in degrees [°], minutes ['] and seconds [''] of arc, in decimal degrees or grads [gon] and their submultiples, or in radians [rad]. The maximum arc of vibration of a watchbalance is 315°, from its point of rest. arc of approach: in a gear, the arc described by a wheel while two teeth are in contact, before the line of centres. arc of withdrawal: the same arc described after the line of centres. supplementary arc: the arc described by a watch-balance outside the functions of the escapement, i.e. before unlocking or after the impulse. electric arc: electric current that becomes visible in an insulating medium such as air or a gas. Very hot electric spark that passes, e.g. between the poles or electrodes of a machine, or between the carbons of an arc lamp.
>

**Berner všechny synonyma:**
- EN (5): arc, arc of approach, arc of withdrawal, electric arc, supplementary arc
- DE (5): Annäherungsbogen, Auslaufbogen, Bogen, Ergänzungsbogen, Lichtbogen
- FR (5): arc, arc d'approche, arc de retraite, arc électrique, arc supplémentaire

**🎯 Doporučený enrichment do `oblouk-orloje.md`**:

- `prekladyEn` doplnit: `arc`, `arc of approach`, `arc of withdrawal`, `electric arc`, `supplementary arc`
- `prekladyDe` doplnit: `Annäherungsbogen`, `Auslaufbogen`, `Bogen`, `Ergänzungsbogen`, `Lichtbogen`
- `prekladyFr` doplnit: `arc`, `arc d'approche`, `arc de retraite`, `arc électrique`, `arc supplémentaire`
- **Definice**: heslo je `isStub` — Berner výklad výše obsahuje plnou EN definici, kterou lze přeformulovat česky

---

## `pero` — pero (tažné péro)

**Soubor**: `content/slovnik/pero.md`
**Kategorie**: mechanika

**Existující definice:**

> Pohonná pružina svinutá v perovníku, která svým rozvíjením přenáší energii na soukolí; primární zdroj síly v kapesních a stolních hodinách (na rozdíl od závaží u věžních a stojacích).

**Existující překlady:** EN: mainspring · DE: Zugfeder, Uhrfeder · FR: ressort moteur, grand ressort

### Berner koncepty mapující na `pero` (1)

#### Berner ID `450` — _clamp_ n.

- **Aligned trio**: EN _clamp_ · FR _bride n. f._ · DE _Bügel m._
- **Špatný 1882 CZ**: unášeč, vodič; pero; spannen pero na- pnouti
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> Device for fixing, holding or connecting, e.g. for holding a part on a machine-tool table, for fixing and/or connecting fluid pipes or electric cables. wing bridle: type of mainspring bridle. Small blade a with two pegs b inserted into the cover e and the bottom of the barrel-drum d; this plate is riveted or welded to the mainspring c. The bridle holds the spring against the wall of the barrel. Coullery bridle: blade a whose length is about 3/4 of the circumference of the drum; one end rests on a hook b attached to the drum, while the other end supports the spring c which bears a rivet e to which the bridle is attached. The free end d of the mainspring rests against the drum itself. power connection: metal part which connects a source of energy, generally a battery, to the electronic module. A distinction is often made between the positive connector (+ connector) and the negative connector (- connector). contact strip: metal part making electrical contact between two or more components. A contact strip can, for example, supply electrical energy to the piezo alarm disc glued to the bottom of the case. battery bridle: metal part having the dual function of electrically connecting one battery pole to the movement and of holding the battery in place, especially when a shock occurs. A well-designed bridle prevents the battery from turning and maintains a stable contact force. It can be removed when replacing the battery. Geneva bridle: small plate a with two pegs b that are inserted between the first coil c1 and the second coil c2 of the spring, approximately 1/6 of a turn from the hook f, with the convex side facing the drum. The lower peg fits into a correspondingly shaped notch in the bottom of barrel d, while the upper peg is held in an identical notch in the cover e. The bridle holds the end of the outer spring coil against the drum when the spring is wound on the core. earth connector: metal part making electrical contact with the movement's earth, i.e. the plate and all other metal parts that are also in electrical contact with it. In most electronic devices, the earth is connected to the zero volt or negative pole of the battery. In watchmaking, however, the earth is often connected to the positive pole of the battery. mainspring-bridle: in a barrel, the essential function of the bridle is to hold the outer end of the mainspring against the walls of the barrel when the spring uncoils. The bridle causes the spring to wind and unwind more concentrically round its arbor. This reduces the friction between the coils of the spring and increases its efficiency. There are several types of mainspring-bridle, including: the wing bridle, the Coullery bridle, the Geneva bridle. The modern manufacture of inverted and alloy mainsprings has rendered the bridle obsolete. slipping spring or slip-spring: used in automatic watches, the sliding blade a is 10% shorter than the inner circumference of the barrel-drum c and is riveted or welded to the end of spring b. The barrel's inner wall has notches d into which the end of the sliding blade a is inserted but without being held in place, the function of this is to limit overtensioning of the mainspring. winding-stem brace (US: winding-arbor brace): part that engages in a groove in the winding-stem and holds it in position. carrier for pivoting: see carrier 1361.
>

**Berner všechny synonyma:**
- EN (11): battery bridle, carrier for pivoting, clamp, contact strip, earth connector, Geneva brace, mainspring-bridle, power connection, slip-spring, slipping spring, winding-arbor brace
- DE (9): Batteriehaltefeder, Drehherz, Genfer Zaum, Gleitzaum, Kontaktbügel, Massebügel, Steg für Aufzugswelle, Stromversorgungsbügel, Zaum der Zugfeder
- FR (11): bride, bride d'alimentation, bride de contact, bride de fixation de pile, bride de Genève, bride de masse, bride de ressort-moteur, bride de surtension, bride de tige de remontoir, bride glissante, bride pour le pivotage

**🎯 Doporučený enrichment do `pero.md`**:

- `prekladyEn` doplnit: `battery bridle`, `carrier for pivoting`, `clamp`, `contact strip`, `earth connector`, `Geneva brace`, `mainspring-bridle`, `power connection`, `slip-spring`, `slipping spring`, `winding-arbor brace`
- `prekladyDe` doplnit: `Batteriehaltefeder`, `Drehherz`, `Genfer Zaum`, `Gleitzaum`, `Kontaktbügel`, `Massebügel`, `Steg für Aufzugswelle`, `Stromversorgungsbügel`, `Zaum der Zugfeder`
- `prekladyFr` doplnit: `bride`, `bride d'alimentation`, `bride de contact`, `bride de fixation de pile`, `bride de Genève`, `bride de masse`, `bride de ressort-moteur`, `bride de surtension`, `bride de tige de remontoir`, `bride glissante`, `bride pour le pivotage`

---

## `prut-orloje` — prut (rameno kola)

**Soubor**: `content/slovnik/prut-orloje.md`
**Kategorie**: mechanika
**isStub**: ✅ — heslo bez plné definice

**Existující definice:**

> Rameno / paprsek kola. U Táborského *kolo tréprutové* = kolo se třemi rameny (paprsky), na kterém sedí indikátory orloje.

**Existující překlady:** EN: — · DE: — · FR: —

### Berner koncepty mapující na `prut-orloje` (1)

#### Berner ID `435` — _arm_ n.

- **Aligned trio**: EN _arm_ · FR _branche n. f._ · DE _Arm m._
- **Špatný 1882 CZ**: rameno; kleiner A
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> I. One of the two parts that make up certain tools or instruments. The arms of a compass, the two arms of a tuning fork.
>
> II. Sector. Syn. or equiv.: industrial sector. The watchmaking industry or sector.
>
> Elongated part connecting certain other parts of an object. The arms of a wheel, a balance or a fork (or horns in the case of the latter).bras en l'air: French term for a pocket watch or wristwatch that indicates the time by means of the arms of a jack. stop lever: in a locking-plate strike-train, the arm carrying the knife-edged locking-lever. leverage effect of a force: perpendicular dropped from the point of support of a lever onto the line representing the direction of the force.
>

**Berner všechny synonyma:**
- EN (2): arm, sector
- DE (2): Arm, Branche
- FR (1): branche

**🎯 Doporučený enrichment do `prut-orloje.md`**:

- `prekladyEn` doplnit: `arm`, `sector`
- `prekladyDe` doplnit: `Arm`, `Branche`
- `prekladyFr` doplnit: `branche`
- **Definice**: heslo je `isStub` — Berner výklad výše obsahuje plnou EN definici, kterou lze přeformulovat česky

---

## `sklicko` — sklíčko

**Soubor**: `content/slovnik/sklicko.md`
**Kategorie**: hodinky

**Existující definice:**

> Průhledná desková součást krytu hodinek — kryje číselník a chrání ručky před prachem, vlhkostí a poškozením. Historicky **plné sklo**, později **plexisklo / akryl** (1940–1980), dnes výhradně **safírové sklo** (umělý korund Al₂O₃, Mohs 9) u kvalitních hodinek.

**Existující překlady:** EN: crystal · DE: Glas, Uhrglas · FR: verre, glace

### Berner koncepty mapující na `sklicko` (1)

#### Berner ID `2415` — _organic_ adj.

- **Aligned trio**: EN _organic_ · FR _organique adj._ · DE _organisch Adj._
- **Špatný 1882 CZ**: ploché sklíčko; ‐ n; broušené sklíčko
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> Describes a compound of which one of the chemical constituent elements is carbon, of natural origin or produced synthetically.organic oil: animal or vegetable oil, as against mineral oil.organic glass: transparent, colourless, shock-resistant material formed of synthetic resins, lighter than mineral glass and more easily scratched. The organic glass used for waterproof watches is usually Plexiglass (Perspex).organic electronics: emerging technology whereby electronic functions may be performed using organic materials, e.g. OLED.
>

**Berner všechny synonyma:**
- EN (3): organic, organic glass, organic oil
- DE (3): organisch, organisches Glas, organisches Öl
- FR (3): huile organique, organique, verre organique

**🎯 Doporučený enrichment do `sklicko.md`**:

- `prekladyEn` doplnit: `organic`, `organic glass`, `organic oil`
- `prekladyDe` doplnit: `organisch`, `organisches Glas`, `organisches Öl`
- `prekladyFr` doplnit: `huile organique`, `organique`, `verre organique`

---

## `snek` — šnek (závitek)

**Soubor**: `content/slovnik/snek.md`
**Kategorie**: mechanika

**Existující definice:**

> Kuželové kolo se šroubovitými chody, na něž se navíjí struna nebo řetízek z bubnu pohonné pružiny; vyrovnává nestejný tah pera (mainspring).

**Existující překlady:** EN: fusee · DE: Schnecke · FR: fusée

### Berner koncepty mapující na `snek` (1)

#### Berner ID `218` — _stopwork_ n.

- **Aligned trio**: EN _stopwork_ · FR _arrêtage n. m._ · DE _Gesperr n._
- **Špatný 1882 CZ**: závitek, ulita
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> Device comprising a finger-piece b fixed to the barrel-arbor and a small wheel a, called the Maltese cross, which is mounted on the barrel cover. This mechanism limits the number of rotations, i.e. the extent to which the barrel can be wound. Breguet stopwork: with two toothed wheels, one of 10 teeth fixed to the barrel-arbor a, and another of 8 teeth fixed to the barrel itself b. The projections on the two wheels c meet after 4 turns thus limiting the extent to which the mainspring is wound. fusee-stopwork: when the chain a coils round the spiral groove of the fusee b, it rises and at its end of travel lifts a lever c, which strikes a cam d on the fusee and stops the mechanism. This system has been widely used in high-quality pocket watches and is sometimes still used today. Jacot stopwork: found in Chinese watches.
>

**Berner všechny synonyma:**
- EN (4): Breguet stopwork, fusee-stopwork, Jacot stopwork, stopwork
- DE (4): Breguet-Gesperr, Gesperr, Gesperr der Schnecke, Jacot-Gesperr
- FR (4): arrêtage, arrêtage breguet, arrêtage de la fusée, arrêtage Jacot

**🎯 Doporučený enrichment do `snek.md`**:

- `prekladyEn` doplnit: `Breguet stopwork`, `fusee-stopwork`, `Jacot stopwork`, `stopwork`
- `prekladyDe` doplnit: `Breguet-Gesperr`, `Gesperr`, `Gesperr der Schnecke`, `Jacot-Gesperr`
- `prekladyFr` doplnit: `arrêtage`, `arrêtage breguet`, `arrêtage de la fusée`, `arrêtage Jacot`

---

## `soukoli` — soukolí

**Soubor**: `content/slovnik/soukoli.md`
**Kategorie**: mechanika

**Existující definice:**

> Sestava ozubených kol, která přenáší energii od pohonu (závaží nebo péra) přes řadu převodů ke kroku a k ručkám hodin.

**Existující překlady:** EN: gear train, wheel train · DE: Räderwerk, Uhrwerk · FR: rouage, mouvement

### Berner koncepty mapující na `soukoli` (1)

#### Berner ID `1536` — _finishing_ n.

- **Aligned trio**: EN _finishing_ · FR _finissage n. m._ · DE _„Finissage“ f._
- **Špatný 1882 CZ**: kolostroj, kola, soukolí, stroj kolový
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> Final operation, completion of a piece of work. The finishing of a watchcase is the final work of assembling the parts and putting the case into working order.
>
> finishing gear: technical term in watchmaking. The drive train of the watch, comprising the barrel, the centre wheel, the third wheel, the second wheel, and the escape wheel. A train assembler. See train 2991.
>
> Process of examining and putting the finishing touches to a piece of work. Finishing of chronographs, repeaters, etc. Finishing is an operation that hardly survives today, except in special high-grade production shops.finishing in blank or in the grey: technical terms, finishing of a movement that has not been gilded.
>

**Berner všechny synonyma:**
- EN (2): finishing, finishing gear
- DE (2): „Finissage“, Finissage-Räderwerk
- FR (2): finissage, rouage de finissage

**🎯 Doporučený enrichment do `soukoli.md`**:

- `prekladyEn` doplnit: `finishing`, `finishing gear`
- `prekladyDe` doplnit: `„Finissage“`, `Finissage-Räderwerk`
- `prekladyFr` doplnit: `finissage`, `rouage de finissage`

---

## `stroj-podsestava` — stroj (podsestava orloje)

**Soubor**: `content/slovnik/stroj-podsestava.md`
**Kategorie**: mechanika
**isStub**: ✅ — heslo bez plné definice

**Existující definice:**

> U Táborského *stroj* ≠ celý hodinový stroj. Označuje **funkční podsestavu** — např. bicí stroj, kalendářní stroj, spouštěcí stroj. Celý mechanismus orloje se skládá ze 4 takových strojů (= 4 stran).

**Existující překlady:** EN: — · DE: — · FR: —

### Berner koncepty mapující na `stroj-podsestava` (1)

#### Berner ID `2053` — _machine_ n.

- **Aligned trio**: EN _machine_ · FR _machine n. f._ · DE _Maschine f._
- **Špatný 1882 CZ**: stroj; zubořez
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> Device capable of doing work or performing a certain function, either under the guidance of an operator (semi-automated machine) or in an autonomous manner (automated machine). Machines have revolutionised the conditions of human work; their increasing precision makes it possible to produce large series of interchangeable parts at low cost.machine tool: mechanical device used for shaping certain parts and other repetitive tasks. In watchmaking, these machines generally comprise a rigid and stable frame, a table that slides back and forth, and a head fitted with spindles to which tools can be fixed (e.g. graver, grinding wheel, chisel), as well as one or more motors. These include the lathe, the milling machine, the grinding machine, the drill press, the transfer machine, and the machining station, which can be conventionally or numerically controlled. Together, these devices can perform a wide variety of jobs which were once done by hand using tools. In the watch industry, the terms machine and tool are often used to denote the same thing. Properly, a tool is an instrument worked only by hand. For instance, a watch-winding tool is a hand-operated mandrel or chuck that acts on the winding button, whereas a watch-winding machine has a motor to operate the mandrel or chuck. The pioneer in the field was the French ébauche manufacturer Frédéric Japy who, in 1799, patented a dozen machine tools "capable of simplifying and reducing the work required in watchmaking": a lathe for turning plates, and machines to cut brass, to cut wheels, to make round or square pillars, to make balances, to drill straight holes, to rivet the feet of frames, to redo the entrance of the long arm of the bracket (which supports two of the four pivots of the parts of the escapement), and to slot screws.CNC machine: machine equipped with CNC (computer numerical control) to perform pre-programmed machining tasks. CNC refers to the hardware and software required to provide instructions to move all parts of the machine.Antikythera machine: a sort of calculator used to calculate the positions of the sun and the moon, as well as to predict eclipses, the movements of at least two of the five planets known at the time, namely Mercury and Venus, and the dates of the Olympic Games. Its gear mechanism—the oldest in the world—is based on the cycles of progression of Babylonian arithmetic. Operated by a crank, this extremely complex device is a type of super-astrolabe and includes some thirty gears, axles, drums, mobile hands and dials engraved with inscriptions and astronomical signs: the hands on the front face indicate the positions of the moon and the sun in relation to the zodiac; it also has a dial corresponding to the Egyptian 365.25 day calendar. On the back face there are two spiral dials, one of which is an astronomical calendar showing the Meton cycle of 235 lunar months or 19 solar years (corrected by the Callippic cycle of 76 tropical years with 365.25 days and 940 lunations), while the other is a Saros dial, showing the cycle of 223 lunations in just under 19 years. They could be used to determine the returns of the lunations and eclipses occurring on the same dates of the year, respectively. The crank could be turned to set the month and year on the Metonic calendar, while the Egyptian calendar on the other side was used to set the day. This machine was the predecessor of the computer and about the size of an average book (21 by 16 by 5 cm). It is named after the Greek island of Antykithera, located between Kythira and Crete. Its age is uncertain, although it most like dates from between 87 BC, the year the ship in which it was found (in 1900) was wrecked, and the 3rd century BC. Other dates have been suggested: 150, 140, 100 and 87 BC. It may have been designed by Archimedes of Syracuse (287–212 BC), Hipparchus of Nicaea (190–120 BC), Posidonios of Rhodes (135–51 BC) or his disciple Geminos (110–40 BC). Cicero wrote of two similar machines, one built by Archimedes, and the other by Posidonios.
>
> rounding machine: machine used to retouch gear teeth to refine their profiles. This machine was used after the slots had been cut using a milling cutter. The watchmaker used it to shape the teeth to improve the meshing of the gear. This machine is still in use today for repair work.water jet cutting machine: machine having a high-pressure pump (between 2 and 4000 bar) projecting water at very high speed (between 600 and 900 m/s, i.e. two to three times the speed of sound) through a nozzle between 0.1 and 0.4 mm in diameter. Pure water is used for softer materials, such as plastic and rubber, and water with suspended abrasive material is used for hard and composite materials, such as steel, titanium and carbon fibre. Combined laser and water jet machines also exist.laser cutting machine: machine equipped with an infrared laser capable of creating significant local heating, used for cutting and engraving materials (e.g. wood, leather, metal, stone or plastic). The laser may be pulsed (YAG) or continuous (CO2 or nitrogen lasers). CO2 lasers can cut many more types of material and at a higher speed than pulsed lasers.electric spot welding machine: machine for spot welding conductive materials by passing an electric current through electrodes, without the addition of material; the materials are pressure-welded as the electrical energy is transformed into heat energy (Joule effect).faceting machine: semi-automated or automated machine used for faceting hands and appliques with several facets. Watchcase faceting and serpentine engraving machine. In watchmaking, syn. or equiv.: diamond polishing machine.rose engine: machine for engraving ornamentation. Numerically controlled machines (CNC) enable larger volumes of parts to be produced at lower cost. The first rose engines appeared in the late 18th century.lapping machine: see lapidary 1964.multi-spindle machine: machine tool fitted with a number of spindles that work simultaneously, e.g. drills, or automatic lathes. A multi-spindle machine may be used in drilling printed circuit boards.circular graining machine: automated or semi-automated machine for performing circular graining.centring machine: machine capable of physically locating, with great accuracy, points defined by their polar coordinates.jig boring machine: measuring instrument based on the Cartesian coordinate system. Two movable slides set at right angles make it possible to move the object to be centred along the X and Y axes, and then to immobilise it under the punch, either to strike a point or to drill a hole.timing machine: see time 2872.riveting machine: syn. or equiv.: riveter.rolling machine: machine used for rolling, polishing and rounding pivots using wheels. See burnishing 2997.sandblasting machine: machine used for sandblasting or shotblasting. There are many types of sandblasting machines; they project, e.g. an abrasive powder, glass beads, bronze powder, or sand through a nozzle using compressed air. Syn. or equiv.: shotblasting machine.screen printing machine: manual, semi-automated or automated machine for high-precision screen printing on flat or cylindrical surfaces.laser welding machine: machine equipped with an infrared laser, whose beam is an extremely concentrated heat source which can create deep fine welds in possibly different materials at a high rate. Magnet welded to the rotor shaft (Lavet motor).ultrasound welding machine: machine for the local melting of fusible materials (plastics) at low temperature (approx. 200°C) by pulsed mechanical agitation using a tool called a sonotrode (welding head). This tool oscillates at its resonance frequency, generated by a piezo-electric element vibrating at 15–80 kHz. It can also perform other operations, e.g. riveting, insertion, forming or cutting.
>
> transfer machine: production machine with multiple machining stations used for large runs, which first appeared in the 1960s. Workpieces are transferred successively and automatically from one station to another. Such machines are normally linear, rotative and have a conveyor belt. In strip feed machines, the parts are machined on a metal or plastic strip travelling between the stations. This process allows both sides of the strip to be machined.
>

**Berner všechny synonyma:**
- EN (21): Antikythera Machine, centring machine, circular graining machine, CNC machine, electric spot-welding machine, faceting machine, jig boring-machine, lapping-machine, laser cutting machine, laser-welding machine, machine, machine-tool, multi-spindle machine, riveting machine, rolling machine, rounding machine, sandblasting machine, screen-printing machine, transfer machine, ultrasound welding machine, water-jet cutting machine
- DE (21): Abrundungsmaschine, CNC-Maschine, Elektro-Punktschweissmaschine, Facettiermaschine, Koordinatenbohrmaschine, Körnmaschine, Läppmaschine, Laserschneidmaschine, Laserschweissmaschine, Maschine, Mechanismus von Antikythera, Mehrspindelmaschine, Nietmaschine, Perliermaschine, Rolliermaschine, Sandstrahlmaschine, Siebdruckmaschine, Transfermaschine, Ultraschallschweissmaschine, Wasserstrahl-Schneidmaschine, Werkzeugmaschine
- FR (23): machine, machine à arrondir, machine à découper par jet d'eau, machine à découper par laser, machine à facetter, machine à guillocher, machine à lapider, machine à perler, machine à pointer, machine à pointer et percer, machine à river, machine à rouler, machine à sabler, machine à sérigraphier, machine à souder par laser, machine à souder par ultrasons, machine CNC, machine d'Anticythère, machine électrique à souder par points, machine multibroche, machine transfert, machine-outil, pointeuse

**🎯 Doporučený enrichment do `stroj-podsestava.md`**:

- `prekladyEn` doplnit: `Antikythera Machine`, `centring machine`, `circular graining machine`, `CNC machine`, `electric spot-welding machine`, `faceting machine`, `jig boring-machine`, `lapping-machine`, `laser cutting machine`, `laser-welding machine`, `machine`, `machine-tool`, `multi-spindle machine`, `riveting machine`, `rolling machine`, `rounding machine`, `sandblasting machine`, `screen-printing machine`, `transfer machine`, `ultrasound welding machine`, `water-jet cutting machine`
- `prekladyDe` doplnit: `Abrundungsmaschine`, `CNC-Maschine`, `Elektro-Punktschweissmaschine`, `Facettiermaschine`, `Koordinatenbohrmaschine`, `Körnmaschine`, `Läppmaschine`, `Laserschneidmaschine`, `Laserschweissmaschine`, `Maschine`, `Mechanismus von Antikythera`, `Mehrspindelmaschine`, `Nietmaschine`, `Perliermaschine`, `Rolliermaschine`, `Sandstrahlmaschine`, `Siebdruckmaschine`, `Transfermaschine`, `Ultraschallschweissmaschine`, `Wasserstrahl-Schneidmaschine`, `Werkzeugmaschine`
- `prekladyFr` doplnit: `machine`, `machine à arrondir`, `machine à découper par jet d'eau`, `machine à découper par laser`, `machine à facetter`, `machine à guillocher`, `machine à lapider`, `machine à perler`, `machine à pointer`, `machine à pointer et percer`, `machine à river`, `machine à rouler`, `machine à sabler`, `machine à sérigraphier`, `machine à souder par laser`, `machine à souder par ultrasons`, `machine CNC`, `machine d'Anticythère`, `machine électrique à souder par points`, `machine multibroche`, `machine transfert`, `machine-outil`, `pointeuse`
- **Definice**: heslo je `isStub` — Berner výklad výše obsahuje plnou EN definici, kterou lze přeformulovat česky

---

## `stupnice` — stupnice

**Soubor**: `content/slovnik/stupnice.md`
**Kategorie**: bici

**Existující definice:**

> V bicím stroji s početníkem **kotouč ve tvaru schodů** (nebo spirálovité šnečí formy) o 12 výškách, spojený přímo s hodinovou ručkou. Hloubka, do níž **početník** vypadne, závisí na výšce schůdku, který je v daném okamžiku pod ramenem početníku.

**Existující překlady:** EN: snail · DE: Staffelscheibe, Schneckenrad · FR: limaçon

### Berner koncepty mapující na `stupnice` (2)

#### Berner ID `573` — _Celsius André (1701–1744)_ pr. n.

- **Aligned trio**: EN _Celsius André (1701–1744)_ · FR _Celsius André (1701-1744) n. pr._ · DE _Celsius André (1701-1744) Eigenn._
- **Špatný 1882 CZ**: stupnice, skala
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> Swedish scientist who proposed the centigrade scale (Celsius scale) for the measurement of temperatures. Celsius scale: scale of relative temperature. Unit: degree Celsius, symbol [°C]. In this scale, 0 corresponds to the temperature of melting ice and 100 to that of pure boiling water (at a pressure of 760 mm of mercury). The other reference point is absolute zero, the lowest temperature that can exist, which is -273.15°C. See degree Celsius 1056.
>

**Berner všechny synonyma:**
- EN (2): Celsius André (1701-1744), Celsius scale
- DE (2): Celsius André (1701-1744), Celsius-Skala
- FR (2): Celsius André (1701-1744), échelle Celsius

**🎯 Doporučený enrichment do `stupnice.md`**:

- `prekladyEn` doplnit: `Celsius André (1701-1744)`, `Celsius scale`
- `prekladyDe` doplnit: `Celsius André (1701-1744)`, `Celsius-Skala`
- `prekladyFr` doplnit: `Celsius André (1701-1744)`, `échelle Celsius`

---

#### Berner ID `1478` — _Fahrenheit Gabriel-Daniel (1686–1736)_ pr. n.

- **Aligned trio**: EN _Fahrenheit Gabriel-Daniel (1686–1736)_ · FR _Fahrenheit Gabriel-Daniel (1686-1736) n. pr._ · DE _Fahrenheit Gabriel-Daniel (1686-1736) Eigenn._
- **Špatný 1882 CZ**: stupnice, skala
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> Prussian physicist whose name has been given to a thermometer scale. See temperature 3255. Some multi-function electronic watches show the outside temperature or the body temperature in degrees Fahrenheit. Fahrenheit scale: a relative temperature scale. Unit: degree Fahrenheit, symbol [°F]. Absolute zero is approx. -460°F. This scale is still used, in particular in the United States. See degree Fahrenheit 1056.
>

**Berner všechny synonyma:**
- EN (2): Fahrenheit Gabriel-Daniel (1686-1736), Fahrenheit scale
- DE (2): Fahrenheit Gabriel-Daniel (1686-1736), Fahrenheit-Skala
- FR (2): échelle Fahrenheit, Fahrenheit Gabriel-Daniel (1686-1736)

**🎯 Doporučený enrichment do `stupnice.md`**:

- `prekladyEn` doplnit: `Fahrenheit Gabriel-Daniel (1686-1736)`, `Fahrenheit scale`
- `prekladyDe` doplnit: `Fahrenheit Gabriel-Daniel (1686-1736)`, `Fahrenheit-Skala`
- `prekladyFr` doplnit: `échelle Fahrenheit`, `Fahrenheit Gabriel-Daniel (1686-1736)`

---

## `tatrmani-aparat` — tatrmani / aparát (pohyblivé figurky)

**Soubor**: `content/slovnik/tatrmani-aparat.md`
**Kategorie**: profese
**isStub**: ✅ — heslo bez plné definice

**Existující definice:**

> Pohyblivé figurky / pohyblivá divadla na orlojích — postavičky, které se v daný okamžik objeví, otočí, kývnou. Táborský používá pohrdlivě (\"tatrmani a jiných aparátův bystře a nákladně, ale neužitečně udělaných\") pro orloje, které jsou pouhou show bez astronomické funkce.

**Existující překlady:** EN: — · DE: — · FR: —

### Berner koncepty mapující na `tatrmani-aparat` (1)

#### Berner ID `171` — _apparatus_ n.

- **Aligned trio**: EN _apparatus_ · FR _appareil n. m._ · DE _Apparat m._
- **Špatný 1882 CZ**: přístroj, aparát
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> Machine, instrument or device used for various jobs. Demagnetising apparatus, watch-timing apparatus, etc. Syn. or equiv.: device. Ultrasound device. Projector, for inspecting gears.
>

**Berner všechny synonyma:**
- EN (1): apparatus
- DE (1): Apparat
- FR (1): appareil

**🎯 Doporučený enrichment do `tatrmani-aparat.md`**:

- `prekladyEn` doplnit: `apparatus`
- `prekladyDe` doplnit: `Apparat`
- `prekladyFr` doplnit: `appareil`
- **Definice**: heslo je `isStub` — Berner výklad výše obsahuje plnou EN definici, kterou lze přeformulovat česky

---

## `vidlice` — vidlice

**Soubor**: `content/slovnik/vidlice.md`
**Kategorie**: hodinky
**isStub**: ✅ — heslo bez plné definice

**Existující definice:**

> **Středový převodový článek** v páčkovém (švýcarském) kroku náramkových a kapesních hodinek. Vidlice spojuje **[krokové kolo](/slovnik/krokove-kolo)** s **[setrvačkou](/slovnik/setrvacka)** — palety na jednom konci vidlice zachycují zuby krokového kola, zatímco druhý konec (= vlastní vidlice) komunikuje se safírovou tříhrannou paletkou na ose setrvačky. Tím přenáší **diskrétní impulsy** (jeden za …

**Existující překlady:** EN: pallet fork, lever · DE: Ankerklaue, Anker · FR: ancre à fourchette, fourchette

### Berner koncepty mapující na `vidlice` (2)

#### Berner ID `1598` — _fork_ n.

- **Aligned trio**: EN _fork_ · FR _fourche n. f._ · DE _Gabel f._
- **Špatný 1882 CZ**: vidlička; in Ankeruhren) hrot vodítka, h
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> In horology, a lever or rocker whose end resembles the prongs of a fork.
>
> Small fork-shaped lever. In a lever escapement: e is the lever and b is the fork, f is the notch of the fork or lever notch, and g are the horns. The fork carries the dart or guard pin h fixed into the block k.
>

**Berner všechny synonyma:**
- EN (1): fork
- DE (1): Gabel
- FR (1): fourche

**🎯 Doporučený enrichment do `vidlice.md`**:

- `prekladyEn` doplnit: `fork`
- `prekladyDe` doplnit: `Gabel`
- `prekladyFr` doplnit: `fourche`
- **Definice**: heslo je `isStub` — Berner výklad výše obsahuje plnou EN definici, kterou lze přeformulovat česky

---

#### Berner ID `1836` — _impulse_ n.

- **Aligned trio**: EN _impulse_ · FR _impulsion n. f._ · DE _Impuls m._
- **Špatný 1882 CZ**: popud, podnět, impuls; — Klang; kotva
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> I. Thrust exerted by a moving body on a stationary body causing the latter to move. impulse given by the wheel to the lever or pallets: in watchmaking, in a lever escapement, the impulse is the action of the escape wheel tooth (impulse face a) on the pallet (impulse face b). In the Swiss lever escapement, the impulse is given on the two faces a and b. The impulse angle α is the angle through which the lever moves between the first contact (continuous lines) of the tooth on the impulse face and the last contact (dotted lines). This angle varies between 8 and 10°. The fork transmits the impulse to the impulse pin. The angle through which the balance travels during the impulse is the "angle of lift" of the balance, which is between 30 and 40°.
>
> II. pulse. In electronics, a pulse is a brief and rapid variation of an electrical state, often used as a signal. The motors of quartz watches are generally activated once per second by a short electric pulse with a duration of around 10 ms.
>

**Berner všechny synonyma:**
- EN (4): impulse, impulse given by the wheel to the lever, impulse given by the wheel to the pallets, pulse
- DE (3): Impuls, Impuls Rad auf Anker, Impuls Rad auf Paletten
- FR (3): impulsion, impulsion roue à ancre, impulsion roue à palettes

**🎯 Doporučený enrichment do `vidlice.md`**:

- `prekladyEn` doplnit: `impulse`, `impulse given by the wheel to the lever`, `impulse given by the wheel to the pallets`, `pulse`
- `prekladyDe` doplnit: `Impuls`, `Impuls Rad auf Anker`, `Impuls Rad auf Paletten`
- `prekladyFr` doplnit: `impulsion`, `impulsion roue à ancre`, `impulsion roue à palettes`
- **Definice**: heslo je `isStub` — Berner výklad výše obsahuje plnou EN definici, kterou lze přeformulovat česky

---

## `vlasek` — vlásek

**Soubor**: `content/slovnik/vlasek.md`
**Kategorie**: mechanika

**Existující definice:**

> Tenká spirálová pružinka navinutá v kotouči nad setrvačkou; vrací setrvačku do středové polohy a tím udržuje její pravidelné rotační kmity.

**Existující překlady:** EN: hairspring, balance spring · DE: Spirale, Unruhspirale · FR: spiral

### Berner koncepty mapující na `vlasek` (3)

#### Berner ID `765` — _counting_ n.

- **Aligned trio**: EN _counting_ · FR _comptage n. m._ · DE _Zählen n._
- **Špatný 1882 CZ**: f., Spiralfeder vlásek
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> Action and result of counting. counting of a balance-spring: operation of determining the proper length of a spring coupled to a balance; it must give the balance the required count, or number of vibrations. The counting of balance-springs may be done automatically or semi-automatically by means of electronic apparatus such as a Spirograf or Spiromatic. counting-point: point indicating the active length of the balance-spring; it should lie between the curb-pins when the spring is in position. sequential counting: see lap time 3257.
>

**Berner všechny synonyma:**
- EN (4): count-point, counting, counting of a balance-spring, sequential counting
- DE (4): Abzählen der Spirale, sequenzielle Zählung, Zählen, Zählpunkt
- FR (4): comptage, comptage du spiral, comptage séquentiel, point de comptage

**🎯 Doporučený enrichment do `vlasek.md`**:

- `prekladyEn` doplnit: `count-point`, `counting`, `counting of a balance-spring`, `sequential counting`
- `prekladyDe` doplnit: `Abzählen der Spirale`, `sequenzielle Zählung`, `Zählen`, `Zählpunkt`
- `prekladyFr` doplnit: `comptage`, `comptage du spiral`, `comptage séquentiel`, `point de comptage`

---

#### Berner ID `2364` — _number_ n.

- **Aligned trio**: EN _number_ · FR _numéro n. m._ · DE _Nummer f._
- **Špatný 1882 CZ**: f., Spiralfeder vlásek
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> Number affixed to an object, a label, the pages of a journal, book, etc. to indicate its position in a series.serial number or serial no.: unique number which is assigned to one of a series in order to identify it. It plays an essential role in quality control and after-sales service, but also in traceability and the prevention of counterfeiting. This number can be intentionally hidden or written in the protected memory of an electronic circuit. A watchcase usually bears a number. It is compulsory to mark numbers on the movements of watches submitted to observatories and control offices, as well as those intended for export. number of a terminal curve: number determined by the formula: whered = distance between the index pins and the balance staff;r = radius of the balance spring at the beginning of the curve.number of a balance spring: number that depends on the strength and diameter of the spring. It is independent of the length of the balance spring.
>

**Berner všechny synonyma:**
- EN (5): number, number of a balance-spring, number of a terminal curve, serial No., serial number
- DE (5): Nummer, Nummer einer Endkrümmung, Nummer einer Spirale, Serien-Nr., Seriennummer
- FR (5): numéro, numéro d'un spiral, numéro d'une courbe terminale, numéro de série, N° de série

**🎯 Doporučený enrichment do `vlasek.md`**:

- `prekladyEn` doplnit: `number`, `number of a balance-spring`, `number of a terminal curve`, `serial No.`, `serial number`
- `prekladyDe` doplnit: `Nummer`, `Nummer einer Endkrümmung`, `Nummer einer Spirale`, `Serien-Nr.`, `Seriennummer`
- `prekladyFr` doplnit: `numéro`, `numéro d'un spiral`, `numéro d'une courbe terminale`, `numéro de série`, `N° de série`

---

#### Berner ID `2621` — _flatness_ n. and adj.

- **Aligned trio**: EN _flatness_ · FR _plat, plate n. m. et adj._ · DE _flach Adj._
- **Špatný 1882 CZ**: plocha; nakloněná plocha; plochý, ploský; flaches jungen)
- **Mapping**: fuzzy_de (Berner DE compound head v `prekladyDe`)

**Berner EN definice:**

> I. n. flatness. Property of what is flat or moves on a plane. To lay a watch down flat.to true a wheel in the flat: to turn it between centres and check for flatness with a fixed pointer. See out of truth in the flat 2068.to plane a surface: to file or mill a flat surface on a cylindrical rod.
>
> II. adj. flat. Synonym of horizontal, or thin, and not curved. A thin pocket watch. A flat file, flat plate.to file flat: to file so as to obtain a flat surface, neither concave nor convex.extra-thin watch: see extra-thin watch 2256.timing in the flat position: i.e. In the horizontal position.flat balance spring: see historical balance springs 3140.
>

**Berner všechny synonyma:**
- EN (7): flat, flat balance spring, flatness, plane a surface, timing in the flat position, to file flat, to true a wheel in the flat
- DE (6): das Flachlaufen eines Rades prüfen, ebene Fläche, flach, flach feilen, flache Spirale, réglage plat
- FR (6): limer plat, plat, plate, réglage plat, spiral plat, surface plane, vérifier le plat d'une roue

**🎯 Doporučený enrichment do `vlasek.md`**:

- `prekladyEn` doplnit: `flat`, `flat balance spring`, `flatness`, `plane a surface`, `timing in the flat position`, `to file flat`, `to true a wheel in the flat`
- `prekladyDe` doplnit: `das Flachlaufen eines Rades prüfen`, `ebene Fläche`, `flach`, `flach feilen`, `flache Spirale`, `réglage plat`
- `prekladyFr` doplnit: `limer plat`, `plat, plate`, `réglage plat`, `spiral plat`, `surface plane`, `vérifier le plat d'une roue`

---

## `vocel` — vocel (ocel)

**Soubor**: `content/slovnik/vocel.md`
**Kategorie**: materialy
**isStub**: ✅ — heslo bez plné definice

**Existující definice:**

> Staročeský pravopis slova *ocel* — s protetickým *v-* na začátku, typickým rysem 16. století. Táborský zdůrazňuje výhody nové oceli oproti zastaralému kalenému železu pro výrobu herštuků (ložisek) a tryblíků (pastorků).

**Existující překlady:** EN: — · DE: — · FR: —

### Berner koncepty mapující na `vocel` (1)

#### Berner ID `20` — _steel_ n.

- **Aligned trio**: EN _steel_ · FR _acier n. m._ · DE _Stahl m._
- **Špatný 1882 CZ**: ocel
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> Metal alloy [Fe-C]; specific gravity: 7.8; melting point: between 1460 and 1550°C depending on the % of carbon content; coefficient of expansion: 11·10-6; modulus of elasticity: between 200 and 220 GPa. Iron combined with a small quantity of carbon. Various types of steel with different properties can be obtained using different treatments, production methods and additives. In French watchmaking, les aciers refers to all steel parts in a watch, e.g. levers, index screws, etc. Polisher of aciers.magnet steels: alloys of steel and tungsten, more recently replaced with other substances, such as cobalt, titanium, or aluminium (ticonal 38), enabling smaller magnets with stronger magnetic properties to be made. carbon steels: iron with added carbon. When the carbon content exceeds 0.4%, steel can be quench hardened. These types of steel are classified according to their properties, which in turn depend on their carbon content.ingot iron and mild steel: iron with between 0.3 and 0.4% added carbon. Used in electro-magnets and for making nails and rivets. semi-hard steels: iron with between 0.4 and 0.6% added carbon. Used in driving shafts and bent pressings. hard steels: iron with between 0.6 and 0.8% added carbon. Used for making screws, pinions and other watch parts that do not require extreme hardness. very hard and extra hard steels: iron with between 0.8 and 1.5% added carbon. Used for making springs, milling-cutters, files, gravers and other tools. steels for automatic lathes: used for certain machine-made parts. stainless steels: iron/nickel/chrome alloy, unalterable and malleable; it cannot be hardened, but can be given a highly polished finish. Used in the manufacture of watchcases. nickel steels: alloys of steel and nickel are classified either as irreversible (nickel alloy steels or nickel steel) and reversible (ferronickels). The former contain less than 27% nickel. Different types of treatments, production methods and additives will produce different types of steel with different properties. Some nickel steels have properties that are useful in watchmaking. See Guillaume Charles-Edouard 1765. high-speed steels: alloys containing between 0.4 and 1.5% carbon, 2 and 6% chrome and 10 and 20% tungsten. These steels are extremely hard and also retain their hardness at high cutting speeds. Chips removed by high-speed steel gravers can become red hot without affecting the hardness of the tool. special steels: alloys containing additives other than carbon, such as chrome, manganese, molybdenum, silicon, tungsten, nickel, glucinium, etc. They are particularly resistant to wear, oxidation, magnetisation and shocks. Bessemer steel: cast steel obtained using a Bessemer converter. The pig iron is completely decarburised and, manganese pig iron, for example, is then added to obtain the required quantity of carbon. cementation steel or cemented steel: obtained by case-hardening iron using a cement. wrought steel: obtained by working hot masses together and not by smelting. pinion wire: drawn steel rod with longitudinal grooves, whose profiles roughly correspond to those of the pinion leaves. These leaves are then given their final form by running a cutter along the grooves. Watchmakers made pinions in this way before pinion-cutting machines were introduced. knurled steel: used for making the shanks of small tools, such as screwdrivers, cutters and oil pikes. The grooves are generally lozenge-shaped. Damascus steel: a heterogeneous steel known as Damascus wrought steel, made using several different grades of steel which are welded and forged together to create more or less complex patterns. The modern fabrication process is employed to improve the aesthetic appearance of certain objects in watchmaking. The name is borrowed from the historic high-quality "Damascus Wootz steel", which was made in many Eastern countries using ancient traditional techniques. Despite their superficial resemblance, these are two different types of materials associated with very different manufacturing methods and properties. Syn. or equiv.: Damask steel.
>

**Berner všechny synonyma:**
- EN (19): Bessemer steel, carbon steels, cementation steel, cemented steel, Damascus steel, hard steels, high speed steels, ingot iron and mild steels, knurled steel, magnet-steels, nickel-steels, pinion wire, semi-hard steels, special steels, stainless steels, steel, steels for automatic lathes, very hard and extra hard steels, wrought steel
- DE (19): Automatenstähle, Bessemerstahl, Damaszenerstahl, Einsatzstahl, extraweiche und weiche Stähle, halbharte Stähle, Hartstähle, Kohlenstoffstähle, Magnetstähle, mit der Rändelscheibe geriffelter Stahl, nicht rostende Stähle, Nickelstähle, Rillenstahl für Triebe, Schnellstähle, Schweissstahl, sehr harte und extraharte Stähle, Spezialstähle, Stahl, Zementstahl
- FR (19): acier, acier Bessemer, acier cannelé à la molette, acier cannelé pour pignons, acier cémenté, acier de cémentation, acier de damas, acier soudé, aciers à aimant, aciers au carbone, aciers de décolletage, aciers demi-durs, aciers durs, aciers extra-doux et doux, aciers inoxydables, aciers rapides, aciers spéciaux, aciers très durs et extra-durs, aciers-nickel

**🎯 Doporučený enrichment do `vocel.md`**:

- `prekladyEn` doplnit: `Bessemer steel`, `carbon steels`, `cementation steel`, `cemented steel`, `Damascus steel`, `hard steels`, `high speed steels`, `ingot iron and mild steels`, `knurled steel`, `magnet-steels`, `nickel-steels`, `pinion wire`, `semi-hard steels`, `special steels`, `stainless steels`, `steel`, `steels for automatic lathes`, `very hard and extra hard steels`, `wrought steel`
- `prekladyDe` doplnit: `Automatenstähle`, `Bessemerstahl`, `Damaszenerstahl`, `Einsatzstahl`, `extraweiche und weiche Stähle`, `halbharte Stähle`, `Hartstähle`, `Kohlenstoffstähle`, `Magnetstähle`, `mit der Rändelscheibe geriffelter Stahl`, `nicht rostende Stähle`, `Nickelstähle`, `Rillenstahl für Triebe`, `Schnellstähle`, `Schweissstahl`, `sehr harte und extraharte Stähle`, `Spezialstähle`, `Stahl`, `Zementstahl`
- `prekladyFr` doplnit: `acier`, `acier Bessemer`, `acier cannelé à la molette`, `acier cannelé pour pignons`, `acier cémenté`, `acier de cémentation`, `acier de damas`, `acier soudé`, `aciers à aimant`, `aciers au carbone`, `aciers de décolletage`, `aciers demi-durs`, `aciers durs`, `aciers extra-doux et doux`, `aciers inoxydables`, `aciers rapides`, `aciers spéciaux`, `aciers très durs et extra-durs`, `aciers-nickel`
- **Definice**: heslo je `isStub` — Berner výklad výše obsahuje plnou EN definici, kterou lze přeformulovat česky

---

## `vos` — vos (osa)

**Soubor**: `content/slovnik/vos.md`
**Kategorie**: mechanika
**isStub**: ✅ — heslo bez plné definice

**Existující definice:**

> Staročeský pravopis slova *osa* — s protetickým *v-* na začátku. Charakteristický pravopisný rys češtiny 16. století.

**Existující překlady:** EN: — · DE: — · FR: —

### Berner koncepty mapující na `vos` (1)

#### Berner ID `283` — _axis_ n.

- **Aligned trio**: EN _axis_ · FR _axe n. m._ · DE _Achse f._
- **Špatný 1882 CZ**: osa; 2
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> Ideal part or line around which an organ, a figure, or one or more elements rotate. The axle of a wheel or pinion. Syn. or equiv.: arbor, staff. A balance staff and a barrel arbor. balance staff: axle comprising: the plate or seat a on which the balance is riveted; the pivot shank b on which the ferrule is fixed; the pivot shank c on which the plate is fixed; the upper conical pivot d; the lower conical pivot e. pointed staff: used in alarm clocks and inexpensive watches. rotor staff: see pinion 2575.
>

**Berner všechny synonyma:**
- EN (4): axis, balance-staff, pointed staff, rotor shaft
- DE (4): Achse, Rotorwelle, Unruhwelle, Welle mit Spitzen
- FR (4): axe, axe de balancier, axe de rotor, axes à pointes

**🎯 Doporučený enrichment do `vos.md`**:

- `prekladyEn` doplnit: `axis`, `balance-staff`, `pointed staff`, `rotor shaft`
- `prekladyDe` doplnit: `Achse`, `Rotorwelle`, `Unruhwelle`, `Welle mit Spitzen`
- `prekladyFr` doplnit: `axe`, `axe de balancier`, `axe de rotor`, `axes à pointes`
- **Definice**: heslo je `isStub` — Berner výklad výše obsahuje plnou EN definici, kterou lze přeformulovat česky

---

## `vreteno-orloje` — vřeteno (orlojní)

**Soubor**: `content/slovnik/vreteno-orloje.md`
**Kategorie**: mechanika
**isStub**: ✅ — heslo bez plné definice

**Existující definice:**

> U Táborského 1570 *vřeteno* označuje drobný hřídelík (typicky nesoucí měsíc nebo malý indikátor). Synonymum: *hřídelík*. Pozor: nezaměňovat s moderním hodinářským *vřetenovým krokem* (= 13. st. typ kroku).

**Existující překlady:** EN: — · DE: — · FR: —

### Berner koncepty mapující na `vreteno-orloje` (1)

#### Berner ID `460` — _brooch_ n.

- **Aligned trio**: EN _brooch_ · FR _broche n. f._ · DE _Brosche f._
- **Špatný 1882 CZ**: vřeteno; Spindel
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> I. Piece of jewellery, generally fastened to a garment by a pin. See brooch watch or lapel watch 2256.
>
> II. runner. A runner is an accessory that holds the tool or the workpiece. e.g. in a machine, a lathe. Syn. or equiv.: spindle.1. Runner, each end of which is made to take a detachable chuck or safety attachment a. 2. Runner fitted with safety discs b for burnishing the heads of pivot-ends. 3. Jacot tool runner fitted with pivot beds, for burnishing pivots. 4. Runner with a grooved ferrule c and carrier pin d. 5. Runner with an eccentric ferrule e.
>

**Berner všechny synonyma:**
- EN (2): brooch, runner
- DE (2): Brosche, Spindel
- FR (1): broche

**🎯 Doporučený enrichment do `vreteno-orloje.md`**:

- `prekladyEn` doplnit: `brooch`, `runner`
- `prekladyDe` doplnit: `Brosche`, `Spindel`
- `prekladyFr` doplnit: `broche`
- **Definice**: heslo je `isStub` — Berner výklad výše obsahuje plnou EN definici, kterou lze přeformulovat česky

---

## `vrub-zub` — vrub (vroubek, zub)

**Soubor**: `content/slovnik/vrub-zub.md`
**Kategorie**: mechanika
**isStub**: ✅ — heslo bez plné definice

**Existující definice:**

> Mezera mezi zuby kola, nebo synonymně i samotný zub. Táborský zaměnitelně používá *vrub*, *vroubek*, *zub* a *zoubek*.

**Existující překlady:** EN: — · DE: — · FR: —

### Berner koncepty mapující na `vrub-zub` (1)

#### Berner ID `721` — _notch_ n.

- **Aligned trio**: EN _notch_ · FR _coche n. f._ · DE _Kerbe f._
- **Špatný 1882 CZ**: vrub
- **Mapping**: strict (modernized Špatný → titul slugu)

**Berner EN definice:**

> Slot or opening, variable in shape. Syn. or equiv.: nick, slot See nick 1341.
>
> I. Nick for hanging, closing or stopping. stop notch: cut that immobilises an organ or prevents a mechanism from functioning.
>
> II. Groove. snap fitting: circular groove b, triangular in shape, in which a cylinder cover a or a mirror fits by pressure. In a snap fitting, one of the elements must be slightly flexible to enable the fitted part to be forced into position.
>

**Berner všechny synonyma:**
- EN (1): notch
- DE (1): Kerbe
- FR (1): coche

**🎯 Doporučený enrichment do `vrub-zub.md`**:

- `prekladyEn` doplnit: `notch`
- `prekladyDe` doplnit: `Kerbe`
- `prekladyFr` doplnit: `coche`
- **Definice**: heslo je `isStub` — Berner výklad výše obsahuje plnou EN definici, kterou lze přeformulovat česky

---

