# Zadání pro dedikovanou session: doložit věžní hodiny u budov Hainz 1904

Prompt pro samostatnou agentskou session, která bude webově dohledávat a ověřovat
doklady o věžních/veřejných hodinách u budov identifikovaných v mapě
[`/hainz-1904`](../apps/hodinarium-eu/src/pages/hainz-1904.astro). Zkopíruj obsah
bloku níže jako úvodní zprávu nové session.

Kontext vzniku a poučení viz `docs/hainz-1904-vyzkum-budov.md`,
`docs/hainz-1904-odpoved-nastroji.md`, `docs/ruian-geokodovani.md`.

---

````
# Úkol: doložit věžní hodiny u identifikovaných budov v mapě Hainz 1904

Pracuješ v repu orlojWeb (/Users/dknespl/Developer/orlojWeb), pipeline
zdroje/Hainz/pipeline/. Stavíme interaktivní mapu /hainz-1904 a soupis pro výstavu
Národního technického muzea o pražské hodinářské firmě Ludwig Hainz (190 let od
založení, 1836). Data jdou na výstavu → přesnost > objem.

Cíl: u budov, kam firma podle firemního letáku z roku 1904 dodala věžní/veřejné
hodiny, najít a OVĚŘIT doklady o těch hodinách na webu — hlavně dochování stroje
a jmenovité doložení firmy L. Hainz — a zapsat POTVRZENÉ nálezy.

## Nejdřív si přečti (v tomto pořadí)
1. docs/hainz-1904-vyzkum-budov.md — jak probíhal dosavadní výzkum budov.
2. docs/hainz-1904-odpoved-nastroji.md — pravidla čtení letáku (klíč k homonymům).
3. docs/ruian-geokodovani.md — RÚIAN, kdyby bylo potřeba řešit polohu/adresu.
4. zdroje/Hainz/pipeline/README.md a hlavičku build-data.py.

## Datový model — NIKDY needituj hainz1904.ts ručně
apps/hodinarium-eu/src/data/hainz1904.ts je GENEROVANÝ. Opravy piš do dictu VYZKUM
v zdroje/Hainz/pipeline/build-data.py (klíč = index záznamu v poli, shodný s
hainz1904-data.json), pak přegeneruj:
  cd zdroje/Hainz/pipeline && python3 build-data.py && python3 emit-ts.py
Ověř, že se změnil JEN cílový záznam: git diff apps/hodinarium-eu/src/data/hainz1904.ts

VYZKUM[idx] = {…} umí přepsat/přidat pole:
- pozn (český text popisku, věcně, se zdrojem),
- dolozenyStroj: 'zachovan' (původní Hainzův stroj dochován — zlatý prsten na mapě)
  nebo 'exponat' (přenesen do muzea),
- soupisSlug + dochovano: 'in_situ'|'muzeum' (pokud vznikne karta v našem soupisu),
- nejiste: None (smaže příznak) / nejiste: True (nastaví),
- lat/lon (jen pokud upřesňuješ polohu).

## Odkud čerpat leady
zdroje/Hainz/pipeline/vyzkum/web-leady-2026-07-08.json — 95 leadů z předchozí
(rozfoukané) rešerše, namapovaných na naše indexy. Pole zjisteni_NEOVERENA jsou
NEOVĚŘENÁ tvrzení včetně URL — každé MUSÍŠ potvrdit sám. 19 z nich tvrdí, že je
jmenován Hainz (začni jimi). Opařany (idx 244) je už hotové — přeskoč.
(Soubor je v gitignorovaném zdroje/, tj. jen lokálně na disku. Když ho nenajdeš,
kandidáty si vyber z hainz1904-data.json příkazem níže.)

Kandidáti (budovy bez informace o stroji), když leady dojdou:
  python3 -c "import json;d=json.load(open('hainz1904-data.json'));
  print([i for i,z in enumerate(d) if z['presnost']=='budova' and z['kategorie'] in
  {'sakralni','radnice','zamek','skola','instituce','nadrazi'} and not z.get('zaniklo')
  and not (z.get('dolozenyStroj') or z.get('soupisSlug') or 'stroj' in (z.get('pozn') or '').lower())])"

## ⚠️ Ověřovací disciplína (jádro úkolu — jde na výstavu)
- Každé tvrzení, které zapíšeš, MUSÍ mít URL, které jsi SKUTEČNĚ načetl (WebFetch),
  a doslovný úryvek, který ho dokládá. Ne co jsi viděl v search výsledcích.
- Nic nedomýšlej. „Nic jsem nenašel / nepotvrdilo se" je plnohodnotný výsledek.
- Buď skeptik: když zdroj říká něco podobného, ale ne totéž (jiný rok, jiná firma,
  „hodiny" = nástěnné, jiná budova), NEZAPISUJ.
- Předchozí rešerše HALUCINOVALA — např. tvrdila „radnice Žižkov je v referenci
  Hainz", což NENÍ pravda. Proto se každý lead ověřuje u zdroje.
- Obrazové PDF: WebFetch text nevytáhne, ale soubor uloží — přečti ho nástrojem
  Read (umí PDF). Takto byly ověřeny Opařany.

## Zdroje podle síly dokladu
1. lhainz.cz/reference — referenční seznam firmy. Autoritativní, ale POZOR: jsou to
   většinou DNEŠNÍ servisní zásahy (2000s), ne doklad původního stroje z 1904.
   Doloží vztah Hainz↔obec; do pozn piš „L. Hainz dnes udržuje…", dolozenyStroj
   z toho NEODVOZUJ (leda že zdroj mluví o původním stroji). Natáhni ho JEDNOU celý
   a udělej cross-match na naše obce — to je nejčistší.
2. Restaurátorské zprávy / správci objektu (jako Opařany) — když jmenují Hainze
   a rok/výrobní číslo = dolozenyStroj: 'zachovan'.
3. NPÚ Památkový katalog (pamatkovykatalog.cz), hrady.cz, farnosti, Noc kostelů.
4. Regionální tisk / ČTK. Wikipedie jen jako rozcestník, ne jako doklad.

## Klíč k homonymům (z letáku)
Leták u německojazyčných (sudetských) měst tiskne německá exonyma (Asch=Aš,
Bodenbach=Podmokly, Joachimsthal=Jáchymov). Cizí položky značí zemí („Budapest,
Ungarn"). Když narazíš na možnou chybu identifikace, ověř ji a případně oprav
(misto/okres ve VYZKUM). Konkrétní podezření k prověření: lead idx 0 (Adamov) —
zdroj tvrdí, že „Adamsfreiheit" je Hůrky u Nové Bystřice, ne Adamov; pokud to
potvrdíš, je to oprava identifikace. Další neověřené tipy: Pardubice Zelená brána
(ČTK: stroj 1896), Bezno (obecní kronika 1903).

## ⚠️ NEspouštěj široký multiagentní fan-out
Předchozí Workflow s desítkami agentů a vnořeným schématem spadl na 1000 agentů
a utekl mimo zadání. Pracuj SEKVENČNĚ nebo v malých kontrolovaných dávkách
(≤ 5 budov), sám s WebFetch/WebSearch. Pokud sub-agenty, tak ploché schéma, tvrdý
strop a ověření inline.

## Výstup
Pracuj po dávkách (~8–12 ověřených záznamů). Pro každou:
1. do VYZKUM zapiš jen POTVRZENÉ nálezy,
2. přegeneruj + pnpm --filter hodinarium-eu build,
3. commit (trailer: Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>),
4. větev z origin/main, gh pr create na GitHub (repo csh-cz/web),
   PR body trailer: 🤖 Generated with [Claude Code](https://claude.com/claude-code),
5. do PR popisu dej ke každému záznamu DOSLOVNÝ úryvek + URL (auditovatelné).

Pozor: pracovní větev tmp-work je stará — před editací vždy
git fetch origin main && git checkout -b <nova> origin/main. Zdroje zdroje/ jsou
gitignorované (jen lokální); commituje se pouze vygenerovaný hainz1904.ts.
Odpovídej česky.
````
