import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

const SITE = 'https://hodinarium-eu.pages.dev';

const TYP_LABELS: Record<string, string> = {
  vernisaz: 'Vernisáž',
  fotoreport: 'Fotoreport',
  sezona: 'Sezóna',
  akvizice: 'Akvizice',
  tisk: 'Tisk',
  tv: 'TV',
  restaurace: 'Restaurace',
  'historie-spolku': 'Historie spolku',
  'tematicka-vystava': 'Tematická výstava',
  jine: 'Událost',
};

export async function GET(context: APIContext) {
  const all = await getCollection('kronika');
  // Sort descending by date string (ISO YYYY-MM-DD or range starting with one)
  all.sort((a, b) => b.data.date.localeCompare(a.data.date));

  return rss({
    title: 'Hodinárium — Kronika',
    description: 'Chronologický feed událostí spolku ČSH — vernisáže, fotoreporty, sezóny, výstavky, akvizice.',
    site: context.site ?? SITE,
    items: all.map((e) => {
      // Extract YYYY-MM-DD start of date (handles plain ISO or " — " / " – " range).
      const dateMatch = e.data.date.match(/^\d{4}-\d{2}-\d{2}/);
      const dateStart = dateMatch ? dateMatch[0] : `${e.data.rok}-01-01`;
      const pub = new Date(dateStart);
      const typLabel = e.data.typ ? TYP_LABELS[e.data.typ] : undefined;
      return {
        title: e.data.title,
        link: `/kronika/${e.id}`,
        pubDate: isNaN(pub.getTime()) ? new Date(`${e.data.rok}-01-01`) : pub,
        description: [typLabel, e.data.misto].filter(Boolean).join(' · '),
        categories: e.data.typ ? [e.data.typ] : undefined,
      };
    }),
    customData: '<language>cs-cz</language>',
    stylesheet: false,
  });
}
