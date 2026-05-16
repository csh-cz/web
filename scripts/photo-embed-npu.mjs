#!/usr/bin/env node
/**
 * Fáze 2: Embed XMP/IPTC metadata do 94 NPÚ MIS PDF souborů.
 *
 * Vstup: /tmp/npu_embed_data.tsv (vygenerováno SQL query nad Zotero DB)
 * Akce: exiftool zapíše do každého souboru:
 *   - XMP-dc:Creator, XMP-dc:Rights, XMP-xmpRights:UsageTerms/WebStatement
 *   - XMP-cc:license, XMP-dc:Source, XMP-dc:Description, XMP-dc:Identifier
 *   - IPTC:By-line, IPTC:CopyrightNotice, IPTC:Source, IPTC:Credit, IPTC:DateCreated
 *
 * License default = CC BY-NC-ND 3.0 CZ (per memory feedback_npu_foto_licence).
 *
 * Idempotentní: před zápisem čte existing XMP-dc:Source — pokud match a flag --skip-existing,
 * skip soubor.
 *
 * Run:
 *   node scripts/photo-embed-npu.mjs --dry        # dry run (žádné writes)
 *   node scripts/photo-embed-npu.mjs              # real embed
 *   node scripts/photo-embed-npu.mjs --verbose    # detail per soubor
 *   node scripts/photo-embed-npu.mjs --skip-existing  # skip pokud XMP-dc:Source už matchuje
 */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const TSV_PATH = '/tmp/npu_embed_data.tsv';

const DRY_RUN = process.argv.includes('--dry');
const VERBOSE = process.argv.includes('--verbose');
const SKIP_EXISTING = process.argv.includes('--skip-existing');

// Konstanty pro NPÚ licenci
const CC_LICENSE_TEXT = 'CC BY-NC-ND 3.0 CZ';
const CC_LICENSE_URL = 'https://creativecommons.org/licenses/by-nc-nd/3.0/cz/';
const NPU_RIGHTS = '© Národní památkový ústav. CC BY-NC-ND 3.0 CZ';
const NPU_COPYRIGHT_NOTICE = '© Národní památkový ústav';
const NPU_SOURCE_INST = 'NPÚ MIS';

// =====================================================================
// Helpers
// =====================================================================

/**
 * Z abstract NPÚ Zotero item extrahuje autora dokumentu.
 * Dvě patterny:
 *  1. "Autor originálu: Mašátová Anna;" (vyšší priorita)
 *  2. First chunk před "; Klíčová slova:" — typicky institucionální autor
 *     (Krajské středisko památkové péče, NPÚ ÚOP v Josefově atd.)
 */
function extractAutor(abstract) {
  if (!abstract) return null;
  // Pattern 1 — explicit "Autor originálu:"
  const m1 = abstract.match(/Autor originálu:\s*([^;|]+)/i);
  if (m1) return m1[1].trim();
  // Pattern 2 — first chunk před "; Klíčová slova:"
  const m2 = abstract.match(/^([^;|]+);\s*Klíčová slova:/);
  if (m2) return m2[1].trim();
  return null;
}

/**
 * Z TSV `date_field` (může být "2017-04-26", "26.04.2017", "1967", "1967-00-00 1967") extrahuje rok.
 */
function extractYear(dateField) {
  if (!dateField) return null;
  const m = dateField.match(/(1[5-9]\d{2}|20\d{2})/);
  return m ? parseInt(m[1], 10) : null;
}

/**
 * Pro IPTC:DateCreated chce YYYY:MM:DD (pokud máme jen rok, dáme YYYY:01:01).
 */
function formatIptcDate(dateField) {
  if (!dateField) return null;
  // ISO format YYYY-MM-DD
  const iso = dateField.match(/(1[5-9]\d{2}|20\d{2})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}:${iso[2]}:${iso[3]}`;
  // Czech format DD.MM.YYYY
  const cs = dateField.match(/(\d{2})\.(\d{2})\.(1[5-9]\d{2}|20\d{2})/);
  if (cs) return `${cs[3]}:${cs[2]}:${cs[1]}`;
  // Jen rok
  const year = extractYear(dateField);
  if (year) return `${year}:01:01`;
  return null;
}

/**
 * Run exiftool s args + path. Vrátí stdout nebo throws.
 */
function runExiftool(args, filePath, opts = {}) {
  const fullArgs = [...args, filePath];
  try {
    return execFileSync('exiftool', fullArgs, {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024,
      stdio: opts.silent ? ['ignore', 'pipe', 'ignore'] : 'pipe',
    });
  } catch (e) {
    if (opts.silent) return null;
    throw new Error(`exiftool failed: ${e.message}`);
  }
}

/**
 * Read existing XMP-dc:Source (= NPÚ MIS URL) z file — pro idempotency check.
 */
function readExistingSource(filePath) {
  const out = runExiftool(['-XMP-dc:Source', '-s', '-s', '-s'], filePath, { silent: true });
  return out ? out.trim() : null;
}

// =====================================================================
// Parse TSV
// =====================================================================

const tsv = readFileSync(TSV_PATH, 'utf-8');
const lines = tsv.split('\n').filter(Boolean);
const header = lines[0].split('\t');
const rows = lines.slice(1).map((line) => {
  const cells = line.split('\t');
  const obj = {};
  header.forEach((h, i) => { obj[h] = cells[i] ?? ''; });
  return obj;
});

console.log(`NPÚ embed batch — ${rows.length} items`);
console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no writes)' : 'WRITE'}`);
console.log(`Skip existing: ${SKIP_EXISTING}`);
console.log('---');

// =====================================================================
// Process each row
// =====================================================================

const stats = { processed: 0, embedded: 0, skipped: 0, failed: 0, missing: 0 };
const failures = [];

for (const row of rows) {
  stats.processed++;
  const { zotero_key, npu_id, title, date_field, source_url, abstract, file_path } = row;

  if (!file_path || !existsSync(file_path)) {
    stats.missing++;
    if (VERBOSE) console.log(`  MISSING [${zotero_key}] npu=${npu_id}: ${file_path}`);
    continue;
  }

  // Idempotency check
  if (SKIP_EXISTING) {
    const existing = readExistingSource(file_path);
    if (existing === source_url) {
      stats.skipped++;
      if (VERBOSE) console.log(`  SKIP [${zotero_key}] npu=${npu_id}: XMP already matches`);
      continue;
    }
  }

  const autor = extractAutor(abstract);
  const iptcDate = formatIptcDate(date_field);
  const year = extractYear(date_field);

  // Sestavit exiftool args
  const args = [
    '-overwrite_original',
    '-charset', 'utf8',
    '-charset', 'iptc=utf8',
  ];

  if (autor) {
    args.push(`-XMP-dc:Creator=${autor}`);
    args.push(`-IPTC:By-line=${autor}`);
  }

  args.push(`-XMP-dc:Rights=${NPU_RIGHTS}`);
  args.push(`-XMP-xmpRights:UsageTerms=${CC_LICENSE_TEXT}`);
  args.push(`-XMP-xmpRights:WebStatement=${CC_LICENSE_URL}`);
  args.push(`-XMP-cc:license=${CC_LICENSE_URL}`);
  args.push(`-XMP-cc:attributionName=${NPU_SOURCE_INST}`);
  args.push(`-XMP-cc:attributionURL=${source_url}`);

  if (title) args.push(`-XMP-dc:Description=${title}`);
  if (source_url) {
    args.push(`-XMP-dc:Source=${source_url}`);
    args.push(`-XMP-dc:Identifier=NPÚ MIS document ID ${npu_id}`);
  }

  args.push(`-IPTC:CopyrightNotice=${NPU_COPYRIGHT_NOTICE}`);
  args.push(`-IPTC:Source=${NPU_SOURCE_INST}`);
  args.push(`-IPTC:Credit=Národní památkový ústav, MIS, dokument č. ${npu_id}`);

  if (iptcDate) args.push(`-IPTC:DateCreated=${iptcDate}`);

  if (DRY_RUN) {
    if (VERBOSE) {
      console.log(`\n  DRY [${zotero_key}] npu=${npu_id}`);
      console.log(`    file: ${file_path.replace(process.env.HOME, '~')}`);
      console.log(`    autor: ${autor || '(none)'}, year: ${year || '(none)'}`);
      console.log(`    args: ${args.filter((a) => a.startsWith('-XMP') || a.startsWith('-IPTC')).slice(0, 4).join(' ')}…`);
    } else {
      process.stdout.write('·');
    }
    stats.embedded++;
    continue;
  }

  try {
    runExiftool(args, file_path);
    stats.embedded++;
    if (VERBOSE) {
      console.log(`  ✓ [${zotero_key}] npu=${npu_id}: embedded (autor=${autor || '∅'}, year=${year || '∅'})`);
    } else {
      process.stdout.write('·');
    }
  } catch (e) {
    stats.failed++;
    failures.push({ zotero_key, npu_id, file_path, error: e.message });
    if (VERBOSE) console.log(`  ✗ [${zotero_key}] npu=${npu_id}: ${e.message}`);
    else process.stdout.write('!');
  }
}

if (!VERBOSE) console.log('');
console.log('---');
console.log(`Stats: processed=${stats.processed}, embedded=${stats.embedded}, skipped=${stats.skipped}, missing=${stats.missing}, failed=${stats.failed}`);

if (failures.length > 0) {
  console.log('\n=== Failures ===');
  for (const f of failures) {
    console.log(`  [${f.zotero_key}] npu=${f.npu_id}`);
    console.log(`    file: ${f.file_path}`);
    console.log(`    error: ${f.error}`);
  }
}

if (DRY_RUN) {
  console.log('\n(dry-run) Run without --dry to actually write XMP.');
}
