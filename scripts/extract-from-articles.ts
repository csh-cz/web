/**
 * Extract strukturovaných polí ze stávajících sbírka článků → karty.
 *
 * Pro každý vázaný článek (podsekce !== 'karta') s vyplněným relatedKarty:
 *   1. Najdi cílovou kartu(y) ze relatedKarty
 *   2. Extract pole z body článku (regex stejný jako apply-popisy)
 *   3. Merge do karta frontmatter — JEN pokud karta dané pole nemá
 *      (manualEdit / popisy data nepřebíjet)
 *
 * Plus pro články BEZ relatedKarty: fuzzy match jako fallback.
 *
 * Default dry-run, --apply zapíše.
 *
 * Run:
 *   pnpm clanky:extract
 *   pnpm clanky:extract -- --apply
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const CONTENT_DIR = join(ROOT, 'content', 'hodinarium-eu');

const APPLY = process.argv.includes('--apply');

interface ParsedFm {
  fields: Record<string, string | string[]>;
  body: string;
  raw: string;
}

function parseFm(content: string): ParsedFm {
  const m = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { fields: {}, body: content, raw: content };
  const fmText = m[1];
  const body = m[2];
  const fields: Record<string, string | string[]> = {};
  // Parse top-level scalar fields
  for (const line of fmText.split('\n')) {
    const sm = line.match(/^(\w+):\s*"([^"]*)"$/);
    if (sm) { fields[sm[1]] = sm[2]; continue; }
    const sm2 = line.match(/^(\w+):\s*([^\s"][^\n]*)$/);
    if (sm2 && !sm2[2].startsWith('-')) { fields[sm2[1]] = sm2[2].trim(); continue; }
  }
  // relatedKarty array (multiline list)
  const rkMulti = fmText.match(/^relatedKarty:\n((?:\s*-\s*[^\n]+\n?)+)/m);
  if (rkMulti) {
    fields.relatedKarty = rkMulti[1].split('\n')
      .map((l) => l.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  // karta block fields (indented)
  for (const km of fmText.matchAll(/^\s+(\w+):\s*"([^"]*)"$/gm)) {
    if (!fields[`karta.${km[1]}`]) fields[`karta.${km[1]}`] = km[2];
  }
  return { fields, body, raw: content };
}

/** Regex extractors — stejné jako apply-popisy-to-karty.ts (zachováno DRY by import; here duplicate pro samostatnost skriptu) */
function extractFields(body: string): Record<string, string> {
  const out: Record<string, string> = {};

  // Datace NEextrahujeme z body — first 4-digit year is často citation/scrape
  // year, ne datace stroje. Nech datace na popisy:apply (extract z titulu)
  // nebo manualní vyplnění.

  if (/litinov[éý]\s+rám|rám\s+(?:hodin\s+)?je\s+litinov/i.test(body)) out.ram = 'litinový';
  else if (/(klecov[ýé]\s+)?(?:z\s+)?ocelov(?:ých|é)\s+pásnic/i.test(body)) out.ram = 'klecový z ocelových pásnic';
  else if (/kovan[éý]\s+rám|rám\s+(?:hodin\s+)?je\s+kovan/i.test(body)) out.ram = 'kovaný';
  else if (/mosazn[éý]\s+rám|rám\s+(?:hodin\s+)?je\s+mosazn/i.test(body)) out.ram = 'mosazný';

  if (/Grahamův?\s+krok|Graham(?:ův)?\s+s\s+kotvou/i.test(body)) out.krokJicihoStroje = 'Grahamův krok';
  else if (/vřetenov[ýé]\s+krok|krok(?:em)?\s+vřetenov[ýé]m?/i.test(body)) out.krokJicihoStroje = 'vřetenový krok';
  else if (/Amantův?\s+(?:kolíčkov[ýé])?\s*krok/i.test(body)) out.krokJicihoStroje = 'Amantův kolíčkový krok';
  else if (/Benoit(?:a)?\s+(?:a\s+)?Robert(?:a)?\s+de\s+Sancerr/i.test(body)) out.krokJicihoStroje = 'kolíčkový krok Benoita a Roberta de Sancerre';
  else if (/Hipp(?:ův)?\s+(?:přerušovač|krok)/i.test(body)) out.krokJicihoStroje = 'Hippův přerušovač';
  else if (/kotvov[ýé]\s+krok/i.test(body)) out.krokJicihoStroje = 'kotvový krok';
  else if (/lihýřov[ýé]\s+krok|s\s+lihýřem/i.test(body)) out.krokJicihoStroje = 'lihýřový krok';

  const bici: string[] = [];
  if (/čtvrťov[éý]\s+(?:bicí\s+stroj|bití)/i.test(body)) bici.push('čtvrťové');
  if (/(?:hodinov[ýé]\s+(?:stroj\s+)?bití|bití\s+celých\s+hodin|hodinov[éý]\s+bití)/i.test(body)) bici.push('hodinové');
  if (/půlov[éý]\s+(?:bicí\s+stroj|bití)/i.test(body)) bici.push('půlové');
  if (bici.length > 0) out.biciStroje = [...new Set(bici)].join(' + ');

  // Rozměry — formáty "š X cm × v Y × h Z" nebo "šířka X, výška Y, hloubka Z"
  const rozmM = body.match(/(?:šířka|š\.?\s*)\s*(\d{1,3})\s*cm[^.]*?(?:výška|v\.?\s*)\s*(\d{1,3})\s*cm[^.]*?(?:hloubka|h\.?\s*)\s*(\d{1,3})\s*cm/i);
  if (rozmM) out.rozmery = `š ${rozmM[1]} × v ${rozmM[2]} × h ${rozmM[3]} cm`;

  const kyvM = body.match(/kyvadl(?:o|ová\s+tyč)[^.]*?(?:dlouh[éou]|délk[ya]|cca)\s*(\d+(?:[,.]\d+)?)\s*(m|cm)/i);
  if (kyvM) out.kyvadlo = `~${kyvM[1].replace(',', '.')} ${kyvM[2]}`;

  // Signatura — z text v uvozovkách nebo CAPS
  const sigM = body.match(/(?:signatur[au]|signov[áa]n[oa]?\s+(?:jmé[nm][eo]m)?|nápis[em]?\s+výrobce)[^.,]*?[":„]([^"„""]+)[":""]/i);
  if (sigM) out.signatura = sigM[1].trim();

  return out;
}

interface ProposalEntry {
  article: string;
  targetKarta: string;
  extracted: Record<string, string>;
  newFields: Record<string, string>;  // Fields not yet in karta (proposed adds)
  conflictFields: Record<string, [string, string]>;  // [existing, extracted]
}

async function main() {
  const files = await readdir(CONTENT_DIR);
  const allArticles: Array<{ slug: string; filename: string; data: ParsedFm }> = [];
  for (const f of files) {
    if (!/\.(md|mdx)$/.test(f)) continue;
    const slug = f.replace(/\.(md|mdx)$/, '');
    const content = await readFile(join(CONTENT_DIR, f), 'utf-8');
    allArticles.push({ slug, filename: f, data: parseFm(content) });
  }

  // Articles: podsekce !== 'karta' AND category sbirka
  const sbirkaArticles = allArticles.filter((a) =>
    a.data.fields.category === 'sbirka' &&
    a.data.fields.podsekce !== 'karta',
  );
  // Karty: podsekce === 'karta'
  const karty = new Map(
    allArticles.filter((a) => a.data.fields.podsekce === 'karta').map((a) => [a.slug, a]),
  );

  const proposals: ProposalEntry[] = [];

  for (const article of sbirkaArticles) {
    const relatedKarty = (article.data.fields.relatedKarty as string[] | undefined) ?? [];
    if (relatedKarty.length === 0) continue;  // Skip — bez relatedKarty target not určen

    const extracted = extractFields(article.data.body);
    if (Object.keys(extracted).length === 0) continue;  // Nic k extract

    for (const targetSlug of relatedKarty) {
      const target = karty.get(targetSlug);
      if (!target) continue;

      const newFields: Record<string, string> = {};
      const conflictFields: Record<string, [string, string]> = {};
      for (const [k, v] of Object.entries(extracted)) {
        const existingValue = target.data.fields[`karta.${k}`] as string | undefined;
        if (!existingValue) {
          newFields[k] = v;
        } else if (existingValue !== v) {
          conflictFields[k] = [existingValue, v];
        }
      }

      if (Object.keys(newFields).length > 0 || Object.keys(conflictFields).length > 0) {
        proposals.push({
          article: article.slug,
          targetKarta: targetSlug,
          extracted,
          newFields,
          conflictFields,
        });
      }
    }
  }

  console.log('=== Extract z článků → karty: dry-run ===');
  console.log(`Sbírka articles s relatedKarty:  ${sbirkaArticles.filter((a) => Array.isArray(a.data.fields.relatedKarty)).length}`);
  console.log(`Návrhy na update karty:          ${proposals.length}`);
  console.log(`Karet ovlivněno:                 ${new Set(proposals.map((p) => p.targetKarta)).size}`);
  console.log();

  console.log('--- Návrhy ---');
  for (const p of proposals) {
    console.log(`📝 ${p.article} → ${p.targetKarta}`);
    if (Object.keys(p.newFields).length > 0) {
      const fieldsStr = Object.entries(p.newFields).map(([k, v]) => `${k}="${v.slice(0, 50)}"`).join(', ');
      console.log(`   + ADD: ${fieldsStr}`);
    }
    if (Object.keys(p.conflictFields).length > 0) {
      console.log(`   ⚠ CONFLICT (existing ≠ extracted):`);
      for (const [k, [a, b]] of Object.entries(p.conflictFields)) {
        console.log(`     ${k}: existing="${a.slice(0, 40)}" vs extracted="${b.slice(0, 40)}"`);
      }
    }
  }

  if (APPLY) {
    console.log('\n=== --apply mode ===');
    let written = 0;
    // Group proposals per karta
    const perKarta = new Map<string, ProposalEntry[]>();
    for (const p of proposals) {
      if (!perKarta.has(p.targetKarta)) perKarta.set(p.targetKarta, []);
      perKarta.get(p.targetKarta)!.push(p);
    }

    for (const [kartaSlug, pList] of perKarta) {
      const karta = karty.get(kartaSlug);
      if (!karta) continue;

      // Aggregate new fields (first proposal wins per field — pokud víc článků, manuální merge)
      const allNew: Record<string, string> = {};
      for (const p of pList) {
        for (const [k, v] of Object.entries(p.newFields)) {
          if (!allNew[k]) allNew[k] = v;
        }
      }
      if (Object.keys(allNew).length === 0) continue;

      // Insert do karta block (after existing karta fields, before closing ---)
      let raw = karta.data.raw;
      const fmEnd = raw.indexOf('\n---\n', 4);
      if (fmEnd < 0) continue;
      const fmText = raw.slice(4, fmEnd);
      const kartaIdx = fmText.indexOf('\nkarta:');
      if (kartaIdx < 0) continue;

      // Find end of karta block (next non-indented line nebo end of fm)
      const after = fmText.slice(kartaIdx + 1);
      const lines = after.split('\n');
      let endIdx = 1;
      for (let i = 1; i < lines.length; i++) {
        if (lines[i] && !/^\s/.test(lines[i])) { endIdx = i; break; }
        endIdx = i + 1;
      }
      const inserts: string[] = [];
      for (const [k, v] of Object.entries(allNew)) {
        const escaped = v.replace(/"/g, '\\"');
        inserts.push(`  ${k}: "${escaped}"`);
      }
      const newKartaBlock = lines.slice(0, endIdx).concat(inserts).concat(lines.slice(endIdx));
      const newFm = fmText.slice(0, kartaIdx + 1) + newKartaBlock.join('\n');
      const newRaw = `---\n${newFm}\n---\n${raw.slice(fmEnd + 5)}`;
      await writeFile(join(CONTENT_DIR, karta.filename), newRaw, 'utf-8');
      written++;
    }
    console.log(`Karet aktualizováno: ${written}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
