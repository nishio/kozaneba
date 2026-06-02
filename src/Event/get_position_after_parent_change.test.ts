import { State } from "reactn/default";
import { add_v2w } from "../dimension/V2";
import { TGroupItem } from "../Global/TGroupItem";
import { TKozaneItem } from "../Global/TKozaneItem";
import { TItemId } from "../Global/TItemId";
import { TWorldCoord } from "../dimension/world_to_screen";
import { get_total_offset_of_parents } from "./get_total_offset_of_parents";
import { get_position_after_parent_change } from "./get_position_after_parent_change";

const id = (value: string) => value as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const group = (
  value: string,
  position: TWorldCoord,
  items: string[]
): TGroupItem => ({
  type: "group",
  text: "",
  position,
  items: items.map(id),
  id: id(value),
  scale: 1,
  isOpen: true,
});

const kozane = (value: string, position: TWorldCoord): TKozaneItem => ({
  type: "kozane",
  text: value,
  position,
  id: id(value),
  scale: 1,
});

const state = (
  drawOrder: string[],
  itemStore: State["itemStore"]
): State =>
  ({
    drawOrder: drawOrder.map(id),
    itemStore,
  } as State);

describe("get_position_after_parent_change", () => {
  test("subtracts the full parent chain when a root item enters a nested group", () => {
    const draft = state(["A", "C"], {
      A: group("A", world(100, 50), ["B"]),
      B: group("B", world(30, 20), []),
      C: kozane("C", world(150, 100)),
    });

    expect(
      get_position_after_parent_change(world(150, 100), null, id("B"), draft)
    ).toEqual(world(20, 30));
  });

  test("keeps world position stable when C moves root and back into A(B(C))", () => {
    const nested = state(["A"], {
      A: group("A", world(100, 50), ["B"]),
      B: group("B", world(30, 20), ["C"]),
      C: kozane("C", world(5, 6)),
    });
    const nestedC = nested.itemStore.C;
    if (nestedC === undefined) {
      throw new Error("missing C");
    }
    const rootPosition = add_v2w(
      nestedC.position,
      get_total_offset_of_parents(id("B"), nested)
    );

    const asRoot = state(["A", "C"], {
      A: group("A", world(100, 50), ["B"]),
      B: group("B", world(30, 20), []),
      C: kozane("C", rootPosition),
    });

    const localPosition = get_position_after_parent_change(
      rootPosition,
      null,
      id("B"),
      asRoot
    );

    expect(localPosition).toEqual(world(5, 6));
    expect(
      add_v2w(localPosition, get_total_offset_of_parents(id("B"), asRoot))
    ).toEqual(rootPosition);
  });
});
