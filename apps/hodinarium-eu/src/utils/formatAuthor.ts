/**
 * Sdílený util pro formátování jmen autorů — iniciála křestního + plné
 * příjmení. Per user feedback (2026-05-19): „Jména autorů jednotně
 * zkracovat — vždy jen iniciála křestního jména, plné příjmení."
 *
 * Konvence:
 *   - „Petr Král"            → „P. Král"
 *   - „Ing. Petr Král"       → „P. Král" (titly zahozené)
 *   - „P. Král"              → „P. Král" (idempotent)
 *   - „Petr Král, Miroslav Baudisch" → „P. Král, M. Baudisch"
 *   - „Petr Král a Miroslav Baudisch" → „P. Král a M. Baudisch"
 *   - „[Petr Skála](/hodinari/petr-skala)" → markdown link zachován,
 *     text uvnitř formátován
 *   - „archiv ČSH" / „NTM" / „ebay.de" (non-name tokens) → ponechány
 *     beze změny (single-token, žádné příjmení)
 */

const TITLE_RE =
  /^(Ing\.|Dr\.|Mgr\.|MUDr\.|RNDr\.|JUDr\.|PaedDr\.|MgA\.|prof\.|doc\.|Prof\.|Doc\.)\s+/g;

export function formatSingleAuthor(name: string): string {
  const stripped = name.replace(TITLE_RE, '').trim();
  // Markdown link `[Jméno](url)` — formátuj text uvnitř, zachovej link.
  const linkM = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(stripped);
  if (linkM) {
    return `[${formatSingleAuthor(linkM[1])}](${linkM[2]})`;
  }
  const parts = stripped.split(/\s+/);
  if (parts.length < 2) return stripped;
  const first = parts[0];
  const surname = parts.slice(1).join(' ');
  // Pokud je první už iniciála („P." / „P"), normalizuj.
  if (/^[A-ZÁ-Ž]\.?$/u.test(first)) {
    return `${first.replace(/\.$/, '')}. ${surname}`;
  }
  return `${first.charAt(0)}. ${surname}`;
}

/**
 * Format multi-author string: split podle čárky / „a"/„i" / středníku,
 * každé jméno separately, zachovat oddělovače.
 */
export function formatAuthor(text: string): string {
  return text.replace(
    /([^,;]+?)(\s*(?:,|;|\s+a\s+|\s+i\s+)\s*|$)/g,
    (_, name, sep) => formatSingleAuthor(name.trim()) + (sep || ''),
  );
}
