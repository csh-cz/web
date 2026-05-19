/**
 * Tiny markdown→HTML converter pro inline YAML pole (poznamka, shrnuti, ...).
 *
 * Pokrývá:
 *   - **bold** → <strong>
 *   - *italic* → <em>
 *   - [text](url) → <a href="url">text</a>
 *   - `code` → <code>code</code>
 *   - dvojité \n\n → odstavec </p><p>
 *
 * Escapuje HTML pro bezpečnost (proti XSS).
 *
 * Pro plné MDX rendering použij `Content` z `astro:content render()`.
 */
function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export interface TinyMarkdownOptions {
  /** Pokud true, markdown link `[text](url)` se převede jen na `text`
   *  (bez `<a>` wrapperu). Použít když render kontext už je uvnitř
   *  `<a>` elementu (např. card preview v indexu) — nested `<a>` HTML
   *  parser auto-rozseká a vyrobí kostýmní artefakty. */
  stripLinks?: boolean;
}

/**
 * Strip markdown formatting na plain text — pro `<meta description>`,
 * `og:description` a podobné kontexty kde markdown syntax nepatří.
 *
 *   **bold**     → bold
 *   *italic*     → italic
 *   _italic_     → italic
 *   [text](url)  → text
 *   `code`       → code
 *   \n\n         → ' '
 */
export function stripMarkdown(s: string | undefined | null): string {
  if (!s) return '';
  return s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*\n]+)\*\*/g, '$1')
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1$2')
    .replace(/(^|[\s(])_([^_\n]+)_/g, '$1$2')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s*\n\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function tinyMarkdown(
  s: string | undefined | null,
  options: TinyMarkdownOptions = {}
): string {
  if (!s) return '';
  let html = escapeHtml(s);
  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Markdown links [text](url) — volitelně bez <a> wrapperu
  if (options.stripLinks) {
    html = html.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  } else {
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  }
  // Bold **text** (ne přes řádek)
  html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  // Italic *text* — po bold (aby se nezasáhly stars uvnitř bold)
  // Vyžaduje boundary před `*` (začátek řádku, mezera, nebo závorka)
  html = html.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  // Paragraphs (double newline → </p><p>)
  html = html
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, ' ')}</p>`)
    .join('');
  // Remove wrapping <p> if it's a single paragraph and only contains inline content
  // (caller can decide; default keep <p>)
  return html;
}
