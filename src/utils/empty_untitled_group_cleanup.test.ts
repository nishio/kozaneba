import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TAnnotation } from "../Global/TAnnotation";
import { TGroupItem } from "../Global/TGroupItem";
import { TItemId } from "../Global/TItemId";
import { TKozaneItem } from "../Global/TKozaneItem";
import { TWorldCoord } from "../dimension/world_to_screen";
import { drag_drop_item } from "../Event/drag_drop_item";
import { drag_drop_item_into_group } from "../Event/drag_drop_item_into_group";
import { delete_item_from_world } from "./delete_item_from_world";
import { remove_empty_untitled_groups } from "./remove_empty_untitled_groups";
import { updateGlobal } from "../Global/updateGlobal";

// A group with no items and no title shows nothing, so the code removes it when
// its last item is taken out. These tests pin that the removal goes all the way
// up a chain of such groups, and that deleting (not only dragging) does it too.
// A Lean model with an exhaustive check over boards of up to 4 items
// (2026-11-24) found both gaps: 1,936 of 23,409 deletions and 762 of 95,445
// guarded drops left a new empty untitled group behind.

vi.mock("../Event/fast_drag_manager", () => ({
  reset_target: vi.fn(),
}));

const id = (value: string) => value as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const kozane = (value: string, position = world(0, 0)): TKozaneItem => ({
  type: "kozane",
  id: id(value),
  text: value,
  position,
  scale: 1,
});

const group = (
  value: string,
  items: string[],
  text = "",
  position = world(0, 0),
): TGroupItem => ({
  type: "group",
  id: id(value),
  text,
  position,
  items: items.map(id),
  scale: 1,
  isOpen: true,
});

const line = (a: string, b: string): TAnnotation => ({
  type: "line",
  items: [id(a), id(b)],
  heads: ["none", "none"],
  is_doubled: false,
  custom: {},
});

const setup = (
  drawOrder: string[],
  items: (TKozaneItem | TGroupItem)[],
  annotations: TAnnotation[] = [],
) => {
  const itemStore: State["itemStore"] = {};
  items.forEach((item) => {
    itemStore[item.id] = item;
  });
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    drawOrder: drawOrder.map(id),
    itemStore,
    annotations,
    selected_items: [],
  } as State);
};

// The nesting invariants proved in the Lean model:
// - every id in drawOrder / group.items is in itemStore (no dangling id)
// - every item in itemStore is in drawOrder or in exactly one group.items,
//   exactly once (no orphan, no duplicate)
// - everything is reachable from drawOrder, so there is no cycle
// - only groups have children
// plus: every line points at items that exist.
const expectWellFormed = (state: State) => {
  const seen = new Map<string, number>();
  const count = (x: string) => seen.set(x, (seen.get(x) ?? 0) + 1);
  state.drawOrder.forEach(count);
  Object.values(state.itemStore).forEach((item) => {
    if (item === undefined) return;
    if (item.type === "group") {
      item.items.forEach(count);
    } else {
      expect(item).not.toHaveProperty("items");
    }
  });
  seen.forEach((n, x) => {
    expect(state.itemStore[x], `dangling id ${x}`).toBeDefined();
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
    if (item?.type === "group") item.items.forEach(visit);
  };
  state.drawOrder.forEach(visit);
  expect(reached.size).toBe(Object.keys(state.itemStore).length);

  state.annotations.forEach((a) => {
    a.items.forEach((x) => {
      expect(state.itemStore[x], `line to missing ${x}`).toBeDefined();
    });
  });
};

const emptyUntitledGroups = (state: State) =>
  Object.values(state.itemStore).filter(
    (item) =>
      item !== undefined &&
      item.type === "group" &&
      item.items.length === 0 &&
      item.text === "",
  );

// Absolute world position: the stored (local) positions of the whole parent
// chain summed. Independent of the code under test.
const absolutePosition = (target: TItemId, state: State): TWorldCoord => {
  const visit = (ids: TItemId[], offset: TWorldCoord): TWorldCoord | null => {
    for (const itemId of ids) {
      const item = state.itemStore[itemId]!;
      const next = world(
        offset[0] + item.position[0],
        offset[1] + item.position[1],
      );
      if (itemId === target) return next;
      if (item.type === "group") {
        const child = visit(item.items, next);
        if (child !== null) return child;
      }
    }
    return null;
  };
  const result = visit(state.drawOrder, world(0, 0));
  if (result === null) throw new Error(`missing item ${target}`);
  return result;
};

describe("deleting the last item of an untitled group", () => {
  test("removes the untitled group", () => {
    setup(["P", "X"], [group("P", ["K"]), kozane("K"), kozane("X")]);

    delete_item_from_world(id("K"));

    const state = getGlobal();
    expect(state.itemStore.P).toBeUndefined();
    expect(state.drawOrder).toEqual(["X"]);
    expect(emptyUntitledGroups(state)).toEqual([]);
    expectWellFormed(state);
  });

  test("removes a chain of untitled groups up to the top", () => {
    setup(
      ["A", "X"],
      [group("A", ["B"]), group("B", ["K"]), kozane("K"), kozane("X")],
    );

    delete_item_from_world(id("K"));

    const state = getGlobal();
    expect(state.itemStore.A).toBeUndefined();
    expect(state.itemStore.B).toBeUndefined();
    expect(state.drawOrder).toEqual(["X"]);
    expectWellFormed(state);
  });

  test("stops at a titled group, which stays even when empty", () => {
    setup(
      ["T", "X"],
      [group("T", ["B"], "title"), group("B", ["K"]), kozane("K"), kozane("X")],
    );

    delete_item_from_world(id("K"));

    const state = getGlobal();
    expect(state.itemStore.B).toBeUndefined();
    expect(state.itemStore.T).toMatchObject({ text: "title", items: [] });
    expect(state.drawOrder).toContain("T");
    expect(emptyUntitledGroups(state)).toEqual([]);
    expectWellFormed(state);
  });

  test("stops at a group that still has other items", () => {
    setup(
      ["A"],
      [group("A", ["B", "Y"]), group("B", ["K"]), kozane("K"), kozane("Y")],
    );

    delete_item_from_world(id("K"));

    const state = getGlobal();
    expect(state.itemStore.B).toBeUndefined();
    expect(state.itemStore.A).toMatchObject({ items: ["Y"] });
    expect(state.drawOrder).toEqual(["A"]);
    expectWellFormed(state);
  });

  test("leaves an untitled group alone while it still has items", () => {
    setup(["P"], [group("P", ["K", "K2"]), kozane("K"), kozane("K2")]);

    delete_item_from_world(id("K"));

    const state = getGlobal();
    expect(state.itemStore.P).toMatchObject({ items: ["K2"] });
    expectWellFormed(state);
  });

  test("deleting a whole group can empty its untitled parent too", () => {
    setup(
      ["Q", "X"],
      [group("Q", ["G"]), group("G", ["K"], "title"), kozane("K"), kozane("X")],
    );

    delete_item_from_world(id("G"));

    const state = getGlobal();
    expect(state.itemStore.Q).toBeUndefined();
    expect(state.itemStore.G).toBeUndefined();
    expect(state.itemStore.K).toBeUndefined();
    expect(state.drawOrder).toEqual(["X"]);
    expectWellFormed(state);
  });

  test("never leaves a removed group's id in drawOrder (move_front only touches survivors)", () => {
    setup(
      ["T", "X"],
      [group("T", ["B"], "title"), group("B", ["K"]), kozane("K"), kozane("X")],
    );

    delete_item_from_world(id("K"));

    const state = getGlobal();
    expect(state.drawOrder).not.toContain("B");
    // the surviving ancestor is brought to the front, as the parent was before
    expect(state.drawOrder).toEqual(["X", "T"]);
    state.drawOrder.forEach((x) => expect(state.itemStore[x]).toBeDefined());
  });

  test("deleting an item that was already removed is a no-op", () => {
    // e.g. a list of ids deleted in a row where the group goes with its child;
    // the old code looked the item up with get_item and threw here
    setup(["P", "X"], [group("P", ["K"]), kozane("K"), kozane("X")]);

    delete_item_from_world(id("K"));
    expect(() => delete_item_from_world(id("P"))).not.toThrow();

    const state = getGlobal();
    expect(state.drawOrder).toEqual(["X"]);
    expectWellFormed(state);
  });

  test("lines attached to the removed untitled group go with it", () => {
    setup(
      ["P", "X"],
      [group("P", ["K"]), kozane("K"), kozane("X")],
      [line("P", "X")],
    );

    delete_item_from_world(id("K"));

    const state = getGlobal();
    expect(state.annotations).toEqual([]);
    expectWellFormed(state);
  });
});

describe("dragging the last item out of an untitled group", () => {
  test("to the canvas removes the whole chain of untitled groups", () => {
    setup(
      ["A", "X"],
      [
        group("A", ["B"], "", world(100, 50)),
        group("B", ["K"], "", world(30, 20)),
        kozane("K", world(5, 6)),
        kozane("X"),
      ],
    );
    const before = absolutePosition(id("K"), getGlobal());

    // no-op drop: K's current frame position is its local one
    drag_drop_item(getGlobal(), world(5, 6), id("K"));

    const state = getGlobal();
    expect(state.itemStore.A).toBeUndefined();
    expect(state.itemStore.B).toBeUndefined();
    expect(state.drawOrder).toEqual(["X", "K"]);
    expect(absolutePosition(id("K"), state)).toEqual(before);
    expectWellFormed(state);
  });

  test("into another group removes the whole chain of untitled groups", () => {
    setup(
      ["A", "D"],
      [
        group("A", ["B"], "", world(100, 50)),
        group("B", ["K"], "", world(30, 20)),
        kozane("K", world(5, 6)),
        group("D", ["E1"], "D", world(-200, -100)),
        kozane("E1", world(2, 3)),
      ],
    );
    const before = absolutePosition(id("K"), getGlobal());

    drag_drop_item_into_group(id("D"), world(5, 6), id("K"));

    const state = getGlobal();
    expect(state.itemStore.A).toBeUndefined();
    expect(state.itemStore.B).toBeUndefined();
    expect(state.drawOrder).toEqual(["D"]);
    expect((state.itemStore.D as TGroupItem).items).toEqual(["E1", "K"]);
    expect(absolutePosition(id("K"), state)).toEqual(before);
    expectWellFormed(state);
  });

  test("into its own grandparent removes the emptied parent and keeps the item in place", () => {
    // T(100,50) > [B(30,20) > [K(5,6)], Y(-40,10)]; K moves from B up into T
    setup(
      ["T"],
      [
        group("T", ["B", "Y"], "title", world(100, 50)),
        group("B", ["K"], "", world(30, 20)),
        kozane("K", world(5, 6)),
        kozane("Y", world(-40, 10)),
      ],
    );
    const before = absolutePosition(id("K"), getGlobal());
    const yBefore = absolutePosition(id("Y"), getGlobal());

    drag_drop_item_into_group(id("T"), world(5, 6), id("K"));

    const state = getGlobal();
    expect(state.itemStore.B).toBeUndefined();
    expect((state.itemStore.T as TGroupItem).items).toEqual(["Y", "K"]);
    expect(absolutePosition(id("K"), state)).toEqual(before);
    expect(absolutePosition(id("Y"), state)).toEqual(yBefore);
    expectWellFormed(state);
  });

  test("a titled group on the way up stays", () => {
    setup(
      ["A"],
      [
        group("A", ["T"]),
        group("T", ["B"], "title"),
        group("B", ["K"]),
        kozane("K"),
      ],
    );

    drag_drop_item(getGlobal(), world(0, 0), id("K"));

    const state = getGlobal();
    expect(state.itemStore.B).toBeUndefined();
    expect(state.itemStore.T).toMatchObject({ items: [] });
    expect(state.itemStore.A).toMatchObject({ items: ["T"] });
    expect(state.drawOrder).toEqual(["A", "K"]);
    expectWellFormed(state);
  });
});

describe("remove_empty_untitled_groups", () => {
  test("follows the tree as it is in the draft, not as it was before the update", () => {
    // A > B > K. In one update B is moved out of A to the top and K is taken
    // out of B. B must then be removed from drawOrder (where it is now), not
    // from A (where it was before the update).
    setup(
      ["A", "X"],
      [group("A", ["B"], "A"), group("B", ["K"]), kozane("K"), kozane("X")],
    );

    let survivor: TItemId | null = id("unset");
    updateGlobal((g) => {
      (g.itemStore.A as TGroupItem).items = [];
      g.drawOrder.push(id("B"));
      (g.itemStore.B as TGroupItem).items = [];
      g.drawOrder.push(id("K"));
      survivor = remove_empty_untitled_groups(g, id("B"));
    });

    const state = getGlobal();
    expect(survivor).toBeNull();
    expect(state.itemStore.B).toBeUndefined();
    expect(state.drawOrder).toEqual(["A", "X", "K"]);
    expectWellFormed(state);
  });

  test("returns the group itself when it is kept", () => {
    setup(["P"], [group("P", ["K"]), kozane("K")]);
    let survivor: TItemId | null = null;
    updateGlobal((g) => {
      survivor = remove_empty_untitled_groups(g, id("P"));
    });
    expect(survivor).toBe("P");
    expect(getGlobal().itemStore.P).toBeDefined();
  });
});
