# Editorial workflow pro Sveltia CMS — design

**Datum:** 2026-05-10
**Status:** návrh + V1 implementace v progress
**Cíl:** úkolovník, lock/checkout, review workflow, kontrola public
visibility během rozpracování.

## Požadavky (od D. Knespla)

1. **Úkolovník** — seznam článků na kterých je vhodné pracovat
2. **Checkout/lock** — editor zabere článek, jiný ho neupravuje
3. **Review** — někdo další přečte a schválí
4. **Uvolnit** — po schválení odebrat ze seznamu + publish
5. **Per-článek visibility** — během edit buď skrytý (jen editoři)
   nebo veřejný s upozorněním

## Architektura

**Frontmatter-based workflow** — všechna metadata v gitu, žádný backend.

```yaml
---
title: "..."
draft: false              # existing — pokud true, jen editoři vidí
workflow:                 # NEW — opt-in field
  status: 'in-progress'   # 'todo' | 'in-progress' | 'review' | 'ready'
  lockedBy: 'petr'        # email/jméno editora (kdo aktivně edituje)
  lockedAt: '2026-05-10T08:00:00Z'
  reviewers: ['david']    # kdo má přečíst před uvolněním
  reviewedBy: []          # kdo to schválil
  publicDuringEdit: false # zda viditelný i v rozpracovaném stavu
  notes: |
    Petr: chybí foto stroje, čekám na NPÚ
---
```

**Logika public visibility** (Astro page render):

```
   draft: true                       → 404 pro veřejnost (existing)
   draft: false + status: ready      → veřejnost
   draft: false + status: !ready
     publicDuringEdit: true          → veřejnost s WIP bannerem
     publicDuringEdit: false         → 404 pro veřejnost
```

Editor (logged via CF Access) vidí vše bez filtru, plus banner stavu.

## Workflow stavy

```
   ┌──────┐  zabrat   ┌──────────────┐  pošli k review ┌────────┐
   │ todo │ ────────▶ │ in-progress  │ ──────────────▶ │ review │
   │      │           │ lockedBy: X  │                 │        │
   └──────┘           └──────────────┘                 └───┬────┘
       ▲                                                   │
       │                                              schválit
       │                                                   │
       │                                                   ▼
       │           uvolnit zpět             ┌──────────────────────┐
       └──────────────────────────────────  │ ready (= publikováno) │
                                            └──────────────────────┘
```

**Stavové transice:**

- `todo → in-progress`: editor klikne „Zabrat" v dashboardu → zapíše
  svoje jméno + timestamp do `workflow.lockedBy`/`lockedAt`.
- `in-progress → review`: editor klikne „Pošli k review" → smaže lock,
  nastaví `status: review`, přidá reviewers (default: všichni ostatní
  editoři).
- `review → ready`: reviewer klikne „Schvaluji" → přidá svoje jméno
  do `reviewedBy`. Když počet `reviewedBy` ≥ 1 (V1), automaticky
  `status: ready` + smazat workflow field nebo přesunout do tracking
  arhivu.
- `review → in-progress` (push back): reviewer klikne „Vrátit k úpravě"
  → přidá komentář do `workflow.notes`, status zpět na `in-progress`.

## Komponenty

### 1. Schema rozšíření (content.config.ts)

```ts
const workflow = z.object({
  status: z.enum(['todo', 'in-progress', 'review', 'ready']).optional(),
  lockedBy: z.string().optional(),
  lockedAt: z.string().optional(),
  reviewers: z.array(z.string()).optional(),
  reviewedBy: z.array(z.string()).optional(),
  publicDuringEdit: z.boolean().optional(),
  notes: z.string().optional(),
});
```

Přidat do `clanky`, `karty`, `hodinari`, `kroky`, `slovnik`,
`soupis-veznich-hodin` schemas.

### 2. Tasks dashboard (`/admin/tasks/`)

Standalone Astro page (ne Sveltia konfigurace). Načte všechny
content collections, filtruje podle `workflow.status`, zobrazí
v tabulce s actions:

- Sloupce: title, collection, status badge, lockedBy, lockedAt
  (relative — „před 2 hodinami"), reviewers
- Filter: status, lockedBy (= „moje úkoly"), collection
- Akce per row: Otevřít v editoru / Zabrat / Pošli k review /
  Schvaluji / Vrátit k úpravě
- Nahoře: čítače „2 todo / 3 in-progress / 1 review / X publikovaných"
- Authentifikace: CF Access (existing)

Akční tlačítka volají `/api/workflow/transition?slug=...&action=...`,
což je nová Pages Function. Function načte aktuální MDX, modifikuje
frontmatter pomocí YAML lib, commitne přes csh-cms-proxy Worker
(stejný flow jako Sveltia save).

### 3. Sveltia widget pro workflow field

Update `apps/hodinarium-eu/public/admin/config.yml` — přidat workflow
group ve fields každé collection:

```yaml
- name: workflow
  label: Workflow status
  widget: object
  required: false
  collapsed: true
  fields:
    - name: status
      label: Status
      widget: select
      required: false
      options: [todo, in-progress, review, ready]
    - name: lockedBy
      label: Zabráno (editor)
      widget: string
      required: false
    # ...
```

### 4. Banner v Sveltia editoru

Inject script `csh-workflow-banner.js` v admin/index.html.
Načte aktuální entry, pokud má `workflow.lockedBy` jiného než
aktuální editor → varování banner nahoře:

> ⚠ Tento článek upravuje petr (od 8:00 ráno). Doporučujeme počkat
> nebo se domluvit. (Zabrat sám) (Otevřít stejně)

### 5. Visibility logic v page render

Update `apps/hodinarium-eu/src/pages/[kategorie]/[slug].astro`,
`hodinari/[slug].astro`, `sbirka/karta/[slug].astro` atd.:

```ts
const isReady = entry.data.workflow?.status === 'ready' ||
                !entry.data.workflow?.status;
const isPublicDuringEdit = entry.data.workflow?.publicDuringEdit;

if (entry.data.draft) {
  // existing logic — 404 nebo editor banner
}
if (!isReady && !isPublicDuringEdit) {
  // hide from public
  return Astro.redirect('/404'); // nebo render 404 inline
}
```

Plus WIP banner v Article layout pokud `!isReady && isPublicDuringEdit`:

> 📝 **Rozpracovaný článek** — informace mohou být neúplné nebo
> neověřené. Aktuálně jej upravuje X.

## PBI rozdělení

### W-1: Schema rozšíření (~1 h)

Přidat `workflow` field do content.config.ts. Type-check + 0 errors.

### W-2: Visibility logic v page render (~2 h)

Update 5 page templates (clanky, karty, hodinari, kroky, slovnik,
soupis). Pre-render filter podle workflow.status.

### W-3: Tasks dashboard `/admin/tasks/` (~4-6 h)

Astro page načítá content collections, filtruje, zobrazí. Akční
tlačítka volají Pages Function pro transitions.

### W-4: API endpoint `/api/workflow/transition` (~2-3 h)

POST handler pro state changes. Použije existing csh-cms-proxy
Worker GitHub PAT pro commit.

### W-5: Sveltia config widget (~1 h)

Update admin/config.yml — workflow object widget per collection.

### W-6: Editor banner v admin/ (~2 h)

`csh-workflow-banner.js` — detect locked article, varovat editor.

### W-7: Documentation + handbook (~1 h)

Update `docs/cms-editor-pomocnici.md` se sekcí workflow.

**Total V1 effort:** ~13-17 h ≈ 2 working days.

## V2 follow-ups

- **Real-time lock check** přes Cloudflare KV (current advisory only)
- **Email notifications** pro reviewers (kdo má co přečíst)
- **History timeline** — visualization stavu changes per article
- **Bulk actions** — „mark all by Petr as in-progress" v dashboardu
- **Auto-assign reviewers** podle author / category
- **Slack/Discord webhook** integration

## Kontrola: visibility matrix

| draft | status | publicDuringEdit | Veřejnost vidí | Editor vidí |
|---|---|---|---|---|
| true | (any) | (any) | ❌ 404 | ✅ s banner „Draft" |
| false | ready / null | (any) | ✅ | ✅ |
| false | todo / in-progress / review | true | ✅ s WIP banner | ✅ |
| false | todo / in-progress / review | false | ❌ 404 | ✅ s banner stavu |

**Default:** `draft: false`, žádný `workflow` field → ready a public
(stejné chování jako dnes — backwards compat).
