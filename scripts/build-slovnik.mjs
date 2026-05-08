#!/usr/bin/env node
/**
 * Sync hodinářského výkladového slovníku ze SSOT v user-scope skillu
 * `~/.claude/skills/horologicka-terminologie/reference/slovnik.md`
 * do content collection `content/slovnik/<slug>.md`.
 *
 * Strategy:
 *   - Structured fields → frontmatter (title, slug, kategorie, překlady, varianty, definice, pribuzne)
 *   - Výklad, Příbuzné termíny (jako text), Reference s citacemi, Obrázky → MDX body unchanged
 *
 * Po commitu jsou MDX soubory autoritativní (lze je editovat ručně).
 *
 * Použití:
 *   node scripts/build-slovnik.mjs            # rebuild všech hesel
 *   node scripts/build-slovnik.mjs --dry-run  # jen vypiš co by se vytvořilo
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const SOURCE = path.join(os.homedir(), '.claude/skills/horologicka-terminologie/reference/slovnik.md');
const OUT_DIR = path.resolve(process.cwd(), 'content/slovnik');

const KATEGORIE = {
  // mechanika času (15)
  'krok': 'mechanika',
  'kotva': 'mechanika',
  'kyvadlo': 'mechanika',
  'setrvačka': 'mechanika',
  'vlásek': 'mechanika',
  'soukolí': 'mechanika',
  'krokové kolo': 'mechanika',
  'paleta': 'mechanika',
  'perovník': 'mechanika',
  'pero (tažné péro)': 'mechanika',
  'závaží': 'mechanika',
  'šnek (závitek)': 'mechanika',
  'chronometr': 'mechanika',
  'lihýř': 'mechanika',
  'regulátor': 'mechanika',
  // bicí mechanismy (11)
  'bicí stroj': 'bici',
  'kladívko': 'bici',
  'cymbál': 'bici',
  'kolo závěrkové': 'bici',
  'početník': 'bici',
  'srdcovka': 'bici',
  'posůvka': 'bici',
  'stupnice': 'bici',
  'větrník': 'bici',
  'spoušť': 'bici',
  'raménko (zapadací / výpustné)': 'bici',
  // sluneční a astronomické hodiny (4)
  'sluneční hodiny': 'astronomicke',
  'gnómon': 'astronomicke',
  'časová rovnice': 'astronomicke',
  'kvadrant': 'astronomicke',
  // materiály a vlastnosti (5)
  'isochronismus': 'materialy',
  'kompenzace teplotní': 'materialy',
  'invar': 'materialy',
  'rubínový kámen': 'materialy',
  'vlásková křivka (Breguetova / Phillipsova)': 'materialy',
  // hodinky kapesní/náramkové (10) — SL3
  'kalibr': 'hodinky',
  'werk': 'hodinky',
  'korunka': 'hodinky',
  'sklíčko': 'hodinky',
  'pouzdro': 'hodinky',
  'signatura': 'hodinky',
  'opakovací hodinky': 'hodinky',
  'chronograf': 'hodinky',
  'automatic (samonatahovací)': 'hodinky',
  'GMT / druhá časová zóna': 'hodinky',
  // profese a hodinářské školy (8) — SL4
  'hodinář': 'profese',
  'pouzdrář': 'profese',
  'pražská škola': 'profese',
  'švarcvaldská škola': 'profese',
  'vídeňská škola': 'profese',
  'anglická škola': 'profese',
  'francouzská škola': 'profese',
  'švýcarská škola': 'profese',
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')        // strip accents
    .replace(/\s*\([^)]+\)\s*/g, ' ')        // strip parentheses content (incl spaces around)
    .replace(/[^\w\s-]/g, '')               // strip punctuation
    .trim()
    .replace(/\s+/g, '-');                  // spaces → dashes
}

function escapeYamlInline(s) {
  if (s == null) return '""';
  s = String(s);
  // Quote if contains special chars or starts/ends with whitespace
  if (/[":#&*!?|>%@`{}\[\],\n]/.test(s) || /^\s|\s$/.test(s)) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return s;
}

// Multi-line literal block scalar (|) — content indented by `indent` spaces.
function blockScalar(s, indent = 2) {
  const pad = ' '.repeat(indent);
  return '|\n' + s.split('\n').map(line => pad + line).join('\n');
}

function parsePreklady(block) {
  const result = { de: [], en: [], fr: [] };
  for (const line of block.split('\n')) {
    const match = /^-\s*(de|en|fr)\s*:\s*(.+)$/.exec(line);
    if (!match) continue;
    const lang = match[1];
    const rest = match[2];
    for (const segment of rest.split(/\s+\/\s+/)) {
      const m = /\*\*([^*]+)\*\*(?:\s*\[([^\]]+)\])?/.exec(segment);
      if (m) {
        const term = m[1].trim();
        const zdroj = m[2]?.trim();
        result[lang].push(zdroj ? { term, zdroj } : { term });
      } else {
        const cleanSeg = segment.replace(/\[([^\]]+)\]/g, '').trim();
        if (cleanSeg && !cleanSeg.includes('Špatný 1882 nemá')) {
          result[lang].push({ term: cleanSeg });
        }
      }
    }
  }
  return result;
}

function parseVarianty(text) {
  const m = /\*\*Varianty\s*\(cs\)\s*:\*\*\s*([^\n]+)/.exec(text);
  if (!m) return [];
  return m[1]
    .split(',')
    .map(s => s.trim().replace(/^\*\*|\*\*$/g, ''))
    .filter(Boolean);
}

function parseDefinice(text) {
  const m = /\*\*Definice:\*\*\s*([\s\S]+?)(?=\n\n\*\*Výklad|\n\n##)/.exec(text);
  if (!m) return '';
  return m[1].trim().replace(/\s+/g, ' ');
}

function parsePribuzne(text, currentSlug) {
  const m = /\*\*Příbuzné termíny:\*\*\s*([^\n]+)/.exec(text);
  if (!m) return [];
  const line = m[1];
  const slugs = new Set();

  // [term](#anchor)
  for (const link of line.matchAll(/\[([^\]]+)\]\(#([^)]+)\)/g)) {
    const slug = link[2].trim();
    if (slug && slug !== currentSlug) slugs.add(slug);
  }
  // [term] without (#…) — only count if known heslo
  for (const link of line.matchAll(/\[([^\]]+)\](?!\()/g)) {
    const term = link[1].trim();
    const slug = slugify(term);
    if (slug && slug !== currentSlug && KATEGORIE[term]) slugs.add(slug);
  }
  return [...slugs];
}

// Extract Výklad → Obrázky as a single MDX body chunk
function extractBody(text) {
  // Body starts at **Výklad:** and ends at the closing horizontal rule `---`
  // (or end of section). We keep Výklad + Příbuzné termíny + Reference + Obrázky.
  const idx = text.indexOf('**Výklad:**');
  if (idx < 0) return '';

  let body = text.slice(idx);
  // Section delimiter at end:
  // The slovnik.md uses `---` between hesla. Split on first occurrence after start.
  const endIdx = body.indexOf('\n---\n');
  if (endIdx > 0) body = body.slice(0, endIdx);

  // Convert "**Heading:**" → "## Heading\n\n" for MDX hierarchy.
  // The trailing `\n\n` ensures inline content (e.g. cross-reference list)
  // becomes its own paragraph instead of part of the heading.
  body = body
    .replace(/\*\*Výklad:\*\*\s*/, '## Výklad\n\n')
    .replace(/\*\*Příbuzné termíny:\*\*\s*/, '## Příbuzné termíny\n\n')
    .replace(/\*\*Reference:\*\*\s*/, '## Reference\n\n')
    .replace(/\*\*Obrázky:\*\*\s*/, '## Obrázky\n\n');

  return body.trim();
}

function buildFrontmatter(data) {
  const lines = ['---'];
  lines.push(`title: ${escapeYamlInline(data.title)}`);
  lines.push(`slug: ${escapeYamlInline(data.slug)}`);
  lines.push(`kategorie: ${escapeYamlInline(data.kategorie)}`);

  function emitTranslations(field, list) {
    if (!list || list.length === 0) return;
    lines.push(`${field}:`);
    for (const t of list) {
      lines.push(`  - term: ${escapeYamlInline(t.term)}`);
      if (t.zdroj) lines.push(`    zdroj: ${escapeYamlInline(t.zdroj)}`);
    }
  }
  emitTranslations('prekladyDe', data.prekladyDe);
  emitTranslations('prekladyEn', data.prekladyEn);
  emitTranslations('prekladyFr', data.prekladyFr);

  if (data.varianty?.length) {
    lines.push('varianty:');
    for (const v of data.varianty) lines.push(`  - ${escapeYamlInline(v)}`);
  }

  // Definice — single line (collapsed whitespace)
  lines.push(`definice: ${escapeYamlInline(data.definice)}`);

  if (data.pribuzne?.length) {
    lines.push('pribuzne:');
    for (const p of data.pribuzne) lines.push(`  - ${escapeYamlInline(p)}`);
  }

  lines.push('---');
  return lines.join('\n');
}

function main() {
  const dryRun = process.argv.includes('--dry-run');

  if (!fs.existsSync(SOURCE)) {
    console.error(`Source file not found: ${SOURCE}`);
    process.exit(1);
  }

  const text = fs.readFileSync(SOURCE, 'utf8');

  const SKIP_HEADINGS = new Set([
    'Konvence hesla',
    '<cs heslo>',
    'Stav slovníku',
    'Postup další iterace',
    'Pravidla pro tvorbu hesel',
  ]);

  const sections = text.split(/^## /m).slice(1);
  let count = 0;

  if (!dryRun) fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const section of sections) {
    const titleEnd = section.indexOf('\n');
    const title = section.slice(0, titleEnd).trim();
    if (SKIP_HEADINGS.has(title)) continue;
    const body = section.slice(titleEnd + 1);

    const slug = slugify(title);
    const kategorie = KATEGORIE[title] || 'jine';
    if (!KATEGORIE[title]) {
      console.warn(`⚠ Unknown kategorie pro heslo "${title}", using 'jine'`);
    }

    const preklady = parsePreklady(body);
    const varianty = parseVarianty(body);
    const definice = parseDefinice(body);
    const pribuzne = parsePribuzne(body, slug);
    const mdxBody = extractBody(body);

    const frontmatter = buildFrontmatter({
      title, slug, kategorie,
      prekladyDe: preklady.de,
      prekladyEn: preklady.en,
      prekladyFr: preklady.fr,
      varianty, definice, pribuzne,
    });

    const out = frontmatter + '\n\n' + mdxBody + '\n';
    const outPath = path.join(OUT_DIR, `${slug}.md`);

    if (dryRun) {
      console.log(`[dry-run] would write ${outPath} (${out.length} bytes)`);
    } else {
      fs.writeFileSync(outPath, out);
      console.log(`✓ ${slug.padEnd(28)} (${kategorie})`);
    }
    count++;
  }

  console.log(`\n${dryRun ? '[dry-run] ' : ''}${count} hesel zpracováno.`);
}

main();
