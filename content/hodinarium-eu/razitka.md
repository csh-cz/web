---
title: "Kvalifikované časové razítko - Time Stamp"
slug: "razitka"
category: "sbirka"
originalUrl: "https://hodinarium.eu/razitka.htm"
lastModified: "Wed, 26 Apr 2017 16:13:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:37:09.302Z"
---
**Č**asové razítko je doplňkový soubor, který pro daný elektronický dokument osvědčuje jeho existenci v určitém čase. Nejčastěji se používá v elektronických podatelnách a při datování smluv a podobných dokumentů. **Kvalifikované časové razítko** poskytují **certifikační autority** (zpravidla po Internetu). Způsob jeho poskytování a obsah je v ČR určen **zákonem o elektronickém podpisu** a je také nejčastěji používán společně s elektronickým podpisem.

Zdálo by ce, že okamžik vzniku či změně nějakého dokumentu dostatečně určují údaje o datu a času vedené operečním systémem. Ty však určují, kdy byl soubor pravděpodobně naposledy změněn na daném médiu a odvozují se od informací operačního systému počítače, které lze často uživalelsky změnit. Uváděné údaje lze velmi jednoduše pozměnit, takže valnou vypovídací hodnotu nemají. Proto musí být použita externí autorita.

**P**rincip celého procesu vydání časové značky je relativně jednoduchý. Je založen na výpočtu "otisku dat" speciálním klientským softwarem. "Otisk dat" lze vzdáleně přirovnat k výpočtu kontrolního součtu, jen způsob výpočtu je poněkud sofistikovanější. Používá se některý hash algoritmus, proto i výsledek se často označuje jako HASH.

HASH příslušenící k dokumentu je doplněn dalšími údaji do formy žádosti o vydání časové značky, která je následně odeslána autoritě časové značky. Tam je žádost zpracována tak, že k dodanému HASHi je přidán přesný časový údaj a celý tento „balíček“ je elektronicky podepsán privátním klíčem autority časové značky. Tím je zajištěna důvěryhodnost časového údaje. Takto vytvořené časové razítko je doručeno žadateli. Pokud bude do souboru, který je časovým razítkem označen, následně proveden jakýkoliv zásah, změní se také jeho HASH, který již nebude odpovídat původnímu, a časové razítko bude neplatné.

!

**J**ednoduchý příklad razítka pro zvolený dokument *smlouva.doc*. Pro tento dokument byl programem **AEC TS Client** spočítán HASH a po Internetu vyžádáno časové razítko. Přijatá podepsaná časová značka je uložena jako souboru *smlouva.doc.TST* Přípona TST znamená soubor typu **Time Stamp Token Files.** Soubor je binární, po dekódování vypadá přibližně takto:

check signature

passed

GMT

15.1.2007 11:22:23

hash algorithm

SHA-1

HASH

6665638e6bf114d06ebb00a2ccd8026ea514a153

serial number

06a1613137cdc5d07280

policy

1.3.6.1.4.1.4020.1.2.2.1

**Z** tabulky je vidět, jaké údaje razítko obsahuje. Programem AEC TS Client lze zpětně ověřit, zda časová značka v souboru *smlouva.doc.TST* stále platí pro soubor *smlouva.doc*..

**Několik zajímavých odkazů:**

-   [business.center.cz/business/pravo/zakony/epodpis/cast1.aspx
    ](http://business.center.cz/business/pravo/zakony/epodpis/cast1.aspx)**Zákon o elektronickém podpisu**
-   [crypto-world.info/pravo/podpis/pravo/496\_04.htm](http://crypto-world.info/pravo/podpis/pravo/496_04.htm)
    **Vyhláška o elektronických podatelnách**
-   [interval.cz/clanky/elektronicke-casove-razitko-doplnek-elektronickeho-podpisu](http://interval.cz/clanky/elektronicke-casove-razitko-doplnek-elektronickeho-podpisu) Elektronické časové razítko, doplněk elektronického podpisu - obsáhlý článek na Interval.cz
-   [vsol.obce.cz/clanek.asp?id=2006111](http://vsol.obce.cz/clanek.asp?id=2006111)Časové razítko - krátký článek na obce.cz

* * *

Časová[!](<javascript:view\('img/razitko2.jpg', 375, 500\)>)[!](<javascript:view\('img/razitko1.jpg', 375, 500\)>)razítka u elektronických souborů je věc poměrně nová. Jsou to jakási razítka virtuální. Přesto se Virtuální muzeum zajímá spíše o historická reálná razítka. I v minulosti bylo nutné osvědčit nějaký čas.

**N**ejznámější značkovací hodiny byly **hodiny docházkové - píchačky**.

**P**odobnou funkci měly **strážní hodiny**, kde byl do papírového kotoučku "děrován" kód klíče, uloženého na určitém místě. Papírový kotouček byl otáčen hodinovým strojem. Tím bylo osvědčeno, kdy a kde se strážný s hodinami vyskytoval.

**N**a obrázcích je ukázáno **časové razítko**, které asi nejlépe odpovídá názvu stránky. Bylo používáno na vrátnici nejmenovaného podniku k označování zboží i písemností vrátnicí procházejících. Později sloužilo jako svérázné těžítko, až se dostalo do soukromé sbírky.

Podobné razítko v Hodináriu Děčín vystavujeme trochu neuctivě na výstavce Nonsens 2015.
