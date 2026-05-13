---
title: "Kvalifikované časové razítko - Time Stamp"
slug: "razitka"
category: "zajimavosti"
originalUrl: "https://hodinarium.eu/razitka.htm"
lastModified: "Wed, 26 Apr 2017 16:13:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:37:09.302Z"
tldr: 'Časové razítko je doplňkový soubor, který pro daný elektronický dokument osvědčuje jeho existenci v určitém čase. Nejčastěji se používá v elektronických podatelnách a při datování smluv a podobných dokumentů.…'
references:
  - title: "Zákon č. 297/2016 Sb., o službách vytvářejících důvěru pro elektronické transakce"
    url: "https://www.e-sbirka.cz/sb/2016/297"
    type: odkaz
    note: "Aktuální česká úprava elektronického podpisu a časových razítek (implementace eIDAS, nař. EU 910/2014). Nahradil zrušený zákon 227/2000 Sb."
  - title: "Zákon č. 227/2000 Sb., o elektronickém podpisu (zrušen)"
    url: "https://www.e-sbirka.cz/sb/2000/227"
    type: odkaz
    note: "Historický pramen — v době vzniku článku platný zákon. Zrušen k 19. 9. 2016."
  - title: "Vyhláška č. 496/2004 Sb., o elektronických podatelnách (zrušena)"
    url: "https://www.e-sbirka.cz/sb/2004/496"
    type: odkaz
    note: "Historický pramen — zrušena v souvislosti s přijetím zákona 297/2016 Sb."
  - title: "Elektronické časové razítko, doplněk elektronického podpisu"
    url: "https://interval.cz/clanky/elektronicke-casove-razitko-doplnek-elektronickeho-podpisu/"
    type: clanek
  - title: "Časové razítko (obce.cz)"
    url: "http://vsol.obce.cz/clanek.asp?id=2006111"
    type: clanek
---
**Č**asové razítko je doplňkový soubor, který pro daný elektronický dokument osvědčuje jeho existenci v určitém čase. Nejčastěji se používá v elektronických podatelnách a při datování smluv a podobných dokumentů. **Kvalifikované časové razítko** poskytují **certifikační autority** (zpravidla po Internetu). Způsob jeho poskytování a obsah je v ČR od roku 2016 určen **zákonem č. 297/2016 Sb., o službách vytvářejících důvěru pro elektronické transakce** (implementace evropského nařízení eIDAS), který nahradil dříve platný zákon č. 227/2000 Sb. o elektronickém podpisu. Razítko je nejčastěji používán společně s elektronickým podpisem.

Zdálo by ce, že okamžik vzniku či změně nějakého dokumentu dostatečně určují údaje o datu a času vedené operečním systémem. Ty však určují, kdy byl soubor pravděpodobně naposledy změněn na daném médiu a odvozují se od informací operačního systému počítače, které lze často uživalelsky změnit. Uváděné údaje lze velmi jednoduše pozměnit, takže valnou vypovídací hodnotu nemají. Proto musí být použita externí autorita.

**P**rincip celého procesu vydání časové značky je relativně jednoduchý. Je založen na výpočtu "otisku dat" speciálním klientským softwarem. "Otisk dat" lze vzdáleně přirovnat k výpočtu kontrolního součtu, jen způsob výpočtu je poněkud sofistikovanější. Používá se některý hash algoritmus, proto i výsledek se často označuje jako HASH.

HASH příslušenící k dokumentu je doplněn dalšími údaji do formy žádosti o vydání časové značky, která je následně odeslána autoritě časové značky. Tam je žádost zpracována tak, že k dodanému HASHi je přidán přesný časový údaj a celý tento „balíček" je elektronicky podepsán privátním klíčem autority časové značky. Tím je zajištěna důvěryhodnost časového údaje. Takto vytvořené časové razítko je doručeno žadateli. Pokud bude do souboru, který je časovým razítkem označen, následně proveden jakýkoliv zásah, změní se také jeho HASH, který již nebude odpovídat původnímu, a časové razítko bude neplatné.

**J**ednoduchý příklad razítka pro zvolený dokument *smlouva.doc*. Pro tento dokument byl programem **AEC TS Client** spočítán HASH a po Internetu vyžádáno časové razítko. Přijatá podepsaná časová značka je uložena jako souboru *smlouva.doc.TST* Přípona TST znamená soubor typu **Time Stamp Token Files.** Soubor je binární, po dekódování vypadá přibližně takto:

| Položka | Hodnota |
|---|---|
| check signature | passed |
| GMT | 15.1.2007 11:22:23 |
| hash algorithm | SHA-1 |
| HASH | `6665638e6bf114d06ebb00a2ccd8026ea514a153` |
| serial number | `06a1613137cdc5d07280` |
| policy | `1.3.6.1.4.1.4020.1.2.2.1` |

**Z** tabulky je vidět, jaké údaje razítko obsahuje. Programem AEC TS Client lze zpětně ověřit, zda časová značka v souboru *smlouva.doc.TST* stále platí pro soubor *smlouva.doc*.

## Časová razítka — historická paralela

![Razítko — pohled 1](/img/razitko2.jpg) ![Razítko — pohled 2](/img/razitko1.jpg)

Časová razítka u elektronických souborů jsou věc poměrně nová. Jsou to jakási razítka virtuální. Přesto se Virtuální muzeum zajímá spíše o historická reálná razítka. I v minulosti bylo nutné osvědčit nějaký čas.

**N**ejznámější značkovací hodiny byly **hodiny docházkové - píchačky**.

**P**odobnou funkci měly **strážní hodiny**, kde byl do papírového kotoučku "děrován" kód klíče, uloženého na určitém místě. Papírový kotouček byl otáčen hodinovým strojem. Tím bylo osvědčeno, kdy a kde se strážný s hodinami vyskytoval.

**N**a obrázcích je ukázáno **časové razítko**, které asi nejlépe odpovídá názvu stránky. Bylo používáno na vrátnici nejmenovaného podniku k označování zboží i písemností vrátnicí procházejících. Později sloužilo jako svérázné těžítko, až se dostalo do soukromé sbírky.

Podobné razítko v Hodináriu Děčín vystavujeme trochu neuctivě na výstavce Nonsens 2015.
