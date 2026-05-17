/**
 * Vitest config pro unit testy nad `scripts/` (D1 v TODO.md).
 *
 * Pokrývá: helper funkce v build scriptech (parseFrontmatter,
 * normalizeVarianta, …). Astro/page testy jdou přes playwright (test:e2e).
 *
 * Spuštění: `pnpm test:unit` (CI mode) nebo `pnpm test:unit:watch` (dev).
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['scripts/__tests__/**/*.test.ts'],
    environment: 'node',
    globals: false,
  },
});
