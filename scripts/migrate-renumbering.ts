/**
 * Migrace karty inv-* po přečíslování Soupisu 3.xls + Popisy strojů 2.docx (2026-05-01).
 *
 * Identita exponátu = slugify(popis). Inv. č. se mohlo změnit, popis ne.
 *
 * Algoritmus:
 *   1. Načti nový soupis-exponatu.json (NEW data se správnými inv. č.)
 *   2. Načti všechny existující content/hodinarium-eu/inv-*.md (OLD slugs)
 *   3. Pro každou existující kartu: extract popisSlug ze slugu (= část za inv-NNN-)
 *   4. Lookup popisSlug v new map → najdi nové inv. č.
 *   5. Plan: SAME / RENAME / ORPHAN / (NEW přidáme zvlášť přes generate-soupis-stubs)
 *
 * Modes:
 *   default (dry-run): jen report v tmp/migrace-prereport.md
 *   --apply:           přejmenuje soubory + opraví frontmatter inventarniCislo
 *
 * Run:
 *   pnpm renumber           # dry-run
 *   pnpm renumber -- --apply
 */
import { readFile, writeFile, rename, mkdir, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const SOUPIS_PATH = join(ROOT, 'apps', 'hodinarium-eu', 'src', 'data', 'soupis-exponatu.json');
const CONTENT_DIR = join(ROOT, 'content', 'hodinarium-eu');
const OUT_REPORT = join(ROOT, 'tmp', 'migrace-prereport.md');

const APPLY = process.argv.includes('--apply');

interface Exponat {
  invCislo: string;
  invCisloNumeric: number | null;
  popis: string;
  lokaceHuman: string;
  mistnost: string;
}

interface KartaFile {
  filename: string;     // "inv-1-vezni-hiemann-1884.md"
  slug: string;         // "inv-1-vezni-hiemann-1884"
  invCisloFromSlug: string;     // "1" or "x1"
  popisSlug: string;    // "vezni-hiemann-1884"
  invCisloFromFm: string | null;  // z frontmatteru, pokud existuje
  titleFromFm: string | null;
  umisteniFromFm: string | null;  // "Hlavní sál" / "Vitrína 2 (Sál elektro)"
  content: string;
  ext: 'md' | 'mdx';
}

function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

function parseFrontmatter(content: string): Record<string, string> | null {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm: Record<string, string> = {};
  const lines = m[1].split('\n');
  for (const line of lines) {
    const fmMatch = line.match(/^(\w+):\s*(.*)$/);
    if (!fmMatch) continue;
    fm[fmMatch[1]] = fmMatch[2].trim().replace(/^["']|["']$/g, '');
  }
  // Also extract karta.inventarniCislo (nested)
  const invM = m[1].match(/\n\s+inventarniCislo:\s*"?([^"\n]+)"?/);
  if (invM) fm['__kartaInvCislo'] = invM[1].trim();
  const umM = m[1].match(/\n\s+umisteni:\s*"?([^"\n]+)"?/);
  if (umM) fm['__kartaUmisteni'] = umM[1].trim();
  return fm;
}

async function loadKartaFiles(): Promise<KartaFile[]> {
  const files = (await readdir(CONTENT_DIR)).filter(
    (f) => /^inv-/.test(f) && (f.endsWith('.md') || f.endsWith('.mdx')),
  );
  const out: KartaFile[] = [];
  for (const filename of files) {
    const ext = filename.endsWith('.mdx') ? 'mdx' : 'md';
    const slug = filename.replace(/\.(md|mdx)$/, '');
    const slugMatch = slug.match(/^inv-(x?\d+)-(.+)$/);
    if (!slugMatch) continue;
    const content = await readFile(join(CONTENT_DIR, filename), 'utf-8');
    const fm = parseFrontmatter(content) ?? {};
    out.push({
      filename,
      slug,
      invCisloFromSlug: slugMatch[1],
      popisSlug: slugMatch[2],
      invCisloFromFm: fm['__kartaInvCislo'] ?? null,
      titleFromFm: fm['title'] ?? null,
      umisteniFromFm: fm['__kartaUmisteni'] ?? null,
      content,
      ext,
    });
  }
  return out;
}

async function main() {
  const soupis = JSON.parse(await readFile(SOUPIS_PATH, 'utf-8')) as Exponat[];
  const existing = await loadKartaFiles();

  // Build new soupis lookups
  // - byInv: jeden záznam per inv. č. (unique)
  // - byPopisSlug: VŠECHNY záznamy se stejnou popis (může být N pro "Bateriové ročky" apod.)
  const newByInv = new Map<string, Exponat>();
  const newByPopisSlug = new Map<string, Exponat[]>();
  for (const e of soupis) {
    const ps = slugify(e.popis);
    newByInv.set(e.invCislo, e);
    const arr = newByPopisSlug.get(ps) ?? [];
    arr.push(e);
    newByPopisSlug.set(ps, arr);
  }

  // Categorize each existing karta
  type Action = 'SAME' | 'RENAME' | 'ORPHAN' | 'AMBIGUOUS';
  interface KartaAction {
    karta: KartaFile;
    action: Action;
    newInv?: string;
    newSlug?: string;
    newFilename?: string;
    matchedPopis?: string;
    note?: string;
  }
  const actions: KartaAction[] = [];

  // Track které new exponáty už byly přiřazeny (aby se nezdvojovaly)
  const claimed = new Set<string>();  // inv. č. claimed by some existing karta

  for (const k of existing) {
    // 1. Stejné inv. č. v novém XLS, popis se shoduje → SAME
    const sameInv = newByInv.get(k.invCisloFromSlug);
    if (sameInv && slugify(sameInv.popis) === k.popisSlug) {
      const newSlug = `inv-${sameInv.invCislo}-${k.popisSlug}`;
      claimed.add(sameInv.invCislo);
      actions.push({
        karta: k,
        action: 'SAME',
        newInv: sameInv.invCislo,
        newSlug,
        newFilename: `${newSlug}.${k.ext}`,
        matchedPopis: sameInv.popis,
      });
      continue;
    }

    // 2. Hledej kandidáty se stejným popisSlug v novém XLS
    const candidates = newByPopisSlug.get(k.popisSlug) ?? [];
    if (candidates.length > 0) {
      // 2a. Preferuj kandidáta se stejným inv. č. (pokud nebyl zachycen v 1)
      let chosen: Exponat | null = null;
      const sameInvCand = candidates.find((c) => c.invCislo === k.invCisloFromSlug);
      if (sameInvCand && !claimed.has(sameInvCand.invCislo)) {
        chosen = sameInvCand;
      }
      // 2b. Pak match podle umisteni z frontmatteru
      if (!chosen && k.umisteniFromFm) {
        const sameUm = candidates.find(
          (c) => c.lokaceHuman === k.umisteniFromFm && !claimed.has(c.invCislo),
        );
        if (sameUm) chosen = sameUm;
      }
      // 2c. Vezmi první nezachycený
      if (!chosen) {
        const first = candidates.find((c) => !claimed.has(c.invCislo));
        if (first) chosen = first;
      }

      if (chosen) {
        const newSlug = `inv-${chosen.invCislo}-${k.popisSlug}`;
        claimed.add(chosen.invCislo);
        const action: Action = newSlug === k.slug ? 'SAME' : 'RENAME';
        actions.push({
          karta: k,
          action,
          newInv: chosen.invCislo,
          newSlug,
          newFilename: `${newSlug}.${k.ext}`,
          matchedPopis: chosen.popis,
          note: candidates.length > 1 ? `1 z ${candidates.length} kandidátů (popis se opakuje)` : undefined,
        });
        continue;
      }
      // Všichni kandidáti zachyceni — fallthrough
    }

    {
      // ORPHAN — popis nenalezen v novém soupisu
      // Pokus o fuzzy: match by title / first slug words
      let bestExp: Exponat | null = null;
      let bestScore = 0;
      const kWords = new Set(k.popisSlug.split('-').filter((w) => w.length >= 3));
      for (const e of soupis) {
        const eSlug = slugify(e.popis);
        const eWords = eSlug.split('-').filter((w) => w.length >= 3);
        let score = 0;
        for (const w of eWords) if (kWords.has(w)) score++;
        if (score > bestScore && score >= 2) { bestScore = score; bestExp = e; }
      }
      if (bestExp) {
        actions.push({
          karta: k,
          action: 'AMBIGUOUS',
          newInv: bestExp.invCislo,
          newSlug: `inv-${bestExp.invCislo}-${slugify(bestExp.popis)}`,
          newFilename: `inv-${bestExp.invCislo}-${slugify(bestExp.popis)}.${k.ext}`,
          matchedPopis: bestExp.popis,
          note: `fuzzy match score ${bestScore} z ${kWords.size} slov`,
        });
      } else {
        actions.push({ karta: k, action: 'ORPHAN', note: 'popis nenalezen v novém soupisu' });
      }
    }
  }

  // Find new soupis rows that have NO existing karta (= NEW)
  const existingPopisSlugs = new Set(existing.map((k) => k.popisSlug));
  const newRows: Exponat[] = [];
  for (const e of soupis) {
    const ps = slugify(e.popis);
    if (!existingPopisSlugs.has(ps)) newRows.push(e);
  }

  // Detect collisions — multiple existing karty mapping to same new slug
  const newSlugCounts = new Map<string, KartaAction[]>();
  for (const a of actions) {
    if (!a.newSlug) continue;
    const arr = newSlugCounts.get(a.newSlug) ?? [];
    arr.push(a);
    newSlugCounts.set(a.newSlug, arr);
  }
  const collisions = [...newSlugCounts.entries()].filter(([, arr]) => arr.length > 1);

  // Report
  const same = actions.filter((a) => a.action === 'SAME');
  const renames = actions.filter((a) => a.action === 'RENAME');
  const orphans = actions.filter((a) => a.action === 'ORPHAN');
  const ambiguous = actions.filter((a) => a.action === 'AMBIGUOUS');

  console.log('=== Migrace přečíslování ===');
  console.log(`Soupis (NEW):                ${soupis.length}`);
  console.log(`Existující karty:            ${existing.length}`);
  console.log();
  console.log(`SAME (žádná změna):          ${same.length}`);
  console.log(`RENAME (jen inv. č. změnil): ${renames.length}`);
  console.log(`AMBIGUOUS (fuzzy):           ${ambiguous.length}`);
  console.log(`ORPHAN (nenalezeno):         ${orphans.length}`);
  console.log(`NEW (nová položka):          ${newRows.length}`);
  console.log(`KOLIZE slugů:                ${collisions.length}`);

  // Markdown report
  let md = '# Migrace přečíslování — pre-report\n\n';
  md += `Generováno: ${new Date().toISOString()}\n\n`;
  md += `- Soupis (NEW): **${soupis.length}**\n`;
  md += `- Existující karty: **${existing.length}**\n\n`;
  md += `| Kategorie | Počet |\n|---|---|\n`;
  md += `| SAME | ${same.length} |\n`;
  md += `| RENAME | ${renames.length} |\n`;
  md += `| AMBIGUOUS | ${ambiguous.length} |\n`;
  md += `| ORPHAN | ${orphans.length} |\n`;
  md += `| NEW (chybí karta) | ${newRows.length} |\n`;
  md += `| KOLIZE | ${collisions.length} |\n\n`;

  if (collisions.length > 0) {
    md += '## Kolize slugů (POZOR — víc karet → 1 nový slug)\n\n';
    for (const [slug, arr] of collisions) {
      md += `- **${slug}**:\n`;
      for (const a of arr) md += `  - ${a.karta.slug} (${a.action})\n`;
    }
    md += '\n';
  }

  if (renames.length > 0) {
    md += `## RENAME (${renames.length})\n\n| starý slug | nový slug | inv. starý → nový |\n|---|---|---|\n`;
    for (const a of renames.sort((x, y) => parseInt(x.newInv ?? '0') - parseInt(y.newInv ?? '0'))) {
      md += `| ${a.karta.slug} | ${a.newSlug} | ${a.karta.invCisloFromSlug} → ${a.newInv} |\n`;
    }
    md += '\n';
  }

  if (ambiguous.length > 0) {
    md += `## AMBIGUOUS — fuzzy match (${ambiguous.length})\n\n| existující slug | navržený nový | popis | note |\n|---|---|---|---|\n`;
    for (const a of ambiguous) {
      md += `| ${a.karta.slug} | ${a.newSlug} | ${a.matchedPopis} | ${a.note} |\n`;
    }
    md += '\n';
  }

  if (orphans.length > 0) {
    md += `## ORPHAN — bez match v novém soupisu (${orphans.length})\n\n| existující slug | poznámka |\n|---|---|\n`;
    for (const a of orphans) md += `| ${a.karta.slug} | ${a.note} |\n`;
    md += '\n';
  }

  if (newRows.length > 0) {
    md += `## NEW — nové položky v Soupisu 3 bez karty (${newRows.length})\n\n| inv. č. | popis | lokace |\n|---|---|---|\n`;
    for (const e of newRows.sort((a, b) => (a.invCisloNumeric ?? 9999) - (b.invCisloNumeric ?? 9999))) {
      md += `| ${e.invCislo} | ${e.popis} | ${e.lokaceHuman} |\n`;
    }
    md += '\n';
  }

  await mkdir(dirname(OUT_REPORT), { recursive: true });
  await writeFile(OUT_REPORT, md, 'utf-8');
  console.log(`\nReport: ${OUT_REPORT}`);

  if (!APPLY) {
    console.log('\n(dry-run — žádný soubor přepsán; spusť s --apply pro provedení RENAME)');
    return;
  }

  // Skip kolize — they need manual review
  const collidingSlugs = new Set(collisions.map(([slug]) => slug));
  const safeRenames = [...renames, ...ambiguous].filter((a) => !collidingSlugs.has(a.newSlug ?? ''));
  const skippedCollisions = [...renames, ...ambiguous].filter((a) => collidingSlugs.has(a.newSlug ?? ''));
  if (skippedCollisions.length > 0) {
    console.warn(`\n!! Vynecháno ${skippedCollisions.length} renames kvůli kolizi (vyžadují manuální review):`);
    for (const a of skippedCollisions) console.warn(`   ${a.karta.slug} → ${a.newSlug}`);
  }

  // Seřaď renames tak, aby cíl nepřekryl zdroj jiného renamu.
  // Pro chain x1→x2, x2→x3, x3→x4, ... procesuj v sestupném pořadí target inv. č.
  const sortableInv = (s: string): number => {
    if (s.startsWith('x')) return parseInt(s.slice(1), 10);
    return parseInt(s, 10);
  };
  safeRenames.sort((a, b) => sortableInv(b.newInv ?? '0') - sortableInv(a.newInv ?? '0'));

  let renamed = 0;
  let fmFixed = 0;
  for (const a of safeRenames) {
    if (!a.newFilename || !a.newInv) continue;
    const oldPath = join(CONTENT_DIR, a.karta.filename);
    const newPath = join(CONTENT_DIR, a.newFilename);

    let content = a.karta.content;
    content = content.replace(/(\n  inventarniCislo:\s*)"[^"]*"/, `$1"${a.newInv}"`);
    content = content.replace(/(\nslug:\s*)"[^"]*"/, `$1"${a.newSlug}"`);

    if (oldPath !== newPath) {
      // Sanity check — pokud cíl existuje, neapply (necháme pro ruční řešení)
      const { existsSync: ex } = await import('node:fs');
      if (ex(newPath)) {
        console.warn(`   SKIP: ${a.karta.slug} → ${a.newSlug} (cíl existuje, neočekávaná kolize)`);
        continue;
      }
      await writeFile(oldPath, content, 'utf-8');
      await rename(oldPath, newPath);
      renamed++;
    } else {
      await writeFile(oldPath, content, 'utf-8');
    }
    fmFixed++;
  }

  // For SAME action, still verify frontmatter inventarniCislo matches
  for (const a of same) {
    if (!a.newInv) continue;
    if (a.karta.invCisloFromFm === a.newInv) continue;
    const newContent = a.karta.content.replace(
      /(\n  inventarniCislo:\s*)"[^"]*"/,
      `$1"${a.newInv}"`,
    );
    await writeFile(join(CONTENT_DIR, a.karta.filename), newContent, 'utf-8');
    fmFixed++;
  }

  console.log(`\n=== --apply provedeno ===`);
  console.log(`Renamed:                  ${renamed}`);
  console.log(`Frontmatter opraveno:     ${fmFixed}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
