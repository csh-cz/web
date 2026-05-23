---
title: "Podružné hodiny Mobatime"
slug: "inv-P502-podruzne-hodiny-mobatime"
category: "sbirka"
podsekce: "karta"
imageCredit: "Archiv Petra Krále (hodinarium.eu)"
originalUrl: "https://hodinarium-eu.pages.dev/sbirka/katalog"
lastModified: null
sourceCharset: "utf-8"
scrapedAt: "2026-04-30T04:12:37.532Z"
manualEdit: true
author: "Petr Král"
tldr: 'Zápůjčka švýcarské soustavy hlavních hodin HN 61 a samostavitelných podružných 3218.SAM.40.C2 do Hodinária pro sezónu 2020 — demonstrace automatického nastavení podružných hodin kódem MOBATIME a MOBALine se synchronizací GPS.'
references:
  - title: "Mobatime — způsoby řízení a synchronizace"
    url: "https://mobatime.cz/kategorie-produktu/zpusoby-rizeni-a-synchronizace/"
    type: odkaz
  - title: "Mobatime — analogové hodiny 3218 (technické parametry)"
    url: "https://mobatime.cz/obchod/analogove-hodiny-3218/"
    type: odkaz
tags:
  - panel-5
  - funkcni
  - mobatime
  - jednotny-cas
  - elektricke
  - gps-rizeno
  - krystal
  - 2000s
  - akvizice
karta:
  inventarniCislo: "P502"
  umisteni: "Panel 5"
  vyrobce: "Mobatime"
  pridanoDoSbirky: "2020"
  majitel: "zápůjčka"
  vztahKeSbirce: "zápůjčka"
  stav: "funkční"
thumbnail: '/img/Mobatime/3218C1.jpg'
---

![Samostavitelné podružné hodiny Mobatime 3218](/img/Mobatime/3218C1.jpg)

Do Hodinária byla pro sezónu 2020 zapůjčena od firmy [Elekon s. r. o.](http://www.mobatime.cz) (člen mezinárodního holdingu MOSER-BAER AG se sídlem ve Švýcarsku) sestava hlavních hodin HN 61 a samostavitelné analogové hodiny 3218.SAM.40.C2. Sestava demonstruje použití automatického nastavení podřízených hodin.

![Struktura holdingu MOSER-BAER AG (2020)](/img/Mobatime/struktura2020.jpg)

## Hlavní hodiny řady HN 60

![Hlavní hodiny HN 60](/img/Mobatime/HN60IP20.jpg)

Hodiny jsou řízeny mikroprocesorem s vlastní přesnou krystalovou základnou, čas je synchronizován satelitním signálem GPS. Místní čas se počítá s automatickou změnou na letní čas podle nastavené zóny ze standardní tabulky časových pásem. Základní dodávka HN 61 obsahuje hlavní hodiny vhodné pro řízení malých systémů jednotného času:

- externí GPS anténa (kabel 5 m) pro synchronizaci (přesnost bez synchronizace ± 0,1 s/den, se synchronizací ± 10 ms)
- jedna podružná linka 24 V / 150 mA
- programovatelný reléový kontakt (např. spínání osvětlení podle astronomického kalendáře pro zadané souřadnice)
- výstup pro nabíjení akumulátoru 14 VDC, výstup 24 VDC
- výstup DCF pro synchronizaci dalších hodin
- provedení k montáži na lištu DIN (6MD), IP 20; napájení 230 V~, 12 nebo 24 VDC

Výstupní podružná linka je univerzální a volně nastavitelná pro různé způsoby přenosu — klasické minutové či půlminutové polarizované [impulzy](/slovnik/impulsy) i sekundové pulzy. V Hodináriu je instalovaná hlavně proto, že může vysílat i sériový kód MOBATIME nebo MOBALine.

## MOBATIME

Sériový kód MOBATIME umožňuje přenos kompletní informace o čase a datu, probíhající vždy jedenkrát za minutu. Všechny připojené [podružné hodiny](/slovnik/podruzne-hodiny) se dokáží během několika minut nastavit na správný čas, takže odpadají prodlevy při změně na letní čas a celková instalace je jednodušší. Přenos je velmi odolný proti rušení a maximální délka je limitována jen úbytkem napětí na vedení — podle průřezu vodiče lze dosáhnout přenosu na vzdálenost několika kilometrů.

![Sériový kód MOBATIME](/img/Mobatime/kod.gif)

Zobrazená posloupnost pulzů představuje datum a čas ve tvaru SU + RRMMDDhhmm. Čísla jsou v desítkové soustavě binárně kódována s proměnnou délkou jednotlivých číslic — pouze číslice, které mohou dosáhnout hodnot 8 nebo 9, jsou kódovány čtyřmi bity, takže je kód délkově minimalizován. Zajímavé je, že je polarizovaný a polarita se střídá po jedné minutě, což umožňuje použití i ve starších soustavách s polarizovanými minutovými impulzy.

![Modulace MOBALine](/img/Mobatime/modulace.gif)

## MOBALine

Kód se přenáší po dvouvodičovém vedení střídavým sinusovým signálem o napětí 10 až 20 V a kmitočtu 50 Hz s kombinovanou amplitudovou a frekvenční modulací. MOBALine obsahuje nejen kompletní informaci o čase a datu, ale i další údaje, využitelné například pro dálkové spínání spotřebičů prostřednictvím vzdálených kanálových relé. Všechna koncová zařízení připojená k MOBALine jsou samostavitelná (včetně podružných analogových hodin). Výhodou oproti předchozím standardům je současný přenos informace i napájení koncových zařízení po jediném vedení — to je možné pro energeticky méně náročná zařízení, jako jsou podružné analogové hodiny do průměru číselníku 1 m či kanálová relé; digitální hodiny a zařízení s vyšší spotřebou vyžadují externí napájení.

## Samostavitelné hodiny 3218.SAM.40.C2

Univerzální analogové hodiny s průměrem číselníku 28 nebo 40 cm. Nežádoucím odrazům světla zabraňuje pevné krycí sklo, rám je zhotoven z nárazuvzdorného termoplastu odolného proti UV záření. Zapojit je lze jak k rozvodu jednotného času, tak autonomně s bateriovým strojkem; k dispozici je výběr z mnoha typů číselníků. Zapůjčená varianta má číselník o průměru 40 cm a typ C2 (se zakreslenými číslicemi). Hodiny pohání strojek SAM — samostavitelný hodinový strojek pro připojení k MOBALine.

## Další zařízení Mobatime v expozici

![Mobatime — NTP LAN rozhraní](/img/Mobatime/NTP_LAN.jpg)

![Mobatime — digitální hodiny OMA 50](/img/Mobatime/OMA50.jpg)

![Mobatime — digitální hodiny OMA 50 (provedení)](/img/Mobatime/OMA50_v.jpg)

![Mobatime — řídicí jednotka s DCF](/img/Mobatime/PIK_dcf1.jpg)
