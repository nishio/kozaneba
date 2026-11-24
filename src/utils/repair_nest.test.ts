import { describe, expect, test, vi } from "vitest";
import { expectWellFormed } from "./expect_well_formed";
import { repair_nest, report_nest_repair } from "./repair_nest";

const sentry = vi.hoisted(() => ({ captureMessage: vi.fn() }));
vi.mock("../initSentry", () => ({ Sentry: sentry }));

// Plain data as it comes from a doc: positions matter for the rescue only.
type TItemLike = {
  type: string;
  id: string;
  text: string;
  position: number[];
  items?: string[];
};
type TLine = {
  type: "line";
  items: string[];
  heads: string[];
  is_doubled: boolean;
  custom: {};
};
const kozane = (id: string, position = [0, 0]): TItemLike => ({
  type: "kozane",
  id,
  text: `text of ${id}`,
  position,
});
const group = (id: string, items: string[], position = [0, 0]): TItemLike => ({
  type: "group",
  id,
  text: "",
  position,
  items,
});
const line = (...items: string[]): TLine => ({
  type: "line",
  items,
  heads: items.map((_, i) => (i === items.length - 1 ? "arrow" : "none")),
  is_doubled: false,
  custom: {},
});
const nest = (
  drawOrder: string[],
  items: TItemLike[],
  annotations: TLine[] = []
) => {
  const itemStore: { [id: string]: TItemLike } = {};
  items.forEach((x) => {
    itemStore[x.id] = x;
  });
  return { itemStore, drawOrder, annotations };
};
const items_of = (n: ReturnType<typeof nest>, id: string) =>
  n.itemStore[id]!.items;

describe("repair_nest", () => {
  test("a well-formed Ba is returned as is, without a report", () => {
    const input = nest(
      ["A", "k3"],
      [group("A", ["k1", "B"]), group("B", ["k2"]), kozane("k1"), kozane("k2"), kozane("k3")],
      [line("k1", "k3")]
    );
    const before = JSON.stringify(input);
    const { nest: out, report } = repair_nest(input);
    expect(out).toBe(input);
    expect(out.itemStore).toBe(input.itemStore);
    expect(out.drawOrder).toBe(input.drawOrder);
    expect(out.annotations).toBe(input.annotations);
    expect(report).toBeNull();
    expect(JSON.stringify(input)).toBe(before);
  });

  test("an empty Ba is returned as is", () => {
    const input = nest([], []);
    expect(repair_nest(input).nest).toBe(input);
  });

  // The Lean counterexample of #135: drawOrder=[0], 0 is a kozane, edit it
  // into two lines -> drawOrder=[3], 3=group[1,2], 0 stays in itemStore.
  test("the orphan kozane left by replace_multiple_kozane is deleted", () => {
    const input = nest(
      ["3"],
      [kozane("0"), kozane("1"), kozane("2"), group("3", ["1", "2"])]
    );
    const { nest: out, report } = repair_nest(input);
    expectWellFormed(out);
    expect(Object.keys(out.itemStore).sort()).toEqual(["1", "2", "3"]);
    expect(out.drawOrder).toBe(input.drawOrder);
    expect(report).toEqual({ orphans: 1, deleted: 1, dangling: 0, duplicates: 0, cycles: 0 });
    // the input is not changed
    expect(input.itemStore["0"]).toBeDefined();
  });

  test("an orphan group is deleted with its children", () => {
    const input = nest(
      ["k1"],
      [kozane("k1"), group("G", ["H", "k2"]), group("H", ["k3"]), kozane("k2"), kozane("k3")]
    );
    const { nest: out, report } = repair_nest(input);
    expectWellFormed(out);
    expect(Object.keys(out.itemStore)).toEqual(["k1"]);
    expect(report).toEqual({ orphans: 1, deleted: 4, dangling: 0, duplicates: 0, cycles: 0 });
  });

  test("an orphan group that also holds a placed item does not delete it", () => {
    // G is not placed; k1 is placed at the top and also listed in G
    const input = nest(["k1"], [kozane("k1"), group("G", ["k1", "k2"]), kozane("k2")]);
    const { nest: out } = repair_nest(input);
    expectWellFormed(out);
    expect(Object.keys(out.itemStore)).toEqual(["k1"]);
  });

  test("lines to deleted items lose that end, and go when fewer than two ends are left", () => {
    const input = nest(
      ["k1", "k2", "k3"],
      [kozane("k0"), kozane("k1"), kozane("k2"), kozane("k3")],
      [line("k0", "k1"), line("k1", "k0", "k2", "k3"), line("k2", "k3")]
    );
    const { nest: out } = repair_nest(input);
    expectWellFormed(out);
    expect(out.annotations).toEqual([
      { ...line("k1", "k2", "k3"), heads: ["none", "none", "arrow"] },
      line("k2", "k3"),
    ]);
    // the untouched line is the same object
    expect(out.annotations![1]).toBe(input.annotations[2]);
  });

  test("dangling ids are removed from drawOrder and from groups", () => {
    const input = nest(["x", "A", "y"], [group("A", ["k1", "z"]), kozane("k1")]);
    const { nest: out, report } = repair_nest(input);
    expectWellFormed(out);
    expect(out.drawOrder).toEqual(["A"]);
    expect(items_of(out, "A")).toEqual(["k1"]);
    expect(report).toEqual({ orphans: 0, deleted: 0, dangling: 3, duplicates: 0, cycles: 0 });
  });

  test("an id that is a key of Object.prototype counts as dangling", () => {
    const input = nest(["constructor", "k1"], [kozane("k1")]);
    const { nest: out } = repair_nest(input);
    expect(out.drawOrder).toEqual(["k1"]);
  });

  test("an item both in drawOrder and in a group keeps the first place (depth first)", () => {
    const input = nest(["A", "k1"], [group("A", ["k1", "k2"]), kozane("k1"), kozane("k2")]);
    const { nest: out, report } = repair_nest(input);
    expectWellFormed(out);
    expect(out.drawOrder).toEqual(["A"]);
    expect(items_of(out, "A")).toEqual(["k1", "k2"]);
    expect(report!.duplicates).toBe(1);

    const input2 = nest(["k1", "A"], [group("A", ["k1", "k2"]), kozane("k1"), kozane("k2")]);
    const out2 = repair_nest(input2).nest;
    expectWellFormed(out2);
    expect(out2.drawOrder).toEqual(["k1", "A"]);
    expect(items_of(out2, "A")).toEqual(["k2"]);
    // the input group is not changed
    expect(items_of(input2, "A")).toEqual(["k1", "k2"]);
  });

  test("an item in two groups, or twice in one, keeps the first place", () => {
    const input = nest(
      ["A", "B"],
      [group("A", ["B2", "k1", "k1"]), group("B2", ["k1"]), group("B", ["k1"]), kozane("k1")]
    );
    const { nest: out } = repair_nest(input);
    expectWellFormed(out);
    // depth first: A -> B2 -> k1 comes before A's own k1
    expect(items_of(out, "B2")).toEqual(["k1"]);
    expect(items_of(out, "A")).toEqual(["B2"]);
    expect(items_of(out, "B")).toEqual([]);
  });

  test("a cycle reachable from drawOrder is cut where it comes back", () => {
    const input = nest(["A"], [group("A", ["B"]), group("B", ["A", "k1"]), kozane("k1")]);
    const { nest: out, report } = repair_nest(input);
    expectWellFormed(out);
    expect(items_of(out, "A")).toEqual(["B"]);
    expect(items_of(out, "B")).toEqual(["k1"]);
    expect(report).toEqual({ orphans: 0, deleted: 0, dangling: 0, duplicates: 1, cycles: 0 });
  });

  test("a group that holds itself is cut", () => {
    const input = nest(["A"], [group("A", ["A", "k1"]), kozane("k1")]);
    const { nest: out } = repair_nest(input);
    expectWellFormed(out);
    expect(items_of(out, "A")).toEqual(["k1"]);
  });

  // The Lean counterexample for the drop without a descendant guard (#136):
  // drawOrder=[], 0=group[1], 1=group[0].
  test("a cycle drawOrder does not reach is brought back, not deleted", () => {
    const input = nest([], [group("0", ["1"], [10, 20]), group("1", ["0"], [-5, 3])]);
    const { nest: out, report } = repair_nest(input);
    expectWellFormed(out);
    expect(out.drawOrder).toEqual(["0"]);
    expect(items_of(out, "0")).toEqual(["1"]);
    expect(items_of(out, "1")).toEqual([]);
    expect(report).toEqual({ orphans: 0, deleted: 0, dangling: 0, duplicates: 1, cycles: 1 });
    // the position is kept as is (there is no world position to convert to)
    expect(out.itemStore["0"]!.position).toEqual([10, 20]);
  });

  test("the item brought back is the smallest id on the cycle, not a child hanging from it", () => {
    // a < b, but a hangs from the cycle c -> d -> c
    const input = nest(
      ["k"],
      [kozane("k"), group("c", ["d"]), group("d", ["c", "a"]), kozane("a")]
    );
    const { nest: out, report } = repair_nest(input);
    expectWellFormed(out);
    expect(out.drawOrder).toEqual(["k", "c"]);
    expect(items_of(out, "c")).toEqual(["d"]);
    expect(items_of(out, "d")).toEqual(["a"]);
    expect(report!.cycles).toBe(1);
    expect(Object.keys(out.itemStore).length).toBe(4);
  });

  test("two separate unreached cycles are both brought back", () => {
    const input = nest(
      [],
      [group("p", ["q"]), group("q", ["p"]), group("x", ["y"]), group("y", ["x"])]
    );
    const { nest: out, report } = repair_nest(input);
    expectWellFormed(out);
    expect(out.drawOrder).toEqual(["p", "x"]);
    expect(report!.cycles).toBe(2);
  });

  test("a cycle under an orphan group is deleted with it", () => {
    const input = nest(["k"], [kozane("k"), group("R", ["A"]), group("A", ["B"]), group("B", ["A"])]);
    const { nest: out, report } = repair_nest(input);
    expectWellFormed(out);
    expect(Object.keys(out.itemStore)).toEqual(["k"]);
    expect(report).toEqual({ orphans: 1, deleted: 3, dangling: 0, duplicates: 0, cycles: 0 });
  });

  // Review of #139: d is held by the orphan group R and by c1 on an
  // unreached cycle. Deleting d with R left "d" in c1 (dangling).
  test("an item an orphan group shares with an unreached cycle is kept under the cycle", () => {
    const input = nest(
      [],
      [group("R", ["d"]), kozane("d"), group("c1", ["c2", "d"]), group("c2", ["c1"])]
    );
    const { nest: out, report } = repair_nest(input);
    expectWellFormed(out);
    expect(out.drawOrder).toEqual(["c1"]);
    expect(items_of(out, "c1")).toEqual(["c2", "d"]);
    expect(out.itemStore["R"]).toBeUndefined();
    expect(out.itemStore["d"]).toBeDefined();
    expect(report).toEqual({ orphans: 1, deleted: 1, dangling: 0, duplicates: 1, cycles: 1 });
    const twice = repair_nest(out);
    expect(twice.nest).toBe(out);
    expect(twice.report).toBeNull();
  });

  test("a shared group under an orphan is kept with what it holds, the rest of the orphan goes", () => {
    // R -> H -> (k, S); S -> (j); the cycle c1 <-> c2 also holds S
    const input = nest(
      ["top"],
      [
        kozane("top"),
        group("R", ["H"]),
        group("H", ["k", "S"]),
        kozane("k"),
        group("S", ["j"]),
        kozane("j"),
        group("c1", ["c2"]),
        group("c2", ["c1", "S"]),
      ],
      [line("k", "j"), line("top", "k", "j")]
    );
    const { nest: out, report } = repair_nest(input);
    expectWellFormed(out);
    expect(Object.keys(out.itemStore).sort()).toEqual(["S", "c1", "c2", "j", "top"]);
    expect(out.drawOrder).toEqual(["top", "c1"]);
    expect(items_of(out, "c2")).toEqual(["S"]);
    expect(items_of(out, "S")).toEqual(["j"]);
    expect(out.annotations).toEqual([{ ...line("top", "j"), heads: ["none", "arrow"] }]);
    expect(report).toEqual({ orphans: 1, deleted: 3, dangling: 0, duplicates: 1, cycles: 1 });
  });

  // pasted JSON reaches repair_nest before its items and lines are checked
  test("a null item or a null line does not throw", () => {
    const input = {
      itemStore: { k1: kozane("k1"), n: null, o: kozane("o") } as never,
      drawOrder: ["k1", "n"],
      annotations: [null, line("o", "k1")] as never[],
    };
    const { nest: out } = repair_nest(input);
    expect(out.itemStore).not.toHaveProperty("o");
    expect(out.annotations).toEqual([null]);
  });

  test("the items of a non-group are not followed", () => {
    const k = { ...kozane("k1"), items: ["k2"] };
    const input = nest(["k1", "k2"], [k, kozane("k2")]);
    const { nest: out } = repair_nest(input);
    expect(out).toBe(input);
  });

  test("a repaired Ba needs no more repair", () => {
    const input = nest(
      ["x", "A", "k1"],
      [group("A", ["k1", "B"]), group("B", ["A"]), kozane("k1"), kozane("o"), group("p", ["q"]), group("q", ["p"])],
      [line("o", "k1")]
    );
    const once = repair_nest(input).nest;
    expectWellFormed(once);
    const twice = repair_nest(once);
    expect(twice.nest).toBe(once);
    expect(twice.report).toBeNull();
  });
});

describe("report_nest_repair", () => {
  test("sends only the counts", () => {
    sentry.captureMessage.mockClear();
    const { report } = repair_nest(nest(["3"], [kozane("0"), kozane("1"), group("3", ["1"])]));
    report_nest_repair(report, "snapshot");
    expect(sentry.captureMessage).toHaveBeenCalledTimes(1);
    const [message, context] = sentry.captureMessage.mock.calls[0]!;
    expect(JSON.stringify([message, context])).not.toContain("text of");
    expect(context.extra).toEqual({
      where: "snapshot",
      orphans: 1,
      deleted: 1,
      dangling: 0,
      duplicates: 0,
      cycles: 0,
    });
  });

  test("sends nothing when nothing was repaired", () => {
    sentry.captureMessage.mockClear();
    report_nest_repair(null, "snapshot");
    expect(sentry.captureMessage).not.toHaveBeenCalled();
  });

  test("with a key, sends once per key and place", () => {
    sentry.captureMessage.mockClear();
    const { report } = repair_nest(nest(["3"], [kozane("0"), group("3", [])]));
    report_nest_repair(report, "snapshot", "ba-once");
    report_nest_repair(report, "snapshot", "ba-once");
    expect(sentry.captureMessage).toHaveBeenCalledTimes(1);
    report_nest_repair(report, "snapshot", "ba-other");
    report_nest_repair(report, "backup");
    report_nest_repair(report, "backup");
    expect(sentry.captureMessage).toHaveBeenCalledTimes(4);
  });
});
