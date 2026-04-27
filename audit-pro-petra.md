# Audit nového webu hodinária — k vyplnění

Ahoj Petře,

zmigroval jsem `hodinarium.eu` do nového stacku (Astro + Markdown v gitu). Funkčně to běží, ale v některých bodech potřebuju tvoji autoritu — strojem se to rozhodnout nedá. Pod každým bodem máš prostor pro odpověď. Stačí napsat za **Tvoje odpověď:**, prázdné body znamenají „ano, pokračuj jak navrhuješ".

Obecné: pokud ti něco nedává smysl nebo bys chtěl víc kontextu, jen u toho bodu napiš `???`, projdeme to telefonem.

---

## A. Strategická rozhodnutí (bez nich nemůžu jet dál)

### A1. Licence obsahu

Texty na webu jsou momentálně 1:1 z `hodinarium.eu`. Než web zveřejníme pod novou doménou, musíme vědět, **pod jakou licencí** se obsah publikuje. Možnosti:

- **CC-BY 4.0** — kdokoli může text používat (Wikipedie, knihy, jiné weby) s uvedením autora
- **CC-BY-NC 4.0** — totéž, ale nekomerční použití (= nesmí to dát do placené knihy bez naší dohody)
- **All rights reserved** — nikdo bez výslovného souhlasu nesmí přebírat
- **Stejné jako hodinarium.eu dnes** — pokud existuje stávající licenční rozhodnutí, drž se ho

Doporučuju **CC-BY 4.0** (otevřenost odpovídá poslání spolku — popularizovat).

**Tvoje odpověď:**


### A2. Členové výboru — aktuálnost (rok 2026)

V `/spolek` mám hardcoded:
- Předseda: **Ing. Petr Král**
- Pokladník: **Ing. Miroslav Baudisch**
- Člen výboru: **Ing. David Knespl**

Tyto údaje jsou ze stránky `spolek.htm`, která dle `last-modified` je aktualizovaná. Ale chci si být jistý:

- Jsou to **stále aktuální členové** výboru?
- Mám doplnit další členy (revizní komise, čestní)?
- Mám u jména uvádět **e-mail** nebo **funkční období** (zvolení od kdy)?

**Tvoje odpověď:**


### A3. Hospodaření 2020–2025

Web (i nový) má PDF za roky **2016, 2017, 2018, 2019**. Zákon č. 304/2013 Sb. o veřejných rejstřících vyžaduje zveřejňování účetní závěrky každý rok ve spolkovém rejstříku. Buď to máš někde jinde, nebo to chybí.

- Můžeš mi dodat **PDF za 2020–2025**? (Stačí scan.)
- Pokud nejsou kompletní, **napiš seznam** (např. „2020 ano, 2021 ano, 2022 zatím ne") a uveřejním jen ty, co jsou.

**Tvoje odpověď:**


### A4. E-mail / kontaktní adresa

Spolek používá **`info@orloj.eu`** pro oba weby. Je to OK takto, nebo bys chtěl pro hodinárium vlastní `info@hodinarium.eu`? (Cloudflare to dělá zdarma — forwarding na Tvoji existující schránku, žádný hosting navíc.)

**Tvoje odpověď:**


### A5. Co s `orloj.eu`?

Až dotáhneme hodinárium, plánuju stejný workflow aplikovat na `orloj.eu`. Otázky:

- **Stejný design** (paleta, typografie), nebo má orloj.eu mít vlastní vizuální identitu?
- **Sdílený obsah** — některé osobnosti (Mikuláš z Kadaně, Hanuš) figurují v obou. Mám je psát na obou webech, nebo na jednom (kde?) a na druhém jen linkovat?
- **Kdy** to chceš — hned po dotažení hodinária, nebo počkat na zpětnou vazbu z provozu?

**Tvoje odpověď:**


---

## B. Data, která potřebuju zkontrolovat

### B1. Souřadnice na mapě

V `/mapa` mám zaznačeno 26 lokací. Některé jsou jasné (Soběslav, Děčín, Praha), u jiných jsem hádal. Projdi prosím a u **chybných** napiš opravu nebo „smazat":

- **Soběslav** — věžní stroj v kostele sv. Petra a Pavla. Lat 49.2599, Lon 14.7195. ✅ správně?
- **Bychory** — zámek. Lat 50.0436, Lon 15.2628. ✅ správně?
- **Janovice** — která? Mám u Klatov (49.4214, 13.2453). Nebo Janovice nad Úhlavou? Janovice u Rýmařova?
- **Rožmberk nad Vltavou** — 48.6553, 14.4119. ✅?
- **Budislav** — Soběslavsko (49.7569, 16.2400). ✅ správně? Nebo to byla jiná Budislav?
- **Klí** (Krušnohoří) — 50.7567, 14.6028. ✅?
- **Prysk** — 50.7833, 14.5167. ✅?
- **Kardašova Řečice** — 49.1858, 14.8533. ✅?

**Tvoje odpověď (jen co je špatně):**


### B2. Časová osa — milníky

Sestavil jsem 17 milníků 1410–2025. Některé jsem domyslel, některé Ti budou znít divně. Projdi prosím:

1. **1410** — Pražský orloj, Mikuláš z Kadaně
2. **~1484?** — Soběslav, věžní stroj
3. **1490** — Mistr Hanuš (Jan Růže), kalendárium
4. **1499** — Torre dell'Orologio, Benátky
5. **1570** — Jan Táborský, zpráva o orloji
6. **1700** — vznik švarcvaldek (datum hrubě odhadnuto)
7. **1857** — Prokešův model orloje
8. **1865** — Mánesovy desky
9. **1911** — Steinich-Hassenteufel model
10. **1930** — generální oprava orloje
11. **1948** — poválečná rekonstrukce orloje
12. **2009** — vznik Virtuálního muzea hodin o.s.
13. **2011** — oprava orloje, kohout
14. **2014** — přeměna na CSH
15. **2015** — otevření Hodinária Děčín
16. **2018** — generální oprava orloje
17. **2025** — ASTRO2 ESP01S

**Co bys přidal / opravil / vyhodil:**


### B3. ASTRO2 — překlep ESP01S vs ESP10S

V článku `astro2_NTP` se text vyskytuje v obou variantách:
> „Řídí jí modul **ESP01S**"
> „Koupil jsem si proto programovací adaptér na modul **ESP10S**"

Je to překlep, nebo jde o dva různé moduly v různých fázích projektu?

**Tvoje odpověď:**


### B4. Featured exponáty per kategorie

Pro každou sekci jsem vybral 4 „featured" články. Jsou to ty, co považuješ za nejcennější / nejvíc reprezentativní pro tu kategorii? Pokud ne, napiš lepší výběr (slugy nebo titulky).

**Sbírka** (`/sbirka`):
- `svarcvaldky` — Švarcvaldky obecně
- `vodni` — Vodní hodiny
- `kvetinove` — Květinové hodiny
- `rimskedigi` — Římské digitálky

→ **Tvůj výběr 4 nej:**


**Projekty** (`/projekty`):
- `astro2_NTP` — ASTRO2 astronomické
- `Arduino` — Arduino DIY úvod
- `GPS_Sakul` — GPS Sakul NTP
- `propeller_clock` — Propeller clock

→ **Tvůj výběr 4 nej:**


**Hodinárium Děčín** (`/decin`):
- `decin_koncepce` — koncepce expozice
- `decin_zamek` — zámek a okolí
- `decin_aktual0` — stěhování 2015
- `decin_dalsi_stroje` — exponáty

→ **Tvůj výběr 4 nej:**


**Věžní hodiny** (`/vezni-hodiny`):
- `sobeslav3` — Soběslavský stroj
- `bychory_zvonici_stroj` — Býchorský budík
- `rozmberk1` — Rožmberk
- `janovice` — Janovice

→ **Tvůj výběr 4 nej:**


### B5. Otazníky v titulcích

Pět článků má v titulku „??":
1. **Doba dřevěná — švarcvaldky v 17. století ??**
2. **Jsou v Kardašově Řečici hodiny mistra Hanuše ??**
3. **Soběslavské hodiny z 15. století ??**
4. **Vyšívané květinové hodiny — hodiny jedna báseň ??**
5. **Stroj Radošov ??**

Otázka: jsou ty „??" tvůj záměrný signál „otevřená hypotéza", nebo by se v některých případech daly odstranit (protože se mezitím odpověď vyjasnila)? Pokud zůstávají hypotézy, vizuálně je označím badge **„Otevřená hypotéza"**, aby čtenář věděl.

**U kterých zachovat / odstranit:**


### B6. Datace článků

Můj skript vyextrahuje rok z textu heuristicky („čtyřmístné číslo 13xx–20xx"). U 14 článků je rok < 1500, což je pravděpodobně chybné — chytl číslo z citace jiného článku, ne datace samotného. Klíčové prosím opravit:

- `decin_chronulator` — zobrazuje rok 1353. Skutečnost?
- `vez_Budislav` — zobrazuje rok 1357. Skutečnost?
- `decin_velika_ves` (Torzo gotického stroje) — zobrazuje rok 1340. Skutečnost?
- `kalendar_rimsky` — zobrazuje rok 1465. Skutečnost?
- `kardasova_recice` — zobrazuje rok 1493. Skutečnost?

**Tvé správné roky:**


### B7. Aktualní info Hodinária Děčín

Web aktuálně ukazuje sezóny **2015 → 2018**. Co bych měl doplnit za roky **2019 → 2026**?

- Otevírací doba (zejména letní vs zimní sezóna)?
- Vstupné?
- Aktuálně probíhající výstava / exponát?
- Plánované akce 2026?
- Adresa (Zámek Děčín, Dlouhá jízda 1254 — správně?)

**Tvoje info:**


### B8. Kategorizace 124 „ostatních" článků

Mám slug-based heuristiku, která řadí článek do sekce. 124 článků zůstalo v `ostatni` (~57 % obsahu). Většinu strojem dotáhnu (kategorie podle názvu — např. všechny `vez_*` → věžní, všechny `slunecni_*` → sbírka), ale **20–30 zůstane sporných**.

Až ti pošlu seznam těch 20–30, můžeš za každým napsat kategorii? (Sbírka / Projekty / Děčín / Věžní / Spolek)

**Souhlas s tímto postupem (ano/ne, případně jiný návrh):**


---

## C. Drobnosti, které budou rozhodovat o vzhledu

### C1. Hero foto na titulce

Aktuálně je titulka textová (titul „Hodinárium" + statistiky). **Chceš velkou foto-titulku** (např. expozice Děčín, Soběslavský stroj, kalendárium orloje)? Pokud ano, který obrázek by na ní měl být?

**Tvoje odpověď:**


### C2. Logo

Nemáme logo. Stávající `hodinarium.eu` má `nadpis_hodinarium1.gif` (textová grafika). Mám:
- (a) zachovat textový styl logo „**Hodinárium**" v Spectral Italic (jak je teď)
- (b) udělat / nechat udělat skutečné logo (znak orloje, ozubené kolo, klíč na natahování…)

**Tvoje odpověď:**


### C3. Sponzoring sekce

Web obsahuje stránku `sponsor.md` se seznamem sponzorů. Měla by být v patičce, nebo na samostatném místě? Aktuálně je v sekci **Spolek**.

**Aktuálně je sponzoring v `/spolek` jako odkaz na článek. OK, nebo to chceš jinak?**


### C4. Sociální sítě

V patičce nového webu mám:
- Facebook
- YouTube (`@muzeum_veznich_hodin`)

Něco další? Instagram? Mastodon? LinkedIn (CSH)? Threads?

**Tvoje odpověď:**


### C5. Co bych měl ze starého webu vyhodit

Některé stránky na původním webu jsou nedokončené nebo zastaralé. Když napíšeš slug nebo titulek, řeknu, jak vypadá teď a buď zachovám nebo vyhodím. Příklady, které mě napadly:

- `nonsens2015` — výstavka Nonsens 2015 (relevantní 11 let zpátky?)
- `dernisaz2013` — dernisáž v r. 2013 (taky stará)
- `sezona2012`, `sezona2013` — fotogalerie z minulých let

→ Mám je nechat jako historický archiv, nebo přesunout do skrytého depozitáře?

**Tvoje odpověď:**


---

## D. Otázky vize

### D1. Hlavní cílová skupina

Když se podíváš na typického návštěvníka nového webu, kdo to je:

- (a) **Sběratel hodin** (vyhledává konkrétní typ hodin v sbírce)
- (b) **DIY maker** (chce postavit Arduino hodiny)
- (c) **Návštěvník Děčína** (plánuje výlet do expozice)
- (d) **Akademik / student** (cituje, hledá historické info)
- (e) **Náhodný turista** (četl o orloji, zaplul ze sesterského webu)

→ Můžeš seřadit podle priority? (Třeba: 1=c, 2=a, 3=e, 4=b, 5=d)

**Tvoje pořadí:**


### D2. Plánované rozšíření obsahu

Je něco, co chceš na nový web přidat, co na staré nebylo nebo bylo skryté? Třeba:

- Audio nahrávky úderů věžních hodin?
- Video tour expozice Děčín?
- 3D modely vybraných hodin?
- Interaktivní simulátor (jako orloj.eu má)?
- Podcast / rozhovory?

**Tvoje odpověď:**


### D3. Kdy chceš být live?

Aktuálně to běží **lokálně u mě**. Až dořeším body výše, nasadím na Cloudflare Pages preview (URL `csh-hodinarium.pages.dev`, dostupné odkudkoli) — můžeš si to otevřít z mobilu, kompu, ukázat manželce.

Až bude preview OK, **přepneme doménu `hodinarium.eu`** na nový web.

- **Cílový datum?** (např. „do konce května", „do schůze výboru", „bez spěchu")
- **Schválení výborem CSH?** Měli bychom to projednat na schůzi, nebo to chápu jako tvou „technickou" agendu člena spolku?

**Tvoje odpověď:**


---

## Co bude dál

Až mi tohle vyplníš (může být postupně, hesla pod body, neformálně), já:

1. Implementuju **B-část** (data, kategorie, datace, mapa)
2. Doplním **C-část** (vzhled, logo, sociálky)
3. Připravím produkční build s tvými rozhodnutími
4. Pošlu ti **preview URL** k otestování
5. Po schválení přepojím doménu

Plus paralelně mám připraveno (čeká na rozhodnutí licence A1):

- **Vlastní vyhledávání** (Cmd+K modal, fuzzy search napříč všemi 218 články — zdarma)
- **Mapa s 26 lokacemi** + vintage sépiové dlaždice
- **Časová osa** s 17 milníky
- **Atlas** — vizuální mřížka 218 hodin s filtrováním
- **AI chat „Zeptej se hodinária"** (volitelně, Cloudflare Workers AI free tier — zdarma do 30k dotazů/den)

Díky za čas — nespěchám, vyplň po troškách.

David
