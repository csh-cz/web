#!/usr/bin/env node
// Generates stub MDX cards for Petr Skála's restoration list (zdroje/skála realizace/realizace seznam.docx).
// Source: 106 numbered locations parsed from the docx; only NEW locations (not yet present in soupis)
// get a stub. Existing cards must be updated manually with `restaurator: "Petr Skála"`.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const OUT_DIR = path.join(ROOT, 'content', 'soupis-veznich-hodin');

// (id, raw label, R/A flag, fullObec, budova, obecSlug, fileSlug, year?)
// fileSlug → filename without .mdx. Convention: skala-realizace-<kebab>.mdx
const ENTRIES = [
  // [label, RA, obec, budova, fileSlug, year]
  ['Batín', 'R+A', 'Batín', null, 'skala-realizace-batin'],
  ['Bedřichov', 'R', 'Bedřichov', null, 'skala-realizace-bedrichov'],
  ['Beroun nátahy 2x', 'A', 'Beroun', null, 'skala-realizace-beroun-natahy', null, 'jen automatické natahy (2×)'],
  ['Bělá pod Bezdězem', 'R+A', 'Bělá pod Bezdězem', null, 'skala-realizace-bela-pod-bezdezem'],
  ['Bezděkov nad Metují', 'R+A', 'Bezděkov nad Metují', null, 'skala-realizace-bezdekov-nad-metuji', 1999],
  ['Březno (kovaný)', 'R', 'Březno', 'kovaný hodinový stroj', 'skala-realizace-brezno-kovany', null, 'kovaný stroj — pravděpodobně odlišný od 1850 Březno u Chomutova (Sommerecker), ověřit'],
  ['Březno (malý)', 'R', 'Březno', 'malý hodinový stroj', 'skala-realizace-brezno-maly', null, 'malý stroj — pravděpodobně odlišný od 1850 Březno u Chomutova (Sommerecker), ověřit'],
  ['Cítoliby', 'R+A', 'Cítoliby', null, 'skala-realizace-citoliby'],
  ['Český Brod (gymnázium)', 'R+A', 'Český Brod', 'Gymnázium', 'skala-realizace-cesky-brod-gymn'],
  ['Dlouhý Most', 'R+A', 'Dlouhý Most', null, 'skala-realizace-dlouhy-most', 2007],
  ['Dolní Bousov', 'R', 'Dolní Bousov', null, 'skala-realizace-dolni-bousov'],
  ['Drahenice (nátah)', 'A', 'Drahenice', null, 'skala-realizace-drahenice-natah', null, 'jen automatický natah'],
  ['Dubí', 'R+A', 'Dubí', null, 'skala-realizace-dubi'],
  ['Frýdek (farní)', 'R', 'Frýdek-Místek', 'Farní kostel', 'skala-realizace-frydek-farni', 1999, 'farní kostel sv. Jana Křtitele (?)'],
  ['Frýdek (mariánský)', 'R+A', 'Frýdek-Místek', 'Bazilika Navštívení Panny Marie', 'skala-realizace-frydek-marianska', 1999],
  ['Horní Kruty', 'R+A', 'Horní Kruty', null, 'skala-realizace-horni-kruty'],
  ['Horní Police', 'R+A', 'Horní Police', null, 'skala-realizace-horni-police'],
  ['Hospozín', 'R+A', 'Hospozín', null, 'skala-realizace-hospozin', 2000],
  ['Hoření Paseky', 'R', 'Hoření Paseky', null, 'skala-realizace-horeni-paseky'],
  ['Chodov (škola)', 'R+A', 'Chodov', 'Škola', 'skala-realizace-chodov-skola', 2000],
  ['Chrást u Poříčan', 'R+A', 'Chrást u Poříčan', null, 'skala-realizace-chrast-u-prican'],
  ['Jankovice', 'R+A', 'Jankovice', null, 'skala-realizace-jankovice'],
  ['Jánský Vrch', 'R', 'Javorník', 'Zámek Jánský Vrch', 'skala-realizace-jansky-vrch'],
  ['Jeřmanice', 'R+A', 'Jeřmanice', null, 'skala-realizace-jermanice', 2003],
  ['Jičín — kostel sv. Ignáce', 'R+A', 'Jičín', 'Kostel sv. Ignáce', 'skala-realizace-jicin-svaty-ignac'],
  ['Kaňk', 'R', 'Kutná Hora', 'Kaňk (městská část)', 'skala-realizace-kank', null, 'Kaňk = městská část Kutné Hory'],
  ['Klapý', 'R+A', 'Klapý', null, 'skala-realizace-klapy', 2000],
  ['Koloděje', 'R', 'Praha-Koloděje', null, 'skala-realizace-kolodeje'],
  ['Kornice', 'R+A', 'Kornice', null, 'skala-realizace-kornice', 2007],
  ['Křinec', 'R', 'Křinec', null, 'skala-realizace-krinec'],
  ['Kuks', 'R', 'Kuks', null, 'skala-realizace-kuks'],
  ['Kutná Hora — Jezuitská kolej', 'R+A', 'Kutná Hora', 'Jezuitská kolej (GASK)', 'skala-realizace-kutna-hora-kolej', 2007],
  ['Kutná Hora — kostel špitální', 'R', 'Kutná Hora', 'Špitální kostel', 'skala-realizace-kutna-hora-spital'],
  ['Kyšice', 'R+A', 'Kyšice', null, 'skala-realizace-kysice'],
  ['Ledeč nad Sázavou — gymnázium', 'R+A', 'Ledeč nad Sázavou', 'Gymnázium', 'skala-realizace-ledec-gymn'],
  ['Liberec — muzeum (věž)', 'R+A', 'Liberec', 'Severočeské muzeum — věžní stroj', 'skala-realizace-liberec-muzeum-vez'],
  ['Liberec — muzeum (exponát)', 'R+A', 'Liberec', 'Severočeské muzeum — exponát', 'skala-realizace-liberec-muzeum-expo'],
  ['Liberec — budova Kotík', 'R', 'Liberec', 'Budova Kotík', 'skala-realizace-liberec-kotik'],
  ['Mladá Vožice', 'R', 'Mladá Vožice', null, 'skala-realizace-mlada-vozice'],
  ['Mnichovo Hradiště — orloj', 'R', 'Mnichovo Hradiště', 'Orloj', 'skala-realizace-mnichovo-hradiste-orloj'],
  ['Mnichovo Hradiště — věž', 'R', 'Mnichovo Hradiště', 'Věž', 'skala-realizace-mnichovo-hradiste-vez'],
  ['Mníšek pod Brdy', 'R', 'Mníšek pod Brdy', null, 'skala-realizace-mnisek-pod-brdy'],
  ['Myšák — Hloubětín', 'R+A', 'Praha-Hloubětín', 'Cukrárna Myšák / továrna', 'skala-realizace-mysak-hloubetin'],
  ['Mělnické Vtelno', 'R', 'Mělnické Vtelno', null, 'skala-realizace-melnicke-vtelno'],
  ['Načeradec', 'R', 'Načeradec', null, 'skala-realizace-naceradec'],
  ['Náchod — nová radnice', 'R', 'Náchod', 'Nová radnice', 'skala-realizace-nachod-nova-radnice'],
  ['Náchod — stará radnice', 'R', 'Náchod', 'Stará radnice', 'skala-realizace-nachod-stara-radnice'],
  ['Návsí', 'R+A', 'Návsí', null, 'skala-realizace-navsi', 2006],
  ['Nižbor', 'R+A', 'Nižbor', null, 'skala-realizace-nizbor'],
  ['Nymburk — evangelický kostel', 'R+A', 'Nymburk', 'Evangelický kostel', 'skala-realizace-nymburk-evangelicky'],
  ['Nymburk — kostel sv. Jiljí', 'R+A', 'Nymburk', 'Kostel sv. Jiljí', 'skala-realizace-nymburk-jilji'],
  ['Nymburk — škola', 'R+A', 'Nymburk', 'Škola', 'skala-realizace-nymburk-skola'],
  ['Odlochovice — zámek', 'R', 'Odlochovice', 'Zámek', 'skala-realizace-odlochovice-zamek'],
  ['Opolany', 'R+A', 'Opolany', null, 'skala-realizace-opolany'],
  ['Orlík — kostel', 'R', 'Orlík nad Vltavou', 'Kostel', 'skala-realizace-orlik-kostel'],
  ['Orloj', 'R+A', 'Praha', 'Pražský orloj (?)', 'skala-realizace-orloj', null, 'identifikace „orloj" v Skálově seznamu — pravděpodobně Pražský orloj, ověřit'],
  ['Osek u Duchcova', 'R+A', 'Osek u Duchcova', null, 'skala-realizace-osek-u-duchcova'],
  ['Pátek', 'R+A', 'Pátek', null, 'skala-realizace-patek'],
  ['Pečky', 'R', 'Pečky', null, 'skala-realizace-pecky'],
  ['Pěnčín — kaple', 'R+A', 'Pěnčín', 'Kaple', 'skala-realizace-pencin-kaple'],
  ['Planička / Ústí nad Orlicí', 'R', 'Ústí nad Orlicí', 'Továrna Planička', 'skala-realizace-planicka-usti-nad-orlici', null, 'případně související s „Ústí n. O. Planička orloj" v seznamu'],
  ['Podbořany — kostel', 'R', 'Podbořany', 'Kostel', 'skala-realizace-podborany-kostel'],
  ['Poděbrady — zámek', 'R+A', 'Poděbrady', 'Zámek', 'skala-realizace-podebrady-zamek'],
  ['Police nad Metují — kostel', 'R', 'Police nad Metují', 'Kostel', 'skala-realizace-police-nad-metuji-kostel', null, 'odlišné od 1876 Police nad Metují radnice (Janata) — Skála restauroval kostelní stroj'],
  ['Roprachtice', 'R+A', 'Roprachtice', null, 'skala-realizace-roprachtice'],
  ['Sadská — blázinec', 'R', 'Sadská', 'Bývalý blázinec', 'skala-realizace-sadska-blazinec'],
  ['Sázava — klášter', 'R', 'Sázava', 'Sázavský klášter', 'skala-realizace-sazava-klaster'],
  ['Semtěš', 'R+A', 'Semtěš', null, 'skala-realizace-semtes'],
  ['Sloupno', 'R+A', 'Sloupno', null, 'skala-realizace-sloupno'],
  ['Soběslav — exponát + věž', 'R', 'Soběslav', 'Věž + muzejní exponát', 'skala-realizace-sobeslav'],
  ['Stará Boleslav', 'R+A', 'Stará Boleslav', null, 'skala-realizace-stara-boleslav'],
  ['Staré Buky', 'R+A', 'Staré Buky', null, 'skala-realizace-stare-buky'],
  ['Stroužná', 'R+A', 'Stroužná', null, 'skala-realizace-strouzna'],
  ['Střevač', 'R+A', 'Střevač', null, 'skala-realizace-strevac'],
  ['Střížovice', 'R+A', 'Střížovice', null, 'skala-realizace-strizovice', 2002],
  ['Sv. Vít — katedrála', 'R+A', 'Praha', 'Katedrála sv. Víta', 'skala-realizace-svaty-vit'],
  ['Štidla', 'R+A', 'Štidla', null, 'skala-realizace-stidla'],
  ['Turnov — Juta', 'R+A', 'Turnov', 'Továrna Juta', 'skala-realizace-turnov-juta'],
  ['Valdice', 'R+A', 'Valdice', null, 'skala-realizace-valdice', 2001],
  ['Velichovky', 'R+A', 'Velichovky', null, 'skala-realizace-velichovky'],
  ['Velim — evangelický kostel', 'R+A', 'Velim', 'Evangelický kostel', 'skala-realizace-velim-evangelicky'],
  ['Velim — zvonice', 'R', 'Velim', 'Zvonice', 'skala-realizace-velim-zvonice'],
  ['Vlašim — evangelický kostel', 'R', 'Vlašim', 'Evangelický kostel', 'skala-realizace-vlasim-evangelicky'],
  ['Ždírec', 'R', 'Ždírec', null, 'skala-realizace-zdirec'],
  ['Židovská radnice (Praha)', 'R', 'Praha', 'Židovská radnice', 'skala-realizace-zidovska-radnice'],
  ['Žireč', 'R+A', 'Žireč', null, 'skala-realizace-zirec'],
  // Doplňky z roční tabulky 1999-2007 (mimo hlavní seznam):
  ['Smíchov', 'R', 'Praha-Smíchov', null, 'skala-realizace-smichov', 2001, 'pouze v roční tabulce 1999–2007 Skálova seznamu, identifikace upřesnit'],
  ['Klatovy', 'R', 'Klatovy', null, 'skala-realizace-klatovy', 2004, 'pouze v roční tabulce 1999–2007 Skálova seznamu, identifikace upřesnit'],
];

function buildFrontmatter({ label, ra, obec, budova, fileSlug, year, note }) {
  const isAuto = ra.includes('A');
  const isResto = ra.includes('R');
  const lines = [];
  lines.push('---');
  lines.push(`slug: "${fileSlug}"`);
  lines.push(`rok: "?"`);
  // Hodinář neznámý — bez explicitního medailonu
  lines.push(`hodinarText: "neuveden — restaurováno P. Skálou (Skálův seznam realizací)"`);
  lines.push('puvodniMisto:');
  lines.push(`  obec: "${obec}"`);
  if (budova) lines.push(`  budova: "${budova}"`);
  lines.push('  zeme: "CZ"');
  lines.push('stav: "in_situ"');
  lines.push(isResto ? 'chod: "restaurovano"' : 'chod: "neznamy"');
  lines.push(`restaurator: "Petr Skála"`);
  if (year) lines.push(`rokRestaurovani: ${year}`);
  // Pramen — Skálův interní seznam
  lines.push('prameny:');
  lines.push('  - citace: |');
  lines.push('      SKÁLA, Petr. *Realizace — seznam.* Interní soupis restaurátorských prací atelieru veznihodiny.cz (rukopis docx, archiv autora).');
  lines.push('    type: archiv');
  lines.push(`zdrojDat: "skala_realizace_seznam"`);
  lines.push(`posledniOvereni: "2026-05-05"`);
  // Note in poznamka
  const flagText = ra === 'R+A' ? 'restaurováno + automatizace nátahu' : ra === 'R' ? 'restaurováno' : ra === 'A' ? 'jen automatika nátahu' : ra;
  let poznamka = `Položka **${label}** ze Skálova seznamu realizací. Stav: **${flagText}**.`;
  if (note) poznamka += ` ${note}.`;
  poznamka += ' Detailní dokumentace zatím nedohledána — karta čeká na doplnění (rok, hodinář, fotografie, restaurátorská zpráva).';
  lines.push('poznamka: |');
  for (const ln of poznamka.split(/\n/)) lines.push('  ' + ln);
  lines.push('---');
  lines.push('');
  lines.push(`Věžní hodiny v lokalitě **${obec}**${budova ? ` (${budova})` : ''} — restaurátor [Petr Skála](/hodinari/petr-skala). Atribuce hodináře, datace a další detaily zatím nedohledány. Karta vychází z interního seznamu realizací atelieru veznihodiny.cz.`);
  lines.push('');
  return lines.join('\n');
}

let created = 0, skipped = 0;
for (const e of ENTRIES) {
  const [label, ra, obec, budova, fileSlug, year, note] = e;
  const target = path.join(OUT_DIR, `${fileSlug}.mdx`);
  if (fs.existsSync(target)) {
    console.log(`SKIP existing: ${fileSlug}.mdx`);
    skipped++;
    continue;
  }
  const fm = buildFrontmatter({ label, ra, obec, budova, fileSlug, year, note });
  fs.writeFileSync(target, fm, 'utf8');
  console.log(`CREATED: ${fileSlug}.mdx (${ra})`);
  created++;
}
console.log(`\nTotal: ${created} created, ${skipped} skipped (already existed).`);
