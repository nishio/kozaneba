import { Sentry } from "../initSentry";

// Repairs the nesting of a Ba that comes from outside (a Firestore doc, a
// local draft, a local backup, pasted JSON) so that it satisfies the
// invariants checked with Lean (2026-11-24):
//   - every item of itemStore appears exactly once, either in drawOrder or in
//     the items of one group
//   - drawOrder and group.items only hold ids that are in itemStore
//   - there is no cycle
//   - only groups have children
// Older clients saved Ba that break them (e.g. replace_multiple_kozane left
// the replaced kozane in itemStore without placing it, #135), and the editing
// code assumes them (get_item throws on a missing id, a cycle recurses
// forever).
//
// The rules, in this order:
// 1. Walk from drawOrder depth first. An id that is not in itemStore is
//    removed (dangling). An id seen before is removed from the second and
//    later places (duplicates, and cycles reachable from drawOrder); the first
//    place is kept. The items of a non-group are not looked at.
// 2. Of the items not reached, those that are in no unreached group's items
//    (orphan roots) are deleted from itemStore with their unreached
//    descendants. They were never shown.
// 3. What is still not reached is in a cycle that drawOrder does not reach
//    (only the drop into a descendant, fixed in #136, could make one). It is
//    the user's content, so one item of such a cycle (the smallest id) is
//    added to the end of drawOrder and rule 1 continues from it.
// 4. Lines to a deleted item lose that end; a line left with fewer than two
//    ends is deleted (as update_annotation_after_deletion does).
//
// The input is not changed. When nothing needs repair, the same object is
// returned (and report is null), so a well-formed Ba is not touched at all.

export type TNestReport = {
  orphans: number; // orphan roots deleted (rule 2)
  deleted: number; // items deleted from itemStore, orphan roots included
  dangling: number; // ids removed because they are not in itemStore
  duplicates: number; // ids removed because they were placed before
  cycles: number; // unreached cycles brought back to drawOrder (rule 3)
};

type TNestItem = { type?: unknown; items?: unknown };
type TNestAnnotation = { type?: unknown; items?: unknown; heads?: unknown };
export type TNest<I extends TNestItem, A extends TNestAnnotation> = {
  itemStore: { [id: string]: I };
  drawOrder: string[];
  annotations?: A[];
};

const is_group = (x: TNestItem | undefined): x is { items: unknown[] } =>
  x !== undefined && x.type === "group" && Array.isArray(x.items);

export const repair_nest = <
  I extends TNestItem,
  A extends TNestAnnotation,
  N extends TNest<I, A>
>(
  input: N
): { nest: N; report: TNestReport | null } => {
  const store = input.itemStore;
  // own keys only: "constructor" etc. must count as missing
  const has = (id: unknown): id is string =>
    typeof id === "string" && Object.prototype.hasOwnProperty.call(store, id);
  const report: TNestReport = {
    orphans: 0,
    deleted: 0,
    dangling: 0,
    duplicates: 0,
    cycles: 0,
  };
  const visited = new Set<string>();
  const new_items = new Map<string, string[]>();

  // rule 1: the kept children, the same array when nothing is removed
  const keep_children = (list: unknown[]): string[] => {
    let out: string[] | null = null;
    list.forEach((id, i) => {
      let keep = false;
      if (!has(id)) {
        report.dangling++;
      } else if (visited.has(id)) {
        report.duplicates++;
      } else {
        visited.add(id);
        keep = true;
        visit(id);
      }
      if (keep) {
        if (out !== null) out.push(id as string);
      } else if (out === null) {
        out = list.slice(0, i) as string[];
      }
    });
    return out ?? (list as string[]);
  };
  const visit = (id: string) => {
    const item = store[id];
    if (is_group(item)) {
      const kept = keep_children(item.items);
      if (kept !== item.items) new_items.set(id, kept);
    }
  };
  let drawOrder = keep_children(input.drawOrder);

  const unreached = Object.keys(store).filter((id) => !visited.has(id));
  const deleted = new Set<string>();
  if (unreached.length > 0) {
    // rule 2
    const contained = new Set<string>();
    unreached.forEach((id) => {
      const item = store[id];
      if (is_group(item)) item.items.forEach((c) => has(c) && contained.add(c));
    });
    unreached.forEach((root) => {
      if (contained.has(root)) return;
      report.orphans++;
      const stack = [root];
      while (stack.length > 0) {
        const id = stack.pop()!;
        if (deleted.has(id) || visited.has(id)) continue;
        deleted.add(id);
        const item = store[id];
        if (is_group(item)) item.items.forEach((c) => has(c) && stack.push(c));
      }
    });
    report.deleted = deleted.size;

    // rule 3
    const rest = unreached.filter((id) => !deleted.has(id)).sort();
    if (rest.length > 0) {
      // Every item of rest is in the items of a group of rest: a group that
      // was reached would have reached it, and one that was deleted would
      // have deleted it. So following "the (smallest) group that holds it"
      // from any item of rest ends in a cycle.
      const in_rest = new Set(rest);
      const holder = new Map<string, string>();
      rest.forEach((gid) => {
        const item = store[gid];
        if (!is_group(item)) return;
        item.items.forEach((c) => {
          if (typeof c === "string" && in_rest.has(c) && !holder.has(c)) {
            holder.set(c, gid);
          }
        });
      });
      rest.forEach((start) => {
        if (visited.has(start)) return;
        const path: string[] = [];
        const index = new Map<string, number>();
        let cur: string | undefined = start;
        while (cur !== undefined && !index.has(cur)) {
          index.set(cur, path.length);
          path.push(cur);
          cur = holder.get(cur);
        }
        // cur is undefined only if the reasoning above is wrong; then bring
        // back the item that has no holder
        const cycle =
          cur === undefined ? path.slice(-1) : path.slice(index.get(cur)!);
        const pick = cycle.reduce((a, b) => (b < a ? b : a));
        // Its position is relative to a parent in the cycle, and nothing in
        // the cycle has a world position, so there is none to convert it to.
        // It is kept as is: children are centered around their group
        // (normalize_group_position), so it lands near the world origin, and
        // loading a doc calls fit_to_contents afterwards, which brings it
        // into view. (A JSON import puts drawOrder into one new group.)
        if (drawOrder === input.drawOrder) drawOrder = [...drawOrder];
        drawOrder.push(pick);
        visited.add(pick);
        visit(pick);
        report.cycles++;
      });
    }
  }

  // rule 4
  let annotations = input.annotations;
  if (deleted.size > 0 && Array.isArray(annotations)) {
    let changed = false;
    const next: A[] = [];
    annotations.forEach((a) => {
      if (
        a.type !== "line" ||
        !Array.isArray(a.items) ||
        !a.items.some((id) => deleted.has(id))
      ) {
        next.push(a);
        return;
      }
      changed = true;
      const heads = Array.isArray(a.heads) ? a.heads : null;
      const items: unknown[] = [];
      const new_heads: unknown[] = [];
      a.items.forEach((id, i) => {
        if (deleted.has(id)) return;
        items.push(id);
        if (heads !== null) new_heads.push(heads[i]);
      });
      if (items.length < 2) return;
      next.push(
        heads === null ? { ...a, items } : { ...a, items, heads: new_heads }
      );
    });
    if (changed) annotations = next;
  }

  if (
    drawOrder === input.drawOrder &&
    new_items.size === 0 &&
    deleted.size === 0
  ) {
    return { nest: input, report: null };
  }
  const itemStore = { ...store };
  deleted.forEach((id) => {
    delete itemStore[id];
  });
  new_items.forEach((items, id) => {
    itemStore[id] = { ...store[id], items } as I;
  });
  const nest = { ...input, itemStore, drawOrder };
  if (annotations !== input.annotations) nest.annotations = annotations;
  return { nest, report };
};

// Only the counts: no ids, text or ba id (see sentry_context).
export const report_nest_repair = (
  report: TNestReport | null,
  where: "doc" | "json"
) => {
  if (report === null) return;
  Sentry.captureMessage("repair_nest: repaired a broken nest", {
    level: "warning",
    extra: { where, ...report },
  });
};
