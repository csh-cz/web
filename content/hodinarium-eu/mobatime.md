---
title: "Samostavitelné hodiny MOBALine"
slug: "mobatime"
category: "sbirka"
tags:
  - jednotny-cas
  - elektricke
  - gps-rizeno
  - krystal
  - 2000s
  - mobatime
  - akvizice
imageCredit: "Archiv Petra Krále (hodinarium.eu)"
originalUrl: "https://hodinarium.eu/mobatime.htm"
lastModified: "Wed, 07 Jul 2021 09:15:00 GMT"
sourceCharset: "windows-1250"
scrapedAt: "2026-04-27T17:36:45.365Z"
relatedKarty:
  - inv-P502-podruzne-hodiny-mobatime
tldr: 'Zápůjčka švýcarské soustavy hlavních hodin HN 61 a podružných 3218.SAM.40.C2 do Hodinária 2020. Popis sériového kódu MOBATIME, modulace MOBALine a synchronizace GPS přes Elekon s.r.o.'
---
Do Hodinária bylo pro sezónu 2020 zapůjčena od firmy [Elekon s.r.o](http://www.mobatime.cz)(člen mezinárodního [holdingu MOSER-BAER AG](/img/Mobatime/struktura2020.jpg) se sídlem ve Švýcarsku) sestava hlavních hodiny HN 61 a samostavitelné analogové hodiny 3218.SAM.40.C2. Sestava demonstruje použití automatického nastavení podřízených hodin. ![hlavní hodiny HN 60](/img/Mobatime/HN60IP20.jpg)

## Hlavní hodiny řady HN 60

Hodiny jsou řízeny mikroprocesorem s vlastní přesnou krystalovou základnou. Čas je synchronizován satelitním signálem GPS. Výpočet místního času s automatickou DST dle nastavené zóny ze standardní tabulky časových pásem.

Základní dodávka HN 61 obsahuje:

Hlavní hodiny vhodné pro řízení malých systémů jednotného času.

- včetně externí GPS antény (kabel 5m) pro synchronizaci
    ( přesnost bez synchonizace ± 0,1 s / den, se synchronizací ± 10 ms)
- jedna podružná linka 24 V / 150 mA
- 1x programovatelný reléový kontakt (např. spínání osvětlení v závislosti na astronomickém kalendáři pro zadané zeměpisné souřadnice)
- výstup pro nabíjení akumulátoru 14 VDC, max. 200 mA
- výstup 24 VDC, max. 200 mA
- výstup DCF pro synchronizaci dalších hodin
- provedení k montáži na lištu DIN (6MD), IP 20
- napájení 230 V~, 12 nebo 24 VDC

Výstupní podružná linka je dosti univerzální. Je volně nastavitelné pro různé způsoby přenosu. Může používat klasické minutové nebo půlminutové polarizované [impulzy](/slovnik/impulsy) i sekundové pulzy. V Hodináriu je instalovaná hlavně proto, že může také vysílat kód MOBATIME nebo MOBALine.

## MOBATIME

Sériový kód MOBATIME umožňuje přenos kompletní informace o čase a datu. Probíhá vždy jedenkrát za minutu. Všechny připojené [podružné hodiny](/slovnik/podruzne-hodiny) se dokáží nastavit na správný čas během několika minut. Odpadají tak časové prodlevy při změně na letní čas a celková instalace systému je jednodušší. Přenos informace je velmi odolný proti rušení a maximální přípojná délka je limitována úbytkem napětí na vedení. Podle typu a průřezu použitého vodiče lze dosáhnout přenosu informace na vzdálenost několika kilometrů.

![seriový kód](/img/Mobatime/kod.gif)

Zobrazená posloupnost pulzů představuje datum a čas roku 2002 ve tvaru SU + RRMMDDhhmm, tedy 1 + 02.05.20 13:46. Uváděny jsou pouze poslední dvě číslice roku. Čísla jsou v desítkové soustavě binárně kódovaná s proměnou délkou jednotlivých číslic. Všimněte si, že pouze číslice, které mohou dosáhnout i hodnot 8 nebo 9 jsou kódovány čtyřmi bity. Například jednotky minut kódovány bity 30, 31, 32 a 33 jako zde 6=0110. Pro číslo desítek měsíců stačí bit jeden, protože může nabývat pouze hodnot nula nebo jedna. Pro desítky dní či hodin (ve 24 hodinové verzi) stačí bity dva (maximální hodnota je 3=11, respektive 2=10), pro desítky minut postačí bity tři, neboť maximální hodnota šest je třemi bity vyjádřitelná jako 6=110. Kód je tedy délkově minimalizován.

Zajímavé je, že kód je polarizovaný. Polarita se střídá po jedné minutě. To přináší celkem zajímavou možnost použití i ve starších soustavách s polarizovanými minutovými impulzy. Pokud by k sériové lince MOBATIME byl připojen klasický strojek na polarizované impulzy, šel by. Pro minutové kroky by byl použit úvodní 1,5 sekundový impulz. Další pulzy stejné polarity by klasický podružný strojek ignoroval. Nastavit na správný čas po výpadku proudu by se ovšem musel ručně.

![modulace](/img/Mobatime/modulace.gif)

## MOBALine

Kód se přenáší po dvouvodičovém vedení střídavým sinusovým signálem o napětí 10 až 20 V a kmitočtu 50 Hz s kombinovanou amplitudovou a frekvenční modulací. MOBALine obsahuje nejen kompletní informaci o čase a datu, ale i další údaje, využitelné například pro dálkové spínaní spotřebičů prostřednictvím vzdálených kanálových relé. Všechna koncová zařízení připojená k MOBALine jsou samostavitelná (včetně podružných analogových hodin).

Výhodou MOBALine oproti předchozím standardům je současný přenos informace a napájení koncových zařízení po jediném vedení. Tento způsob napájení je možný pro energeticky méně náročná zařízení, jako jsou například podružné analogové hodiny do průměru číselníku 1 m, kanálová relé řady KR a rozhraní řady IF. Digitální hodiny a jiná zařízení s vyšší spotřebou vyžadují externí napájení.

[Podrobnější informace od výrobce.](https://mobatime.cz/kategorie-produktu/zpusoby-rizeni-a-synchronizace/)

![podružné samonastavitelné hodiny 3218](/img/Mobatime/3218C1.jpg)

## Samostavitelné hodiny 3218.SAM.40.C2

Jedná se o univerzální analogové hodiny s průměrem číselníku 28 nebo 40 cm. Nežádoucím odrazům světla zabraňuje pevné krycí sklo. Rám hodin je zhotoven z nárazuvzdorného termoplastu odolného proti UV záření. Zapojení je možné jak k rozvodu jednotného času, tak i autonomní poháněné baterií volbou strojku. Další předností je výběr z mnoha typů číselníků.

Varianty provedení (tučně vyznačená zapůjčená varianta)

- číselník o průměru 28 nebo 40 cm
- nárazuvzdorný termoplast odolný proti UV záření
- jednostranné hodiny, volba nástěnné montáže nebo montáž stropním závěsem / boční konzolou se zaslepenou zadní stranou
- dvoustranné hodiny se skládají ze dvou jednostranných a stropního závěsu / boční konzoly z důvodu rušení nelze složit dvoustranné hodiny ze dvou jednostranných s typem strojku R (autonomní hodinový strojek řízený radiosignálem DCF77,5 kHz)
- konzola lakována ve shodném odstínu se standardní délkou 10, 30 nebo 50 cm
- automatická změna zimní/letní čas (kromě Quartz strojku)
- minutové nebo sekundové [impulsy](/slovnik/impulsy)
- autonomní Quartz / DCF strojek
- synchronizace DCF / MOBALine / samostavitelné pro LAN / WTD
- napájení bateriové / MOBALine / PoE / 230 VAC

Hodiny bude tedy pohánět strojek SAM – samostavitelný hodinový strojek pro připojení k MOBALine. [Podrobnější technické parametry](https://mobatime.cz/obchod/analogove-hodiny-3218/). Číselník bude typu C2, tedy se zakreslenými číslicemi.

Podle stránek výrobce napsal [Petr Král](/hodinari/petr-kral)
