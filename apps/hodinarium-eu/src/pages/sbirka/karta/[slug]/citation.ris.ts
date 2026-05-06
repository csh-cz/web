/**
 * RIS export pro evidenční karty sbírkových předmětů.
 *
 * URL: /sbirka/karta/<slug>/citation.ris
 *
 * Standard RIS (Research Information Systems) — řádkový plain text
 * čitelný Zoterem, EndNote, RefWorks, Mendeley. Type GEN (generic) —
 * sbírkový předmět nemá v RIS dedicated typ, generic se nemapuje
 * silně na žádný field model.
 *
 * Content-Type podle RIS spec: `application/x-research-info-systems`,
 * Disposition `attachment` aby browser nabídl uložení .ris souboru.
 */

import type { APIContext } from 'astro';
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import { kartaCitationData, kartaToRis } from '../../../../utils/karta-citation';

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
  const body = kartaToRis(c);

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-research-info-systems; charset=utf-8',
      'Content-Disposition': `attachment; filename="${entry.id}.ris"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
