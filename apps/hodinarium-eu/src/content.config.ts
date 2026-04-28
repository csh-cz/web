import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
  }),
});

export const collections = { clanky };
