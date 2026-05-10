/**
 * Editorial workflow — visibility rules.
 *
 * Pravidla:
 *   - workflow undefined NEBO status === 'ready' → render normálně
 *     (= výchozí stav, naprostá většina článků)
 *   - status ∈ ('todo' | 'in-progress' | 'review') + publicDuringEdit === true
 *     → render s WIP bannerem (= editor chce, aby veřejnost viděla
 *     rozpracovaný stav, např. evergreen článek o probíhající události)
 *   - status ∈ ('todo' | 'in-progress' | 'review') + publicDuringEdit !== true
 *     → SKIP v getStaticPaths (= 404 pro všechny, vč. editorů); editoři
 *     reviewují přes Sveltia preview UI nebo lokální dev build
 *
 * Použití v getStaticPaths:
 *   const items = (await getCollection('clanky'))
 *     .filter((e) => isPubliclyBuildable(e.data.workflow));
 *
 * Použití v rendering pro WIP banner:
 *   {showsWipBanner(workflow) && <WipBanner status={workflow.status} … />}
 */

export interface WorkflowMeta {
  status?: 'todo' | 'in-progress' | 'review' | 'ready';
  lockedBy?: string;
  lockedAt?: string;
  reviewers?: string[];
  reviewedBy?: string[];
  publicDuringEdit?: boolean;
  notes?: string;
}

/** Má se článek vůbec vygenerovat (= cesta existuje pro veřejnost)?
 *  False znamená 404 — Astro getStaticPaths cestu nezahrne do dist. */
export function isPubliclyBuildable(workflow?: WorkflowMeta): boolean {
  if (!workflow) return true;
  if (!workflow.status || workflow.status === 'ready') return true;
  return workflow.publicDuringEdit === true;
}

/** Má se zobrazit WIP banner nahoře?
 *  True jen pro publicDuringEdit articles s non-ready statusem. */
export function showsWipBanner(workflow?: WorkflowMeta): boolean {
  if (!workflow) return false;
  if (!workflow.status || workflow.status === 'ready') return false;
  return workflow.publicDuringEdit === true;
}
