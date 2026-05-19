import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { NEW_CATEGORIES, clanekHref } from '../../data/url-helpers';

const SITE = 'https://hodinarium-eu.pages.dev';

const KAT_LABELS: Record<string, string> = {
  sbirka: 'Sbírka',
  konstrukce: 'Konstrukce',
  projekty: 'Projekty',
  'virtualni-muzeum': 'Virtuální muzeum',
  muzea: 'Muzea',
  zajimavosti: 'Zajímavosti',
};

function parseDate(s: string | null | undefined): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function GET(context: APIContext) {
  const all = await getCollection('clanky');
  // Articles in new taxonomy, exclude evidenční karty (podsekce: 'karta')
  // a draft (rozpracované — nikdy nepublikovat do RSS / sociálního feedu).
  const items = all
    .filter((e) => NEW_CATEGORIES.has(e.data.category))
    .filter((e) => e.data.podsekce !== 'karta')
    .filter((e) => e.data.draft !== true)
    .map((e) => {
      const pub = parseDate(e.data.lastModified) ?? parseDate(e.data.scrapedAt) ?? new Date(0);
      return { entry: e, pub };
    })
    .sort((a, b) => b.pub.getTime() - a.pub.getTime());

  return rss({
    title: 'Hodinárium — Články',
    description: 'Sbírka, konstrukce, projekty, virtuální muzeum, muzea a zajímavosti spolku ČSH.',
    site: context.site ?? SITE,
    items: items.map(({ entry, pub }) => ({
      title: entry.data.title,
      link: clanekHref({ slug: entry.data.slug, category: entry.data.category, podsekce: entry.data.podsekce }),
      pubDate: pub,
      description: entry.data.tldr ?? KAT_LABELS[entry.data.category] ?? entry.data.category,
      categories: [entry.data.category],
    })),
    customData: '<language>cs-cz</language>',
    stylesheet: false,
  });
}
