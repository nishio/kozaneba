import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { vi } from "vitest";
import { INITIAL_GLOBAL_STATE } from "../Global/initializeGlobalState";
import { TGroupItem } from "../Global/TGroupItem";
import { TItemId } from "../Global/TItemId";
import { TKozaneItem } from "../Global/TKozaneItem";
import { TWorldCoord } from "../dimension/world_to_screen";
import { Sentry } from "../initSentry";
import { drag_drop_item_into_group } from "./drag_drop_item_into_group";
import { drag_drop_selection_into_group } from "./drag_drop_selection_into_group";

// The drop handlers themselves must refuse to put a group inside itself or
// inside one of its own descendants. Until now only onCanvasMouseUp filtered
// those drops (drop_validity.ts); onGroupMouseUp called the handlers directly.
//
// Counterexample found by the Lean model of the nesting invariants
// (2026-11-24): drawOrder=[0], 0=group[1], 1=group[];
// drag_drop_item_into_group(1, _, 0) gave drawOrder=[], 0.items=[1],
// 1.items=[0] -- a cycle that is saved but no longer drawn.

vi.mock("./fast_drag_manager", () => ({ reset_target: vi.fn() }));
vi.mock("../initSentry", () => ({ Sentry: { captureMessage: vi.fn() } }));

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
  // titled, so a group emptied by a move is never auto-removed
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
    itemStore: Object.fromEntries(
      Object.entries(partial.itemStore ?? {}).map(([k, v]) => [
        k,
        v.type === "group" ? { ...v, items: [...v.items] } : { ...v },
      ])
    ),
    selected_items: [...(partial.selected_items ?? [])],
    selectionRange: {
      ...(partial.selectionRange ?? { top: 0, left: 0, width: 0, height: 0 }),
    },
  } as State);
};

// The invariant checked by the Lean model:
// every item in itemStore appears exactly once, either in drawOrder or in the
// items of exactly one group; nothing points to a missing id; there is no
// cycle (everything is reachable from drawOrder); only groups have children.
const invariantViolations = (state: State): string[] => {
  const problems: string[] = [];
  const count: Record<string, number> = {};
  const bump = (x: TItemId) => {
    count[x] = (count[x] ?? 0) + 1;
    if (state.itemStore[x] === undefined) problems.push(`dangling ${x}`);
  };
  state.drawOrder.forEach(bump);
  Object.values(state.itemStore).forEach((item) => {
    if (item.type === "group") item.items.forEach(bump);
    else if ((item as { items?: unknown }).items !== undefined) {
      problems.push(`non-group ${item.id} has children`);
    }
  });
  Object.keys(state.itemStore).forEach((x) => {
    if (count[x] !== 1) problems.push(`${x} appears ${count[x] ?? 0} times`);
  });
  const reached = new Set<string>();
  const visit = (x: TItemId, depth: number) => {
    if (depth > 100 || reached.has(x)) return;
    reached.add(x);
    const item = state.itemStore[x];
    if (item?.type === "group") item.items.forEach((c) => visit(c, depth + 1));
  };
  state.drawOrder.forEach((x) => visit(x, 0));
  Object.keys(state.itemStore).forEach((x) => {
    if (!reached.has(x)) problems.push(`${x} is not reachable from drawOrder`);
  });
  return problems;
};

const groupItems = (gid: string) =>
  (getGlobal().itemStore[gid] as TGroupItem).items;

const captureMessage = vi.mocked(Sentry.captureMessage);

beforeEach(() => {
  captureMessage.mockClear();
});

describe("drag_drop_item_into_group refuses self / descendant targets", () => {
  test("Lean counterexample: dropping a group into its own child makes no cycle", () => {
    resetGlobal({
      drawOrder: [id("0")],
      itemStore: {
        "0": group("0", world(10, 20), ["1"]),
        "1": group("1", world(3, 4), []),
      },
    });

    drag_drop_item_into_group(id("1"), world(50, 60), id("0"));

    const g = getGlobal();
    expect(invariantViolations(g)).toEqual([]);
    expect(g.drawOrder).toEqual([id("0")]);
    expect(groupItems("0")).toEqual([id("1")]);
    expect(groupItems("1")).toEqual([]);
    // falls back to a plain move (drag_drop_item): the group lands at delta
    expect(g.itemStore["0"]!.position).toEqual(world(50, 60));
    expect(g.drag_target).toBe("");
    expect(captureMessage).toHaveBeenCalledWith(
      "drag_drop_item_into_group: group_id is a descendant of target_id"
    );
  });

  test("dropping a nested group into its grandchild makes no cycle", () => {
    // R > A > B > C : drop A into C
    resetGlobal({
      drawOrder: [id("R")],
      itemStore: {
        R: group("R", world(0, 0), ["A"]),
        A: group("A", world(10, 10), ["B"]),
        B: group("B", world(5, 5), ["C"]),
        C: group("C", world(1, 1), []),
      },
    });

    drag_drop_item_into_group(id("C"), world(7, 8), id("A"));

    const g = getGlobal();
    expect(invariantViolations(g)).toEqual([]);
    expect(groupItems("C")).toEqual([]);
    expect(groupItems("B")).toEqual([id("C")]);
    expect(groupItems("A")).toEqual([id("B")]);
  });

  test("dropping a group onto itself keeps the existing Sentry message", () => {
    resetGlobal({
      drawOrder: [id("G")],
      itemStore: {
        G: group("G", world(10, 20), ["K"]),
        K: kozane("K", world(1, 1)),
      },
    });

    drag_drop_item_into_group(id("G"), world(30, 40), id("G"));

    const g = getGlobal();
    expect(invariantViolations(g)).toEqual([]);
    expect(groupItems("G")).toEqual([id("K")]);
    expect(g.itemStore.G!.position).toEqual(world(30, 40));
    expect(captureMessage).toHaveBeenCalledWith(
      "drag_drop_item_into_group: target_id === group_id"
    );
  });

  test("an ordinary drop into a group is unchanged", () => {
    resetGlobal({
      drawOrder: [id("G"), id("H"), id("K")],
      itemStore: {
        G: group("G", world(100, 50), ["G1"]),
        G1: kozane("G1", world(0, 0)),
        H: group("H", world(-50, 0), ["H1"]),
        H1: kozane("H1", world(0, 0)),
        K: kozane("K", world(150, 100)),
      },
    });

    drag_drop_item_into_group(id("G"), world(150, 100), id("K"));
    drag_drop_item_into_group(id("G"), world(-50, 0), id("H"));

    const g = getGlobal();
    expect(invariantViolations(g)).toEqual([]);
    expect(groupItems("G")).toEqual([id("G1"), id("K"), id("H")]);
    expect(g.drawOrder).toEqual([id("G")]);
    expect(captureMessage).not.toHaveBeenCalled();
  });

  // Every (group, target) pair on a small nested board.
  //   A > [B > [C > [c1]], b1]
  //   D > [d1]
  //   K
  const board = () =>
    resetGlobal({
      drawOrder: [id("A"), id("D"), id("K")],
      itemStore: {
        A: group("A", world(100, 50), ["B", "b1"]),
        B: group("B", world(30, 20), ["C"]),
        C: group("C", world(5, 6), ["c1"]),
        c1: kozane("c1", world(1, 2)),
        b1: kozane("b1", world(3, 4)),
        D: group("D", world(-200, -100), ["d1"]),
        d1: kozane("d1", world(2, 3)),
        K: kozane("K", world(300, 0)),
      },
    });
  const groups = ["A", "B", "C", "D"];
  const items = ["A", "B", "C", "c1", "b1", "D", "d1", "K"];

  test.each(groups.flatMap((gid) => items.map((t) => [gid, t])))(
    "drop %s <- %s keeps the nesting invariant",
    (gid, target) => {
      board();
      drag_drop_item_into_group(id(gid), world(11, 12), id(target));
      expect(invariantViolations(getGlobal())).toEqual([]);
    }
  );
});

describe("drag_drop_selection_into_group refuses selected / descendant targets", () => {
  // A > B > C ; K
  const board = (selected: string[]) =>
    resetGlobal({
      drawOrder: [id("A"), id("K"), id("X")],
      itemStore: {
        A: group("A", world(100, 50), ["B"]),
        B: group("B", world(30, 20), ["C"]),
        C: group("C", world(5, 6), []),
        K: kozane("K", world(300, 0)),
        X: group("X", world(-100, 0), []),
      },
      selected_items: selected.map(id),
      is_selected: selected.length > 0,
      selectionRange: { top: 10, left: 20, width: 30, height: 40 },
    });

  test("dropping a selection into a descendant of a selected group makes no cycle", () => {
    board(["A", "K"]);

    drag_drop_selection_into_group(id("B"), world(5, 7));

    const g = getGlobal();
    expect(invariantViolations(g)).toEqual([]);
    expect(g.drawOrder).toEqual([id("A"), id("K"), id("X")]);
    expect(groupItems("B")).toEqual([id("C")]);
    // falls back to a plain selection move (drag_drop_selection), which
    // keeps the selection, like onCanvasMouseUp does
    expect(g.itemStore.A!.position).toEqual(world(105, 57));
    expect(g.itemStore.K!.position).toEqual(world(305, 7));
    expect(g.selected_items).toEqual([id("A"), id("K")]);
    expect(g.is_selected).toBe(true);
    expect(g.drag_target).toBe("");
    expect(captureMessage).toHaveBeenCalledWith(
      "drag_drop_selection_into_group: group_id is in the selection or its descendants"
    );
  });

  test("dropping a selection into a selected group makes no cycle", () => {
    board(["A"]);

    drag_drop_selection_into_group(id("A"), world(5, 7));

    const g = getGlobal();
    expect(invariantViolations(g)).toEqual([]);
    expect(g.drawOrder).toEqual([id("A"), id("K"), id("X")]);
    expect(groupItems("A")).toEqual([id("B")]);
  });

  test("an ordinary selection drop is unchanged and clears the selection", () => {
    board(["A", "K"]);

    drag_drop_selection_into_group(id("X"), world(5, 7));

    const g = getGlobal();
    expect(invariantViolations(g)).toEqual([]);
    expect(g.drawOrder).toEqual([id("X")]);
    expect(groupItems("X")).toEqual([id("A"), id("K")]);
    expect(g.selected_items).toEqual([]);
    expect(g.is_selected).toBe(false);
    expect(captureMessage).not.toHaveBeenCalled();
  });

  // Every non-empty selection of top-level items x every group.
  const tops = ["A", "K", "X"];
  const selections = [1, 2, 3, 4, 5, 6, 7].map((mask) =>
    tops.filter((_, i) => (mask >> i) & 1)
  );
  test.each(
    ["A", "B", "C", "X"].flatMap((gid) =>
      selections.map((s) => [gid, s.join(",")])
    )
  )("drop selection into %s <- [%s] keeps the nesting invariant", (gid, s) => {
    board(s.split(","));
    drag_drop_selection_into_group(id(gid), world(1, 1));
    expect(invariantViolations(getGlobal())).toEqual([]);
  });
});
