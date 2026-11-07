import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TGroupItem } from "../Global/TGroupItem";
import { TItemId } from "../Global/TItemId";
import { TKozaneItem } from "../Global/TKozaneItem";
import { TWorldCoord } from "../dimension/world_to_screen";
import { drag_drop_item } from "./drag_drop_item";
import { drag_drop_item_into_group } from "./drag_drop_item_into_group";

// These tests pin the world-coordinate invariants that the 2026-06 nested drag
// fix uncovered (see wiki/themes/テスト改善計画.md §1). They go through the real
// drag handlers at the itemStore/drawOrder level (no DOM) and check the absolute
// world position directly, so a 1px rendering difference can never mask a bug in
// the parent-chain offset math.

vi.mock("./fast_drag_manager", () => ({
  reset_target: vi.fn(),
}));

const id = (value: string) => value as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const kozane = (value: string, position: TWorldCoord): TKozaneItem => ({
  type: "kozane",
  id: id(value),
  text: value,
  position,
  scale: 1,
});

const group = (
  value: string,
  position: TWorldCoord,
  items: string[]
): TGroupItem => ({
  type: "group",
  id: id(value),
  // non-empty text so the handlers never auto-remove the group when it is
  // temporarily emptied during a move.
  text: value,
  position,
  items: items.map(id),
  scale: 1,
  isOpen: true,
});

const resetGlobal = (partial: Partial<State>) => {
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    ...partial,
    drawOrder: [...(partial.drawOrder ?? [])],
    itemStore: { ...(partial.itemStore ?? {}) },
    selected_items: [...(partial.selected_items ?? [])],
    selectionRange: {
      ...(partial.selectionRange ?? { top: 0, left: 0, width: 0, height: 0 }),
    },
  } as State);
};

// Absolute world position of an item, summing the stored (local) positions of
// the whole parent chain. Independent of the code under test.
const absolutePosition = (target: TItemId, state: State): TWorldCoord => {
  const visit = (ids: TItemId[], offset: TWorldCoord): TWorldCoord | null => {
    for (const itemId of ids) {
      const item = state.itemStore[itemId]!;
      const nextOffset = world(
        offset[0] + item.position[0],
        offset[1] + item.position[1]
      );
      if (itemId === target) return nextOffset;
      if (item.type === "group") {
        const child = visit(item.items, nextOffset);
        if (child !== null) return child;
      }
    }
    return null;
  };
  const result = visit(state.drawOrder, world(0, 0));
  if (result === null) {
    throw new Error(`missing item ${target}`);
  }
  return result;
};

const storedPosition = (target: TItemId): TWorldCoord => {
  const item = getGlobal().itemStore[target];
  if (item === undefined) {
    throw new Error(`missing item ${target}`);
  }
  return item.position;
};

// A(B(C, C2)) with a non-zero offset at every level, plus a second nested
// group D(E) to drag between. Absolute positions:
//   C  = (100+30+5, 50+20+6)  = (135, 76)
//   C2 = (100+30+10, 50+20-4) = (140, 66)
//   E  = (-200+40, -100+10)   = (-160, -90)
const buildNestedBoards = () =>
  resetGlobal({
    drawOrder: [id("A"), id("D"), id("R")],
    itemStore: {
      A: group("A", world(100, 50), ["B"]),
      B: group("B", world(30, 20), ["C", "C2"]),
      C: kozane("C", world(5, 6)),
      C2: kozane("C2", world(10, -4)),
      D: group("D", world(-200, -100), ["E"]),
      E: group("E", world(40, 10), ["E1"]),
      E1: kozane("E1", world(2, 3)),
      R: kozane("R", world(500, 400)),
    },
  });

describe("nested drag world-coordinate invariants", () => {
  test("canvas drop (root -> root) keeps the dropped world position", () => {
    buildNestedBoards();
    const before = absolutePosition(id("R"), getGlobal());

    // no-op drop: drop R at its current frame position (root frame == world)
    drag_drop_item(getGlobal(), storedPosition(id("R")), id("R"));

    expect(absolutePosition(id("R"), getGlobal())).toEqual(before);
  });

  test("nested -> root keeps the world position through a two-level parent chain", () => {
    buildNestedBoards();
    const before = absolutePosition(id("C"), getGlobal()); // (135, 76)

    // no-op drop: C is nested, so its current frame position is its local one.
    drag_drop_item(getGlobal(), storedPosition(id("C")), id("C"));

    const state = getGlobal();
    expect((state.itemStore.B as TGroupItem).items).not.toContain(id("C"));
    expect(state.drawOrder).toContain(id("C"));
    expect(absolutePosition(id("C"), state)).toEqual(before);
    expect(before).toEqual(world(135, 76));
  });

  test("root -> nested (two levels deep) keeps the world position", () => {
    buildNestedBoards();
    const before = absolutePosition(id("R"), getGlobal()); // (500, 400)

    // root item R dropped into B, which lives inside A. Current frame is world.
    drag_drop_item_into_group(id("B"), storedPosition(id("R")), id("R"));

    const state = getGlobal();
    expect((state.itemStore.B as TGroupItem).items).toContain(id("R"));
    expect(state.drawOrder).not.toContain(id("R"));
    expect(absolutePosition(id("R"), state)).toEqual(before);
  });

  test("nested -> nested keeps the world position between two deep groups", () => {
    buildNestedBoards();
    const before = absolutePosition(id("C"), getGlobal()); // (135, 76)

    // C moves from B (inside A) into E (inside D).
    drag_drop_item_into_group(id("E"), storedPosition(id("C")), id("C"));

    const state = getGlobal();
    expect((state.itemStore.E as TGroupItem).items).toContain(id("C"));
    expect((state.itemStore.B as TGroupItem).items).not.toContain(id("C"));
    expect(absolutePosition(id("C"), state)).toEqual(before);
  });

  test("A(B(C)) round trip: C out to root and back into B restores its world position", () => {
    buildNestedBoards();
    const before = absolutePosition(id("C"), getGlobal());

    // out to root
    drag_drop_item(getGlobal(), storedPosition(id("C")), id("C"));
    const atRoot = absolutePosition(id("C"), getGlobal());
    expect(atRoot).toEqual(before);

    // back into B (C is now a root item, so its frame is world)
    drag_drop_item_into_group(id("B"), storedPosition(id("C")), id("C"));

    const state = getGlobal();
    expect((state.itemStore.B as TGroupItem).items).toContain(id("C"));
    expect(absolutePosition(id("C"), state)).toEqual(before);
  });

  // KNOWN BUG (do not "fix" by relaxing this test): dropping an item back into
  // the group it already belongs to shifts its world position by the group's
  // re-center offset. In drag_drop_item_into_group, when previous_parent ===
  // group_id, normalize_group_position(previous_parent) runs before
  // target.position is assigned, and the later assignment keeps the shifted
  // group position while discarding the target's share of the normalization.
  // Reachable from onGroupMouseUp when an item is released over its own group.
  // Tracked in queue/drafts/K2-same-group-drop-shifts-world-position.md.
  // test.fails keeps CI green and will start failing (prompting removal of
  // `.fails`) the moment the underlying bug is fixed.
  test.fails(
    "dropping an item into its own group should be a no-op on world position (KNOWN BUG)",
    () => {
      buildNestedBoards();
      const before = absolutePosition(id("C"), getGlobal());

      // same-group drop: target already belongs to B.
      drag_drop_item_into_group(id("B"), storedPosition(id("C")), id("C"));

      expect(absolutePosition(id("C"), getGlobal())).toEqual(before);
    }
  );
});
