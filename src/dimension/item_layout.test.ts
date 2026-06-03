import { setGlobal } from "reactn";
import { State } from "reactn/default";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TGroupItem } from "../Global/TGroupItem";
import { TItemId } from "../Global/TItemId";
import { TKozaneItem } from "../Global/TKozaneItem";
import { TWorldCoord } from "./world_to_screen";
import { get_group_bounding_box } from "./get_group_bounding_box";
import { get_item_bounding_box } from "./get_bounding_box";
import { get_kozane_bounding_box } from "./get_kozane_bounding_box";
import { position_to_left_top } from "./position_to_left_top";

const id = (value: string) => value as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;

const kozane = (
  value: string,
  position: TWorldCoord,
  scale = 1
): TKozaneItem => ({
  type: "kozane",
  id: id(value),
  text: value,
  position,
  scale,
});

const group = (
  value: string,
  position: TWorldCoord,
  items: string[],
  text = ""
): TGroupItem => ({
  type: "group",
  id: id(value),
  text,
  position,
  items: items.map(id),
  scale: 1,
  isOpen: true,
});

const resetGlobal = (drawOrder: string[], itemStore: State["itemStore"]) => {
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    drawOrder: drawOrder.map(id),
    itemStore,
  } as State);
};

describe("item layout geometry", () => {
  test("computes a scaled kozane bounding box in world coordinates", () => {
    expect(get_kozane_bounding_box(kozane("A", world(100, 20), 2))).toEqual({
      left: -31,
      top: -81,
      right: 231,
      bottom: 121,
    });
  });

  test("rounds world positions to stable CSS left/top strings", () => {
    expect(position_to_left_top(world(-123.456, 45))).toEqual({
      left: "-123.46px",
      top: "45.00px",
    });
  });

  test("includes a translated parent group offset in its bounding box", () => {
    const g = group("G", world(50, 20), ["A", "B"]);
    resetGlobal(["G"], {
      G: g,
      A: kozane("A", world(-100, 0)),
      B: kozane("B", world(100, 0)),
    });

    expect(get_group_bounding_box(g)).toEqual({
      left: -171,
      top: -86,
      right: 271,
      bottom: 126,
    });
  });

  test("accumulates nested group layout through get_item_bounding_box", () => {
    resetGlobal(["A"], {
      A: group("A", world(0, 0), ["B"]),
      B: group("B", world(0, 0), ["C"]),
      C: kozane("C", world(0, 0)),
    });

    expect(get_item_bounding_box(id("B"))).toEqual({
      left: -121,
      top: -106,
      right: 121,
      bottom: 106,
    });
    expect(get_item_bounding_box(id("A"))).toEqual({
      left: -151,
      top: -136,
      right: 151,
      bottom: 136,
    });
  });
});
