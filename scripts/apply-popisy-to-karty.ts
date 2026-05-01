/**
 * Apply parsed Popisy strojů → existující karta stuby v content/hodinarium-eu/.
 *
 * Per stroj z popisy:
 *   1. Fuzzy match titlu na popis ze Soupisu (slovní intersect)
 *   2. Najdi odpovídající karta soubor (inv-NNN-<popisSlug>.md)
 *   3. Extract strukturované atributy z body textu (regex):
 *        - puvodniUmisteni (objekt + obec)
 *        - ram, krokJicihoStroje, biciStroje, kyvadlo, pohon, signatura
 *        - restaurovani, adaptaceProVystavu, darceZapujcitel
 *   4. Update karta frontmatter — vepsat extracted fields + body text
 *      jako prózu pod karta blok
 *   5. Set manualEdit: true (vyplněno ručně z Popisů)
 *
 * Default: dry-run (jen report).
 * --apply: skutečně přepíše karta soubory.
 *
 * Run:
 *   pnpm popisy:apply
 *   pnpm popisy:apply -- --apply
 */
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const POPISY_PATH = join(ROOT, 'tmp', 'popisy-stroju-parsed.json');
const SOUPIS_PATH = join(ROOT, 'apps', 'hodinarium-eu', 'src', 'data', 'soupis-exponatu.json');
const CONTENT_DIR = join(ROOT, 'content', 'hodinarium-eu');

const APPLY = process.argv.includes('--apply');

interface PopisStroj {
  invCislo: number;
  docOrder: number;
  title: string;
  body: string;
  bodyParagraphs: string[];
}
interface SoupisExp {
  invCislo: string;
  popis: string;
}

function slugify(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

/** Skóre fuzzy match dvou popisů — počet sdílených slov délky ≥4, mimo stop-words. */
const STOP = new Set(['věžní', 'vezni', 'hodinový', 'hodinovy', 'hodiny', 'stroj', 'soubor', 'roku', 'hodin']);
function fuzzyScore(a: string, b: string): number {
  const wa = new Set(a.toLowerCase().split(/[^a-zá-ž0-9]+/i).filter((w) => w.length >= 4 && !STOP.has(w)));
  const wb = b.toLowerCase().split(/[^a-zá-ž0-9]+/i).filter((w) => w.length >= 4 && !STOP.has(w));
  let s = 0;
  for (const w of wb) if (wa.has(w)) s++;
  return s;
}

/** Extrakce strukturovaných atributů z body textu Popisu. */
function extractFields(body: string): Record<string, string> {
  const out: Record<string, string> = {};
  const lc = body;

  // Rok výroby (4-číslo) — první výskyt, případně z titulu
  const rokM = body.match(/\b(1[5-9]\d{2}|20[0-2]\d)\b/);
  if (rokM) out.rokVyroby = rokM[1];

  // Rám
  if (/litinov[éý]\s+rám|rám\s+(?:hodin\s+)?je\s+litinov/i.test(body)) out.ram = 'litinový';
  else if (/(klecov[ýé]\s+)?(?:z\s+)?ocelov(?:ých|é)\s+pásnic/i.test(body)) out.ram = 'klecový z ocelových pásnic';
  else if (/kovan[éý]\s+rám|rám\s+(?:hodin\s+)?je\s+kovan/i.test(body)) out.ram = 'kovaný';
  else if (/mosazn[éý]\s+rám|rám\s+(?:hodin\s+)?je\s+mosazn/i.test(body)) out.ram = 'mosazný';

  // Krok
  if (/Grahamův?\s+krok|Graham(?:ův)?\s+s\s+kotvou/i.test(body)) out.krokJicihoStroje = 'Grahamův krok';
  else if (/vřetenov[ýé]\s+krok|krok(?:em)?\s+vřetenov[ýé]m?/i.test(body)) out.krokJicihoStroje = 'vřetenový krok';
  else if (/Amantův?\s+(?:kolíčkov[ýé])?\s*krok/i.test(body)) out.krokJicihoStroje = 'Amantův kolíčkový krok';
  else if (/Benoit(?:a)?\s+(?:a\s+)?Robert(?:a)?\s+de\s+Sancerr/i.test(body)) out.krokJicihoStroje = 'kolíčkový krok Benoita a Roberta de Sancerre';
  else if (/Hipp(?:ův)?\s+(?:přerušovač|krok)/i.test(body)) out.krokJicihoStroje = 'Hippův přerušovač';
  else if (/kotvov[ýé]\s+krok/i.test(body)) out.krokJicihoStroje = 'kotvový krok';
  else if (/lihýřov[ýé]\s+krok|s\s+lihýřem/i.test(body)) out.krokJicihoStroje = 'lihýřový krok';

  // Bití
  const bici: string[] = [];
  if (/čtvrťov[éý]\s+(?:bicí\s+stroj|bití)/i.test(body)) bici.push('čtvrťové');
  if (/(?:hodinov[ýé]\s+(?:stroj\s+)?bití|bití\s+celých\s+hodin|hodinov[éý]\s+bití)/i.test(body)) bici.push('hodinové');
  if (/půlov[éý]\s+(?:bicí\s+stroj|bití)/i.test(body)) bici.push('půlové');
  if (bici.length > 0) out.biciStroje = [...new Set(bici)].join(' + ');

  // Kyvadlo
  const kyvM = body.match(/kyvadlo[^.]*?(?:dlouh[éou]|délk[ya]|cca)\s*(\d+(?:[,.]\d+)?)\s*(m|cm)/i);
  if (kyvM) {
    const len = kyvM[1].replace(',', '.');
    const unit = kyvM[2];
    out.kyvadlo = `~${len} ${unit}`;
  }

  // Pohon (závaží)
  if (/(\d+)\s+(?:těžk[áé])?\s*(?:litinov[áé])?\s*závaž[íiy]/i.test(body)) {
    const m = body.match(/(\d+)\s+(?:těžk[áé])?\s*(?:litinov[áé])?\s*závaž[íiy]/i)!;
    out.pohon = `${m[1]} závaží`;
  } else if (/elektromotor[em]?\s+nátah|elektrick[ýé]\s+nátah/i.test(body)) {
    out.pohon = 'elektromotorový nátah';
  }

  // Signatura — text v uvozovkách, dvojtečka + věta, nebo CAPSLOCK
  // Strategie: hledej za "letopočtem:" / "signov" / "nápis" / "signatura"
  // jednu větu (konec po první tečce/CR), max 80 znaků.
  const sigPatterns = [
    /(?:letopočtem|signatura|signov[áa]n[oa]?(?:\s+jmé[nm][eo]m)?|nápis[em]?\s+výrobce|štítku\s+(?:upevněn[éma]?\s+)?na\s+rámu)\s*[:„"]\s*([^.\n]{3,80}?)\s*[."\n]/i,
    /(?:Signatur[au]|Nápis)[\s:]*[„"]([^"„"\n]{3,80})["]/i,
  ];
  for (const re of sigPatterns) {
    const m = body.match(re);
    if (m) { out.signatura = m[1].trim(); break; }
  }
  if (!out.signatura) {
    const capsM = body.match(/\b([A-Z][A-Z\s.]{5,40}[A-Z])\b/);
    if (capsM) out.signatura = capsM[1].trim();
  }

  // Restaurování — extract věty obsahující "restaurován*"
  const restoreM = body.match(/[^.]*?restaurov[áa]n[íeé][^.]*?\./i);
  if (restoreM) out.restaurovani = restoreM[0].trim();

  // Adaptace pro vystavení — věty s "doplněn*" / "zkrácen*" / "nepůvodní"
  const adaptM = body.match(/[^.]*?(?:doplněn|zkrácen|nepůvodní|nahraz)[^.]*?\./i);
  if (adaptM) out.adaptaceProVystavu = adaptM[0].trim();

  // Dárce / zapůjčitel
  const darceM = body.match(/(?:[Zz]apůjčen[oa]?\s+(?:z\s+majetku\s+|z\s+(?:fondů\s+|sbírek\s+))?|[Dd]aroval(?:a)?\s+(?:pan(?:í)?\s+)?)([A-ZÁ-Ž][^.]{5,80}?)\.?$/m);
  if (darceM) out.darceZapujcitel = darceM[1].trim();

  return out;
}

/** Heuristika pro puvodniUmisteni z body textu. */
function extractPuvodniUmisteni(body: string): { objekt?: string; typObjektu?: string; obec?: string; detail?: string } | null {
  // Typicky: "v kostele/kostele sv. X v Y", "ze zámku v Y", "z věže Y v Z"
  const patterns = [
    /(?:v\s+)?(kostel(?:e)?\s+sv\.\s+[A-ZÁ-Ž][^,.]{3,40})\s+v\s+([A-ZÁ-Ž][^,.\s]+(?:\s+[A-ZÁ-Ž][^,.\s]+)?)/i,
    /(?:byly\s+)?(?:původně\s+)?(?:umístěn[yo])?\s*ve?\s+(zvonici|věži)\s+(kostela\s+sv\.\s+[A-ZÁ-Ž][^,.]{3,40})\s+v\s+([A-ZÁ-Ž][^,.\s]+(?:\s+[A-ZÁ-Ž][^,.\s]+)?)/i,
    /ze\s+zámku\s+v\s+([A-ZÁ-Ž][^,.\s]+(?:\s+[A-ZÁ-Ž][^,.\s]+)?)/i,
    /z\s+věže\s+zámku\s+v\s+([A-ZÁ-Ž][^,.\s]+)/i,
    /budov[ěy]\s+(bývalé\s+[a-zá-ž]+\s+radnice)/i,
  ];
  for (const re of patterns) {
    const m = body.match(re);
    if (!m) continue;
    if (re === patterns[0]) {
      return { objekt: m[1].trim(), typObjektu: 'kostel', obec: m[2].trim() };
    } else if (re === patterns[1]) {
      return { objekt: m[2].trim(), typObjektu: 'kostel', obec: m[3].trim(), detail: m[1] };
    } else if (re === patterns[2] || re === patterns[3]) {
      return { typObjektu: 'zámek', obec: m[1].trim() };
    } else if (re === patterns[4]) {
      return { objekt: m[1].trim(), typObjektu: 'radnice' };
    }
  }
  return null;
}

/** Body summary — vezme první 2-3 paragrafy plus history odstavec. */
function buildBodySummary(p: PopisStroj): string {
  // Pro karta detail page: full body text as paragraphs (zachovává prózu)
  // Stub byl jen warning + photos — nahradíme plným textem
  return p.bodyParagraphs.map((para) => para.trim()).filter(Boolean).join('\n\n');
}

async function findKartaByInv(invCislo: string): Promise<{ slug: string; path: string; content: string } | null> {
  // Najdi inv-NNN-*.md / *.mdx
  const { readdirSync } = await import('node:fs');
  const files = readdirSync(CONTENT_DIR);
  const prefix = `inv-${invCislo}-`;
  const candidates = files.filter((f) => f.startsWith(prefix) && (f.endsWith('.md') || f.endsWith('.mdx')));
  if (candidates.length === 0) return null;
  const file = candidates[0];
  const content = await readFile(join(CONTENT_DIR, file), 'utf-8');
  return { slug: file.replace(/\.(md|mdx)$/, ''), path: join(CONTENT_DIR, file), content };
}

interface MatchResult {
  popis: PopisStroj;
  matchedKartaSlug: string | null;
  matchedKartaPath: string | null;
  matchedSoupis: SoupisExp | null;
  extractedFields: Record<string, string>;
  extractedPuvodniUmisteni: { objekt?: string; typObjektu?: string; obec?: string; detail?: string } | null;
}

async function main() {
  const popisy = JSON.parse(await readFile(POPISY_PATH, 'utf-8')) as PopisStroj[];
  const soupis = JSON.parse(await readFile(SOUPIS_PATH, 'utf-8')) as SoupisExp[];
  const soupisByInv = new Map(soupis.map((s) => [s.invCislo, s]));

  const matches: MatchResult[] = [];
  // Deduplicate popisy by inv. č. — pokud více blocků se stejným inv. (chyba v docx), vezmi nejdelší
  const popisyByInv = new Map<number, PopisStroj>();
  for (const p of popisy) {
    const prev = popisyByInv.get(p.invCislo);
    if (!prev || p.body.length > prev.body.length) popisyByInv.set(p.invCislo, p);
  }

  for (const p of popisyByInv.values()) {
    const invStr = String(p.invCislo);
    const soupisExp = soupisByInv.get(invStr) ?? null;
    const karta = await findKartaByInv(invStr);

    matches.push({
      popis: p,
      matchedKartaSlug: karta?.slug ?? null,
      matchedKartaPath: karta?.path ?? null,
      matchedSoupis: soupisExp,
      extractedFields: extractFields(p.body),
      extractedPuvodniUmisteni: extractPuvodniUmisteni(p.body),
    });
  }

  // Sanity check: detekuj DISCREPANCY mezi popis title (docx) a soupis popis (XLS)
  // Pokud jsou úplně jiné identity (žádné společné slovo), skipni apply pro tu položku.
  function shareWords(a: string, b: string): boolean {
    const stop = new Set(['věžní','vezni','vezne','vezna','hodinový','hodinovy','hodiny','hodin','stroj','strojek','strojku','soubor','roku','model','komplet','kostela','kostele','kostel','typu']);
    const norm = (s: string) =>
      s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
        .split(/[^a-z0-9]+/i).filter((w) => w.length >= 4 && !stop.has(w))
        .map((w) => w.slice(0, 4));  // prefix-4 — řeší českou flexi (velké/velká)
    const wa = new Set(norm(a));
    for (const w of norm(b)) if (wa.has(w)) return true;
    return false;
  }
  // Známé discrepancies mezi Popisy 2.docx a Soupis 3.xls (zatím nesouhlasí —
  // user musí buď opravit inv. č. v jednom ze souborů, nebo dát explicitní override).
  // Tady NEAPLYUJEME — body by se zapsal do nesprávné karty.
  const KNOWN_HARD_MISMATCH = new Set<number>([
    65,   // popis: Model Pražského orloje, XLS inv. 65: Orloj Kavalír (taky model orloje, ale jiný)
    67,   // popis: Věžní hodiny Lissner, XLS inv. 67: Orloj Hvězdárna Petřín
    68,   // popis: Model orloje, XLS inv. 68: Sluneční hodiny horizontální
  ]);

  // Označ "soft warnings" pokud popis title nesdílí žádné slovo s XLS popis,
  // ale apply přesto provedeme — inv. č. je deterministická identita.
  for (const m of matches) {
    if (!m.matchedKartaSlug || !m.matchedSoupis) continue;
    if (KNOWN_HARD_MISMATCH.has(m.popis.invCislo)) {
      m.matchedKartaSlug = null;
      m.matchedKartaPath = null;
      (m as MatchResult & { discrepancy?: string }).discrepancy =
        `HARD: popis "${m.popis.title}" ≠ XLS "${m.matchedSoupis.popis}" — vyžaduje manuální review`;
      continue;
    }
    const haystack = `${m.popis.title} ${m.popis.body}`;
    if (!shareWords(haystack, m.matchedSoupis.popis)) {
      (m as MatchResult & { warning?: string }).warning =
        `popis title "${m.popis.title}" se neshoduje s XLS popisem "${m.matchedSoupis.popis}" — zkontroluj manuálně`;
    }
  }

  console.log('=== Popisy → karty: dry-run (inv. č. direct match) ===');
  console.log(`Popisy total (unique inv): ${popisyByInv.size}`);
  console.log(`S match na kartu:          ${matches.filter((m) => m.matchedKartaSlug).length}`);
  console.log(`Bez match (chybí karta):   ${matches.filter((m) => !m.matchedKartaSlug).length}`);
  console.log();

  console.log('--- Match preview ---');
  const sorted = [...matches].sort((a, b) => a.popis.invCislo - b.popis.invCislo);
  for (const m of sorted) {
    const status = m.matchedKartaSlug ? '✓' : '✗';
    console.log(`${status} inv. ${String(m.popis.invCislo).padStart(3)} "${m.popis.title}"`);
    if (m.matchedKartaSlug) {
      console.log(`   → karta: ${m.matchedKartaSlug}`);
      const w = (m as MatchResult & { warning?: string }).warning;
      if (w) console.log(`   ⚠ WARNING: ${w}`);
      const fields = Object.entries(m.extractedFields).map(([k, v]) => `${k}="${v.slice(0, 40)}"`).join(', ');
      if (fields) console.log(`   fields: ${fields}`);
      if (m.extractedPuvodniUmisteni) console.log(`   puvodniUmisteni: ${JSON.stringify(m.extractedPuvodniUmisteni)}`);
    } else {
      const disc = (m as MatchResult & { discrepancy?: string }).discrepancy;
      if (disc) console.log(`   ✋ ${disc}`);
      else console.log(`   ! karta inv-${m.popis.invCislo}-* neexistuje`);
      if (m.matchedSoupis) console.log(`     (soupis: "${m.matchedSoupis.popis}")`);
    }
  }

  if (APPLY) {
    console.log('\n=== --apply mode ===');
    let written = 0;
    for (const m of matches) {
      if (!m.matchedKartaPath) continue;
      const content = await readFile(m.matchedKartaPath, 'utf-8');
      const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (!fmMatch) continue;
      let fm = fmMatch[1];
      // const oldBody = fmMatch[2];

      // Update karta block — append extracted fields if missing
      // Simple text-based append before next top-level field
      const kartaIdx = fm.indexOf('\nkarta:');
      if (kartaIdx >= 0) {
        // Find end of karta block (next top-level non-indented line)
        const after = fm.slice(kartaIdx + 1);
        const lines = after.split('\n');
        let endIdx = 1;
        for (let i = 1; i < lines.length; i++) {
          if (lines[i] && !/^\s/.test(lines[i])) { endIdx = i; break; }
          endIdx = i + 1;
        }
        const inserts: string[] = [];
        for (const [k, v] of Object.entries(m.extractedFields)) {
          if (fm.includes(`\n  ${k}:`)) continue;  // už existuje
          // Sanitize: trim, sloučit whitespace na single space, oříznout na 300 znaků
          const sanitized = v.replace(/\s+/g, ' ').trim().slice(0, 300);
          if (!sanitized) continue;
          const escaped = sanitized.replace(/"/g, '\\"');
          inserts.push(`  ${k}: "${escaped}"`);
        }
        if (m.extractedPuvodniUmisteni && !fm.includes('puvodniUmisteni:')) {
          inserts.push('  puvodniUmisteni:');
          for (const [k, v] of Object.entries(m.extractedPuvodniUmisteni)) {
            if (!v) continue;
            inserts.push(`    ${k}: ${JSON.stringify(v)}`);
          }
        }
        if (inserts.length > 0) {
          const newKartaBlock = lines.slice(0, endIdx).concat(inserts).concat(lines.slice(endIdx));
          fm = fm.slice(0, kartaIdx + 1) + newKartaBlock.join('\n');
        }
      }
      // Set manualEdit: true
      if (fm.includes('\nmanualEdit: false')) {
        fm = fm.replace('\nmanualEdit: false', '\nmanualEdit: true');
      }

      // Replace stub body s extracted full text
      const newBody = '\n' + buildBodySummary(m.popis) + '\n';
      const newContent = `---\n${fm}\n---\n${newBody}`;
      await writeFile(m.matchedKartaPath, newContent, 'utf-8');
      written++;
    }
    console.log(`Karet aktualizováno: ${written}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
