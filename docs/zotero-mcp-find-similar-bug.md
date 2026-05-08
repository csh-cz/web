# Zotero MCP `find_similar` — bug report draft

**Datum:** 2026-05-08
**Autor draftu:** Claude (TL1 z TODO A.7)
**Status:** Draft pro filing — vyžaduje David Knespl GitHub identitu pro
submit do upstream zotero-mcp issue trackeru.

---

## Issue title

`find_similar` returns unrelated matches across collections

## Issue body

### Summary

The `find_similar` tool with a Zotero item ID returns matches that are
**unrelated to the input item's topic** — sometimes from completely
different domains (e.g., biology vs. horology) — while the existing
`semantic_search` tool with a free-text query consistently returns
relevant results from the same library.

### Reproduction

**Setup:**
- zotero-mcp-server (any current version)
- Library indexed via `semantic_status` (1629 items / ~41k vectors,
  OpenAI text-embedding-3-small, 768 dim)
- All items in **horology** subject area (≈ 100 % of library)

**Steps:**

1. Call `find_similar(itemKey="…")` with any horology item ID.
   Example: `SFQ3RQTR` (Knespl 2023, "Robertův krok" — clock escapement
   mechanism article).
2. Observe results.

**Expected:** Top matches should be other horology articles (escapement
patents, similar clock mechanism papers, related authors like Skála,
Michal, Schmid).

**Actual:** Top match returned is a Limax slug study (biology) —
completely unrelated to the horological domain.

In contrast, `semantic_search(query="hodinový krok kotvový krok klidový")`
on the same library reliably returns the correct horology cluster
(SFQ3RQTR + related Skála/Michal articles in top 5).

### Impact

For domain-specific libraries (small institutional, single-topic), this
makes `find_similar` effectively unusable. We've worked around it by
constructing free-text queries from the item's title and using
`semantic_search` instead, but this is more cumbersome for editorial
workflows that should be discovery-driven.

### Hypothesis

Possible causes (uninvestigated):

1. **Wrong vector lookup** — `find_similar` may be querying against a
   different index or namespace than `semantic_search`.
2. **Embedding mismatch** — the item's stored embedding may be the
   metadata-only (title + abstract) representation, while the tool
   compares against the full-text representation, causing dimensional
   mismatch.
3. **Score normalization** — if `find_similar` uses raw inner product
   while the index is L2-normalized for `semantic_search`, ordering will
   be skewed.

### Workaround

```ts
// Don't use:
// findSimilar({ itemKey: "SFQ3RQTR" })

// Use instead:
const item = await getItemDetails({ itemKey: "SFQ3RQTR" });
const query = `${item.title} ${item.abstract || ""}`;
semanticSearch({ query, topK: 10 });
```

### Environment

- zotero-mcp-server: (version of repo at time of report — fill before submit)
- Index: OpenAI text-embedding-3-small, 768 dim
- Library size: 1629 items, 41 240 vectors
- Domain: horology (Czech / German / English / French — multilingual)
- Reproduced from: Claude Code session via MCP

---

## Filing notes (pro Davida)

- Repository: github.com/54yyyu/zotero-mcp (nebo aktuální fork — ověřit)
- Issue tag: `bug`, `priority/medium`
- Po filing přidat issue URL do `~/.claude/skills/horologicka-terminologie/reference/`
- Workaround zůstává v memory `reference_zotero_semantic_search.md`
- Lze připojit min-repro skript pokud upstream požádá
