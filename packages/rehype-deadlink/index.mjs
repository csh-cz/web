/**
 * Rehype plugin — označí externí odkazy, které byly při poslední kontrole
 * nedostupné (z dead-link auditu `scripts/audit-dead-links.mjs`).
 *
 * Pro každý `<a href>`, jehož URL je v seznamu `deadUrls`:
 *   - přidá class `link-dead`
 *   - přidá `data-dead-link` atribut
 *   - přidá `title` s upozorněním + datem kontroly
 *
 * CSS (global.css) pak vykreslí vizuální marker (⚠) za odkazem.
 *
 * Označení je **build-time** — žádné runtime ani zásah do contentu.
 * Po opravě/odstranění odkazu stačí re-run `pnpm deadlinks:audit`
 * + regenerace `src/data/dead-links.json`, marker zmizí sám.
 *
 * Use:
 *   import rehypeDeadlink from '@csh/rehype-deadlink';
 *   import deadLinks from './src/data/dead-links.json' with { type: 'json' };
 *   ...
 *   markdown: { rehypePlugins: [[rehypeDeadlink, { deadUrls: deadLinks.urls, checkedDate: deadLinks._meta.generated }]] }
 */
import { visit } from 'unist-util-visit';

/**
 * @param {{
 *   deadUrls?: string[],
 *   checkedDate?: string,
 * }} [options]
 */
/** Normalizace URL pro porovnání: dekóduj %-encoding (markdown zdroj může mít
 *  `(hodinář)`, rendered href `(hodin%C3%A1%C5%99)`) a usekni trailing slash.
 *  Bez toho marker minul body odkazy kvůli encoding/slash mismatchi. */
function normUrl(u) {
  if (!u || typeof u !== 'string') return '';
  let s = u.trim();
  try { s = decodeURIComponent(s); } catch { try { s = decodeURI(s); } catch { /* keep raw */ } }
  return s.replace(/\/+$/, '');
}

export default function rehypeDeadlink(options = {}) {
  const deadSet = new Set((options.deadUrls ?? []).map(normUrl));
  const checkedDate = options.checkedDate ?? '';
  const titleText = checkedDate
    ? `Odkaz byl při poslední kontrole (${checkedDate}) nedostupný`
    : 'Odkaz byl při poslední kontrole nedostupný';

  if (deadSet.size === 0) return () => {};

  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'a') return;
      const href = node.properties?.href;
      if (!href || typeof href !== 'string') return;
      if (!deadSet.has(normUrl(href))) return;

      // Přidat class link-dead (zachovat existující classy)
      const existing = node.properties.className;
      const classes = Array.isArray(existing)
        ? existing
        : existing
          ? [existing]
          : [];
      if (!classes.includes('link-dead')) classes.push('link-dead');
      node.properties.className = classes;

      // Data atribut + title (title nepřepisovat, pokud už existuje)
      node.properties['data-dead-link'] = 'true';
      if (!node.properties.title) node.properties.title = titleText;
    });
  };
}
