import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TGroupItem } from "../Global/TGroupItem";
import { TItemId } from "../Global/TItemId";
import { TKozaneItem } from "../Global/TKozaneItem";
import { TWorldCoord } from "../dimension/world_to_screen";
import { replace_multiple_kozane } from "./add_multiple_kozane";

vi.mock("../API/redraw", () => ({ redraw: vi.fn() }));

// Editing a kozane into several lines (EditKozaneDialog) replaces it with a
// new group of new kozane. The edited kozane must leave itemStore too: it used
// to stay there with no parent, an invisible orphan saved to Firestore. The
// Lean model of the nesting invariants (2026-11-24) found this on every board
// it checked.

const id = (value: string) => value as TItemId;
const world = (x: number, y: number) => [x, y] as TWorldCoord;
const kozane = (value: string, position: TWorldCoord): TKozaneItem => ({
  type: "kozane",
  id: id(value),
  text: value,
  position,
  scale: 1,
});
const group = (value: string, position: TWorldCoord, items: string[]): TGroupItem => ({
  type: "group",
  id: id(value),
  text: value,
  position,
  items: items.map(id),
  scale: 1,
  isOpen: true,
});

const setup = (partial: Partial<State>) => {
  setGlobal({
    ...INITIAL_GLOBAL_STATE,
    dialog: "EditKozane",
    ...partial,
  } as State);
};

// every item in itemStore sits exactly once in drawOrder or in one group's
// items, and nothing points at a missing id
const expect_nesting_invariants = (g: State) => {
  const placements: string[] = [...g.drawOrder];
  Object.values(g.itemStore).forEach((item) => {
    if (item.type === "group") placements.push(...item.items);
  });
  placements.forEach((p) => expect(g.itemStore[p]).toBeDefined());
  expect([...placements].sort()).toEqual(Object.keys(g.itemStore).sort());
};

const new_ids = (before: string[]) =>
  Object.keys(getGlobal().itemStore).filter((k) => !before.includes(k));

describe("replace_multiple_kozane (edit a kozane into several lines)", () => {
  test("a top-level kozane is removed from itemStore, not left as an orphan", () => {
    setup({
      drawOrder: [id("A"), id("B")],
      itemStore: { A: kozane("A", world(10, 20)), B: kozane("B", world(0, 0)) },
      clicked_target: id("A"),
    });
    replace_multiple_kozane("x\ny");

    const g = getGlobal();
    expect(g.itemStore["A"]).toBeUndefined();
    const [gid] = g.drawOrder.filter((k) => k !== "B");
    const new_group = g.itemStore[gid!] as TGroupItem;
    expect(g.drawOrder).toEqual(["B", gid]);
    expect(new_group.type).toBe("group");
    expect(new_group.position).toEqual([10, 20]);
    expect(new_group.items.map((k) => g.itemStore[k]!.text)).toEqual(["x", "y"]);
    expect_nesting_invariants(g);
  });

  test("a kozane inside a group is replaced in its parent and removed from itemStore", () => {
    setup({
      drawOrder: [id("P")],
      itemStore: {
        P: group("P", world(100, 50), ["K", "L"]),
        K: kozane("K", world(5, 6)),
        L: kozane("L", world(0, 0)),
      },
      clicked_target: id("K"),
    });
    replace_multiple_kozane("x\ny\nz");

    const g = getGlobal();
    expect(g.itemStore["K"]).toBeUndefined();
    expect(g.drawOrder).toEqual(["P"]);
    const parent = g.itemStore["P"] as TGroupItem;
    expect(parent.items[0]).toBe("L");
    const new_group = g.itemStore[parent.items[1]!] as TGroupItem;
    expect(parent.items).toHaveLength(2);
    // the position is relative to the parent, as the kozane's was
    expect(new_group.position).toEqual([5, 6]);
    expect(new_group.items.map((k) => g.itemStore[k]!.text)).toEqual(["x", "y", "z"]);
    expect_nesting_invariants(g);
  });

  test("lines to the replaced kozane are removed", () => {
    setup({
      drawOrder: [id("A"), id("B")],
      itemStore: { A: kozane("A", world(0, 0)), B: kozane("B", world(0, 0)) },
      annotations: [
        { type: "line", items: [id("A"), id("B")], heads: ["none", "none"], is_doubled: false, custom: {} },
      ],
      clicked_target: id("A"),
    });
    replace_multiple_kozane("x\ny");
    expect(getGlobal().annotations).toEqual([]);
  });

  test("clicked_target no longer names the deleted kozane", () => {
    setup({
      drawOrder: [id("A")],
      itemStore: { A: kozane("A", world(0, 0)) },
      clicked_target: id("A"),
    });
    replace_multiple_kozane("x\ny");
    const g = getGlobal();
    expect(g.clicked_target).toBe("");
    expect(g.dialog).toBe("");
  });

  test("a single line only replaces the text and keeps the same kozane", () => {
    setup({
      drawOrder: [id("P"), id("B")],
      itemStore: {
        P: group("P", world(100, 50), ["K", "L"]),
        K: kozane("K", world(5, 6)),
        L: kozane("L", world(0, 0)),
        B: kozane("B", world(0, 0)),
      },
      clicked_target: id("K"),
    });
    const before = Object.keys(getGlobal().itemStore);
    replace_multiple_kozane("new text");

    const g = getGlobal();
    expect(new_ids(before)).toEqual([]);
    expect(g.itemStore["K"]).toMatchObject({ text: "new text", position: [5, 6] });
    // moved to the front, parent first
    expect((g.itemStore["P"] as TGroupItem).items).toEqual(["L", "K"]);
    expect(g.drawOrder).toEqual(["B", "P"]);
    expect(g.clicked_target).toBe("K");
    expect_nesting_invariants(g);
  });
});
