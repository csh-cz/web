/**
 * Citation builder pro evidenční karty sbírkových předmětů.
 *
 * Zdrojem dat je `clanky` collection entry s `category: 'sbirka', podsekce: 'karta'`.
 * Výstupy:
 *   - kartaCitationData()  — normalizovaný interní model (TS objekt)
 *   - kartaToCslJson()     — CSL JSON (typ "webpage" + custom note s inv. č.)
 *   - kartaToBibTeX()      — BibTeX `@misc` entry
 *   - kartaToRis()         — RIS (TY=GEN) text (CRLF)
 *
 * Filozofie:
 *   - Sbírkový předmět NENÍ článek. Mapujeme ho pragmaticky na webpage/misc/GEN
 *     a do `note` / N1 vkládáme „Sbírkový předmět, inv. č. XYZ".
 *   - Autor = `karta.vyrobce` pokud je znám, jinak instituce („Hodinárium —
 *     Český spolek horologický") — drží předmět, takže může vystupovat jako
 *     corporate author.
 *   - Datum = `karta.datace` (rok výroby, ne datum publikace stránky). U
 *     volně psaných hodnot („polovina 18. století") rok extrahujeme regexem
 *     a fallbackneme na undefined.
 *   - Kanonická URL = `https://hodinarium.eu/sbirka/karta/<slug>`. Site URL
 *     bere site context, takže preview na pages.dev má pages.dev URL.
 */

export interface KartaForCitation {
  /** ID/slug entry (== `entry.id`). */
  slug: string;
  /** Název karty (entry.data.title). */
  title: string;
  /** karta.* podstrom z frontmatteru. Volné — všechna pole optional. */
  karta?: {
    inventarniCislo?: string;
    datace?: string;
    vyrobce?: string;
    signatura?: string;
    materialy?: string | string[];
    rozmery?: string;
    pohon?: string;
    krokJicihoStroje?: string;
    biciStroje?: string | string[];
    umisteni?: string;
    majitel?: string;
    catalogPdfUrl?: string;
    iiifManifestUrl?: string;
    puvodniUmisteni?: {
      objekt?: string;
      typObjektu?: string;
      obec?: string;
      detail?: string;
    };
  };
  /** Tags (volitelné — promítnou se do keywords). */
  tags?: string[];
  /** Autor záznamu (editor karty). Většinou „Český spolek horologický". */
  author?: string;
}

export interface CitationData {
  /** Stabilní cite-key pro BibTeX (bez non-ASCII, bez interpunkce). */
  citeKey: string;
  /** Hlavní název objektu. */
  title: string;
  /** Výrobce nebo instituce — buď personal nebo literal. */
  authors: Array<{ literal?: string; family?: string; given?: string }>;
  /** Vydavatel = ČSH / Hodinárium (drží předmět). */
  publisher: string;
  /** Drží objekt (Museum / archive — pro CSL `archive` field). */
  archive: string;
  /** Lokace v archivu = umístění v expozici. */
  archiveLocation?: string;
  /** Inventární / přírůstkové číslo. */
  callNumber?: string;
  /** Rok výroby (numeric, extrahovaný z `datace`). undefined když chybí. */
  yearCreated?: number;
  /** Plný free-text řetězec z `datace` (např. "polovina 18. století"). */
  dateCreatedRaw?: string;
  /** Místo původního umístění (např. „kostel sv. Jakuba, Kutná Hora"). */
  placeCreated?: string;
  /** Material(s) — array, případně prázdná. */
  materials: string[];
  /** Rozměry (free text "š 80 × v 68 × h 38 cm"). */
  dimensions?: string;
  /** Stable canonical URL. */
  url: string;
  /** Datum přístupu — dnes (ISO YYYY-MM-DD). */
  accessed: string;
  /** Volitelně PDF katalogového listu. */
  pdfUrl?: string;
  /** Volitelně IIIF manifest URL. */
  iiifManifestUrl?: string;
  /** Keywords — sjednocení tags + manuálně doplněné (materiál, hodinář, místo). */
  keywords: string[];
  /** Note — vždy obsahuje „Sbírkový předmět" hint + inv. č. */
  note: string;
}

/** Extrahuje numerický rok z volně psané datace.
 *  Příklady:
 *    "1868"                    → 1868
 *    "1868–1872"               → 1868 (první)
 *    "polovina 18. století"    → undefined
 *    "po 1880"                 → 1880
 *    "konec 19. století"       → undefined
 */
function extractYear(s?: string): number | undefined {
  if (!s) return undefined;
  const m = s.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
  if (!m) return undefined;
  const y = Number(m[1]);
  return Number.isFinite(y) ? y : undefined;
}

/** Normalizuje materialy field na array stringů. */
function normalizeArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).map((s) => String(s).trim());
  return String(v)
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Sestaví human-readable text původního umístění. */
function formatPuvodniUmisteni(p?: KartaForCitation['karta'] extends infer K ? K extends { puvodniUmisteni?: infer U } ? U : never : never): string | undefined {
  if (!p) return undefined;
  const o = p as { objekt?: string; typObjektu?: string; obec?: string; detail?: string };
  const main = o.objekt || o.typObjektu;
  const parts: string[] = [];
  if (main) parts.push(main);
  if (o.obec) parts.push(o.obec);
  let result = parts.join(', ');
  if (o.detail) result = result ? `${result} — ${o.detail}` : o.detail;
  return result || undefined;
}

/** Pokus o rozparsování „Jméno Příjmení" na CSL `family` + `given`.
 *  Sbírkové karty často mají `vyrobce` jako volný text typu
 *  „Jan Prokeš v Sobotce, 1868" — proto strip-ujeme rok a předložky.
 *
 *  Strategie:
 *    1. Vezmi text před první čárkou.
 *    2. Strip „v <místo>", „na <místo>", „z <místo>" suffix.
 *    3. Strip 4-místné roky.
 *    4. Pokud zbude 2 slova → given + family.
 *    5. Jinak → vrať jako literal (firma, kompozit jako „Bratři Pacltové").
 */
function parseAuthor(vyrobce: string): { literal?: string; family?: string; given?: string } {
  const cleaned = vyrobce
    .split(',')[0] // až po první čárku
    .replace(/\s+(?:v|ve|na|z|ze)\s+\S+.*$/i, '') // strip "v Sobotce" suffix
    .replace(/\b(1[0-9]{3}|20[0-9]{2})\b/g, '') // strip roky
    .trim()
    .replace(/\s+/g, ' ');

  const tokens = cleaned.split(' ').filter(Boolean);
  if (tokens.length === 2) {
    return { given: tokens[0], family: tokens[1] };
  }
  if (tokens.length >= 3 && tokens.length <= 4) {
    // např. „Jan Petr Prokeš" → given = „Jan Petr", family = „Prokeš"
    return { given: tokens.slice(0, -1).join(' '), family: tokens[tokens.length - 1] };
  }
  // Firma / krátký fragment / kompozit
  return { literal: cleaned || vyrobce };
}

/** Sestaví stabilní BibTeX cite-key. Preferuje inv. č., fallback na slug. */
function buildCiteKey(slug: string, inventarniCislo?: string): string {
  const base = inventarniCislo
    ? `Inv${inventarniCislo}`
    : slug;
  // ASCII-fold + strip non-alphanumeric
  return (
    'hodinarium' +
    base
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^./, (c) => c.toUpperCase())
  );
}

/** Hlavní builder — z entry vyrobí normalizovaný citation model. */
export function kartaCitationData(
  entry: KartaForCitation,
  siteUrl: URL,
): CitationData {
  const k = entry.karta ?? {};
  const inv = k.inventarniCislo;

  // Authors: výrobce je primární, ČSH fallback (corporate)
  const authors: CitationData['authors'] = [];
  if (k.vyrobce) {
    authors.push(parseAuthor(k.vyrobce));
  } else if (entry.author) {
    authors.push({ literal: entry.author });
  } else {
    authors.push({ literal: 'Český spolek horologický' });
  }

  // Datum
  const yearCreated = extractYear(k.datace);
  const dateCreatedRaw = k.datace;

  // Materiály
  const materials = normalizeArray(k.materialy);

  // Keywords — tags ∪ materials ∪ vyrobce(první slovo) ∪ obec původu
  const placeCreated = formatPuvodniUmisteni(k.puvodniUmisteni);
  const keywordSet = new Set<string>();
  for (const t of entry.tags ?? []) keywordSet.add(t);
  for (const m of materials) keywordSet.add(m);
  if (k.puvodniUmisteni?.obec) keywordSet.add(k.puvodniUmisteni.obec);
  if (k.umisteni) keywordSet.add(k.umisteni);
  if (k.krokJicihoStroje) keywordSet.add(`krok: ${k.krokJicihoStroje}`);
  keywordSet.add('sbírkový předmět');

  // Note — vždy obsahuje „Sbírkový předmět" + inv. č. (kvůli RIS/BibTeX
  // omezeným typům). Plus pohon/krok když jsou.
  const noteParts: string[] = ['Sbírkový předmět'];
  if (inv) noteParts.push(`inv. č. ${inv}`);
  if (k.signatura) noteParts.push(`signatura: ${k.signatura}`);
  if (placeCreated) noteParts.push(`původní umístění: ${placeCreated}`);
  const note = noteParts.join('; ') + '.';

  // URL
  const url = new URL(`/sbirka/karta/${entry.slug}`, siteUrl).toString();

  // Accessed = today
  const today = new Date();
  const accessed = today.toISOString().slice(0, 10);

  return {
    citeKey: buildCiteKey(entry.slug, inv),
    title: entry.title,
    authors,
    publisher: 'Hodinárium — Český spolek horologický',
    archive: 'Hodinárium, Český spolek horologický',
    archiveLocation: k.umisteni,
    callNumber: inv,
    yearCreated,
    dateCreatedRaw,
    placeCreated,
    materials,
    dimensions: k.rozmery,
    url,
    accessed,
    pdfUrl: k.catalogPdfUrl ? new URL(k.catalogPdfUrl, siteUrl).toString() : undefined,
    iiifManifestUrl: k.iiifManifestUrl,
    keywords: Array.from(keywordSet).filter(Boolean),
    note,
  };
}

// ─── EXPORT FORMAT: CSL JSON ──────────────────────────────────────────
// Type: "webpage". Sbírkový předmět nemá nativní CSL type, webpage je
// nejméně lživé řešení (URL-first, "publisher" = drží objekt). Inv. č.
// jde do call-number, signatura do archive_location, datace do issued.
// Note má prefix "Sbírkový předmět; inv. č. …", takže Zotero connector
// + citeproc render dokážou rekonstruovat sémantiku.

export function kartaToCslJson(c: CitationData): unknown {
  const accessedParts = c.accessed.split('-').map(Number);
  const csl: Record<string, unknown> = {
    id: c.citeKey,
    type: 'webpage',
    title: c.title,
    author: c.authors.map((a) =>
      a.literal ? { literal: a.literal } : { family: a.family, given: a.given },
    ),
    publisher: c.publisher,
    'container-title': 'Hodinárium — Sbírka',
    URL: c.url,
    accessed: { 'date-parts': [accessedParts] },
    note: c.note,
    language: 'cs',
  };
  if (c.yearCreated) {
    csl.issued = { 'date-parts': [[c.yearCreated]] };
  } else if (c.dateCreatedRaw) {
    csl.issued = { literal: c.dateCreatedRaw };
  }
  if (c.callNumber) csl['call-number'] = c.callNumber;
  if (c.archiveLocation) csl['archive_location'] = c.archiveLocation;
  if (c.archive) csl.archive = c.archive;
  if (c.dimensions) csl.dimensions = c.dimensions;
  if (c.placeCreated) csl['publisher-place'] = c.placeCreated;
  if (c.keywords.length > 0) csl.keyword = c.keywords.join('; ');
  return [csl];
}

// ─── EXPORT FORMAT: BibTeX ────────────────────────────────────────────
// @misc — generic non-article entry. „howpublished = {Online}" + URL,
// „note = Sbírkový předmět; inv. č. …" zachová sémantiku po importu do
// reference manageru, který @misc nemá specializované.

function escapeBib(s: string): string {
  // Escape `{`, `}`, `\`, `%`, `#`, `&`, `_`, `$`, `^`, `~`.
  return s
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[{}]/g, '\\$&')
    .replace(/[%#&_$^~]/g, '\\$&');
}

/** Vyrobí jeden author token. Pro corporate (literal) autora vyžaduje
 *  extra braces aby BibTeX neinterpretoval čárku jako hranici Family/Given;
 *  pro Person stačí "Family, Given" formát uvnitř outer field braces. */
function authorToBib(a: { literal?: string; family?: string; given?: string }): string {
  if (a.literal) return `{${escapeBib(a.literal)}}`;
  if (a.family && a.given) return `${escapeBib(a.family)}, ${escapeBib(a.given)}`;
  return escapeBib(a.family || a.given || '');
}

export function kartaToBibTeX(c: CitationData): string {
  const fields: Array<[string, string]> = [];
  fields.push(['title', `{${escapeBib(c.title)}}`]);
  // Wrap whole author field v `{...}` — chrání non-ASCII a interpunkci.
  fields.push(['author', `{${c.authors.map(authorToBib).join(' and ')}}`]);
  if (c.yearCreated) {
    fields.push(['year', String(c.yearCreated)]);
  } else if (c.dateCreatedRaw) {
    fields.push(['year', `{${escapeBib(c.dateCreatedRaw)}}`]);
  }
  fields.push(['publisher', `{${escapeBib(c.publisher)}}`]);
  if (c.archiveLocation) fields.push(['address', `{${escapeBib(c.archiveLocation)}}`]);
  if (c.callNumber) fields.push(['number', `{${escapeBib(c.callNumber)}}`]);
  fields.push(['howpublished', '{Online}']);
  fields.push(['url', `{${c.url}}`]);
  fields.push(['urldate', `{${c.accessed}}`]);
  fields.push(['note', `{${escapeBib(c.note)}}`]);
  if (c.keywords.length > 0) fields.push(['keywords', `{${escapeBib(c.keywords.join(', '))}}`]);
  if (c.pdfUrl) fields.push(['pdf', `{${c.pdfUrl}}`]);
  fields.push(['language', '{cs}']);

  const body = fields.map(([k, v]) => `  ${k} = ${v}`).join(',\n');
  return `@misc{${c.citeKey},\n${body}\n}\n`;
}

// ─── EXPORT FORMAT: RIS ───────────────────────────────────────────────
// TY=GEN (Generic). RIS je řádkový plain text se 2-písm. tagy.
// Pole:
//   T1 — title
//   AU — author (multiple lines OK)
//   PY — publication year (rok výroby v našem případě)
//   DA — full date (YYYY///)
//   PB — publisher (drží objekt)
//   UR — canonical URL
//   AN — accession number (inv. č.)
//   CN — call number (signatura)
//   KW — keyword (multiple lines)
//   N1 — note (Sbírkový předmět hint)
//   L2 — link to PDF (catalog list)
//   LA — language
//   ER — end record (CRLF terminated)

function risLine(tag: string, value: string | undefined): string {
  if (!value) return '';
  return `${tag}  - ${value}\r\n`;
}

export function kartaToRis(c: CitationData): string {
  let out = '';
  out += risLine('TY', 'GEN');
  out += risLine('T1', c.title);
  for (const a of c.authors) {
    if (a.literal) out += risLine('AU', a.literal);
    else if (a.family && a.given) out += risLine('AU', `${a.family}, ${a.given}`);
    else if (a.family) out += risLine('AU', a.family);
  }
  if (c.yearCreated) {
    out += risLine('PY', String(c.yearCreated));
    out += risLine('DA', `${c.yearCreated}///`);
  }
  out += risLine('PB', c.publisher);
  out += risLine('CY', c.archiveLocation);
  out += risLine('AN', c.callNumber);
  out += risLine('UR', c.url);
  out += risLine('LA', 'Czech');
  for (const kw of c.keywords) {
    out += risLine('KW', kw);
  }
  out += risLine('N1', c.note);
  if (c.pdfUrl) out += risLine('L2', c.pdfUrl);
  out += 'ER  - \r\n';
  return out;
}
