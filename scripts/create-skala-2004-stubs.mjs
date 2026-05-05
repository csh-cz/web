#!/usr/bin/env node
// Vytvoří stub karty pro lokality ze Skálovy Závěrečné zprávy 2004,
// které dosud nemají kartu v soupisu — třída 1 a 2 (nejvyšší priorita).
// Pro každou stub kartu se nastaví: rok (z popisu pokud jasný), hodinář (slug
// jen u jasných případů), pramen Skála 2004, sekce s klasifikací.

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
    default: return `**Třída ${c}**.`;
  }
}

// (file, rok, slug, hodinar, hodinarText, obec, budova, okres, kraj, popis, klass, docYear, lokalitaName)
const STUBS = [
  // === Třída 1 (10 lokalit) ===
  {
    file: 'nedatovano-hradistko-skala-2004.mdx',
    slug: 'nedatovano-hradistko-skala-2004',
    rok: '?', hodinarText: 'neznámý, 2. polovina 18. stol. (atribuce dle Skály 2004)',
    obec: 'Hradišťko', budova: 'Zámek',
    okres: 'Praha-západ', kraj: 'Středočeský',
    popis: 'nezn. 2. pol. 18. stol?', klass: 1, docYear: 1996, lokalitaName: 'Hradišťko',
  },
  {
    file: 'nedatovano-karlstejn-skala-2004.mdx',
    slug: 'nedatovano-karlstejn-skala-2004',
    rok: '?', hodinarText: 'barokní kovaný stroj 18. století (atribuce dle Skály 2004)',
    obec: 'Karlštejn', budova: 'Hrad Karlštejn',
    okres: 'Beroun', kraj: 'Středočeský',
    popis: 'barokní kovaný 18. stol.', klass: 1, docYear: 1999, lokalitaName: 'Karlštejn',
  },
  {
    file: 'nedatovano-loucen-summerecker.mdx',
    slug: 'nedatovano-loucen-summerecker', hodinar: 'frantisek-summerecker',
    rok: '?', hodinarText: 'I. polovina 19. století',
    obec: 'Loučeň', budova: 'Zámek',
    okres: 'Nymburk', kraj: 'Středočeský',
    popis: 'Franz Summerecker I. pol. 19. st.', klass: 1, docYear: 1996, lokalitaName: 'Loučeň',
  },
  {
    file: 'nedatovano-msec-skala-2004.mdx',
    slug: 'nedatovano-msec-skala-2004',
    rok: '?', hodinarText: 'neznámý, kovaný stroj (atribuce dle Skály 2004)',
    obec: 'Mšec', budova: 'Kostel sv. Kateřiny Alexandrijské',
    okres: 'Rakovník', kraj: 'Středočeský',
    popis: 'nezn. kovaný', klass: 1, docYear: 2003, lokalitaName: 'Mšec',
  },
  {
    file: '1852-nimerice-summerecker.mdx',
    slug: '1852-nimerice-summerecker', hodinar: 'frantisek-summerecker',
    rok: 1852,
    obec: 'Niměřice', budova: 'Zámek',
    okres: 'Mladá Boleslav', kraj: 'Středočeský',
    popis: 'Franz Summerecker 1852', klass: 1, docYear: 1996, lokalitaName: 'Niměřice',
  },
  {
    file: 'nedatovano-nizbor-skala-2004.mdx',
    slug: 'nedatovano-nizbor-skala-2004',
    rok: '?', hodinarText: 'neznámý, I. polovina 18. století (?)',
    obec: 'Nižbor', budova: 'Zámek',
    okres: 'Beroun', kraj: 'Středočeský',
    popis: 'nezn. I. pol. 18. stol.?', klass: 1, docYear: 1997, lokalitaName: 'Nižbor',
  },
  {
    file: 'nedatovano-obristvi-skala-2004.mdx',
    slug: 'nedatovano-obristvi-skala-2004',
    rok: '?', hodinarText: 'barokní kovaný, vřetenový krok klidový',
    obec: 'Obříství', budova: 'Zámek',
    okres: 'Mělník', kraj: 'Středočeský',
    popis: 'bar. kovaný, vřet. krok klid.', klass: 1, docYear: 2001, lokalitaName: 'Obříství',
  },
  {
    file: 'nedatovano-psovka-skala-2004.mdx',
    slug: 'nedatovano-psovka-skala-2004',
    rok: '?', hodinarText: 'kovaný, II. polovina 18. století (?)',
    obec: 'Pšovka', cast: 'Mělník-Pšovka', budova: 'Zámek (klášter Pšovka)',
    okres: 'Mělník', kraj: 'Středočeský',
    popis: 'kovaný II. pol. 18. stol. ?', klass: 1, docYear: 2004, lokalitaName: 'Pšovka',
  },
  {
    file: '1920-roztez-schauer.mdx',
    slug: '1920-roztez-schauer',
    rok: 1920, hodinarText: 'Emil Schauer, Wien (elektrický pohon)',
    obec: 'Roztěž', budova: 'Zámek',
    okres: 'Kutná Hora', kraj: 'Středočeský',
    popis: 'Emil Schauer Wien 1920 elektr.', klass: 1, docYear: 2002, lokalitaName: 'Roztěž',
  },
  {
    file: 'nedatovano-slapy-skala-2004.mdx',
    slug: 'nedatovano-slapy-skala-2004',
    rok: '?', hodinarText: 'kovaný stroj, 1. čtvrtina 19. století (?)',
    obec: 'Slapy', budova: 'Zámek',
    okres: 'Praha-západ', kraj: 'Středočeský',
    popis: 'kovaný 1. čtvrť 19. stol.?', klass: 1, docYear: 2004, lokalitaName: 'Slapy',
  },
  {
    file: 'nedatovano-zasmuky-skala-2004.mdx',
    slug: 'nedatovano-zasmuky-skala-2004',
    rok: '?', hodinarText: 'barokní kovaný (osud kovaného stroje nezjištěn — ciferníky byly při opravě fasády nahrazeny oknem)',
    obec: 'Zásmuky', budova: 'Zámek',
    okres: 'Kolín', kraj: 'Středočeský',
    popis: 'barokní kovaný', klass: '1x?', docYear: 1998, lokalitaName: 'Zásmuky',
    extraNote: 'Skála ve své zprávě 2004 výslovně uvádí: *„Ciferníky věžních hodin byly při opravě fasády nahrazeny oknem, osud kovaného stroje nebyl zjištěn"* — stroj byl proto vyloučen z výběru navržených k památkové ochraně.',
  },
  // === Třída 2 (5 lokalit) ===
  {
    file: 'nedatovano-kostelec-nad-labem-puda-radnice-skala-2004.mdx',
    slug: 'nedatovano-kostelec-nad-labem-puda-radnice-skala-2004',
    rok: '?', hodinarText: 'kovaný barokní (uložen na půdě radnice)',
    obec: 'Kostelec nad Labem', budova: 'Půda staré radnice',
    okres: 'Mělník', kraj: 'Středočeský',
    popis: 'kovaný barokní', klass: 2, docYear: 1996, lokalitaName: 'Kostelec nad Labem (půda radnice)',
  },
  {
    file: '1830-luzec-summerecker.mdx',
    slug: '1830-luzec-summerecker', hodinar: 'frantisek-summerecker',
    rok: '1830', hodinarText: 'okolo 1830',
    obec: 'Lužec nad Vltavou', budova: 'Kostel sv. Jiljí',
    okres: 'Mělník', kraj: 'Středočeský',
    popis: 'Franz Summerecker okolo 1830', klass: 2, docYear: 2001, lokalitaName: 'Lužec',
  },
  {
    file: 'nedatovano-obdenice-skala-2004.mdx',
    slug: 'nedatovano-obdenice-skala-2004',
    rok: '?', hodinarText: 'neznámý, polovina 18. století (?)',
    obec: 'Obděnice', budova: 'Kostel Nanebevzetí Panny Marie',
    okres: 'Příbram', kraj: 'Středočeský',
    popis: 'nezn. pol. 18. stol.?', klass: 2, docYear: 2002, lokalitaName: 'Obděnice',
  },
  {
    file: 'nedatovano-prestavlky-skala-2004.mdx',
    slug: 'nedatovano-prestavlky-skala-2004',
    rok: '?', hodinarText: 'malý barokní kovaný, polovina 18. století (?)',
    obec: 'Přestavlky', budova: 'Zámek',
    okres: 'Příbram', kraj: 'Středočeský',
    popis: 'malý bar. kovaný, pol. 18. st.?', klass: 2, docYear: 2001, lokalitaName: 'Přestavlky',
  },
  {
    file: 'nedatovano-velika-ves-skala-2004.mdx',
    slug: 'nedatovano-velika-ves-skala-2004',
    rok: '?', hodinarText: 'kovaný, velmi starý, neúplný',
    obec: 'Veliká Ves', budova: 'Kostel sv. Vavřince',
    okres: 'Praha-východ', kraj: 'Středočeský',
    popis: 'Kovaný, velmi starý, neúplný', klass: 2, docYear: 2003, lokalitaName: 'Veliká Ves',
  },
];

let created = 0, skipped = 0;
for (const e of STUBS) {
  const fp = path.join(DIR, e.file);
  if (fs.existsSync(fp)) {
    console.log(`SKIP existing: ${e.file}`);
    skipped++;
    continue;
  }
  const lines = [];
  lines.push('---');
  lines.push(`slug: "${e.slug}"`);
  lines.push(`rok: ${typeof e.rok === 'number' ? e.rok : `"${e.rok}"`}`);
  if (e.hodinar) lines.push(`hodinar: "${e.hodinar}"`);
  if (e.hodinarText) lines.push(`hodinarText: "${e.hodinarText.replace(/"/g, '\\"')}"`);
  lines.push('puvodniMisto:');
  lines.push(`  obec: "${e.obec}"`);
  if (e.cast) lines.push(`  cast: "${e.cast}"`);
  lines.push(`  budova: "${e.budova}"`);
  if (e.okres) lines.push(`  okres: "${e.okres}"`);
  if (e.kraj) lines.push(`  kraj: "${e.kraj}"`);
  lines.push('  zeme: "CZ"');
  const isMissing = String(e.klass).includes('x?');
  lines.push(isMissing ? 'stav: "ztracene"' : 'stav: "in_situ"');
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
  console.log(`CREATED ${e.file} (klas. ${e.klass})`);
  created++;
}
console.log(`\nTotal: ${created} created, ${skipped} skipped.`);
