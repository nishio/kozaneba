// Render / coordinate scaling benchmark for synthetic boards (QUEUE K4, #25).
//
// Run with:  npx vitest bench perf/
// (Named *.bench.ts so the CI test run — `vitest run` / `npm test` — ignores it.)
//
// Goal: show how the per-render-pass coordinate work scales with the number of
// kozane, and locate the super-linear hotspot. The dimensions measured here are
// pure state computations (no DOM), so the numbers are machine-relative but the
// *scaling shape* (linear vs quadratic) is environment-robust and is what we act
// on. Absolute ms and any "feel" claims are intentionally out of scope.
import { bench, describe } from "vitest";
import { setGlobal } from "reactn";
import { State } from "reactn/default";
import { TGroupItem } from "../src/Global/TGroupItem";
import { TItemId } from "../src/Global/TItemId";
import { TKozaneItem } from "../src/Global/TKozaneItem";
import { TWorldCoord } from "../src/dimension/world_to_screen";
import { world_to_screen_with_viewport } from "../src/dimension/world_to_screen";
import { get_global_position } from "../src/dimension/get_global_position";
import { get_total_offset_of_parents } from "../src/Event/get_total_offset_of_parents";

const id = (v: string) => v as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const kozane = (i: number): TKozaneItem => ({
  type: "kozane",
  id: id(`k${i}`),
  text: `k${i}`,
  position: world((i % 100) * 20, Math.floor(i / 100) * 20),
  scale: 1,
});

// A flat board: N root kozane, no groups.
const flatBoard = (n: number): State => {
  const itemStore: State["itemStore"] = {};
  const drawOrder: TItemId[] = [];
  for (let i = 0; i < n; i++) {
    const k = kozane(i);
    itemStore[k.id] = k;
    drawOrder.push(k.id);
  }
  return { drawOrder, itemStore } as State;
};

// A grouped board: N kozane evenly split into groups of `groupSize`, one level
// deep. Mirrors a KJ-style board where cards are collected into groups.
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

const VIEWPORT = {
  width: 1280,
  height: 800,
  scale: 1,
  trans_x: 0,
  trans_y: 0,
};

// One render pass: compute the on-screen position of every kozane, exactly what
// the canvas layer must do each time it redraws. get_global_position walks the
// parent chain via find_parent(getGlobal()), so this is where O(n^2) shows up.
const renderPass = (g: State) => {
  for (const itemId of g.drawOrder) {
    const item = g.itemStore[itemId]!;
    if (item.type === "group") {
      for (const childId of item.items) {
        const p = get_global_position(childId, g) as TWorldCoord;
        world_to_screen_with_viewport(p, VIEWPORT);
      }
    } else {
      const p = get_global_position(itemId, g) as TWorldCoord;
      world_to_screen_with_viewport(p, VIEWPORT);
    }
  }
};

const SIZES = [500, 2000, 5000];

for (const n of SIZES) {
  describe(`flat board, ${n} kozane`, () => {
    const g = flatBoard(n);
    setGlobal(g);
    bench(`render pass (get_global_position x ${n})`, () => {
      setGlobal(g); // get_global_position reads getGlobal() for find_parent
      renderPass(g);
    });
  });
}

for (const n of SIZES) {
  describe(`grouped board (groups of 10), ${n} kozane`, () => {
    const g = groupedBoard(n, 10);
    setGlobal(g);
    bench(`render pass (get_global_position x ${n})`, () => {
      setGlobal(g);
      renderPass(g);
    });
    bench(`get_total_offset_of_parents x ${n / 10} groups`, () => {
      for (const itemId of g.drawOrder) {
        get_total_offset_of_parents(itemId, g);
      }
    });
  });
}
