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

// Promotes the drag_group_to_group / nested_group behavior that the retired
// Movidea specs (cypress/e2e/movidea/drag_group_to_group.cy.ts,
// nested_group.cy.ts) used to cover with pixel-exact DOM assertions. The
// existing state-level drag tests (drag_drop_state.test.ts,
// nested_drag_invariants.test.ts) only ever drag a *kozane* as the target;
// dragging a whole *group* (which carries its descendants) was unprotected.
// See wiki/sources/movidea-legacy-test-inventory-2026-06.md.

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

// Two independent boards, each two levels deep, plus a root-level group.
//   A(100,50) > B(30,20) > [C]
//   D(-200,-100) > E(40,10) > [E1]          -- E is the group we drag around
//   F(300,0) > [F1]                          -- a root-level group to drag in
// Absolute positions:
//   E  = (-160, -90)   E1 = (-158, -87)
//   F  = (300, 0)      F1 = (305, 7)
const buildBoards = () =>
  resetGlobal({
    drawOrder: [id("A"), id("D"), id("F")],
    itemStore: {
      A: group("A", world(100, 50), ["B"]),
      B: group("B", world(30, 20), ["C"]),
      C: kozane("C", world(5, 6)),
      D: group("D", world(-200, -100), ["E"]),
      E: group("E", world(40, 10), ["E1"]),
      E1: kozane("E1", world(2, 3)),
      F: group("F", world(300, 0), ["F1"]),
      F1: kozane("F1", world(5, 7)),
    },
  });

describe("group-into-group drag world-coordinate invariants", () => {
  test("nested -> nested: dragging a group keeps the group and its child in place", () => {
    buildBoards();
    const eBefore = absolutePosition(id("E"), getGlobal());
    const e1Before = absolutePosition(id("E1"), getGlobal());

    // E (inside D) dragged into B (inside A), no net movement.
    drag_drop_item_into_group(id("B"), storedPosition(id("E")), id("E"));

    const state = getGlobal();
    expect((state.itemStore.B as TGroupItem).items).toContain(id("E"));
    expect((state.itemStore.D as TGroupItem).items).not.toContain(id("E"));
    // the dragged group still contains its child
    expect((state.itemStore.E as TGroupItem).items).toEqual([id("E1")]);
    expect(absolutePosition(id("E"), state)).toEqual(eBefore);
    expect(absolutePosition(id("E1"), state)).toEqual(e1Before);
  });

  test("root -> nested: dragging a root group into a nested group keeps its child in place", () => {
    buildBoards();
    const fBefore = absolutePosition(id("F"), getGlobal());
    const f1Before = absolutePosition(id("F1"), getGlobal());

    // F is a root group; its frame is world, so the no-op drop delta is F.position.
    drag_drop_item_into_group(id("B"), storedPosition(id("F")), id("F"));

    const state = getGlobal();
    expect((state.itemStore.B as TGroupItem).items).toContain(id("F"));
    expect(state.drawOrder).not.toContain(id("F"));
    expect(absolutePosition(id("F"), state)).toEqual(fBefore);
    expect(absolutePosition(id("F1"), state)).toEqual(f1Before);
  });

  test("nested -> root: dragging a group out to the canvas keeps its child in place", () => {
    buildBoards();
    const eBefore = absolutePosition(id("E"), getGlobal());
    const e1Before = absolutePosition(id("E1"), getGlobal());

    // E is nested in D; no-op drop delta is its local position.
    drag_drop_item(getGlobal(), storedPosition(id("E")), id("E"));

    const state = getGlobal();
    expect(state.drawOrder).toContain(id("E"));
    expect((state.itemStore.E as TGroupItem).items).toEqual([id("E1")]);
    expect(absolutePosition(id("E"), state)).toEqual(eBefore);
    expect(absolutePosition(id("E1"), state)).toEqual(e1Before);
  });

  test("round trip: a group dragged out and back keeps its child's world position", () => {
    buildBoards();
    const e1Before = absolutePosition(id("E1"), getGlobal());

    drag_drop_item(getGlobal(), storedPosition(id("E")), id("E"));
    expect(absolutePosition(id("E1"), getGlobal())).toEqual(e1Before);

    // E is now a root group; drop it into A (two levels: into B? use A directly)
    drag_drop_item_into_group(id("A"), storedPosition(id("E")), id("E"));

    const state = getGlobal();
    expect((state.itemStore.A as TGroupItem).items).toContain(id("E"));
    expect(absolutePosition(id("E1"), state)).toEqual(e1Before);
  });
});
