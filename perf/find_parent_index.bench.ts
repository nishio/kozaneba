// Before/after for the find_parent child->parent index (QUEUE K15).
//   npx vitest bench perf/find_parent_index.bench.ts
// "before" = the old O(total items) scan per call; "after" = the indexed
// find_parent via get_global_position. Both run a full render pass (global
// position of every kozane) on a grouped board. *.bench.ts so CI ignores it.
import { bench, describe } from "vitest";
import { setGlobal } from "reactn";
import { State } from "reactn/default";
import { add_v2, V2 } from "../src/dimension/V2";
import { get_item } from "../src/utils/get_item";
import { get_global_position } from "../src/dimension/get_global_position";
import { TGroupItem } from "../src/Global/TGroupItem";
import { TItemId } from "../src/Global/TItemId";
import { TKozaneItem } from "../src/Global/TKozaneItem";
import { TWorldCoord } from "../src/dimension/world_to_screen";

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
    const grp: TGroupItem = {
      type: "group",
      id: id(`g${gi}`),
      text: `g${gi}`,
      position: world((gi % 20) * 220, Math.floor(gi / 20) * 220),
      items: childIds,
      scale: 1,
      isOpen: true,
    };
    itemStore[grp.id] = grp;
    drawOrder.push(grp.id);
    gi++;
  }
  return { drawOrder, itemStore } as State;
};

// The OLD behavior: find_parent scans the whole tree on each call.
const findParentDirect = (target: TItemId, g: State): TItemId | null => {
  let result: TItemId | null = null;
  const visit = (x: TItemId) => {
    const it = get_item(g, x);
    if (it.type === "group") {
      if (it.items.includes(target)) result = x;
      it.items.forEach(visit);
    }
  };
  g.drawOrder.forEach(visit);
  return result;
};

const globalPositionDirect = (id0: TItemId, g: State): V2 => {
  let v: V2 = get_item(g, id0).position;
  let p = findParentDirect(id0, g);
  while (p !== null) {
    const grp = get_item(g, p) as TGroupItem;
    v = grp.isOpen ? add_v2(v, grp.position) : grp.position;
    p = findParentDirect(p, g);
  }
  return v;
};

const eachKozane = (g: State, fn: (id: TItemId) => void) => {
  for (const gid of g.drawOrder) {
    const grp = g.itemStore[gid] as TGroupItem;
    for (const child of grp.items) fn(child);
  }
};

for (const n of [500, 2000, 5000]) {
  describe(`grouped board, ${n} kozane`, () => {
    const g = groupedBoard(n, 10);
    bench(`BEFORE direct scan render pass x ${n}`, () => {
      eachKozane(g, (cid) => globalPositionDirect(cid, g));
    });
    bench(`AFTER indexed render pass x ${n}`, () => {
      setGlobal(g); // get_global_position -> find_parent(getGlobal()) uses the index
      eachKozane(g, (cid) => get_global_position(cid, g));
    });
  });
}
