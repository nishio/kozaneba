import { setGlobal } from "reactn";
import { State } from "reactn/default";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TGroupItem } from "../Global/TGroupItem";
import { TItemId } from "../Global/TItemId";
import { TKozaneItem } from "../Global/TKozaneItem";
import { TWorldCoord } from "../dimension/world_to_screen";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "./find_parent";

const id = (v: string) => v as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const kozane = (v: string): TKozaneItem => ({
  type: "kozane",
  id: id(v),
  text: v,
  position: world(0, 0),
  scale: 1,
});
const group = (v: string, items: string[]): TGroupItem => ({
  type: "group",
  id: id(v),
  text: v,
  position: world(0, 0),
  items: items.map(id),
  scale: 1,
  isOpen: true,
});

const reset = (partial: Partial<State>) =>
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    ...partial,
    drawOrder: [...(partial.drawOrder ?? [])],
    itemStore: { ...(partial.itemStore ?? {}) },
  } as State);

describe("find_parent (indexed)", () => {
  test("finds the parent on the no-state (getGlobal) path", () => {
    reset({
      drawOrder: [id("A"), id("B")],
      itemStore: { A: group("A", ["C"]), C: kozane("C"), B: kozane("B") },
    });
    expect(find_parent(id("C"))).toBe(id("A"));
    expect(find_parent(id("B"))).toBeNull();
    expect(find_parent(id("A"))).toBeNull();
  });

  test("reflects a reparent made via updateGlobal (cache invalidated by immer refs)", () => {
    reset({
      drawOrder: [id("A"), id("G")],
      itemStore: {
        A: group("A", ["C"]),
        C: kozane("C"),
        G: group("G", []),
      },
    });
    expect(find_parent(id("C"))).toBe(id("A"));

    // move C from A into G
    updateGlobal((g) => {
      (g.itemStore.A as TGroupItem).items = [];
      (g.itemStore.G as TGroupItem).items = [id("C")];
    });

    expect(find_parent(id("C"))).toBe(id("G"));
  });

  test("nested chain resolves each level", () => {
    reset({
      drawOrder: [id("A")],
      itemStore: {
        A: group("A", ["B"]),
        B: group("B", ["C"]),
        C: kozane("C"),
      },
    });
    expect(find_parent(id("C"))).toBe(id("B"));
    expect(find_parent(id("B"))).toBe(id("A"));
    expect(find_parent(id("A"))).toBeNull();
  });

  test("explicit-state path scans the given draft, not the global", () => {
    reset({
      drawOrder: [id("X")],
      itemStore: { X: kozane("X") },
    });
    const draft = {
      drawOrder: [id("P")],
      itemStore: { P: group("P", ["Q"]), Q: kozane("Q") },
    } as unknown as State;
    expect(find_parent(id("Q"), draft)).toBe(id("P"));
    // global is unaffected
    expect(find_parent(id("X"))).toBeNull();
  });
});
