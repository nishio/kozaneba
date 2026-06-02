import { setGlobal } from "reactn";
import { State } from "reactn/default";
import { TGroupItem } from "../Global/TGroupItem";
import { TKozaneItem } from "../Global/TKozaneItem";
import { TItemId } from "../Global/TItemId";
import { TWorldCoord } from "../dimension/world_to_screen";
import { get_total_offset_of_parents } from "./get_total_offset_of_parents";

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

describe("get_total_offset_of_parents", () => {
  test("uses the supplied state when traversing parent chain", () => {
    setGlobal(
      state(["B"], {
        B: group("B", world(30, 20), ["C"]),
        C: kozane("C", world(5, 6)),
      })
    );

    const draft = state(["A"], {
      A: group("A", world(100, 50), ["B"]),
      B: group("B", world(30, 20), ["C"]),
      C: kozane("C", world(5, 6)),
    });

    expect(get_total_offset_of_parents(id("B"), draft)).toEqual(
      world(130, 70)
    );
  });
});
