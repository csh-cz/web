/**
 * Sdílené helpery pro skripty v `scripts/`. Drží low-level utils, které by
 * jinak duplikovaly napříč skripty.
 *
 * Používá se přes:
 *   import { walk, splitFrontmatter } from './_lib.mjs';
 */

import { readdirSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Rekurzivně vyjmenuje všechny `.md` a `.mdx` soubory pod adresářem.
 * (Přizpůsobitelné přes `extensions` parametr.)
 */
export function walk(dir, extensions = ['.md', '.mdx']) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) {
      out.push(...walk(p, extensions));
    } else if (extensions.some((ext) => p.endsWith(ext))) {
      out.push(p);
    }
  }
  return out;
}

/**
 * Rozdělí YAML frontmatter (`---\n…\n---\n`) a body. Vrací `null` pokud
 * soubor frontmatter nemá (např. čistý markdown bez metadat).
 */
export function splitFrontmatter(txt) {
  const m = txt.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return null;
  return { fm: m[1], body: m[2] };
}

/**
 * Vyčte hodnotu jednoduchého stringového klíče z YAML frontmatter bloku.
 * Podporuje single i double quotes, multi-line block scalars (přes `key: |`)
 * skrz pickStrAny.
 */
export function pickStr(block, key) {
  const re = new RegExp(`${key}:\\s*'((?:[^'\\\\]|\\\\.)*)'`, 's');
  const m = block.match(re);
  if (!m) return null;
  return m[1].replace(/\\'/g, "'").replace(/\\\\/g, '\\');
}

export function pickStrAny(block, key) {
  const re = new RegExp(`${key}:\\s*(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`, 's');
  const m = block.match(re);
  if (!m) return null;
  return (m[1] ?? m[2]).replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');
}
