#!/usr/bin/env node
// Import Hellich 1917 list of Janata's clocks → soupis-veznich-hodin/*.mdx
// Geocoding via Nominatim with 1.1s rate limit.

import fs from 'node:fs';
import path from 'node:path';

const OUT_DIR = path.resolve('content/soupis-veznich-hodin');

// Already existing — skip
const SKIP = new Set([
  '1867-dobruska-radnice-janata',
  '1871-lipnice-nad-sazavou-radnice-janata',
  '1876-police-nad-metuji-radnice-janata',
]);

// Master list — Hellichových zakázek s dnešní toponymií
// [hellich_name, modern_obec, modern_zeme, query_for_nominatim, optional_okres, optional_kraj, note_extra]
const ENTRIES = [
  // === V království českém ===
  ['Liberec — evangelický nový kostel', 'Liberec', 'CZ', 'Liberec evangelický kostel', 'Liberec', 'Liberecký', 'evangelický kostel'],
  ['Lysá nad Labem', 'Lysá nad Labem', 'CZ', 'Lysá nad Labem', 'Nymburk', 'Středočeský', null],
  ['Kněžice (Bydžovsko)', 'Kněžice', 'CZ', 'Kněžice okres Jičín', 'Jičín', 'Královéhradecký', 'oblast Bydžovsko'],
  ['Hlušice', 'Hlušice', 'CZ', 'Hlušice okres Hradec Králové', 'Hradec Králové', 'Královéhradecký', null],
  ['Veležice', 'Veležice', 'CZ', 'Veležice', null, null, 'lokalitu třeba ověřit (možná Velešice)'],
  ['Vysoké Veselí', 'Vysoké Veselí', 'CZ', 'Vysoké Veselí', 'Jičín', 'Královéhradecký', null],
  ['Kartouzy', 'Kartouzy', 'CZ', 'Valdice Kartouzy', null, null, 'snad Valdice u Jičína (klášter Valdice byl dříve Kartouzy)'],
  ['Miličeves', 'Miličeves', 'CZ', 'Miličeves', 'Jičín', 'Královéhradecký', null],
  ['Jičín', 'Jičín', 'CZ', 'Jičín náměstí', 'Jičín', 'Královéhradecký', null],
  ['Královské Městec', 'Městec Králové', 'CZ', 'Městec Králové', 'Nymburk', 'Středočeský', null],
  ['Kostelec nad Orlicí', 'Kostelec nad Orlicí', 'CZ', 'Kostelec nad Orlicí radnice', 'Rychnov nad Kněžnou', 'Královéhradecký', null],
  ['Polná', 'Polná', 'CZ', 'Polná radnice', 'Jihlava', 'Vysočina', null],
  ['Chotěboř — radnice', 'Chotěboř', 'CZ', 'Chotěboř radnice', 'Havlíčkův Brod', 'Vysočina', 'jedna ze dvou Janatových zakázek v Chotěboři'],
  ['Chotěboř — škola', 'Chotěboř', 'CZ', 'Chotěboř škola', 'Havlíčkův Brod', 'Vysočina', 'druhá Janatova zakázka v Chotěboři, na škole'],
  ['Vilímov', 'Vilémov', 'CZ', 'Vilémov okres Havlíčkův Brod', 'Havlíčkův Brod', 'Vysočina', 'patrně Vilémov u Golčova Jeníkova'],
  ['Heinrichsthal u Zábřehu', 'Jindřichov', 'CZ', 'Jindřichov u Zábřehu', 'Šumperk', 'Olomoucký', 'něm. Heinrichsthal'],
  ['Kadaň', 'Kadaň', 'CZ', 'Kadaň náměstí', 'Chomutov', 'Ústecký', null],
  ['Kolín', 'Kolín', 'CZ', 'Kolín radnice', 'Kolín', 'Středočeský', null],
  ['Kutná Hora — první stroj', 'Kutná Hora', 'CZ', 'Kutná Hora kostel sv Jakuba', 'Kutná Hora', 'Středočeský', 'jedna ze dvou Janatových zakázek v Kutné Hoře (lokalita upřesnit)'],
  ['Kutná Hora — druhý stroj', 'Kutná Hora', 'CZ', 'Kutná Hora radnice', 'Kutná Hora', 'Středočeský', 'druhá Janatova zakázka v Kutné Hoře (lokalita upřesnit)'],
  ['Kojetice u Mělníka', 'Kojetice', 'CZ', 'Kojetice okres Mělník', 'Mělník', 'Středočeský', null],
  ['Bystřice u Sobotky', 'Bystřice', 'CZ', 'Bystřice u Sobotky', 'Jičín', 'Královéhradecký', null],
  ['Dymokury', 'Dymokury', 'CZ', 'Dymokury', 'Nymburk', 'Středočeský', null],
  ['Libněves', 'Libněves', 'CZ', 'Libněves', null, null, 'lokalitu třeba ověřit'],
  ['Libice', 'Libice nad Cidlinou', 'CZ', 'Libice nad Cidlinou', 'Nymburk', 'Středočeský', 'pravděpodobně Libice n. Cidlinou'],
  ['Lhota Písková', 'Písková Lhota', 'CZ', 'Písková Lhota okres Mladá Boleslav', null, 'Středočeský', 'lokalitu ověřit (více Lhot)'],
  ['Lipany u Černého Kostelce', 'Lipany', 'CZ', 'Lipany Kostelec nad Černými lesy', 'Praha-východ', 'Středočeský', 'Černý Kostelec = dnes Kostelec n. Černými lesy'],
  ['Nová Ves u Kolína', 'Nová Ves I', 'CZ', 'Nová Ves I okres Kolín', 'Kolín', 'Středočeský', 'více Nových Vsí v okolí'],
  ['Milčice', 'Milčice', 'CZ', 'Milčice okres Nymburk', 'Nymburk', 'Středočeský', null],
  ['Pyšely', 'Pyšely', 'CZ', 'Pyšely', 'Benešov', 'Středočeský', null],
  ['Divišov', 'Divišov', 'CZ', 'Divišov okres Benešov', 'Benešov', 'Středočeský', null],
  ['Hostomice', 'Hostomice', 'CZ', 'Hostomice okres Beroun', 'Beroun', 'Středočeský', 'více Hostomic v ČR (Beroun, Teplice)'],
  ['Benátky', 'Benátky nad Jizerou', 'CZ', 'Benátky nad Jizerou', 'Mladá Boleslav', 'Středočeský', null],
  ['Doksy (Hirschberg)', 'Doksy', 'CZ', 'Doksy okres Česká Lípa', 'Česká Lípa', 'Liberecký', 'něm. Hirschberg am See'],
  ['Jablonec nad Nisou', 'Jablonec nad Nisou', 'CZ', 'Jablonec nad Nisou kostel', 'Jablonec nad Nisou', 'Liberecký', null],
  ['Josefsthal', 'Josefův Důl', 'CZ', 'Josefův Důl okres Jablonec nad Nisou', 'Jablonec nad Nisou', 'Liberecký', 'něm. Josefsthal — patrně J. Důl u Jablonce'],
  ['Maxdorf u Jablonce', 'Maxov', 'CZ', 'Maxov okres Jablonec', 'Jablonec nad Nisou', 'Liberecký', 'něm. Maxdorf'],
  ['Stružnice u Č. Lípy', 'Stružnice', 'CZ', 'Stružnice okres Česká Lípa', 'Česká Lípa', 'Liberecký', null],
  ['Radoušov u Litoměřic', 'Radouň', 'CZ', 'Radouň okres Litoměřice', 'Litoměřice', 'Ústecký', 'lokalitu ověřit (Radoušov / Radouň)'],
  ['Most (pro hodináře Franka)', 'Most', 'CZ', 'Most náměstí', 'Most', 'Ústecký', 'pro hodináře Franka, ne přímo zakázka města'],
  ['Pilná u Mostu', 'Pilná', 'CZ', 'Pilná Most', null, 'Ústecký', 'něm. Pilnau u Mostu'],
  ['Blažim u Postoloprt', 'Blažim', 'CZ', 'Blažim Postoloprty', null, 'Ústecký', 'něm. Ploscha'],
  ['Sádová', 'Sadová', 'CZ', 'Sadová okres Hradec Králové', 'Hradec Králové', 'Královéhradecký', null],
  ['Modřany u Prahy', 'Praha 12 — Modřany', 'CZ', 'Praha Modřany kostel', null, 'Praha', null],
  ['Hořenoves', 'Hořiněves', 'CZ', 'Hořiněves', 'Hradec Králové', 'Královéhradecký', null],
  ['Benešov (Bensen)', 'Benešov nad Ploučnicí', 'CZ', 'Benešov nad Ploučnicí', 'Děčín', 'Ústecký', 'něm. Bensen'],
  ['Nymburk', 'Nymburk', 'CZ', 'Nymburk kostel sv Mikuláš', 'Nymburk', 'Středočeský', null],
  ['Skřivany', 'Skřivany', 'CZ', 'Skřivany okres Hradec Králové', 'Hradec Králové', 'Královéhradecký', null],
  ['Jaroměř', 'Jaroměř', 'CZ', 'Jaroměř náměstí', 'Náchod', 'Královéhradecký', null],
  ['Svojšice', 'Svojšice', 'CZ', 'Svojšice okres Kolín', 'Kolín', 'Středočeský', null],
  ['Karlsthal', 'Karlov', 'CZ', 'Karlov u Prahy', null, null, 'lokalitu ověřit (více Karlovů)'],
  ['Lipnice (= Lipnice nad Sázavou — viz 1871)', null, null, null, null, null, 'duplikát s 1871-lipnice — SKIP'],
  ['Louny', 'Louny', 'CZ', 'Louny náměstí', 'Louny', 'Ústecký', null],
  // === Morava ===
  ['Stará Ptení', 'Ptení', 'CZ', 'Ptení okres Prostějov', 'Prostějov', 'Olomoucký', 'Stará Ptení / Ptení'],
  ['Ždětín', 'Zdětín', 'CZ', 'Zdětín okres Prostějov', 'Prostějov', 'Olomoucký', 'lokalitu upřesnit, více Zdětínů (Mor./Stř. Č.)'],
  ['Těšetice', 'Těšetice', 'CZ', 'Těšetice okres Olomouc', 'Olomouc', 'Olomoucký', null],
  ['Cholina (Kollein)', 'Cholina', 'CZ', 'Cholina okres Olomouc', 'Olomouc', 'Olomoucký', 'něm. Kollein'],
  ['Dubčany', 'Dubčany', 'CZ', 'Dubčany okres Olomouc', 'Olomouc', 'Olomoucký', null],
  ['Svitavy', 'Svitavy', 'CZ', 'Svitavy náměstí', 'Svitavy', 'Pardubický', null],
  ['Domašov', 'Domašov nad Bystřicí', 'CZ', 'Domašov nad Bystřicí', 'Olomouc', 'Olomoucký', 'více Domašovů; ověřit'],
  ['Prostějov', 'Prostějov', 'CZ', 'Prostějov radnice', 'Prostějov', 'Olomoucký', null],
  // === Halič ===
  ['Lvov (Lwów)', 'Lviv', 'UA', 'Lvov radnice', null, null, 'Halič; pro Lvov již existuje 1829-lvov-radnice-videnska-polytechnika (jiný stroj!)'],
  ['Sokal na řece Bugu', 'Sokal', 'UA', 'Sokal Ukraine', null, null, null],
  ['Brody', 'Brody', 'UA', 'Brody Lviv oblast', null, null, null],
  ['Višnice', 'Vyshnivchyk', 'UA', 'Vyshnivchyk Lviv', null, null, 'Halič — možná Vyšnivčik / Vyshnivchyk; ověřit'],
  ['Svietnik Gorný', 'Svitnyky', 'UA', 'Svitnyky Galicia', null, null, 'lokalita ověřit'],
  // === Bukovina ===
  ['Černovice (hl. město)', 'Chernivtsi', 'UA', 'Chernivtsi city hall', null, null, 'Bukovina — Czernowitz'],
  ['Sadegora', 'Sadhora', 'UA', 'Sadhora Chernivtsi', null, null, 'něm. Sadagora — dnes součást Černovic'],
  ['Novie Seliece v Besarabii', 'Noua Suliță', 'UA', 'Novoselytsia Ukraine', null, null, 'rumunsky Noua Suliță, ukrajinsky Novoselycja — historicky Bukovina/Besarabie'],
  // === Uhry ===
  ['Batovce (Bath)', 'Bátovce', 'SK', 'Bátovce Slovakia', null, null, null],
  ['Gorgonice', 'Gargonyica', 'HU', 'Gárgyán Hungary', null, null, 'lokalitu těžké identifikovat'],
  ['Berkabanye — první stroj', 'Berkenye', 'HU', 'Berkenye Hungary', null, null, 'jedna ze dvou Janatových zakázek (lokalita ověřit)'],
  ['Berkabanye — druhý stroj', 'Berkenye', 'HU', 'Berkenye Hungary', null, null, 'druhá ze dvou Janatových zakázek (lokalita ověřit)'],
  ['Nagy Koresu', 'Nagykőrös', 'HU', 'Nagykőrös Hungary', null, null, null],
  ['Vag Ujheli', 'Nové Mesto nad Váhom', 'SK', 'Nové Mesto nad Váhom', null, null, 'maď. Vágújhely'],
  ['Uj Kečke', 'Újkécske', 'HU', 'Tiszakécske Hungary', null, null, 'maď. Újkécske, dnes Tiszakécske'],
  ['Pápa', 'Pápa', 'HU', 'Pápa Hungary', null, null, null],
];

function slugify(s) {
  return s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function nominatim(query, country) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1${country ? `&countrycodes=${country.toLowerCase()}` : ''}`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Hodinarium-CSH-Janata-import/1.0' } });
    const d = await r.json();
    if (d.length > 0) return [parseFloat(d[0].lat), parseFloat(d[0].lon), d[0].display_name];
  } catch (e) {
    console.error(`  err: ${e.message}`);
  }
  return null;
}

function mdxFor(entry, coords) {
  const [hellichName, obec, zeme, query, okres, kraj, note] = entry;
  if (!obec) return null;
  const slug = slugify(`hellich-${obec}-janata`).replace(/-+/g, '-');
  const front = {
    slug,
    rok: '?',
    hodinar: 'jan-janata',
    puvodniMisto: { obec, zeme },
  };
  if (note) front.puvodniMisto.cast = note;
  if (okres) front.puvodniMisto.okres = okres;
  if (kraj) front.puvodniMisto.kraj = kraj;
  if (coords) {
    front.souradnice = [Math.round(coords[0] * 1e6) / 1e6, Math.round(coords[1] * 1e6) / 1e6];
    front.souradnicePribl = true;
  }
  front.stav = 'neznamy';
  front.chod = 'neznamy';
  front.poznamka = `Doloženo v Hellichově seznamu Janatovy produkce (1917) jako zakázka pro lokalitu \"${hellichName}\" — primární pramen poznámky Václava Cepka, zetě Janaty. Dnešní stav, konkrétní budova, rok výroby a aktuální dochování stroje zatím nedohledány. Vyžaduje dohledání v místních pramenech (kroniky, muzea, weby obcí, OSM/Wikipedia).`;
  front.prameny = [
    {
      citace: `HELLICH, Jan. Příspěvek k slovníku umělců a uměleckých řemeslníků z Poděbradska. *Památky archeologické*. 1917, díl XXIX, sešit 4. — primární seznam Janatovy věžně-hodinářské produkce sestavený podle poznámek Václava Cepka.`,
    },
  ];
  front.zdrojDat = 'hellich_1917';
  front.posledniOvereni = '2026-05-05';

  // Serialize YAML
  const yaml = [];
  yaml.push('---');
  yaml.push(`slug: "${front.slug}"`);
  yaml.push(`rok: "${front.rok}"`);
  yaml.push(`hodinar: "${front.hodinar}"`);
  yaml.push('puvodniMisto:');
  yaml.push(`  obec: "${front.puvodniMisto.obec}"`);
  if (front.puvodniMisto.cast) yaml.push(`  cast: "${front.puvodniMisto.cast.replace(/"/g, '\\"')}"`);
  if (front.puvodniMisto.okres) yaml.push(`  okres: "${front.puvodniMisto.okres}"`);
  if (front.puvodniMisto.kraj) yaml.push(`  kraj: "${front.puvodniMisto.kraj}"`);
  yaml.push(`  zeme: "${front.puvodniMisto.zeme}"`);
  if (front.souradnice) yaml.push(`souradnice: [${front.souradnice[0]}, ${front.souradnice[1]}]`);
  if (front.souradnicePribl) yaml.push(`souradnicePribl: true`);
  yaml.push(`stav: "${front.stav}"`);
  yaml.push(`chod: "${front.chod}"`);
  yaml.push(`poznamka: |`);
  yaml.push(`  ${front.poznamka}`);
  yaml.push(`prameny:`);
  for (const p of front.prameny) {
    yaml.push(`  - citace: |`);
    yaml.push(`      ${p.citace}`);
  }
  yaml.push(`zdrojDat: "${front.zdrojDat}"`);
  yaml.push(`posledniOvereni: "${front.posledniOvereni}"`);
  yaml.push('---');
  yaml.push('');
  return { slug, content: yaml.join('\n') };
}

async function main() {
  let created = 0;
  let skipped = 0;
  let geocoded = 0;
  const log = [];
  for (const entry of ENTRIES) {
    const [hellichName, obec, zeme, query] = entry;
    if (!obec) { skipped++; log.push(`SKIP (duplicate/marker): ${hellichName}`); continue; }
    const tentativeSlug = slugify(`hellich-${obec}-janata`);
    if (SKIP.has(tentativeSlug)) { skipped++; log.push(`SKIP existing: ${tentativeSlug}`); continue; }
    // check both old polička slug and other duplicates
    const targetPath = path.join(OUT_DIR, `${tentativeSlug}.mdx`);
    if (fs.existsSync(targetPath)) { skipped++; log.push(`SKIP exists: ${tentativeSlug}`); continue; }

    let coords = null;
    if (query) {
      coords = await nominatim(query, zeme);
      if (coords) geocoded++;
      // rate limit
      await new Promise(r => setTimeout(r, 1100));
    }

    const out = mdxFor(entry, coords);
    if (!out) { skipped++; continue; }
    fs.writeFileSync(targetPath, out.content);
    created++;
    log.push(`CREATE ${out.slug}${coords ? ` (${coords[0]}, ${coords[1]})` : ' (no coords)'}`);
    process.stdout.write(`.`);
  }
  process.stdout.write('\n');
  console.log(`\n=== DONE ===`);
  console.log(`Created: ${created}`);
  console.log(`Geocoded: ${geocoded}`);
  console.log(`Skipped: ${skipped}`);
  fs.writeFileSync('tmp/janata-hellich-import.log', log.join('\n'));
  console.log('Log: tmp/janata-hellich-import.log');
}

main().catch(e => { console.error(e); process.exit(1); });
