/**
 * CSL JSON export pro evidenční karty sbírkových předmětů.
 *
 * URL: /sbirka/karta/<slug>/citation.json
 *
 * Citation Style Language JSON — moderní formát používaný citeproc-js,
 * Pandoc, Zotero (jako export option). Sbírkový předmět mapujeme na
 * type="webpage" + custom note s prefixem „Sbírkový předmět; inv. č.".
 *
 * Vrací JSON array (kompatibilní s citeproc input expectation).
 *
 * Content-Type: `application/vnd.citationstyles.csl+json`. To je
 * registrovaný IANA media type pro CSL JSON.
 */

import type { APIContext } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { kartaCitationData, kartaToCslJson } from '../../../../utils/karta-citation';

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
  const body = JSON.stringify(kartaToCslJson(c), null, 2);

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.citationstyles.csl+json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${entry.id}.csl.json"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
