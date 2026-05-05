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

export function tinyMarkdown(s: string | undefined | null): string {
  if (!s) return '';
  let html = escapeHtml(s);
  // Inline code `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Markdown links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
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
