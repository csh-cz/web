import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const clanky = defineCollection({
  loader: glob({
    base: '../../content/horologie-cz',
    pattern: '**/*.md',
  }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    category: z.string().optional(),
    originalUrl: z.string().url().optional(),
    lastModified: z.string().nullable().optional(),
    sourceCharset: z.string().optional(),
    scrapedAt: z.string().optional(),
    manualEdit: z.boolean().optional(),
    /** Výchozí kredit pro markdown `![]()` obrázky v těle stránky (viz hodinarium-eu/content.config.ts). */
    imageCredit: z.string().optional(),
  }),
});

export const collections = { clanky };
