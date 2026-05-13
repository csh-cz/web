/**
 * Serve references.json (CSL JSON Zotero snapshot) jako static endpoint.
 *
 * URL: /data/references.json
 *
 * Klient: csh-citation-picker.js v editoru lazy-loaduje při prvním otevření
 * modalu (Cmd+Shift+R). Cached browserem (immutable response).
 *
 * Source data: apps/hodinarium-eu/src/data/references.json — sync z Zotera
 * přes `pnpm refs:sync`.
 */
import references from '../../data/references.json';

export const prerender = true;

export async function GET() {
  return new Response(JSON.stringify(references), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
