# Tier C — review batches (Špatný kandidát, bez existujícího slugu)

Celkem **440 konceptů** z Berner FHS, které mají Špatný 1882 kandidát ale ještě nemají heslo v `content/slovnik/` napřímo přes prekladyEn/De/Fr.

**Po revizi 2026-05-26** rozděleno na:
- **422 skutečně nových konceptů** (bez překryvu s existujícími hesly, clock-relevantní) — v 9 batchích po max 50
- **31 překryvných konceptů vyřazeno** — patří k existujícím heslům, viz `slovnik-tierC-overlap-enrichment.md`
- **18 hodinkových-specifik vyloučeno** — viz appendix na konci tohoto indexu (kontrola filtru)

Řazeno abecedně podle prvního EN/FR/DE termínu.

**Fokus** clock-making — věžní, interiérové, elektrické hodiny. Hodinky se vyloučí, pokud koncept obsahuje markery jako: `Armbanduhr / wristwatch / Taschenuhr / Tourbillon / bezel / bracelet / case-back / power-reserve indicator / water-resistant / Incabloc / etc.` Override (ponechá se): pokud termín zmiňuje **`clock / horloge / Standuhr / Turmuhr / Pendeluhr / Regulator / Räderwerk / Pendel / Schlagwerk / orloj`** atd.

## Moderní CZ — automatická modernizace

Pro každý řádek je **navržen `Moderní CZ`** jako kombinace:
1. **Lookup proti existujícím 157 heslům** (titles + varianty + redirectTo) — když Špatný kandidát po normalizaci sedí, vrátí se canonical slug + title.
2. **Rule-based modernizace archaismů**: 161 substitucí (zpruha→pružina, kotvičné kolo→krokové kolo, chod kotvičný→kotvový krok, ciferník→číselník, ručka koncovky -iti→-it, atd.).
3. **Lookup proti 3 moderním učebnicím** (text-stem search, accent-folded):
   - **B** = Bureš 1965, _Hodinové stroje I_ (Zotero `G8KJDSAC`)
   - **S** = Sušický 1900, _Hodinářství. Pro praktickou potřebu_ (Zotero `V4C6HXI4`)
   - **M** = Martínek & Řehoř 1964, _Základy hodinářství_ (Zotero `ENIN3P86`)
4. **Unchanged**: pokud žádné pravidlo nesedí, žádný canonical match a žádná z 3 učebnic → ponecháno doslova jako kandidát k expertizu.

**Confidence značky** (s indikací zdroje [B/S/M]):
- ✅ **existující heslo** — namatchoval existující slug v `content/slovnik/`
- 🔧📚 **modernizace pravidlem + potvrzeno** [B/S/M] — pravidlo aplikováno a výsledek je v učebnici/cích
- 🔧 **modernizace pravidlem** — bez potvrzení v učebnicích (k ověření)
- 📚 **v moderní učebnici** [B/S/M] — Špatný termín beze změny v učebnici/cích
- ⚪ **k ověření** — Špatný termín se nenašel ani v jedné z 3 učebnic, ani žádné pravidlo nesedí
- ⚠️ **jen fragment** — Špatný kandidát neúplný

### Statistika modernizace (přes 422 clock-relevantních řádků)

| Confidence | Počet | Akce |
|---|---:|---|
| ✅ exact-canonical | 10 | `[~]` synonymum existujícího hesla |
| 🔧📚 rule-based + potvrzeno | 15 | `[x]` nové heslo (vysoká jistota) |
| 🔧 rule-based | 5 | `[x]` nové heslo (k ověření) |
| 📚 in-modern | 246 | `[x]` nové heslo (potvrzeno v 1+ moderní učebnici) |
| ⚪ unchanged | 145 | k expertizu — možná zastaralý / specifický termín |
| ⚠️ trim-fragment | 1 | `[?]` expert |

**Poznámka**: pokud je `exact-canonical` > 0, znamená to že auto-match přes EN/FR/DE nezachytil hesla, kterým Špatný CZ ale odpovídá. Pro tyto řádky doporučujeme `[~]` synonymum (rozšířit prekladyDe v existujícím hesle).

## Postup review

Pro každý řádek v batchu zaškrtnout volbu:

- **`[x]`** = chci nové heslo. Pokud Moderní CZ návrh sedí, jen potvrzuje; jinak vyplnit `Korekce` s vlastním slugem.
- **`[~]`** = uložit jen jako synonymum existujícího hesla. Vyplnit `Korekce` slugem do kterého doplnit.
- **`[?]`** = otázka pro experta (Skála / Knespl). Vyplnit `Pozn.`.
- **`[ ]`** (nevyplněno) = vynechat / vrátit se k tomu později.

Po projetí všech batchů spustím **Fázi 2** (Berner full definice pro vybrané) a **Fázi 3** (doplnění `prekladyXx` u Tier A).

## Index batchů

- [Batch 01](slovnik-master-clockmaking-tierC-batch-01.md) — řádky 1–50 (absorption drying … barometric coefficient of a watch or clock)
- [Batch 02](slovnik-master-clockmaking-tierC-batch-02.md) — řádky 51–100 (barrel-cover … cardinal points)
- [Batch 03](slovnik-master-clockmaking-tierC-batch-03.md) — řádky 101–150 (carrier … cutting edge)
- [Batch 04](slovnik-master-clockmaking-tierC-batch-04.md) — řádky 151–200 (cylinder plug … English lever escape-wheel tooth)
- [Batch 05](slovnik-master-clockmaking-tierC-batch-05.md) — řádky 201–250 (engrener … hinge)
- [Batch 06](slovnik-master-clockmaking-tierC-batch-06.md) — řádky 251–300 (hole … montre à heures sautantes)
- [Batch 07](slovnik-master-clockmaking-tierC-batch-07.md) — řádky 301–350 (Montres & Bijoux de Genève … refendre)
- [Batch 08](slovnik-master-clockmaking-tierC-batch-08.md) — řádky 351–400 (remove file-strokes … time scale)
- [Batch 09](slovnik-master-clockmaking-tierC-batch-09.md) — řádky 401–422 (time-taker … wobble)

---

## Klíčové archaismy Špatný → moderní (pro orientaci)

| Špatný 1882 | Moderní (Martínek 1964 / Sušický 1900) |
|---|---|
| zpruha | pružina |
| kotvičné kolo / kolo chodové | krokové kolo |
| chod kotvičný | kotvový krok |
| kolo čelní / čelník (Učník) | korunové kolo |
| perovník / kolo bubínkové | buben pružiny |
| lihýř | foliot / vahadlo |
| nepokoj | setrvačka |
| krokoměr (= pedometr) | chronometr (přesné hodiny) |

OCR poznámka: `Č/č` ↔ `U` zaměněn u některých slov (Učník = čelník = korunové kolo).
Ale `Učník` může být i historický termín — neopravovat doslovně, ponechat jako kandidát.

---

## Appendix — vyloučené hodinkové koncepty (18)

**Tyto koncepty byly automaticky vyloučeny** jako hodinky-specifické (obsahují markery jako _wristwatch / Taschenuhr / Tourbillon / bezel / bracelet / case-back / Incabloc / power-reserve / atd._ a zároveň nezmiňují clock-marker jako _clock / horloge / Standuhr / Turmuhr / Pendel / Räderwerk / Schlagwerk_).

Pokud něco z níže uvedeného **přesto chceš zařadit do velkých hodin**, dej vědět — vyjmu z exclusion filtru a vrátí se do batchů.

| ID | EN | DE | Špatný CZ | Důvod (hodinky markers) |
|---|---|---|---|---|
| 2130 | alarm mechanism; chronograph-mechanism | Aufzugsmechanismus; Chronographenmechanismus | strojba; ústroj- nosť; mechanismus | `chronograph` |
| 160 | antique; antique repeating-work | antik; antike Repetition | opakování; opěto vání | `repeating-work` |
| 2696 | application of luminous paint; dial-fitting | Aufsetzen der Zeiger; Auftragen von Leuchtsalzen | ručka; ručička | `luminous paint` |
| 3059 | atomic second; centre seconds | Antriebssekunde; atomare Sekunde | sekunda; vteřina | `chronograph` |
| 2223 | automatic electronic time setting; bezel setting | elektronische automatische Zeiteinstellung; elektronische Zeiteinstellung | hodiny / tah | `bezel` |
| 641 | balance-jewel setting; false setting | „Chaton“; Chaton mit flachem Lagerstein | zácel; Futter des | `balance-jewel` |
| 434 | bangle wristlet; bracelet with a cover | Armband; Armband mit Deckel | (beim Gehäuse) springt auf víčko (u pouzdra) vyskočilo; vymrštilo se / víko | `wristwatch` |
| 2992 | bevel wheel; chronograph wheel | Chronographenrad; Freilaufrad | kolo zavírací; ko lo zpěrací; zpírací; kolo zá- kladkové / kolo | `chronograph` |
| 415 | bush; jewelled bushing | Futter; Steinfutter | zácel; Futter des / kamínek s dírkou | `jewelled bushing` |
| 823 | cap-jewel; endstone | Deckstein | krycí kamínek; náčepní kamínek | `cap-jewel` |
| 397 | case shape; dustproof case | Armbanduhrgehäuse; dreiteiliges Armbanduhrgehäuse | ) kroužek / pouzdro kryté | `wristwatch` |
| 724 | chronograph heart; heart-piece | Chronographenherz; Herz | unášeč; vodič | `chronograph` |
| 2789 | date watch; day of the month | Datumsuhr; Day-Date-Kalender | kalendář | `day-date` |
| 1911 | fork gauge; jewel-hole gauge | Dickenlehre; Endmass | rozpor | `jewel-hole` |
| 1995 | hand-lever; lever-tools | Hebel; Hebel des Schleppzeigers | páka; einarmiger / páka jednoramená; gleicharmiger Hebel páka rovnoramená; krummliniger | `split-seconds` |
| 3083 | jewel-setting tool | Fassungsschliesser | zavěrač obrub | `jewel-setting` |
| 3080 | to set a diamond; to set a watch-jewel | einen Diamant fassen; einen Uhrenstein einsetzen | chopiti; uchopiti; Steine f / zasaditi | `watch-jewel` |
| 3306 | tonneau calibre; tonneau case | Fass; Schrott produzieren | ) kroužek / ráž; kalibr | `tonneau` |
