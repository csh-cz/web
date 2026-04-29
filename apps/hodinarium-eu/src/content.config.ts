import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Schéma jednoho odkazu / literatury pod článkem.
 * - title povinný; ostatní volitelné
 * - type ovlivní ikonku/řazení (kniha, článek, PDF, web odkaz, wiki)
 */
const reference = z.object({
  title: z.string(),
  url: z.string().url().optional(),
  author: z.string().optional(),
  year: z.union([z.number(), z.string()]).optional(),
  type: z.enum(['kniha', 'clanek', 'pdf', 'odkaz', 'wiki', 'mapa']).optional(),
  note: z.string().optional(),
});

const clanky = defineCollection({
  loader: glob({
    base: '../../content/hodinarium-eu',
    pattern: '**/*.{md,mdx}',
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    category: z.enum(['decin', 'vezni-hodiny', 'sbirka', 'projekty', 'ostatni']),
    originalUrl: z.string().url(),
    lastModified: z.string().nullable(),
    sourceCharset: z.string(),
    scrapedAt: z.string(),
    tldr: z.string().optional(),
    manualEdit: z.boolean().optional(),
    /** Custom path (e.g. /img/...) to override the default template-based OG image. */
    ogImage: z.string().optional(),
    /** Custom thumbnail for atlas / katalog karet — přebíjí prvni-image z těla. */
    thumbnail: z.string().optional(),
    /** Autor článku (např. "Petr Král"). Footer ho zobrazí jako "P. Král". */
    author: z.string().optional(),
    /** Literatura a odkazy renderované v sekci pod článkem. */
    references: z.array(reference).optional(),
  }),
});

export const collections = { clanky };
