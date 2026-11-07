import { getGlobal, setGlobal } from "reactn";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TItemId } from "../Global/TItemId";
import { TWorldCoord } from "../dimension/world_to_screen";
import { get_global_position } from "../dimension/get_global_position";
import { ungroup } from "./ungroup";

vi.mock("../API/redraw", () => ({ redraw: vi.fn() }));
vi.mock("../utils/close_menu", () => ({ close_menu: vi.fn() }));

const id = (value: string) => value as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;
const group = (value: string, position: TWorldCoord, items: string[], text = "") => ({
  type: "group" as const,
  id: id(value),
  text,
  position,
  items: items.map(id),
  scale: 1,
  isOpen: true,
});
const kozane = (value: string, position: TWorldCoord) => ({
  type: "kozane" as const,
  id: id(value),
  text: value,
  position,
  scale: 1,
});

// P(100,50) > G(30,20) > K(5,6): K is at (135,76) on the board
const setup = (g_title = "") => {
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    drawOrder: [id("P"), id("X")],
    itemStore: {
      P: group("P", world(100, 50), ["G"], "P"),
      G: group("G", world(30, 20), ["K"], g_title),
      K: kozane("K", world(5, 6)),
      X: kozane("X", world(0, 0)),
    },
    annotations: [
      { type: "line", items: [id("G"), id("X")], heads: ["none", "none"], custom: {} },
    ],
  });
};

describe("ungroup a nested group", () => {
  test("keeps the children where they are on the board", () => {
    setup();
    expect(get_global_position(id("K"), getGlobal())).toEqual([135, 76]);
    ungroup(id("G"));
    expect(getGlobal().itemStore["P"]!).toMatchObject({ items: ["K"] });
    expect(get_global_position(id("K"), getGlobal())).toEqual([135, 76]);
  });

  test("an untitled group is removed from itemStore with its lines", () => {
    setup();
    ungroup(id("G"));
    expect(getGlobal().itemStore["G"]).toBeUndefined();
    expect(getGlobal().annotations).toEqual([]);
  });
});
