#!/usr/bin/env node
// Vytvoří stub karty pro zbývající lokality ze Skálovy Závěrečné zprávy 2004
// (třída 3, 4, 5) + vyřeší 5 ambiguitních případů.
// Pro nejasné případy stub explicitně označí *„VYŽADUJE OVĚŘENÍ"*.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const DIR = path.join(ROOT, 'content', 'soupis-veznich-hodin');

const SKALA_2004_PRAMEN_BLOCK = `  - citace: |
      SKÁLA, Petr. *Závěrečná zpráva o provedení soupisu historicky cenných věžních hodinových strojů ve středočeském regionu*. Sadská, prosinec 2004. — Rukopis (MS Word, 138 strojů zdokumentovaných v letech 1996–2004), archiv atelieru veznihodiny.cz.
    type: zprava
    author: "Petr Skála"`;

function classDescription(c) {
  const klass = String(c).replace(/x\?/, '').trim();
  switch (klass) {
    case '1': return '**Třída 1** — nejvyšší hodnocení v rámci celého soupisu (138 strojů); priorita pro památkovou ochranu.';
    case '2': return '**Třída 2** — vysoce hodnotný stroj; uveden ve výběru navrženém k památkové ochraně.';
    case '3': return '**Třída 3** — historicky cenný stroj.';
    case '4': return '**Třída 4** — zajímavý a hodnotný stroj.';
    case '5': return '**Třída 5** — zajímavá a cenná technická památka.';
    default: return `**Třída ${c}**.`;
  }
}

// Helper to slugify
function slugify(s) {
  return s.toLowerCase()
    .replace(/[áàâ]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íì]/g, 'i')
    .replace(/[óò]/g, 'o').replace(/[úůù]/g, 'u').replace(/[ý]/g, 'y')
    .replace(/[čć]/g, 'c').replace(/[ď]/g, 'd').replace(/[ě]/g, 'e')
    .replace(/[ňń]/g, 'n').replace(/[řŕ]/g, 'r').replace(/[šś]/g, 's')
    .replace(/[ť]/g, 't').replace(/[ž]/g, 'z')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// (lokalita, obec, budova, popis, klass, docYear, [hodinar], [hodinarText], [rok], [okres], [kraj], [extraNote])
const STUBS_TBD = [
  // === Třída 3 (17 lokalit) ===
  { lokalita: 'Benátky n. Jizerou', obec: 'Benátky nad Jizerou', budova: 'Kostel Panny Marie', popis: 'Londensperger? konec 18. st.?', klass: 3, docYear: 1996, hodinarText: 'připisováno dílně Londensbergerů (Landesbergerů) — atribuce nejistá; konec 18. století', okres: 'Mladá Boleslav', kraj: 'Středočeský',
    extraNote: '⚠️ **VYŽADUJE OVĚŘENÍ** — Skála 2004 atribuci uvádí s otazníkem. Atribuce dílně Landesbergerů by si vyžádala srovnání konstrukčních detailů s dochovanými stroji rodu (Měšice 1774, Dobříš 1791).',
  },
  { lokalita: 'Činěves', obec: 'Činěves', budova: 'Kostel sv. Václava', popis: 'Jan Mareš konec 19. stol.', klass: 3, docYear: 1998, hodinarText: 'Jan Mareš (konec 19. století)', okres: 'Nymburk', kraj: 'Středočeský' },
  { lokalita: 'Dublovice', obec: 'Dublovice', budova: 'Kostel Nejsvětější Trojice', popis: 'F. X. Schnaider + L. Hainz 1878', klass: 3, docYear: 2003, hodinarText: 'F. X. Schnaider + L. Hainz, 1878', okres: 'Příbram', kraj: 'Středočeský',
    extraNote: 'Stroj nese kombinaci dvou autorů — pravděpodobně původní stroj F. X. Schnaidera (1878) a pozdější doplnění/oprava od L. Hainze; vyžaduje pohled in situ.',
  },
  { lokalita: 'Horky', obec: 'Horky nad Jizerou', budova: 'Zámek', popis: 'konec 18. st.?', klass: 3, docYear: 1998, hodinarText: 'neznámý, konec 18. století (?)', okres: 'Mladá Boleslav', kraj: 'Středočeský',
    extraNote: '⚠️ **VYŽADUJE OVĚŘENÍ** — datace pouze odhadem dle vzhledu stroje.',
  },
  { lokalita: 'Chlum u Sedlčan', obec: 'Chlum (u Sedlčan)', budova: 'Kostel sv. Václava', popis: 'nezn. I. pol. 19. století', klass: 3, docYear: 2002, hodinarText: 'neznámý, I. polovina 19. století', okres: 'Příbram', kraj: 'Středočeský' },
  { lokalita: 'Jemniště', obec: 'Postupice', cast: 'Jemniště', budova: 'Zámek Jemniště', popis: 'barokní kovaný I. pol. 18. st. ?', klass: 3, docYear: 1998, hodinarText: 'barokní kovaný stroj, I. polovina 18. století (?)', okres: 'Benešov', kraj: 'Středočeský' },
  { lokalita: 'Kostelec nad Labem (radnice)', obec: 'Kostelec nad Labem', budova: 'Radnice', popis: 'nezn. poč. 20. stol.?', klass: 3, docYear: 1996, hodinarText: 'neznámý, počátek 20. století (?)', okres: 'Mělník', kraj: 'Středočeský',
    extraNote: 'Pozor — v Kostelci nad Labem jsou doloženy 3 různé hodinové stroje: tato karta = stroj na věži radnice. Viz též: půda radnice (kovaný barokní, klas. 2) a kostel sv. Martina (L. Hainz 1891, klas. 5).',
  },
  { lokalita: 'Liblice', obec: 'Liblice', budova: 'Kostel sv. Václava', popis: 'pásnicový rám', klass: '3x?', docYear: 1999, hodinarText: 'neznámý, stroj s pásnicovým rámem', okres: 'Mělník', kraj: 'Středočeský' },
  { lokalita: 'Modletice', obec: 'Modletice', budova: 'Zámek', popis: 'nezn. 1. čtvrť 19. stol. ?', klass: 3, docYear: 2003, hodinarText: 'neznámý, 1. čtvrtina 19. století (?)', okres: 'Praha-východ', kraj: 'Středočeský' },
  { lokalita: 'Nové Dvory', obec: 'Nové Dvory', budova: 'Kostel sv. Anny', popis: 'barokní kovaný 18. stol. přestav.', klass: 3, docYear: 1998, hodinarText: 'barokní kovaný stroj 18. století (přestavován)', okres: 'Kutná Hora', kraj: 'Středočeský' },
  { lokalita: 'Obecnice', obec: 'Obecnice', budova: 'Kostel sv. Šimona a Judy', popis: 'nezn. 19. stol.', klass: 3, docYear: 1997, hodinarText: 'neznámý, 19. století', okres: 'Příbram', kraj: 'Středočeský' },
  { lokalita: 'Rousínov', obec: 'Rousínov', budova: 'Kostel Narození Panny Marie', popis: 'nezn. kov. barokní', klass: 3, docYear: 1997, hodinarText: 'barokní kovaný, neznámý', okres: 'Rakovník', kraj: 'Středočeský',
    extraNote: '⚠️ Pozor — v ČR je více obcí jménem Rousínov (např. Rousínov u Vyškova). Skála 2004 dokumentoval středočeský region — pravděpodobně Rousínov u Rakovníka.',
  },
  { lokalita: 'Svatý Jan pod Skalou (kůr)', obec: 'Svatý Jan pod Skalou', budova: 'Kostel Narození sv. Jana Křtitele — kůr', popis: 'barokní stroj kovaný pol. 18. st.?', klass: 3, docYear: 1998, hodinarText: 'barokní kovaný stroj, polovina 18. století (?)', okres: 'Beroun', kraj: 'Středočeský',
    extraNote: 'Ve Sv. Janu pod Skalou jsou ve stejném kostele **dva hodinové stroje** — tento na kůru (klas. 3) a další ve věži (Kadlec/Adamec 1936, klas. 5).',
  },
  { lokalita: 'Škvorec', obec: 'Škvorec', budova: 'Zámek Škvorec', popis: 'barokní kovaný okolo 1750?', klass: 3, docYear: 1997, hodinarText: 'barokní kovaný stroj okolo 1750 (?)', okres: 'Praha-východ', kraj: 'Středočeský' },
  { lokalita: 'Veltrusy', obec: 'Veltrusy', budova: 'Zámek Veltrusy (depozitář)', popis: 'kovaný stroj 1762? depositář', klass: 3, docYear: 2001, hodinarText: 'kovaný stroj, 1762 (?)', okres: 'Mělník', kraj: 'Středočeský', stav: 'preneseno',
    extraNote: 'Stroj je uložen v **depozitáři zámku Veltrusy**, ne ve věži — byl odtud přesunut.',
  },
  { lokalita: 'Vysoká', obec: 'Vysoká u Příbrami', budova: 'Kostel sv. Václava', popis: 'nezn. pol. 18. stol. ?', klass: 3, docYear: 2002, hodinarText: 'neznámý, polovina 18. století (?)', okres: 'Příbram', kraj: 'Středočeský',
    extraNote: '⚠️ Pozor — v ČR je více obcí jménem Vysoká. Skála 2004 dokumentoval středočeský region; pravděpodobně Vysoká u Příbrami.',
  },
  { lokalita: 'Žerčice', obec: 'Žerčice', budova: 'Kostel sv. Mikuláše', popis: 'nezn. poč. 19. stol.', klass: 3, docYear: 1996, hodinarText: 'neznámý, počátek 19. století', okres: 'Mladá Boleslav', kraj: 'Středočeský' },
  // === Třída 4 (16 lokalit) ===
  { lokalita: 'Hluboš', obec: 'Hluboš', budova: 'Zámek Hluboš', popis: 'L. Hainz 1880', klass: 4, docYear: 1999, hodinar: 'l-hainz', rok: 1880, okres: 'Příbram', kraj: 'Středočeský' },
  { lokalita: 'Hrubý Jeseník', obec: 'Hrubý Jeseník', budova: 'Kostel sv. Václava', popis: 'L. Hainz konec 19. stol.', klass: 4, docYear: 1999, hodinar: 'l-hainz', hodinarText: 'L. Hainz, konec 19. století', okres: 'Nymburk', kraj: 'Středočeský' },
  { lokalita: 'Chleby', obec: 'Chleby', budova: 'Evangelický kostel', popis: 'Heršt? (Mareš?) konec 19. stol.', klass: 4, docYear: 1999, hodinarText: 'Heršt nebo Mareš (?), konec 19. století', okres: 'Nymburk', kraj: 'Středočeský',
    extraNote: '⚠️ **Atribuce nejistá** — stroj v Skálově zprávě označen otazníkem mezi Herštem a Marešem.',
  },
  { lokalita: 'Chocerady', obec: 'Chocerady', budova: 'Kostel Nanebevzetí Panny Marie', popis: 'Schauer ev. Schneider, sig. Hainz', klass: 4, docYear: 2004, hodinarText: 'Schauer nebo Schneider (signováno Hainz)', okres: 'Benešov', kraj: 'Středočeský',
    extraNote: '⚠️ **Atribuce nejistá** — stroj nese signaturu Hainz, ale konstrukce odpovídá pravděpodobně dílně Schauer (Wien) nebo Schneider.',
  },
  { lokalita: 'Chotouň', obec: 'Chotouň', cast: 'Choťánky', budova: 'Kostel sv. Prokopa', popis: 'z dílny J. Janaty konec 19. stol', klass: 4, docYear: 2002, hodinar: 'jan-janata', hodinarText: 'z dílny Jana Janaty, konec 19. století', okres: 'Kolín', kraj: 'Středočeský' },
  { lokalita: 'Kladno', obec: 'Kladno', budova: 'Radnice', popis: 'Josef Kohlert', klass: 4, docYear: 2001, hodinarText: 'Josef Kohlert (zřejmě jiný než kraslický Kohlert)', okres: 'Kladno', kraj: 'Středočeský',
    extraNote: '⚠️ Atribuce **Josef Kohlert** — nejasné, zda souvisí s [kraslickou firmou Kohlert](/hodinari/kohlert) nebo jde o jinou pražskou hodinářskou linii.',
  },
  { lokalita: 'Líšnice', obec: 'Líšnice', budova: 'Kostel Všech svatých', popis: 'kovaný nezn.', klass: 4, docYear: 2002, hodinarText: 'kovaný, neznámý', okres: 'Praha-západ', kraj: 'Středočeský' },
  { lokalita: 'Sloveč', obec: 'Sloveč', budova: 'Kostel sv. Martina', popis: 'Jan Mareš 1886', klass: 4, docYear: 2003, hodinarText: 'Jan Mareš', rok: 1886, okres: 'Nymburk', kraj: 'Středočeský' },
  { lokalita: 'Suchdol', obec: 'Suchdol', budova: 'Kostel sv. Markéty', popis: 'K. Adamec malý konec 19. stol.', klass: '4x?', docYear: 1997, hodinarText: 'Karel Adamec (Čáslav), malý stroj, konec 19. století', okres: 'Kutná Hora', kraj: 'Středočeský',
    extraNote: '⚠️ Pozor — Suchdol je více obcí; pravděpodobně **Suchdol u Kutné Hory**.',
  },
  { lokalita: 'Suchomasty', obec: 'Suchomasty', budova: 'Zámek Suchomasty', popis: 'L. Hainz přelom 19. a 20. stol.', klass: 4, docYear: 2002, hodinar: 'l-hainz', hodinarText: 'L. Hainz, přelom 19. a 20. století', okres: 'Beroun', kraj: 'Středočeský' },
  { lokalita: 'Tvoršovice', obec: 'Tvoršovice', budova: 'Zámek Tvoršovice', popis: 'L. Hainz', klass: 4, docYear: 1999, hodinar: 'l-hainz', okres: 'Benešov', kraj: 'Středočeský' },
  { lokalita: 'Tuchoměřice', obec: 'Tuchoměřice', budova: 'Zámek Tuchoměřice', popis: 'kovaný, poč. 19. stol.?', klass: 4, docYear: 2004, hodinarText: 'kovaný, počátek 19. století (?)', okres: 'Praha-západ', kraj: 'Středočeský' },
  { lokalita: 'Týnec nad Labem', obec: 'Týnec nad Labem', budova: 'Radnice', popis: 'Emil Schauer Wien poč. 20. stol.', klass: 4, docYear: 1998, hodinarText: 'Emil Schauer, Wien, počátek 20. století', okres: 'Kolín', kraj: 'Středočeský' },
  { lokalita: 'Velvary', obec: 'Velvary', budova: 'Pražská brána', popis: 'nezn. 19. století', klass: 4, docYear: 2001, hodinarText: 'neznámý, 19. století', okres: 'Kladno', kraj: 'Středočeský' },
  { lokalita: 'Vojkov', obec: 'Vojkov', budova: 'Kostel sv. Jakuba Staršího', popis: 'K. Adamec', klass: 4, docYear: 2002, hodinarText: 'Karel Adamec (Čáslav)', okres: 'Benešov', kraj: 'Středočeský' },
  { lokalita: 'Vrbová Lhota', obec: 'Vrbová Lhota', budova: 'Škola', popis: 'Grubský 20. stol.', klass: 4, docYear: 1996, hodinarText: 'Jindřich Grubský (Pečky), 20. století', okres: 'Nymburk', kraj: 'Středočeský' },
  // === Třída 5 (25 lokalit) ===
  { lokalita: 'Brodce', obec: 'Brodce', budova: 'Stará radnice', popis: 'Jindřich Grubský poč. 20. stol.', klass: 5, docYear: 1998, hodinarText: 'Jindřich Grubský (Pečky), počátek 20. století', okres: 'Mladá Boleslav', kraj: 'Středočeský' },
  { lokalita: 'Čáslav', obec: 'Čáslav', budova: 'Kostel sv. Petra a Pavla', popis: 'K. Adamec 1910', klass: 5, docYear: 2002, hodinarText: 'Karel Adamec (Čáslav)', rok: 1910, okres: 'Kutná Hora', kraj: 'Středočeský' },
  { lokalita: 'Čelákovice', obec: 'Čelákovice', budova: 'Radnice', popis: 'K. Adamec malý poč. 20. stol.', klass: '5x?', docYear: 1996, hodinarText: 'Karel Adamec (Čáslav), malý stroj, počátek 20. století', okres: 'Praha-východ', kraj: 'Středočeský' },
  { lokalita: 'Červený Hrádek', obec: 'Sedlec-Prčice', cast: 'Červený Hrádek', budova: 'Zámek Červený Hrádek', popis: 'K. Adamec malý jen hodinový', klass: 5, docYear: 2001, hodinarText: 'Karel Adamec (Čáslav), malý jen hodinový', okres: 'Příbram', kraj: 'Středočeský',
    extraNote: '⚠️ Pozor — v ČR je více zámků jménem Červený Hrádek (např. u Jirkova v Ústeckém kraji). Skála 2004 dokumentoval středočeský region; pravděpodobně Červený Hrádek u Sedlce-Prčic.',
  },
  { lokalita: 'Kněževes', obec: 'Kněževes', budova: 'Sušička chmele', popis: 'L. Hainz 1929', klass: 5, docYear: 2001, hodinar: 'l-hainz', rok: 1929, okres: 'Rakovník', kraj: 'Středočeský' },
  { lokalita: 'Kostelec n. Labem (sv. Martin)', obec: 'Kostelec nad Labem', budova: 'Kostel sv. Martina', popis: 'L. Hainz malý 1891', klass: 5, docYear: 1996, hodinar: 'l-hainz', rok: 1891, okres: 'Mělník', kraj: 'Středočeský' },
  { lokalita: 'Kostomlátky', obec: 'Kostomlátky', budova: 'Kaplička', popis: 'Jan Mareš ? 1896', klass: 5, docYear: 1998, hodinarText: 'Jan Mareš (?)', rok: 1896, okres: 'Nymburk', kraj: 'Středočeský',
    extraNote: '⚠️ **Atribuce nejistá** — Skála ji uvádí s otazníkem.',
  },
  { lokalita: 'Krušovice', obec: 'Krušovice', budova: 'Bývalá základní škola', popis: 'Karel Adamec velký', klass: 5, docYear: 2001, hodinarText: 'Karel Adamec (Čáslav), velký stroj', okres: 'Rakovník', kraj: 'Středočeský' },
  { lokalita: 'Na Štěpáně', obec: 'Sázava', cast: 'Na Štěpáně', budova: 'Zámeček Na Štěpáně', popis: 'neznámý okolo 1916–18', klass: 5, docYear: 2004, hodinarText: 'neznámý, okolo 1916–1918', okres: 'Benešov', kraj: 'Středočeský',
    extraNote: '⚠️ **Lokalita „Na Štěpáně"** — nejasná identifikace. Vyžaduje ověření.',
  },
  { lokalita: 'Nehvizdy', obec: 'Nehvizdy', budova: 'Kostel sv. Václava', popis: 'K. Adamec velký konec 19. stol.?', klass: 5, docYear: 1997, hodinarText: 'Karel Adamec (Čáslav), velký stroj, konec 19. století (?)', okres: 'Praha-východ', kraj: 'Středočeský' },
  { lokalita: 'Ohaře', obec: 'Ohaře', budova: 'Kostel sv. Jana Nepomuckého', popis: 'Karel Adamec velký', klass: 5, docYear: 2001, hodinarText: 'Karel Adamec (Čáslav), velký stroj', okres: 'Kolín', kraj: 'Středočeský' },
  { lokalita: 'Petrovice', obec: 'Petrovice', budova: 'Kostel sv. Petra a Pavla', popis: 'L. Hainz', klass: 5, docYear: 2002, hodinar: 'l-hainz', okres: 'Příbram', kraj: 'Středočeský',
    extraNote: '⚠️ Pozor — v ČR je více obcí jménem Petrovice. Skála 2004 dokumentoval středočeský region.',
  },
  { lokalita: 'Polní Voděrady', obec: 'Polní Voděrady', budova: 'Kostel Navštívení Panny Marie', popis: 'K. Adamec jen hod. bití poč. 20. st.', klass: 5, docYear: 1998, hodinarText: 'Karel Adamec (Čáslav), jen hodinové bití, počátek 20. století', okres: 'Kolín', kraj: 'Středočeský' },
  { lokalita: 'Rakovník', obec: 'Rakovník', budova: 'Škola', popis: 'L. Hainz malý (jen jicí)', klass: 5, docYear: 2001, hodinar: 'l-hainz', hodinarText: 'L. Hainz, malý stroj (jen jicí)', okres: 'Rakovník', kraj: 'Středočeský' },
  { lokalita: 'Rožmitál pod Třemšínem', obec: 'Rožmitál pod Třemšínem', budova: 'Radnice', popis: 'L. Hainz', klass: 5, docYear: 2002, hodinar: 'l-hainz', okres: 'Příbram', kraj: 'Středočeský' },
  { lokalita: 'Sedlčany', obec: 'Sedlčany', budova: 'Kostel sv. Martina', popis: 'Karel Adamec, Čáslav', klass: 5, docYear: 1999, hodinarText: 'Karel Adamec (Čáslav)', okres: 'Příbram', kraj: 'Středočeský' },
  { lokalita: 'Strenice', obec: 'Strenice', budova: 'Kostel sv. Bartoloměje', popis: 'L. Hainz malý 1896', klass: 5, docYear: 1996, hodinar: 'l-hainz', rok: 1896, okres: 'Mladá Boleslav', kraj: 'Středočeský' },
  { lokalita: 'Svatý Jan pod Skalou (věž)', obec: 'Svatý Jan pod Skalou', budova: 'Kostel Narození sv. Jana Křtitele — věž', popis: 'Kadlec (Adamec) 1936', klass: 5, docYear: 1998, hodinarText: 'Kadlec (Adamec), 1936', okres: 'Beroun', kraj: 'Středočeský',
    extraNote: 'Ve Sv. Janu pod Skalou jsou **dva hodinové stroje** — tento na věži (1936) a starší na kůru (barokní kovaný, klas. 3).',
  },
  { lokalita: 'Úmyslovice', obec: 'Úmyslovice', budova: 'Kostel sv. Linharta', popis: 'J. Grubský 1930', klass: 5, docYear: 2003, hodinarText: 'Jindřich Grubský (Pečky)', rok: 1930, okres: 'Nymburk', kraj: 'Středočeský' },
  { lokalita: 'Veleliby', obec: 'Veleliby', budova: 'Kostel sv. Václava', popis: '(J. Mareš?) konec 19. stol.', klass: 5, docYear: 1999, hodinarText: 'J. Mareš (?), konec 19. století', okres: 'Nymburk', kraj: 'Středočeský',
    extraNote: '⚠️ **Atribuce nejistá** — stroj v Skálově zprávě označen otazníkem.',
  },
  { lokalita: 'Vojkovice', obec: 'Vojkovice', budova: 'Silo', popis: 'L. Hainz 1918', klass: 5, docYear: 2001, hodinar: 'l-hainz', rok: 1918, okres: 'Mělník', kraj: 'Středočeský',
    extraNote: '⚠️ Pozor — v ČR je více obcí jménem Vojkovice. Skála 2004 dokumentoval středočeský region; pravděpodobně Vojkovice u Mělníka.',
  },
  { lokalita: 'Vraný', obec: 'Vraný', budova: 'Radnice', popis: 'L. Hainz, malý, jen hod. bicí', klass: 5, docYear: 2001, hodinar: 'l-hainz', hodinarText: 'L. Hainz, malý stroj, jen hodinové bicí', okres: 'Kladno', kraj: 'Středočeský' },
  { lokalita: 'Vrbice', obec: 'Vrbice', budova: 'Kostel sv. Martina', popis: 'J. Mareš?', klass: 5, docYear: 1999, hodinarText: 'J. Mareš (?)', okres: 'Mělník', kraj: 'Středočeský',
    extraNote: '⚠️ **Atribuce nejistá** + **lokalita nejistá** — v ČR je více obcí jménem Vrbice. Skála 2004 dokumentoval středočeský region.',
  },
  { lokalita: 'Zibohlavy', obec: 'Kolín', cast: 'Zibohlavy', budova: 'Kostel sv. Martina', popis: 'Karel Adamec, Čáslav', klass: '5x?', docYear: 1999, hodinarText: 'Karel Adamec (Čáslav)', okres: 'Kolín', kraj: 'Středočeský' },
  { lokalita: 'Zlonice', obec: 'Zlonice', budova: 'Kostel Nanebevzetí Panny Marie', popis: 'L. Hainz velký', klass: 5, docYear: 2001, hodinar: 'l-hainz', hodinarText: 'L. Hainz, velký stroj', okres: 'Kladno', kraj: 'Středočeský' },
];

// === Stuby pro chybějící z disambig listu ===
const DISAMBIG_NEW = [
  { lokalita: 'Kutná Hora — sv. Jakub', obec: 'Kutná Hora', budova: 'Kostel sv. Jakuba', popis: 'nezn. demontovaný', klass: 5, docYear: 1997, hodinarText: 'neznámý, stroj demontovaný', okres: 'Kutná Hora', kraj: 'Středočeský',
    file: 'nedatovano-kutna-hora-svaty-jakub-skala-2004.mdx', stav: 'preneseno',
    extraNote: 'Stroj je **demontovaný** — pravděpodobně už není ve věži kostela; aktuální umístění zatím neověřeno.',
  },
  { lokalita: 'Libice (evangelický kostel)', obec: 'Libice nad Cidlinou', budova: 'Evangelický kostel', popis: 'Jan Mareš 1895', klass: 4, docYear: 1997, hodinarText: 'Jan Mareš', rok: 1895, okres: 'Nymburk', kraj: 'Středočeský',
    file: '1895-libice-nad-cidlinou-evangelicky-mares.mdx',
    extraNote: 'Pozor — v Libici nad Cidlinou jsou dva hodinové stroje (evangelický kostel + kostel sv. Vojtěcha). Tato karta = evangelický (Jan Mareš 1895). Pro hodiny v kostele sv. Vojtěcha [viz samostatná karta](/soupis-veznich-hodin/nedatovano-libice-nad-cidlinou-svaty-vojtech-skala-2004).',
  },
  { lokalita: 'Libice (sv. Vojtěch)', obec: 'Libice nad Cidlinou', budova: 'Kostel sv. Vojtěcha', popis: 'nezn. II. pol. 19. stol.', klass: 3, docYear: 1997, hodinarText: 'neznámý, II. polovina 19. století', okres: 'Nymburk', kraj: 'Středočeský',
    file: 'nedatovano-libice-nad-cidlinou-svaty-vojtech-skala-2004.mdx',
    extraNote: 'Pozor — v Libici nad Cidlinou jsou dva hodinové stroje (kostel sv. Vojtěcha + evangelický kostel). Pro evangelický [viz samostatná karta](/soupis-veznich-hodin/1895-libice-nad-cidlinou-evangelicky-mares).',
  },
];

let created = 0, skipped = 0;
function buildAndWrite(e) {
  let file = e.file;
  if (!file) {
    const baseSlug = e.rok
      ? `${e.rok}-${slugify(e.lokalita.replace(/\s*\(.*\)/, ''))}-skala-2004`
      : `nedatovano-${slugify(e.lokalita.replace(/\s*\(.*\)/, ''))}-skala-2004`;
    file = `${baseSlug}.mdx`;
  }
  const fp = path.join(DIR, file);
  if (fs.existsSync(fp)) {
    console.log(`SKIP existing: ${file}`);
    skipped++;
    return;
  }
  const slug = file.replace(/\.mdx$/, '');
  const isMissing = String(e.klass).includes('x?');
  const stav = e.stav || (isMissing ? 'ztracene' : 'in_situ');

  const lines = [];
  lines.push('---');
  lines.push(`slug: "${slug}"`);
  lines.push(`rok: ${typeof e.rok === 'number' ? e.rok : `"${e.rok || '?'}"`}`);
  if (e.hodinar) lines.push(`hodinar: "${e.hodinar}"`);
  if (e.hodinarText) lines.push(`hodinarText: "${e.hodinarText.replace(/"/g, '\\"')}"`);
  lines.push('puvodniMisto:');
  lines.push(`  obec: "${e.obec}"`);
  if (e.cast) lines.push(`  cast: "${e.cast}"`);
  lines.push(`  budova: "${e.budova}"`);
  if (e.okres) lines.push(`  okres: "${e.okres}"`);
  if (e.kraj) lines.push(`  kraj: "${e.kraj}"`);
  lines.push('  zeme: "CZ"');
  lines.push(`stav: "${stav}"`);
  lines.push('chod: "neznamy"');
  lines.push('prameny:');
  lines.push(SKALA_2004_PRAMEN_BLOCK);
  lines.push(`zdrojDat: "skala_zprava_2004"`);
  lines.push(`posledniOvereni: "2026-05-05"`);
  lines.push('---');
  lines.push('');
  lines.push(`Věžní hodiny v lokalitě **${e.obec}** (${e.budova}) — zdokumentováno [Petrem Skálou](/hodinari/petr-skala) v roce **${e.docYear}**, popis: *„${e.popis}"*. Detailní karta zatím nezpracována.`);
  lines.push('');
  lines.push('## Hodnocení v Skálově zprávě 2004');
  lines.push('');
  const xBadge = isMissing ? ' (s poznámkou „x?" — stroj možná již není na svém místě)' : '';
  const klassNum = String(e.klass).replace(/x\?/, '').trim();
  lines.push(`Stroj získal v Skálově závěrečném soupisu z prosince 2004 **klasifikaci ${klassNum}**${xBadge} (rozsah 1–5, kde 1 je nejvyšší). ${classDescription(e.klass)}`);
  if (e.extraNote) {
    lines.push('');
    lines.push(e.extraNote);
  }
  lines.push('');
  lines.push('* * *');
  lines.push('');
  lines.push('*Karta vychází ze Skálovy závěrečné zprávy soupisu středočeského regionu (Sadská, prosinec 2004). Detailní popis stroje, datace a další údaje vyžadují další doplnění (z místních pramenů, restaurátorských zpráv, apod.).*');
  fs.writeFileSync(fp, lines.join('\n') + '\n', 'utf8');
  console.log(`CREATED ${file} (klas. ${e.klass})`);
  created++;
}

for (const e of [...STUBS_TBD, ...DISAMBIG_NEW]) buildAndWrite(e);
console.log(`\nTotal: ${created} created, ${skipped} skipped.`);
