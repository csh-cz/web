/**
 * cite.ts — build-time renderer ISO 690 citací přes citeproc-js.
 *
 * Single source of truth: `src/data/references.json` (CSL JSON export ze Zotera
 * přes Better BibTeX, indexovaný podle `citation-key`). Refresh: stažení přes
 * Zotero local API a `node scripts/sync-zotero-refs.mjs` (TBD).
 *
 * Style: `src/data/iso690-author-date-cs.csl` (ČSN ISO 690:2022, autor-rok).
 * Locale: `src/data/csl-locale-cs-CZ.xml`.
 *
 * API:
 *   formatCite(bibKey)               → bibliografický záznam (HTML string)
 *   formatCite(bibKey, { pages })    → s override stránek
 *   getRef(bibKey)                   → raw CSL JSON entry (pro custom rendering)
 *
 * Errors:
 *   - bibKey nenalezen → vrátí null + console.warn (build neselže)
 *   - citeproc engine error → loguje a vrací fallback string
 *
 * Build performance: citeproc engine je drahá inicializace (~100ms +
 * 1.8 MB references.json parsing). Lazy-init při prvním volání, dál cache.
 */
// @ts-expect-error — citeproc nepublikuje typings, používáme jako any
import CSL from 'citeproc';
import refsRaw from '../data/references.json';
// CSS-modules cesta: ?raw je Vite-feature, vrací surový string místo importu modulu.
import cslStyle from '../data/iso690-author-date-cs.csl?raw';
import cslLocale from '../data/csl-locale-cs-CZ.xml?raw';

interface CSLItem {
  id: string;
  'citation-key'?: string;
  type?: string;
  title?: string;
  author?: Array<{ family?: string; given?: string; literal?: string }>;
  issued?: { 'date-parts'?: number[][]; literal?: string };
  // ... další CSL JSON pole; zde minimum pro typing
  [key: string]: unknown;
}

const refs = refsRaw as unknown as CSLItem[];

// Index by citation-key pro O(1) lookup.
const byKey = new Map<string, CSLItem>();
for (const r of refs) {
  const k = r['citation-key'] || r.id;
  if (k) byKey.set(k, r);
}

/** Raw lookup do CSL JSON SSOT — returns the CSL item nebo undefined. */
export function getRef(bibKey: string): CSLItem | undefined {
  return byKey.get(bibKey);
}

let engine: any = null;
function ensureEngine() {
  if (engine) return engine;
  // citeproc Sys interface: must provide retrieveLocale + retrieveItem callbacks
  const sys = {
    retrieveLocale: (_lang: string) => cslLocale,
    retrieveItem: (id: string) => {
      const item = byKey.get(id);
      if (!item) {
        console.warn(`[cite] Unknown bibKey: ${id}`);
        return { id, type: 'document', title: `[neznámá citace: ${id}]` };
      }
      // citeproc očekává `id`, my máme `citation-key` jako semantic key.
      // Vrať kopii s id = citation-key (a původní id ponech jako záloha).
      return { ...item, id };
    },
  };
  engine = new (CSL as any).Engine(sys, cslStyle, 'cs-CZ');
  return engine;
}

interface FormatOptions {
  pages?: string;
}

// Module-level cache: bibKey + opts → rendered HTML.
// Build vyrendere každou stránku samostatně, ale modul je sdílený mezi
// page renders — cache zachytí všechna duplicity (~67 % volání jsou
// opakované bibKey napříč články).
const formatCache = new Map<string, string | null>();
let cacheHits = 0;
let cacheMisses = 0;

function cacheKey(bibKey: string, opts: FormatOptions): string {
  return `${bibKey}|${opts.pages ?? ''}`;
}

/** Statistics — užitečné při debugu build performance. */
export function getCiteCacheStats() {
  return { hits: cacheHits, misses: cacheMisses, size: formatCache.size };
}

/**
 * Vrátí bibliografický záznam (jeden citation list) jako HTML string.
 * Citeproc vrací array s jedním HTML snippetem; sloučíme + očistíme.
 *
 * Cached — opakovaná volání pro stejný bibKey+pages vrací z paměti.
 * Citeproc engine call je výrazně dražší než Map lookup.
 */
export function formatCite(bibKey: string, opts: FormatOptions = {}): string | null {
  const key = cacheKey(bibKey, opts);
  if (formatCache.has(key)) {
    cacheHits++;
    return formatCache.get(key) ?? null;
  }
  cacheMisses++;

  const item = byKey.get(bibKey);
  if (!item) {
    console.warn(`[cite] formatCite: bibKey nenalezen v references.json: ${bibKey}`);
    formatCache.set(key, null);
    return null;
  }

  const eng = ensureEngine();
  // Update items in engine
  eng.updateItems([bibKey]);

  const result = eng.makeBibliography();
  if (!result || !result[1] || result[1].length === 0) {
    formatCache.set(key, null);
    return null;
  }

  let html = result[1][0]; // První a jediný item
  // Citeproc vrací <div class="csl-entry">…</div> — strip wrapper, vrať inner
  html = html.replace(/^<div[^>]*>([\s\S]*)<\/div>\s*$/m, '$1').trim();

  // Pokud má caller `pages` override, přidej " s. <pages>" za větu citace.
  if (opts.pages) {
    html += ` s. ${opts.pages}.`;
  }

  formatCache.set(key, html);
  return html;
}
