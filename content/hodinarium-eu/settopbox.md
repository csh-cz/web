---
title: "Hodinárium Děčín - expozice časoměrných strojů"
slug: "settopbox"
category: "projekty"
originalUrl: "https://hodinarium.eu/settopbox.htm"
lastModified: "Wed, 28 May 2025 11:54:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:37:21.057Z"
tldr: 'Srovnání přesnosti časového údaje v analogovém vysílání (pípání v 90. letech, ±0,1 s), v DVB tabulkách TDT/TOT (±1 s) a v IPTV s NTP — s legislativní úvahou nad zákonem č. 348/2005 Sb.'
---
## Jak přesný je čas v televizi?

Původní představa byla, udělat pro Hodinárium exponát, který by zobrazoval čas přenášený v televizním signálu. Myšlenka narazila na legislativní překážku. V ČR jsou rozhlasové a televizní poplatky upraveny zákonem č. 348/2005 Sb., kde se říká: Poplatníkem je ten, kdo drží zařízení technicky způsobilé k individuálnímu příjmu rozhlasového nebo televizního vysílání. Pokud by základem exponátu byl například set-top box, i kdyby zařízení nepřehrávalo žádný program, ale bylo schopné to udělat, může být považováno za předmět poplatku. Existuje výjimka: Pokud je zařízení nefunkční nebo zjevně upravené tak, že nemůže přijímat TV vysílání, poplatek se neplatí. Ovšem ničit pro tento účel funkční zařízení je nepatřičné. Proto následující článek o příjmu času v televizi je jen teoretický.

## Vysílání času ze studia a doba analogová

Kdysi se v analogové televizi vysílal přesný čas přímo z vysílacího studia. Mělo to své praktické i synchronizační důvody. Dnes je situace jiná, zejména kvůli digitalizaci a zpoždění způsobeným zpracováním digitálního signálu. Studia (např. ČST, ČT) měla vlastní hlavní hodiny, synchronizované obvykle z ČSAV nebo přes DCF77 / GPS (v pozdější době). Čas byl někdy zobrazován přímo na obrazovce např. před začátkem vysílání, nebo na testovacích obrazcích. Přesnost byla velmi dobrá – v řádu desetin sekundy, často lepší než ±0.1s. Analogové vysílání bylo v reálném čase, se zanedbatelným zpožděním (do 50–100 ms). Zpoždění bylo předvídatelné, takže čas z obrazovky bylo možné brát jako „oficiální” čas.

ČT ještě v 90. letech vysílala čas s pípáním před zprávami (včetně 5 pípnutí – poslední = přesná sekunda). Tento čas byl synchronizován s „hlavními hodinami” a považoval se za oficiální etalon. Dnes už tento přesný čas zmizel z obrazu, ale zůstal v datové vrstvě DVB-T2. Na výstupu studia byla přesnost typicky lepší než ±0.1 s. Ale kvůli zpoždění v přenosu (analogové cesty, mikrovlnné spoje, analogové distribuční cesty) se mohla lišit: V analogové TV běžně ±0.2 až ±0.5 s. V rozhlasu bývalo lepší, často ±0.1 s, protože šlo o přímý audio přenos bez konverze.

**Časová informace se nepřenášena standardizovaně jako digitální data**, ale **přesto nějaká forma synchronizace a časových signálů existovala.** Časová a jiná data byla přenášena během tzv. "zpětného řádku", přesněji ve vertikálním zatemnění (VBI – Vertical Blanking Interval). V analogové televizi se po každém snímku musel elektronový paprsek ve starých CRT televizorech vrátit zespodu obrazovky zpět nahoru (tzv. vertikální retrace). Během této doby (cca řádky 6–22 v PAL systému) nebyl obraz vysílán, což se využilo k přenosu různých skrytých dat.

V těchto řádcích se přenášel zejména Teletext. Byl přenášen digitálně v několika řádcích VBI (např. 16–22). Struktura přenosu byla 40 znaků na řádek, přenosová rychlost cca 6.9 kbit/s. Časová informace byla dostupná na stránce 100 nebo ve speciálních záhlavích. Některé přístroje (videorekordéry, dekodéry) si čas z teletextu synchronizovaly. VPS (Video Programming System) používal například řádek 16. Rozšíření VPS, používané zejména v západní Evropě, obsahovalo datum, čas zahájení, typ pořadu, apod. Existovaly i další systémy.

Analogové vysílání je v ČR **zcela ukončeno** od roku 2012 (a DVB-T2 od 2020). Možnost získání času z analogového signálu už **prakticky neexistuje**.

## Doba digitální - digitální televize a set-top box

V digitálním vysílání se vše se zpracovává **v blocích**: komprese, multiplexace, enkódování atd. Často se přidává **buffer**, **zpoždění z vysílačů**, a **síťová latence**. To způsobuje, že studiový **čas na obrazovce může být opožděn o 1–5 sekund i více**. Čas tedy **už není přímo „živý”**, a proto se dnes **na TV obraz nelze spolehnout pro přesné určení času**.

| Typ vysílání | Typické zpoždění |
|---|---|
| DVB-T / DVB-T2 | 1–2 s |
| DVB-S (satelit) | 2–4 s |
| IPTV (O2TV, apod.) | 2–10 s |
| HbbTV, streamy | 5–30 s |

**Digitální televize a set-top boxy** získávají čas několika možnými způsoby, v závislosti na technologii příjmu (DVB-T, DVB-C, DVB-S, IPTV) a výrobci zařízení. Přesnost se pohybuje typicky v řádu **sekund**, ale u některých typů může být i lepší. Přehled podle typu:

### 1\. **DVB-T / DVB-C / DVB-S (pozemní, kabelová, satelitní TV)**

**Čas je získáván z dat v transportním streamu (TS)** – konkrétně z **tabulky TDT (Time and Date Table)** a/nebo **TOT (Time Offset Table)**, které jsou součástí normy **DVB-SI (Service Information)**. Tyto tabulky obsahují: **UTC čas** (nebo místní čas) Informaci o **posunu** oproti UTC (např. letní čas). Přesnost je Obvykle **±1 sekunda**. Vysílací stanice aktualizuje čas obvykle **každou sekundu nebo méně často**, záleží na multiplexu. Podstatné je, že nejde o čas vysílaný ze studia, ale až z vysílače. Přesto může mýt zpoždění, pokud má vysílací řetězec velké zpoždění (např. u satelitu nebo přes IP), může být čas méně přesný nebo zpožděný.

### 2\. **IPTV (např. O2TV a pod.)**

**Čas je získáván z** **serveru poskytovatele IPTV** – často pomocí NTP (Network Time Protocol) nebo HTTP požadavků. **Případně z operačního systému boxu (např. Android TV)**, který si synchronizuje čas přes internet. **Dobrá přesnost – obvykle ±100 ms až ±1 s**

### 3\. **Interní hodiny set-top boxu**

Pokud žádný jiný čas není k dispozici (např. při výpadku signálu), může zařízení používat **interní RTC (real-time clock)**, pokud je jím vybaveno. Tyto hodiny jsou ale často **méně přesné** (drift v minutách až hodinách za den) a používají se jen jako záložní řešení. Může jít o čas nastavený do zazení "ručně". Některé televizory mají vestavěné hodiny, které se synchronizují s atomovými hodinami přes internet.

### Shrnutí přesností:

| Zdroj času | Přesnost | Poznámka |
|---|---|---|
| DVB-T / DVB-C / DVB-S (TOT) | ±1 s | Záleží na multiplexu |
| IPTV (NTP) | ±0.1–1 s | Záleží na síti |
| Interní hodiny | ±minuty až hodiny | Bez synchronizace rychle driftují |

## Odkazy

- [DIGITÁLNÍ TELEVIZE A DIGITÁLNÍ ROZHLAS SOUČASNOST A PERSPEKTIVY](http://old.roznovskastredni.cz/dwnl/pel2009/06/zalud.pdf) — old.roznovskastredni.cz. [cit. 2026-04-28]
- [Digitální vysílání: Je uváděný čas skutečně přesný?](www.parabola.cz/clanky/1899/digitalni-vysilani-je-uvadeny-cas-skutecne-presny/) Obsahuje vyjádření různých televizí v ČR na tuto otázku.

S pomocí AI sestavil [Petr Král](/hodinari/petr-kral)
