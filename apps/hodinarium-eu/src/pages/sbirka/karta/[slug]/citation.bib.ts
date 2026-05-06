/**
 * BibTeX export pro evidenční karty sbírkových předmětů.
 *
 * URL: /sbirka/karta/<slug>/citation.bib
 *
 * Entry type: @misc — generic non-article. BibTeX nemá dedicated
 * entry pro sbírkový předmět, @misc je standardní fallback (s `note`
 * doplňujícím sémantiku „Sbírkový předmět; inv. č. …").
 *
 * Content-Type: `application/x-bibtex`. Disposition `attachment`
 * pro download flow v prohlížeči.
 */

import type { APIContext } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { kartaCitationData, kartaToBibTeX } from '../../../../utils/karta-citation';

export async function getStaticPaths() {
  const all = await getCollection('clanky');
  return all
    .filter((entry) => entry.data.category === 'sbirka' && entry.data.podsekce === 'karta')
    .map((entry) => ({
      params: { slug: entry.id },
      props: { entry },
    }));
}

export async function GET(context: APIContext) {
  const { entry } = context.props as { entry: CollectionEntry<'clanky'> };
  const site = context.site ?? new URL('https://hodinarium-eu.pages.dev');

  const c = kartaCitationData(
    {
      slug: entry.id,
      title: entry.data.title,
      karta: entry.data.karta,
      tags: entry.data.tags,
      author: entry.data.author,
    },
    site,
  );
  const body = kartaToBibTeX(c);

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-bibtex; charset=utf-8',
      'Content-Disposition': `attachment; filename="${entry.id}.bib"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
