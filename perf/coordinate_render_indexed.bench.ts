// Proof-of-concept: the same render pass as coordinate_render.bench.ts, but with
// a precomputed child->parent index so find_parent is O(depth) instead of O(n).
// This measures the *achievable* improvement without touching production code
// (QUEUE K4 rule: only claim improvements that the measurement shows).
//
// Run with:  npx vitest bench perf/coordinate_render_indexed.bench.ts
import { bench, describe } from "vitest";
import { State } from "reactn/default";
import { add_v2, V2 } from "../src/dimension/V2";
import { TGroupItem } from "../src/Global/TGroupItem";
import { TItemId } from "../src/Global/TItemId";
import { TKozaneItem } from "../src/Global/TKozaneItem";
import { TWorldCoord } from "../src/dimension/world_to_screen";
import { world_to_screen_with_viewport } from "../src/dimension/world_to_screen";

const id = (v: string) => v as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const kozane = (i: number): TKozaneItem => ({
  type: "kozane",
  id: id(`k${i}`),
  text: `k${i}`,
  position: world((i % 100) * 20, Math.floor(i / 100) * 20),
  scale: 1,
});

const groupedBoard = (n: number, groupSize = 10): State => {
  const itemStore: State["itemStore"] = {};
  const drawOrder: TItemId[] = [];
  let gi = 0;
  for (let i = 0; i < n; i += groupSize) {
    const childIds: TItemId[] = [];
    for (let j = i; j < Math.min(i + groupSize, n); j++) {
      const k = kozane(j);
      itemStore[k.id] = k;
      childIds.push(k.id);
    }
    const group: TGroupItem = {
      type: "group",
      id: id(`g${gi}`),
      text: `g${gi}`,
      position: world((gi % 20) * 220, Math.floor(gi / 20) * 220),
      items: childIds,
      scale: 1,
      isOpen: true,
    };
    itemStore[group.id] = group;
    drawOrder.push(group.id);
    gi++;
  }
  return { drawOrder, itemStore } as State;
};

const VIEWPORT = { width: 1280, height: 800, scale: 1, trans_x: 0, trans_y: 0 };

// Build the child -> parent index once, O(n).
const buildParentIndex = (g: State): Map<TItemId, TItemId> => {
  const parentOf = new Map<TItemId, TItemId>();
  for (const itemId of Object.keys(g.itemStore) as TItemId[]) {
    const item = g.itemStore[itemId];
    if (item && item.type === "group") {
      for (const childId of item.items) parentOf.set(childId, itemId);
    }
  }
  return parentOf;
};

// get_global_position using the index: O(depth) per item.
const globalPositionIndexed = (
  id0: TItemId,
  g: State,
  parentOf: Map<TItemId, TItemId>
): V2 => {
  let v: V2 = g.itemStore[id0]!.position;
  let p = parentOf.get(id0);
  while (p !== undefined) {
    const group = g.itemStore[p] as TGroupItem;
    if (group.isOpen) {
      v = add_v2(v, group.position);
    } else {
      v = group.position;
    }
    p = parentOf.get(p);
  }
  return v;
};

const renderPassIndexed = (g: State) => {
  const parentOf = buildParentIndex(g); // once per render pass
  for (const itemId of g.drawOrder) {
    const item = g.itemStore[itemId]!;
    if (item.type === "group") {
      for (const childId of item.items) {
        const pos = globalPositionIndexed(childId, g, parentOf) as TWorldCoord;
        world_to_screen_with_viewport(pos, VIEWPORT);
      }
    } else {
      const pos = globalPositionIndexed(itemId, g, parentOf) as TWorldCoord;
      world_to_screen_with_viewport(pos, VIEWPORT);
    }
  }
};

for (const n of [500, 2000, 5000]) {
  describe(`indexed grouped board (groups of 10), ${n} kozane`, () => {
    const g = groupedBoard(n, 10);
    bench(`indexed render pass x ${n}`, () => {
      renderPassIndexed(g);
    });
  });
}
