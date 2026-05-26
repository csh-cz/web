# Fyzikální poznámky per krok

Doporučené hodnoty pro jednotlivé typy kroků — vychází z literatury (Saunier 1875, Britten 1899, Headrick 2002, Rawlings 1993) + Wikipedia.

## Grahamův klidový krok (deadbeat) — REFERENCE PILOT

Plně implementován jako pilot. Viz `apps/hodinarium-eu/public/img/kroky/grahamuv-krok-animace.svg`.

| Parametr | Hodnota |
|---|---|
| Typ palety | Klidová (lock face = kruhový oblouk soustředný s pivot, impulse face = úkos) |
| Amplituda kyvadla (animace) | ±6° (reálné ±1,5–2,5°) |
| Perioda kyvadla | 4 s (reálné regulátory 2 s) |
| Tick wheel | discrete, 12° (1 zub) za půlperiodu |
| Lock fáze | ~80% času (kolo stojí) |
| Impulse fáze | ~15% času |
| Drop angle | ~2° kola |
| Směr rotace kola | CW |
| Helper arcs | r=243 (left OUTER), r=222 (right INNER) od pivot (242, 42.7) |

## Vretenový krok (verge escapement)

Nejstarší typ (před 1670). Specifika:

- **2 palety v kolmé orientaci** (vertical pallets na verge — svislé hřídeli)
- **Foliot** (vahadlo) namísto kyvadla — vodorovné rameno s nastavitelnými závažími
- **Vysoká amplituda** ±50° i víc (NEROVNOMĚRNĚ — vahadlo se zastavuje a obrací)
- **Vždy recoil** — kolo COUVÁ při lock fázi (žádná klidová plocha)
- Geometrie: krokové kolo s **2 sadami zubů na opačných stranách**, paletky orientované perpendiculárně (90°)
- Časování: tick každých ~0,5–1 s (rychlejší než pendulum)

Pozn.: pro animaci foliotu místo kyvadla — horizontální oscilace, ne svislá tyč.

## Kotvový vratný krok (recoil anchor escapement, Hooke 1666)

| Parametr | Hodnota |
|---|---|
| Typ palety | Vratná — palet má PLOCHÉ lock face (ne kruhový oblouk) → tečná síla nenulová → kolo COUVÁ |
| Amplituda | ±3–4° (větší než deadbeat kvůli recoil ztrátám) |
| Perioda | 2 s (typicky pro seconds pendulum) |
| Tick | 1 zub za půlperiodu |
| **Recoil** | **Kolo se vrací o ~0,5° při lock** (vizualizovat!) |
| Drop | ~1–2° |
| Helper arc | NENÍ (lock face není kruhový — paleta je plochá rovina) |

Klíčová vizualizační odlišnost od Grahama: **animace musí ukázat zpětný posun kola při lock fázi** (např. kolo skočí +12°, pak při dolazení kotvy do extrému couvne o -0,5° = recoil).

## Robertův krok (kolíčková varianta deadbeat, CZ specifikum)

- Vychází z Grahama, ale místo **zubů** má krokové kolo **kolíky** (cylindrical pins) ven z disku
- Palety nemají úkos — jsou tvořené **dvěma kolíky** na kotvě které střídavě zachycují kolíky kola
- Geometrie identická jako Graham, jen vizualizace kolíků
- Lock geometry stejná (kruhové oblouky soustředné s pivot)
- Časování stejné jako Graham

## Mannhardtův krok (gravitační, free escapement)

- **Free escapement** — kyvadlo NENÍ pevně spojeno s krokovým kolem; impulse se předává přes gravitační rameno (gravity arm)
- 2 ramena se střídavě zvedají vahou; když se kotva uvolní, padá rameno = předává impulse kyvadlu
- Vizualizace: tři pohyblivé části (krokové kolo + 2 gravity ramena + kyvadlo)
- Časování: tick každých 1–2 s

## Chronometrový krok (detent / chronometer escapement)

- **Spring detent** — pružinová "závora" co se ohýbá pro uvolnění/zachycení zubu
- **Impulse jen jednou za perioda** (ne dvakrát) — proto vyšší přesnost
- Používá se v lodních chronometrech (marine chronometer)
- Geometrie: krokové kolo + detent paletka + impulse paletka + balance wheel (ne kyvadlo)
- Vizualizace: balance wheel místo kyvadla, ohýbací pružinová paletka

## Lévékův krok (lever escapement, modern watch standard)

- Most common watch escapement (90% mechanických hodinek)
- 2 paletky (entry/exit) na lever ramenu, ramena na balanc wheel
- Klidová + impulse face (jako Graham, ale na lever, ne přímo na anchor)
- Geometrie kotvy = "lever" tvar (T-shape), ne V
- Vizualizace: balance wheel (kruhový) místo kyvadla

## Cylindrový krok (cylinder escapement, Graham 1726 pro watch)

- Watch-only (žádné věžní hodiny)
- Polovina otevřeného válce funguje jako jediná "paleta"
- Velmi citlivý na opotřebení
- Geometrie zcela odlišná od anchor types
- Časování: rychlé tick (~5 Hz pro watch)

## Pin-pallet (Roskopf, levné hodinky)

- Variant lever escapement s **ocelové kolíky** místo rubínových palet
- Méně přesný ale levný
- Vizualizace: jako lever, jen kolíky místo úkosových palet

---

## Univerzální workflow per nový krok

1. **Identifikuj typ**:
   - Recoil (kolo couvá při lock) vs Deadbeat (kolo stojí)?
   - Anchor/lever (pendulum) vs verge (foliot) vs balance wheel?
   - Free escapement (mezilehlé rameno) vs direct?
2. **Najdi referenci** v Wikipedia + Saunier/Britten
3. **Skopíruj template.svg**, upraviv:
   - viewBox + paletu zachovat
   - Geometrie wheel + anchor přepsat (Wikimedia PD path nebo vlastní kresba)
   - Helper arcs vypočítat (pro recoil typy možná chybí — flat lock face)
   - Animation upravit per typ:
     - Recoil: přidat zpětný posun při lock
     - Verge: foliot oscilace, žádné kyvadlo
     - Free escapement: třetí animated group (gravity arm)
4. **Verifikace v Chromu** (NIKDY jen rsvg-convert)
5. **Commit + push**
