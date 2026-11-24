import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TGroupItem } from "../Global/TGroupItem";
import { TItem } from "../Global/TItem";
import { TItemId } from "../Global/TItemId";
import { TWorldCoord } from "../dimension/world_to_screen";
import { get_middle_point } from "../Canvas/Annotation/get_middle_point";
import { get_global_position } from "../dimension/get_global_position";
import { get_group_bounding_box } from "../dimension/get_group_bounding_box";

// Regressions for the coordinate bugs that the fast-check property tests of
// PR #144 (src/Event/nested_coords.property.test.ts) found, as plain cases
// with numbers one can see on screen. Each goes through the real handler and
// the real global state, and checks the world position (the sum of the
// stored local positions along the parent chain, computed here independently
// of the code under test) or whether the groups are centered on their
// children.

vi.mock("./fast_drag_manager", () => ({ reset_target: vi.fn() }));
vi.mock("../initSentry", () => ({ Sentry: { captureMessage: vi.fn() } }));

import { drag_drop_item_into_group } from "./drag_drop_item_into_group";
import { drag_drop_selection_into_group } from "./drag_drop_selection_into_group";
import { normalize_group_position } from "../utils/normalize_group_position";

const id = (v: string) => v as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const kz = (v: string, x: number, y: number): TItem => ({
  type: "kozane",
  id: id(v),
  text: v,
  position: world(x, y),
  scale: 1,
});
const gr = (
  v: string,
  x: number,
  y: number,
  items: string[],
  text = "",
  isOpen = true
): TItem => ({
  type: "group",
  id: id(v),
  text,
  position: world(x, y),
  items: items.map(id),
  scale: 1,
  isOpen,
});
const setBoard = (drawOrder: string[], items: TItem[]) =>
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    drawOrder: drawOrder.map(id),
    itemStore: Object.fromEntries(items.map((x) => [x.id, x])),
    selected_items: [],
    selectionRange: { top: 0, left: 0, width: 0, height: 0 },
  } as unknown as State);

const parentOf = (state: State, target: TItemId): TItemId | null => {
  for (const [k, v] of Object.entries(state.itemStore)) {
    if (v?.type === "group" && v.items.includes(target)) return k as TItemId;
  }
  return null;
};

const absolute = (state: State, target: TItemId): TWorldCoord => {
  let x = 0;
  let y = 0;
  for (let c: TItemId | null = target; c !== null; c = parentOf(state, c)) {
    const p = state.itemStore[c]!.position;
    x += p[0];
    y += p[1];
  }
  return world(x, y);
};

const center = (state: State, gid: string) => {
  const g = state.itemStore[gid] as TGroupItem;
  return get_middle_point(g.items.map((c) => state.itemStore[c]!.position));
};

describe("drag_drop_item_into_group keeps the dropped item where it was dropped", () => {
  // A (200,0) > [ B (-200,0) > [ x (-100,0), y (100,0) ], z (200,0) ]
  // world: x = -100, y = 100, z = 400; every group centered.
  const nestedAB = () =>
    setBoard(
      ["A"],
      [
        gr("A", 200, 0, ["B", "z"], "A"),
        gr("B", -200, 0, ["x", "y"], "B"),
        kz("x", -100, 0),
        kz("y", 100, 0),
        kz("z", 200, 0),
      ]
    );

  test("x dragged out of B and dropped on the outer group A (no movement)", () => {
    nestedAB();
    // no movement: delta is x's local position (in B's frame)
    drag_drop_item_into_group(id("A"), world(-100, 0), id("x"));
    const s = getGlobal();
    expect(parentOf(s, id("x"))).toBe("A");
    // was (-50, 0): x jumped 50px right
    expect(absolute(s, id("x"))).toEqual(world(-100, 0));
    expect(absolute(s, id("y"))).toEqual(world(100, 0));
    expect(absolute(s, id("z"))).toEqual(world(400, 0));
  });

  test("x dragged out of B and dropped on A, 30px down", () => {
    nestedAB();
    drag_drop_item_into_group(id("A"), world(-100, 30), id("x"));
    expect(absolute(getGlobal(), id("x"))).toEqual(world(-100, 30));
  });

  test("the groups whose children changed are centered after the drop", () => {
    nestedAB();
    drag_drop_item_into_group(id("A"), world(-100, 0), id("x"));
    const s = getGlobal();
    expect(center(s, "A")).toEqual([0, 0]);
    expect(center(s, "B")).toEqual([0, 0]);
  });
});

describe("#137 review: the group that survives the removal of the old parent is re-centered", () => {
  // A (0,0) > [ P (-200,0, untitled) > t (0,0), z (200,0) ],
  // G (1000,0) > w (0,0). Every group centered. Dropping t into G leaves P
  // empty and untitled, so P is removed; A (the survivor) is left with z only.
  const review137 = () =>
    setBoard(
      ["A", "G"],
      [
        gr("A", 0, 0, ["P", "z"], "A"),
        gr("P", -200, 0, ["t"]),
        kz("t", 0, 0),
        kz("z", 200, 0),
        gr("G", 1000, 0, ["w"], "G"),
        kz("w", 0, 0),
      ]
    );

  test("nothing moves in world coordinates", () => {
    review137();
    drag_drop_item_into_group(id("G"), world(0, 0), id("t"));
    const s = getGlobal();
    expect(s.itemStore.P).toBeUndefined();
    expect(absolute(s, id("t"))).toEqual(world(-200, 0));
    expect(absolute(s, id("z"))).toEqual(world(200, 0));
    expect(absolute(s, id("w"))).toEqual(world(1000, 0));
  });

  test("A's anchor moves to its only child z", () => {
    review137();
    drag_drop_item_into_group(id("G"), world(0, 0), id("t"));
    // was (0, 0)
    expect(getGlobal().itemStore.A!.position).toEqual(world(200, 0));
  });

  test("the anchor that lines aim at stays inside A's box", () => {
    // A line to a group is drawn from get_global_position(group), cut at the
    // group's box (LineAnnot + get_box_line_crosspoint). When the anchor is
    // outside the box, the line ends in empty space next to the group.
    review137();
    drag_drop_item_into_group(id("G"), world(0, 0), id("t"));
    const s = getGlobal();
    const [ax, ay] = get_global_position(id("A"), s);
    const b = get_group_bounding_box(s.itemStore.A as TGroupItem);
    // was: anchor x = 0, box from x = 79 to x = 321
    expect(b.left <= ax && ax <= b.right && b.top <= ay && ay <= b.bottom).toBe(true);
  });
});

describe("drag_drop_item_into_group re-centers the destination's ancestors", () => {
  test("a root kozane dropped into a nested group: the outer group follows", () => {
    // A (0,0) > B (0,0) > k (0,0); r (300,0) at the root
    setBoard(["A", "r"], [gr("A", 0, 0, ["B"], "A"), gr("B", 0, 0, ["k"], "B"), kz("k", 0, 0), kz("r", 300, 0)]);
    drag_drop_item_into_group(id("B"), world(300, 0), id("r"));
    const s = getGlobal();
    expect(absolute(s, id("r"))).toEqual(world(300, 0));
    expect(absolute(s, id("k"))).toEqual(world(0, 0));
    expect(center(s, "B")).toEqual([0, 0]);
    expect(center(s, "A")).toEqual([0, 0]);
    expect(s.itemStore.A!.position).toEqual(world(150, 0));
  });
});

describe("drag_drop_selection_into_group", () => {
  // A (300,200) > B (0,0) > k (0,0); r (1000,0) at the root
  const board = () =>
    setBoard(
      ["A", "r"],
      [gr("A", 300, 200, ["B"], "A"), gr("B", 0, 0, ["k"], "B"), kz("k", 0, 0), kz("r", 1000, 0)]
    );

  test("a selection dropped into a nested group stays where it was dropped", () => {
    board();
    setGlobal({ selected_items: [id("r")], is_selected: true });
    drag_drop_selection_into_group(id("B"), world(0, 0));
    const s = getGlobal();
    expect(parentOf(s, id("r"))).toBe("B");
    // was (1300, 200): off by A's position
    expect(absolute(s, id("r"))).toEqual(world(1000, 0));
    expect(absolute(s, id("k"))).toEqual(world(300, 200));
  });

  test("... moved by m = (10, -20)", () => {
    board();
    setGlobal({ selected_items: [id("r")], is_selected: true });
    drag_drop_selection_into_group(id("B"), world(10, -20));
    expect(absolute(getGlobal(), id("r"))).toEqual(world(1010, -20));
  });

  test("the nested group and the outer group are centered after the drop", () => {
    board();
    setGlobal({ selected_items: [id("r")], is_selected: true });
    drag_drop_selection_into_group(id("B"), world(0, 0));
    const s = getGlobal();
    expect(center(s, "B")).toEqual([0, 0]);
    expect(center(s, "A")).toEqual([0, 0]);
  });
});

describe("normalize_group_position (without a draft)", () => {
  test("re-centers the group and its ancestors, and no kozane moves", () => {
    // A (0,0) > B (0,0) > [ k1 (0,0), k2 (100,0) ]; B is not centered
    setBoard(["A"], [gr("A", 0, 0, ["B"]), gr("B", 0, 0, ["k1", "k2"]), kz("k1", 0, 0), kz("k2", 100, 0)]);
    normalize_group_position(id("B"));
    const s = getGlobal();
    expect(s.itemStore.B!.position).toEqual(world(0, 0)); // was (50, 0)
    expect(s.itemStore.A!.position).toEqual(world(50, 0)); // was (0, 0)
    expect(absolute(s, id("k1"))).toEqual(world(0, 0));
    expect(absolute(s, id("k2"))).toEqual(world(100, 0));
  });

  test("three levels: every ancestor is centered", () => {
    // A (0,0) > B (0,0) > C (0,0) > [ k1 (0,0), k2 (0,60) ]
    setBoard(
      ["A"],
      [gr("A", 0, 0, ["B"]), gr("B", 0, 0, ["C"]), gr("C", 0, 0, ["k1", "k2"]), kz("k1", 0, 0), kz("k2", 0, 60)]
    );
    normalize_group_position(id("C"));
    const s = getGlobal();
    for (const g of ["A", "B", "C"]) expect(center(s, g)).toEqual([0, 0]);
    expect(s.itemStore.A!.position).toEqual(world(0, 30));
    expect(absolute(s, id("k2"))).toEqual(world(0, 60));
  });
});
