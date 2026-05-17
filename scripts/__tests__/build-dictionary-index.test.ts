/**
 * Unit testy pro `build-dictionary-index.ts` helper funkce
 * (parseFrontmatter, normalizeVarianta).
 *
 * Spuštění: `pnpm test:unit`
 *
 * D1 v TODO.md — Test coverage Vitest setup pro scripts/.
 */
import { describe, it, expect } from 'vitest';
import { parseFrontmatter, normalizeVarianta } from '../build-dictionary-index';

describe('parseFrontmatter', () => {
  it('extrahuje frontmatter z markdown souboru', () => {
    const raw = '---\ntitle: kotva\nslug: kotva\nkategorie: mechanika\n---\n\nBody text.';
    const result = parseFrontmatter(raw);
    expect(result).toMatchObject({
      title: 'kotva',
      slug: 'kotva',
      kategorie: 'mechanika',
    });
  });

  it('vrátí prázdný objekt pro soubor bez frontmatteru', () => {
    const raw = '# Just a heading\n\nNo frontmatter here.';
    const result = parseFrontmatter(raw);
    expect(result).toEqual({});
  });

  it('parsuje arrayové fieldy (varianty)', () => {
    const raw = '---\ntitle: x\nvarianty:\n  - one\n  - two\n---\n';
    const result = parseFrontmatter(raw);
    expect(result.varianty).toEqual(['one', 'two']);
  });

  it('parsuje strukturované varianty (A.28 schema)', () => {
    const raw = `---
title: ciselnik
varianty:
  - term: číselník
    status: preferred
  - term: ciferník
    status: archaic
    note: "Archaismus"
---
`;
    const result = parseFrontmatter(raw);
    expect(result.varianty).toEqual([
      { term: 'číselník', status: 'preferred' },
      { term: 'ciferník', status: 'archaic', note: 'Archaismus' },
    ]);
  });

  it('handle CRLF line endings', () => {
    const raw = '---\r\ntitle: foo\r\nslug: foo\r\n---\r\n\r\nBody.';
    const result = parseFrontmatter(raw);
    expect(result.title).toBe('foo');
  });
});

describe('normalizeVarianta', () => {
  it('převede legacy string na strukturovaný objekt s default status', () => {
    const result = normalizeVarianta('cifrák');
    expect(result).toEqual({ term: 'cifrák', status: 'admitted' });
  });

  it('zachová strukturovaný objekt beze změny', () => {
    const input = { term: 'ciferník', status: 'archaic', note: 'Archaismus' };
    const result = normalizeVarianta(input);
    expect(result).toEqual(input);
  });

  it('zahrne doloženo pole pokud je definováno', () => {
    const input = {
      term: 'rafije',
      status: 'historical',
      'doloženo': 'Špatný 1882, s. 23',
    };
    const result = normalizeVarianta(input);
    expect(result['doloženo']).toBe('Špatný 1882, s. 23');
  });

  it('vrátí status admitted pro non-string non-object vstup (defensive)', () => {
    const result = normalizeVarianta(123);
    expect(result).toEqual({ term: '123', status: 'admitted' });
  });

  it('hodlí všechny status hodnoty z A.28 enum', () => {
    const statuses = ['preferred', 'admitted', 'archaic', 'erroneous', 'ocr-variant', 'historical'];
    for (const status of statuses) {
      const result = normalizeVarianta({ term: 'x', status });
      expect(result.status).toBe(status);
    }
  });
});
