/**
 * Lookup pomocník: free-text vyrobce → slug medailonu hodináře.
 *
 * Sdíleno mezi /sbirka/katalog/ tabulkou + Card preview komponentou.
 * Heuristika: case-insensitive substring match proti `jmeno + aliasy`
 * z hodinari.ts. Sortuje kandidáty podle délky needle desc — preferujeme
 * specifičtější match (např. "L. Hainz" před "Hainz").
 */
import { hodinari } from '../data/hodinari';

interface Candidate {
  needle: string;
  slug: string;
  jmeno: string;
}

let candidatesCache: Candidate[] | null = null;

function buildCandidates(): Candidate[] {
  const out: Candidate[] = [];
  for (const h of hodinari) {
    const variants = new Set<string>([h.jmeno, ...(h.aliasy ?? [])]);
    for (const v of variants) {
      out.push({
        needle: v.toLowerCase().normalize('NFC'),
        slug: h.slug,
        jmeno: h.jmeno,
      });
    }
  }
  // Delší needle dřív — specifičtější match preferován
  out.sort((a, b) => b.needle.length - a.needle.length);
  return out;
}

export function findHodinarFromVyrobce(vyrobce: string | undefined | null): { slug: string; jmeno: string } | null {
  if (!vyrobce) return null;
  if (!candidatesCache) candidatesCache = buildCandidates();
  const hay = vyrobce.toLowerCase().normalize('NFC');
  for (const c of candidatesCache) {
    if (c.needle.length >= 3 && hay.includes(c.needle)) {
      return { slug: c.slug, jmeno: c.jmeno };
    }
  }
  return null;
}
