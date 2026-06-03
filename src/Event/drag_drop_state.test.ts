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
import { drag_drop_selection } from "./drag_drop_selection";
import { drag_drop_selection_into_group } from "./drag_drop_selection_into_group";

vi.mock("./fast_drag_manager", () => ({
  reset_target: vi.fn(),
}));

const id = (value: string) => value as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const kozane = (
  value: string,
  position: TWorldCoord
): TKozaneItem => ({
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
  text: "",
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
      ...(partial.selectionRange ?? {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
      }),
    },
  } as State);
};

const absolutePosition = (target: TItemId, state: State): TWorldCoord => {
  const visit = (
    ids: TItemId[],
    offset: TWorldCoord
  ): TWorldCoord | null => {
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

describe("drag/drop state transitions", () => {
  test("moves a grouped item to the root and keeps the dropped world position", () => {
    resetGlobal({
      drawOrder: [id("G")],
      itemStore: {
        G: group("G", world(0, 0), ["A", "B"]),
        A: kozane("A", world(-100, 0)),
        B: kozane("B", world(100, 0)),
      },
    });

    drag_drop_item(getGlobal(), world(100, 100), id("A"));

    const state = getGlobal();
    expect(state.drawOrder).toEqual([id("G"), id("A")]);
    expect((state.itemStore.G as TGroupItem).items).toEqual([id("B")]);
    expect(state.itemStore.A?.position).toEqual(world(100, 100));
    expect(absolutePosition(id("A"), state)).toEqual(world(100, 100));
  });

  test("moves a root item into a group without changing its world position", () => {
    resetGlobal({
      drawOrder: [id("G"), id("A")],
      itemStore: {
        G: group("G", world(100, 50), ["B"]),
        B: kozane("B", world(0, 0)),
        A: kozane("A", world(150, 100)),
      },
    });

    drag_drop_item_into_group(id("G"), world(150, 100), id("A"));

    const state = getGlobal();
    expect(state.drawOrder).toEqual([id("G")]);
    expect((state.itemStore.G as TGroupItem).items).toContain(id("A"));
    expect(absolutePosition(id("A"), state)).toEqual(world(150, 100));
  });

  test("moves selected root items by the supplied world delta", () => {
    resetGlobal({
      drawOrder: [id("A"), id("B"), id("C"), id("D")],
      itemStore: {
        A: kozane("A", world(0, 0)),
        B: kozane("B", world(0, 200)),
        C: kozane("C", world(200, 0)),
        D: kozane("D", world(200, 200)),
      },
      selected_items: [id("A"), id("B"), id("C"), id("D")],
      selectionRange: { left: 150, top: 150, width: 300, height: 300 },
      drag_target: "selection",
    });

    drag_drop_selection(world(-50, -50));

    const state = getGlobal();
    expect(["A", "B", "C", "D"].map((value) => state.itemStore[value]?.position))
      .toEqual([
        world(-50, -50),
        world(-50, 150),
        world(150, -50),
        world(150, 150),
      ]);
    expect(state.drag_target).toBe("");
  });

  test("moves selected root items into a group", () => {
    resetGlobal({
      drawOrder: [id("G"), id("A"), id("B")],
      itemStore: {
        G: group("G", world(100, 100), []),
        A: kozane("A", world(20, 20)),
        B: kozane("B", world(40, 20)),
      },
      selected_items: [id("A"), id("B")],
      is_selected: true,
      drag_target: "selection",
    });

    drag_drop_selection_into_group(id("G"), world(100, 100));

    const state = getGlobal();
    expect(state.drawOrder).toEqual([id("G")]);
    expect((state.itemStore.G as TGroupItem).items).toEqual([id("A"), id("B")]);
    expect(state.selected_items).toEqual([]);
    expect(state.is_selected).toBe(false);
    expect(absolutePosition(id("A"), state)).toEqual(world(120, 120));
    expect(absolutePosition(id("B"), state)).toEqual(world(140, 120));
  });
});
