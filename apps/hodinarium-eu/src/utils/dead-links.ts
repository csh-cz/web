/**
 * Dead-link marker pro reference odkazy v šablonách (body odkazy řeší
 * rehype-deadlink plugin). Stejný zdroj dat: src/data/dead-links.json
 * (generuje `pnpm deadlinks:audit` — jen genuine 4xx/5xx).
 *
 * Normalizace URL je KLÍČOVÁ: rendered href může být %-encoded
 * (`…(hodin%C3%A1%C5%99)`) zatímco zdroj/audit má dekódovanou podobu
 * (`…(hodinář)`), plus trailing slash se liší. Bez normalizace marker minul.
 */
import deadLinks from '../data/dead-links.json';

function normUrl(u?: string): string {
  if (!u) return '';
  let s = u.trim();
  try {
    s = decodeURIComponent(s);
  } catch {
    try { s = decodeURI(s); } catch { /* keep raw */ }
  }
  return s.replace(/\/+$/, '');
}

const DEAD_SET = new Set<string>(((deadLinks.urls as string[]) ?? []).map(normUrl));
const DEAD_TITLE = deadLinks._meta?.generated
  ? `Odkaz byl při poslední kontrole (${deadLinks._meta.generated}) nedostupný`
  : 'Odkaz byl při poslední kontrole nedostupný';

export function isDeadLink(url?: string): boolean {
  return !!url && DEAD_SET.has(normUrl(url));
}

/** Spread atributů na `<a href>` — `{...deadLinkAttrs(url)}`. */
export function deadLinkAttrs(url?: string): Record<string, string> {
  return isDeadLink(url)
    ? { class: 'link-dead', 'data-dead-link': 'true', title: DEAD_TITLE }
    : {};
}
