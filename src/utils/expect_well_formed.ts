// Test helper (used by *.test.ts only).
import { expect } from "vitest";

type TNestLike = {
  itemStore: { [id: string]: { type: string; items?: string[] } | undefined };
  drawOrder: string[];
  annotations?: { items: string[] }[];
};

// The nesting invariants proved in the Lean model (2026-11-24):
// - every id in drawOrder / group.items is in itemStore (no dangling id)
// - every item in itemStore is in drawOrder or in exactly one group.items,
//   exactly once (no orphan, no duplicate)
// - everything is reachable from drawOrder, so there is no cycle
// - only groups have children
// plus: every line points at items that exist.
// Same as expectWellFormed in src/utils/empty_untitled_group_cleanup.test.ts
// of #137 (not on main yet).
export const expectWellFormed = (state: TNestLike) => {
  const has = (x: string) =>
    Object.prototype.hasOwnProperty.call(state.itemStore, x);
  const seen = new Map<string, number>();
  const count = (x: string) => seen.set(x, (seen.get(x) ?? 0) + 1);
  state.drawOrder.forEach(count);
  Object.values(state.itemStore).forEach((item) => {
    if (item === undefined) return;
    if (item.type === "group") {
      item.items!.forEach(count);
    } else {
      expect(item).not.toHaveProperty("items");
    }
  });
  seen.forEach((n, x) => {
    expect(has(x), `dangling id ${x}`).toBe(true);
    expect(n, `id ${x} appears ${n} times`).toBe(1);
  });
  Object.keys(state.itemStore).forEach((x) => {
    expect(seen.has(x), `orphan ${x} in itemStore`).toBe(true);
  });

  const reached = new Set<string>();
  const visit = (x: string) => {
    expect(reached.has(x), `cycle through ${x}`).toBe(false);
    reached.add(x);
    const item = state.itemStore[x];
    if (item?.type === "group") item.items!.forEach(visit);
  };
  state.drawOrder.forEach(visit);
  expect(reached.size).toBe(Object.keys(state.itemStore).length);

  (state.annotations ?? []).forEach((a) => {
    a.items.forEach((x) => {
      expect(has(x), `line to missing ${x}`).toBe(true);
    });
  });
};
