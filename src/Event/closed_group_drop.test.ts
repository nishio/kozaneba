import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TGroupItem } from "../Global/TGroupItem";
import { TItemId } from "../Global/TItemId";
import { TKozaneItem } from "../Global/TKozaneItem";
import { TWorldCoord } from "../dimension/world_to_screen";
import { drag_drop_item_into_group } from "./drag_drop_item_into_group";
import { drag_drop_item } from "./drag_drop_item";

// Regression for dropping into / out of a CLOSED group (isOpen=false), the case
// the retired movidea/drag_closed_group.cy.ts used to cover. See
// queue/drafts/K3-rewrite-drag_closed_group.md and QUEUE K11. Closed groups
// still render the drop target element and wire onGroupMouseUp/onPointerUp, so
// the hit test can land a drop on them; this pins the state outcome.

vi.mock("./fast_drag_manager", () => ({ reset_target: vi.fn() }));

const id = (v: string) => v as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const kozane = (v: string, position: TWorldCoord): TKozaneItem => ({
  type: "kozane",
  id: id(v),
  text: v,
  position,
  scale: 1,
});

const group = (
  v: string,
  position: TWorldCoord,
  items: string[],
  isOpen: boolean
): TGroupItem => ({
  type: "group",
  id: id(v),
  text: v,
  position,
  items: items.map(id),
  scale: 1,
  isOpen,
});

const resetGlobal = (partial: Partial<State>) => {
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    ...partial,
    drawOrder: [...(partial.drawOrder ?? [])],
    itemStore: { ...(partial.itemStore ?? {}) },
    selected_items: [...(partial.selected_items ?? [])],
    selectionRange: { ...(partial.selectionRange ?? { top: 0, left: 0, width: 0, height: 0 }) },
  } as State);
};

describe("drop into / out of a closed group", () => {
  test("a root item dropped onto a closed group is added to it and the group stays closed", () => {
    resetGlobal({
      drawOrder: [id("G"), id("R")],
      itemStore: {
        G: group("G", world(100, 50), ["C"], false), // closed
        C: kozane("C", world(0, 0)),
        R: kozane("R", world(150, 100)),
      },
    });

    drag_drop_item_into_group(id("G"), world(150, 100), id("R"));

    const g = getGlobal();
    expect((g.itemStore.G as TGroupItem).items).toContain(id("R"));
    expect((g.itemStore.G as TGroupItem).isOpen).toBe(false);
    expect(g.drawOrder).not.toContain(id("R"));
  });

  test("an item dragged out of a closed group returns to the root", () => {
    resetGlobal({
      drawOrder: [id("G")],
      itemStore: {
        G: group("G", world(100, 50), ["C", "D"], false), // closed, keep 2 so it is not auto-removed
        C: kozane("C", world(0, 0)),
        D: kozane("D", world(10, 0)),
      },
    });

    // drag_drop_item interprets `delta` in the item's current (parent) frame and
    // adds the parent-chain offset to produce the new root position. G is at
    // (100,50), so delta (200,250) -> absolute (300,300). This is isOpen-agnostic
    // (get_total_offset_of_parents ignores the closed state).
    drag_drop_item(getGlobal(), world(200, 250), id("C"));

    const g = getGlobal();
    expect(g.drawOrder).toContain(id("C"));
    expect((g.itemStore.G as TGroupItem).items).not.toContain(id("C"));
    expect(g.itemStore.C?.position).toEqual(world(300, 300));
  });
});
