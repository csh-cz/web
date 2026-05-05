#!/usr/bin/env node
// Aplikace Skálovy Závěrečné zprávy 2004 (138 strojů středočeského regionu)
// na všechny existující karty soupisu — ochrana proti duplicitám.
//
// Pro každou položku ze Skálova soupisu:
//   - Hledá existující kartu obsahující obec (case-insensitive)
//   - Pokud karta existuje a NEOBSAHUJE už referenci na Skálovu 2004 zprávu →
//     doplní pramen + sekci „Hodnocení v Skálově zprávě 2004"
//   - Pokud existuje více kandidátních karet → vyžaduje ruční review (vypíše)
//   - Pokud neexistuje → zařadí do reportu (k případnému budoucímu vytvoření)

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const DIR = path.join(ROOT, 'content', 'soupis-veznich-hodin');

// Položky Skálova soupisu 2004 — 138 záznamů (přepsáno z `zdroje/soupis hodin skála.doc`).
// Pole: [poradoveCislo, lokalita, rokDokumentace, popisStroje, klasifikace]
const ENTRIES = [
  [1, 'Bakov', 2001, 'Jan Prokeš malý', 3],
  [2, 'Bečváry', 2003, 'Londensperger?', 1],
  [3, 'Benátky n. Jizerou', 1996, 'Londensperger? konec 18. st.?', 3],
  [4, 'Beroun', 1998, 'kovaný nezn.', '1x?'],
  [5, 'Bezno (kostel)', 1996, 'L. Hainz velký 1903', 5],
  [6, 'Bezno (zámek)', 1996, 'F. Summerecker I. pol. 19. stol.?', 1],
  [7, 'Bošín', 1996, 'Jan Prokeš 1887', 2],
  [8, 'Brandýs nad Labem', 1996, 'P. Neumann 1702', 1],
  [9, 'Brodce', 1998, 'Jindřich Grubský poč. 20. stol.', 5],
  [10, 'Býchory', 1998, 'Jan Prokeš, zvonicí stroj 1868', 2],
  [11, 'Čáslav', 2002, 'K. Adamec 1910', 5],
  [12, 'Čelákovice', 1996, 'K. Adamec malý poč. 20. stol.', '5x?'],
  [13, 'Červený Hrádek', 2001, 'K. Adamec malý jen hodinový', 5],
  [14, 'Český Brod', 2003, 'K. Šimek Č. Brod?', 4],
  [15, 'Činěves', 1998, 'Jan Mareš konec 19. stol.', 3],
  [16, 'Dobříš', 1998, 'F. Londensperger 1791', 1],
  [17, 'Drahenice', 2003, '1728', 2],
  [18, 'Dublovice', 2003, 'F. X. Schnaider + L. Hainz 1878', 3],
  [19, 'Dymokury', 1998, 'Jan Prokeš 1869', 3],
  [20, 'Hluboš', 1999, 'L. Hainz 1880', 4],
  [21, 'Horky', 1998, 'konec 18. st.?', 3],
  [22, 'Horní Slivno', 2002, 'Jan Prokeš', 4],
  [23, 'Horní Vidim', 2001, 'V. Krečmer', 4],
  [24, 'Hořín', 2002, 'Kovaný před pol. 18. stol.', 1],
  [25, 'Hradišťko', 1996, 'nezn. 2. pol. 18. stol?', 1],
  [26, 'Hrubý Jeseník', 1999, 'L. Hainz konec 19. stol.', 4],
  [27, 'Chleby', 1999, 'Heršt? (Mareš?) konec 19. stol.', 4],
  [28, 'Chlum u Sedlčan', 2002, 'nezn. I. pol. 19. století', 3],
  [29, 'Chocerady', 2004, 'Schauer ev. Schneider, sig. Hainz', 4],
  [30, 'Chotětov', 1998, 'Jan Prokeš 2. pol. 19. stol.', 3],
  [31, 'Chotouň', 2002, 'z dílny J. Janaty konec 19. stol', 4],
  [32, 'Chrást', 1997, 'K. Šimek 1930?', 4],
  [33, 'Chroustov (Hainz)', 2003, 'L. Hainz nejst.', 3],
  [34, 'Chroustov (Prokeš)', 2003, 'Jan Prokeš 1891', 4],
  [35, 'Jemniště', 1998, 'barokní kovaný I. pol. 18. st.?', 3],
  [36, 'Kačina', 1998, 'Franz Summerecker 1847', 3],
  [37, 'Karlštejn', 1999, 'barokní kovaný 18. stol.', 1],
  [38, 'Katusice', 2003, 'Jan Prokeš 1855', 3],
  [39, 'Kladno', 2001, 'Josef Kohlert', 4],
  [40, 'Kněževes', 2001, 'L. Hainz 1929', 5],
  [41, 'Kněžice', 2003, 'kovaný I. pol. 19. stol?', 1],
  [42, 'Kostelec nad Labem (půda radnice)', 1996, 'kovaný barokní', 2],
  [43, 'Kostelec nad Labem (radnice)', 1996, 'nezn. poč. 20. stol.?', 3],
  [44, 'Kostelec nad Labem (kostel sv. Martina)', 1996, 'L. Hainz malý 1891', 5],
  [45, 'Kostelní Lhota', 1996, 'Jan Janata 3. čtvrt. 19. stol.', 3],
  [46, 'Kostomlátky', 1998, 'Jan Mareš? 1896', 5],
  [47, 'Kouřim', 1997, 'Jan Prokeš elektr.', 5],
  [48, 'Krušovice', 2001, 'Karel Adamec velký', 5],
  [49, 'Křivoklát', 1997, 'Slévárna Nižbor 1817', 3],
  [50, 'Kutná Hora (Jezuitská kolej)', 1998, 'barokní kovaný pol. 18. st.?', 1],
  [51, 'Kutná Hora (sv. Jakub)', 1997, 'nezn. demontovaný', 5],
  [52, 'Kyšice', 2003, 'nezn., kovaný', 1],
  [53, 'Libice (evang.)', 1997, 'Jan Mareš 1895', 4],
  [54, 'Libice (sv. Vojtěch)', 1997, 'nezn. II. pol. 19. stol.', 3],
  [55, 'Liblice', 1999, 'pásnicový rám', '3x?'],
  [56, 'Libušín', 1997, 'Václav Krečmer 1898', 3],
  [57, 'Líšnice', 2002, 'kovaný nezn.', 4],
  [58, 'Lochovice', 2002, 'nezn. kovaný pol. 18. stol.?', 3],
  [59, 'Loučeň', 1996, 'Franz Summerecker I. pol. 19. st.', 1],
  [60, 'Lužec', 2001, 'Franz Summerecker okolo 1830', 2],
  [61, 'Městec Králové', 2002, 'Jan Janata', 2],
  [62, 'Měšice', 1997, 'S. Londensperger 1776', 1],
  [63, 'Mnichovo Hradiště', 2001, 'barokní kovaný, kotvový krok', 2],
  [64, 'Mníšek pod Brdy', 1999, 'I. pol. 19. stol.', 3],
  [65, 'Modletice', 2003, 'nezn. 1. čtvrť 19. stol.?', 3],
  [66, 'Mšec', 2003, 'nezn. kovaný', 1],
  [67, 'Na Štěpáně', 2004, 'neznámý okolo 1916–18', 5],
  [68, 'Načeradec', 1999, 'barokní kovaný', 2],
  [69, 'Nehvizdy', 1997, 'K. Adamec velký konec 19. stol.?', 5],
  [70, 'Niměřice', 1996, 'Franz Summerecker 1852', 1],
  [71, 'Nižbor', 1997, 'nezn. I. pol. 18. stol.?', 1],
  [72, 'Nové Dvory', 1998, 'barokní kovaný 18. stol. přestav.', 3],
  [73, 'Nymburk (sv. Jiljí)', 1997, 'Jan Janata 1856?', 2],
  [74, 'Obděnice', 2002, 'nezn. pol. 18. stol.?', 2],
  [75, 'Obecnice', 1997, 'nezn. 19. stol.', 3],
  [76, 'Obříství', 2001, 'bar. kovaný, vřet. krok klid.', 1],
  [77, 'Odlochovice', 2002, 'nezn. po pol. 19. stol.', 2],
  [78, 'Ohaře', 2001, 'Karel Adamec velký', 5],
  [79, 'Ondřejov', 2004, 'Jan Prokeš, Sobotka 1876', 4],
  [80, 'Opolany', 1997, 'Jan Mareš 1893', 4],
  [81, 'Osov', 2002, 'kovaný II. čtvrť 18. stol. odstav.', 3],
  [82, 'Pečky', 2004, 'Jindř. Grubský, Pečky 1914–15', 4],
  [83, 'Petrovice', 2002, 'L. Hainz', 5],
  [84, 'Plaňany', 1997, 'Jan Janata 1868', 2],
  [85, 'Poděbrady (kostel)', 2004, 'J. Heršt? J. Mareš? okolo 1900', 4],
  [86, 'Poděbrady (zámek)', 1996, 'Jan Janata 1870', 2],
  [87, 'Polní Voděrady', 1998, 'K. Adamec jen hod. bití poč. 20. st.', 5],
  [88, 'Průhonice', 2003, 'Václav Krečmer', 4],
  [89, 'Přerov nad Labem', 1999, 'Václav Krečmer 1905', 5],
  [90, 'Přestavlky', 2001, 'malý bar. kovaný, pol. 18. st.?', 2],
  [91, 'Pšovka', 2004, 'kovaný II. pol. 18. stol.?', 1],
  [92, 'Pyšely', 2002, 'Jan Janata 1862', 3],
  [93, 'Rakovník', 2001, 'L. Hainz malý (jen jicí)', 5],
  [94, 'Rousínov', 1997, 'nezn. kov. barokní', 3],
  [95, 'Roztěž', 2002, 'Emil Schauer Wien 1920 elektr.', 1],
  [96, 'Rožmitál pod Třemšínem', 2002, 'L. Hainz', 5],
  [97, 'Rudná', 2002, 'V. Krečmer', 4],
  [98, 'Sadská (léčebna)', 2002, 'nezn. (E. Liebing?)', 5],
  [99, 'Sadská (mlýn)', 1996, 'nezn. 20. stol.', 5],
  [100, 'Sány', 1997, 'kovaný nezn. 1825?', 3],
  [101, 'Sázava', 2004, 'kovaný 18. stol.(?)', 1],
  [102, 'Sedlčany', 1999, 'Karel Adamec, Čáslav', 5],
  [103, 'Skalsko', 2003, 'Jan Prokeš, Sobotka 1857', 4],
  [104, 'Slapy', 2004, 'kovaný 1. čtvrť 19. stol.?', 1],
  [105, 'Sloveč', 2003, 'Jan Mareš 1886', 4],
  [106, 'Stará Boleslav', 1998, 'L. Hainz velký zvonkohra 1926', 1],
  [107, 'Strenice', 1996, 'L. Hainz malý 1896', 5],
  [108, 'Suchdol', 1997, 'K. Adamec malý konec 19. stol.', '4x?'],
  [109, 'Suchomasty', 2002, 'L. Hainz přelom 19. a 20. stol.', 4],
  [110, 'Svatý Jan pod Skalou (kůr)', 1998, 'barokní stroj kovaný pol. 18. st.?', 3],
  [111, 'Svatý Jan pod Skalou (věž)', 1998, 'Kadlec (Adamec) 1936', 5],
  [112, 'Škvorec', 1997, 'barokní kovaný okolo 1750?', 3],
  [113, 'Trhový Štěpánov', 2003, 'V. Krečmer 1882', 5],
  [114, 'Tvoršovice', 1999, 'L. Hainz', 4],
  [115, 'Tuchoměřice', 2004, 'kovaný, poč. 19. stol.?', 4],
  [116, 'Týnec nad Labem', 1998, 'Emil Schauer Wien poč. 20. stol.', 4],
  [117, 'Úmyslovice', 2003, 'J. Grubský 1930', 5],
  [118, 'Unhošť', 2003, 'V. Kretschmer', 4],
  [119, 'Veleliby', 1999, '(J. Mareš?) konec 19. stol.', 5],
  [120, 'Veliká Ves', 2003, 'Kovaný, velmi starý, neúplný', 2],
  [121, 'Velim', 2004, 'neznámý, okolo 1854', 3],
  [122, 'Veltrusy', 2001, 'kovaný stroj 1762? depositář', 3],
  [123, 'Velvary', 2001, 'nezn. 19. století', 4],
  [124, 'Vojkov', 2002, 'K. Adamec', 4],
  [125, 'Vojkovice', 2001, 'L. Hainz 1918', 5],
  [126, 'Votice', 1999, 'V. Krečmer', '3x?'],
  [127, 'Vraný', 2001, 'L. Hainz, malý, jen hod. bicí', 5],
  [128, 'Vrbice', 1999, 'J. Mareš?', 5],
  [129, 'Vrbová Lhota', 1996, 'Grubský 20. stol.', 4],
  [130, 'Vrchotovy Janovice', 1999, 'V. Krečmer', 3],
  [131, 'Vysoká', 2002, 'nezn. pol. 18. stol.?', 3],
  [132, 'Zásmuky', 1998, 'barokní kovaný', '1x?'],
  [133, 'Zdětín', 2003, 'Jan Prokeš, Sobotka', 3],
  [134, 'Zibohlavy', 1999, 'Karel Adamec, Čáslav', '5x?'],
  [135, 'Zlonice', 2001, 'L. Hainz velký', 5],
  [136, 'Žehuň', 2003, 'Jan Janata 1873', 3],
  [137, 'Žerčice', 1996, 'nezn. poč. 19. stol.', 3],
  [138, 'Žitovlice', 1999, 'J. Prokeš přestavěn B. Proňkem', 5],
];

const SKALA_2004_PRAMEN_BLOCK = `  - citace: |
      SKÁLA, Petr. *Závěrečná zpráva o provedení soupisu historicky cenných věžních hodinových strojů ve středočeském regionu*. Sadská, prosinec 2004. — Rukopis (MS Word, 138 strojů zdokumentovaných v letech 1996–2004), archiv atelieru veznihodiny.cz. Klasifikace 1–5 (priorita ochrany; 1 = nejvyšší historická hodnota; značka „x?" = stroj možná již není na svém místě).
    type: zprava
    author: "Petr Skála"
`;

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

function slugify(s) {
  return s.toLowerCase()
    .replace(/[áàâ]/g, 'a').replace(/[éèê]/g, 'e').replace(/[íì]/g, 'i')
    .replace(/[óò]/g, 'o').replace(/[úůù]/g, 'u').replace(/[ý]/g, 'y')
    .replace(/[čć]/g, 'c').replace(/[ďd]/g, 'd').replace(/[ě]/g, 'e')
    .replace(/[ňń]/g, 'n').replace(/[řŕ]/g, 'r').replace(/[šś]/g, 's')
    .replace(/[ťt]/g, 't').replace(/[ž]/g, 'z')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Mapování složitějších lokalit na konkrétní soubory
const FILE_OVERRIDES = {
  // Bakov — máme 1873-bakov-nad-jizerou-prokes (už zpracováno Prokeš)
  'Bakov': '1873-bakov-nad-jizerou-prokes',
  // Bečváry — už máme zpracováno (Skálova zpráva 2003 je samostatná)
  'Bečváry': null, // má vlastní detailní zprávu, neaplikovat 2004
  // 'Bezno (kostel)' a 'Bezno (zámek)' — máme jen Bezno?
  // Hradec Králové Bílá věž — není v Skála 2004
  'Brandýs nad Labem': null, // necháme - nemáme kartu
  'Bošín': '1887-bosin-prokes', // zpracováno
  'Býchory': '1868-bychory-prokes', // zpracováno
  'Chotětov': 'nedatovano-chotetov-prokes', // zpracováno
  'Dobříš': '1791-dobris-landesberger-f', // má vlastní detailní zprávu
  'Dymokury': '1869-dymokury-prokes', // zpracováno
  'Horní Vidim': '1912-horni-vidim-krecmer', // zpracováno
  'Kačina': null, // přidat — máme?
  'Katusice': '1855-katusice-prokes', // zpracováno
  'Kostelní Lhota': null,
  'Kouřim': 'nedatovano-kourim-prokes', // zpracováno
  'Křivoklát': '1817-krivoklat-bozek',
  'Libušín': '1895-libusin-krecmer', // zpracováno (krečmer batch)
  'Měšice': '1774-mesice-u-prahy-landesberger-s', // má vlastní zprávu
  'Městec Králové': 'hellich-mestec-kralove-janata',
  'Nymburk (sv. Jiljí)': 'hellich-nymburk-janata',
  'Ondřejov': '1876-ondrejov-prokes', // zpracováno
  'Plaňany': null,
  'Pyšely': null,
  'Průhonice': 'nedatovano-pruhonice-krecmer', // zpracováno (krečmer batch)
  'Přerov nad Labem': '1904-prerov-nad-labem-krecmer', // zpracováno
  'Rudná': 'nedatovano-rudna-krecmer', // zpracováno
  'Skalsko': '1857-skalsko-prokes', // zpracováno
  'Stará Boleslav': null,
  'Trhový Štěpánov': '1882-trhovy-stepanov-krecmer', // zpracováno
  'Unhošť': '1886-unhost-krecmer', // zpracováno
  'Vrchotovy Janovice': '1887-vrchotovy-janovice-krecmer', // zpracováno
  'Votice': '1894-votice-krecmer', // zpracováno
  'Žehuň': null,
  'Zdětín': '1883-zdetin-prokes-josef', // zpracováno
  'Žitovlice': 'nedatovano-zitovlice-prokes', // zpracováno
  'Chroustov (Prokeš)': '1891-chroustov-prokes-jr', // zpracováno
  'Velim': null,
  'Horní Slivno': 'nedatovano-horni-slivno-prokes', // zpracováno
};

// Helpers
const allCards = fs.readdirSync(DIR).filter(f => f.endsWith('.mdx'));

function findCardForLocality(loc) {
  if (loc in FILE_OVERRIDES) {
    const v = FILE_OVERRIDES[loc];
    if (v === null) return { skip: true, reason: 'override null (skip)' };
    return { file: v + '.mdx' };
  }
  // Generic fuzzy match by obec name (extracted from filename)
  // Strip „(...)" from loc for fuzzy match
  const baseLoc = loc.replace(/\s*\(.*?\)/, '').trim();
  const slug = slugify(baseLoc);
  const candidates = allCards.filter(f => f.includes(slug));
  if (candidates.length === 0) return { missing: true };
  if (candidates.length === 1) return { file: candidates[0] };
  return { multiple: true, candidates };
}

let updated = 0, skipped = 0, missing = 0, multiple = 0, alreadyHas = 0;
const report = { updated: [], missing: [], multiple: [], skipped: [], alreadyHas: [] };

for (const [no, lokalita, docYear, popis, klass] of ENTRIES) {
  const result = findCardForLocality(lokalita);
  if (result.skip) { skipped++; report.skipped.push({ no, lokalita }); continue; }
  if (result.missing) { missing++; report.missing.push({ no, lokalita, klass }); continue; }
  if (result.multiple) { multiple++; report.multiple.push({ no, lokalita, candidates: result.candidates }); continue; }

  const fp = path.join(DIR, result.file);
  if (!fs.existsSync(fp)) {
    console.warn(`File ${result.file} not found for ${lokalita}`);
    missing++;
    continue;
  }
  let src = fs.readFileSync(fp, 'utf8');

  // Detect if Skála 2004 zpráva already referenced
  if (/Závěrečná zpráva o provedení soupisu/i.test(src) || /soupisu středočeského regionu/i.test(src)) {
    alreadyHas++;
    report.alreadyHas.push({ no, lokalita, file: result.file });
    continue;
  }

  // Split frontmatter / body
  const m = src.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) { console.warn(`BAD FORMAT: ${result.file}`); continue; }
  let fm = m[1], body = m[2];

  // Add pramen entry
  if (/^prameny:\s*$/m.test(fm) || /^prameny:\s*\n\s+- /m.test(fm)) {
    const lines = fm.split('\n');
    let i = lines.findIndex(l => /^prameny:/.test(l));
    let j = i + 1;
    while (j < lines.length && /^\s+/.test(lines[j])) j++;
    const insert = SKALA_2004_PRAMEN_BLOCK.split('\n');
    while (insert.length && insert[insert.length-1] === '') insert.pop();
    lines.splice(j, 0, ...insert);
    fm = lines.join('\n');
  } else {
    const block = `prameny:\n${SKALA_2004_PRAMEN_BLOCK}`;
    if (/^zdrojDat:/m.test(fm)) {
      fm = fm.replace(/^zdrojDat:/m, block + 'zdrojDat:');
    } else {
      fm = fm.trimEnd() + '\n' + block;
    }
  }

  // Append body section
  const xBadge = String(klass).includes('x?') ? ' (s poznámkou „x?" — stroj možná již není na svém místě)' : '';
  const klassNum = String(klass).replace(/x\?/, '').trim();
  const section = `\n## Hodnocení v Skálově zprávě 2004\n\nStroj v lokalitě **${lokalita}** byl zdokumentován **[Petrem Skálou](/hodinari/petr-skala)** v roce **${docYear}** (popis: „${popis}"). V závěrečném soupisu Skály z prosince 2004 dostal **klasifikaci ${klassNum}**${xBadge} (rozsah 1–5, kde 1 je nejvyšší). ${classDescription(klass)}\n\n*Pramen: SKÁLA, Petr. Závěrečná zpráva o provedení soupisu historicky cenných věžních hodinových strojů ve středočeském regionu. Sadská, prosinec 2004 — viz prameny.*\n`;
  body = body.trimEnd() + '\n' + section;

  fs.writeFileSync(fp, `---\n${fm}\n---\n${body}`, 'utf8');
  console.log(`UPDATED ${result.file} (no ${no}: ${lokalita}, doc ${docYear}, klas. ${klass})`);
  updated++;
  report.updated.push({ no, lokalita, file: result.file, klass });
}

console.log('\n=== SUMMARY ===');
console.log(`Updated:    ${updated}`);
console.log(`Already has: ${alreadyHas}`);
console.log(`Skipped:    ${skipped} (override null — má vlastní detailní zprávu)`);
console.log(`Missing:    ${missing} (lokalita nemá kartu)`);
console.log(`Multiple:   ${multiple} (více kandidátů — k ručnímu review)`);

if (report.multiple.length) {
  console.log('\n--- Multiple candidates (k ručnímu review) ---');
  for (const m of report.multiple) {
    console.log(`  [${m.no}] ${m.lokalita}: ${m.candidates.join(', ')}`);
  }
}

if (report.missing.length) {
  console.log(`\n--- Missing (${report.missing.length} lokalit, nezahrnuto) ---`);
  // Group by class for prioritization
  const byClass = { '1': [], '2': [], '3': [], '4': [], '5': [] };
  for (const m of report.missing) {
    const k = String(m.klass).replace(/x\?/, '').trim();
    if (byClass[k]) byClass[k].push(m);
  }
  for (const k of ['1', '2', '3', '4', '5']) {
    if (byClass[k].length) {
      console.log(`\n  Klas. ${k} (${byClass[k].length}):`);
      for (const m of byClass[k]) console.log(`    [${m.no}] ${m.lokalita}`);
    }
  }
}
