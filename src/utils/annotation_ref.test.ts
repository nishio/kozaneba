import { TAnnotation } from "../Global/TAnnotation";
import { TItemId } from "../Global/TItemId";
import { State } from "reactn/default";
import {
  can_reverse,
  ref_of_annotation,
  resolve_annotation_ref,
  reversed_heads,
} from "./annotation_ref";
import { update_annotation_after_deletion } from "./update_annotation_after_deletion";

const line = (items: string[], heads?: TAnnotation["heads"]): TAnnotation => ({
  type: "line",
  items: items as TItemId[],
  heads: heads ?? items.map(() => "none"),
  is_doubled: false,
  custom: {},
});

describe("resolve_annotation_ref", () => {
  it("keeps the index while the line is still there", () => {
    const annotations = [line(["A", "B"]), line(["B", "C"])];
    const ref = ref_of_annotation(annotations, 1);
    expect(resolve_annotation_ref(annotations, ref)).toBe(1);
  });

  it("follows the line when an earlier one is removed", () => {
    const before = [line(["A", "B"]), line(["B", "C"])];
    const ref = ref_of_annotation(before, 1);
    expect(resolve_annotation_ref([line(["B", "C"])], ref)).toBe(0);
  });

  it("returns null when the line is gone", () => {
    const before = [line(["A", "B"]), line(["B", "C"])];
    const ref = ref_of_annotation(before, 1);
    expect(resolve_annotation_ref([line(["A", "B"])], ref)).toBeNull();
  });

  it("does not take a different line at the same index", () => {
    const before = [line(["A", "B"])];
    const ref = ref_of_annotation(before, 0);
    expect(resolve_annotation_ref([line(["X", "Y"])], ref)).toBeNull();
  });

  it("copies the items so later edits do not change the ref", () => {
    const a = line(["A", "B"]);
    const ref = ref_of_annotation([a], 0);
    a.items.push("C" as TItemId);
    expect(ref.items).toEqual(["A", "B"]);
  });
});

// Two lines between the same kozane (e.g. a plain line and an arrow from A to
// B) have the same items. These cases took the other line before the fix; the
// Lean model (verification/lean-annotation-ref) checks them exhaustively.
describe("resolve_annotation_ref with lines of the same items", () => {
  const labeled = (items: string[], label: string) => ({
    ...line(items),
    label,
  });

  it("keeps each of them apart while nothing changes", () => {
    const annotations = [labeled(["A", "B"], "first"), labeled(["A", "B"], "second")];
    expect(resolve_annotation_ref(annotations, ref_of_annotation(annotations, 0))).toBe(0);
    expect(resolve_annotation_ref(annotations, ref_of_annotation(annotations, 1))).toBe(1);
  });

  it("follows the second one when an unrelated earlier line is removed", () => {
    const before = [
      labeled(["P", "Q"], "pq"),
      labeled(["A", "B"], "first"),
      labeled(["A", "B"], "second"),
    ];
    const ref = ref_of_annotation(before, 2);
    const after = [before[1]!, before[2]!];
    expect(resolve_annotation_ref(after, ref)).toBe(1);
  });

  it("follows it when another one changes its label or heads", () => {
    const before = [labeled(["A", "B"], "first"), labeled(["A", "B"], "second")];
    const ref = ref_of_annotation(before, 1);
    const after = [
      { ...before[0]!, label: "changed", heads: ["none", "arrow"] as TAnnotation["heads"] },
      before[1]!,
    ];
    expect(resolve_annotation_ref(after, ref)).toBe(1);
  });

  it("returns null when the referenced one is removed, not the other one", () => {
    const before = [labeled(["A", "B"], "first"), labeled(["A", "B"], "second")];
    expect(resolve_annotation_ref([before[1]!], ref_of_annotation(before, 0))).toBeNull();
    expect(resolve_annotation_ref([before[0]!], ref_of_annotation(before, 1))).toBeNull();
  });

  it("returns null when a line with the same items is added", () => {
    const before = [labeled(["A", "B"], "first")];
    const ref = ref_of_annotation(before, 0);
    expect(resolve_annotation_ref([...before, labeled(["A", "B"], "new")], ref)).toBeNull();
  });

  it("does not take a line whose items shrank to the same items when a kozane is deleted", () => {
    const g = {
      annotations: [
        labeled(["Z", "W"], "zw"),
        labeled(["A", "B", "Z"], "abz"),
        labeled(["A", "B"], "ab"),
      ],
    } as unknown as State;
    const ref = ref_of_annotation(g.annotations, 2);
    update_annotation_after_deletion(g, "Z" as TItemId);
    // now [ab (was abz), ab]: which one is ours cannot be told apart by
    // items, so the dialog closes (before the fix it took "abz")
    expect(g.annotations.map((a) => a.label)).toEqual(["abz", "ab"]);
    expect(resolve_annotation_ref(g.annotations, ref)).toBeNull();
  });
});

describe("reversed_heads", () => {
  it("moves the arrow to the other end of a two-item line", () => {
    expect(reversed_heads(["none", "arrow"])).toEqual(["arrow", "none"]);
    expect(reversed_heads(["arrow", "none"])).toEqual(["none", "arrow"]);
  });

  it("flips each end of a line with three or more items", () => {
    expect(reversed_heads(["none", "none", "arrow"])).toEqual([
      "arrow",
      "arrow",
      "none",
    ]);
  });

  it("leaves lines without a direction as they are", () => {
    expect(can_reverse(["none", "none"])).toBe(false);
    expect(can_reverse(["arrow", "arrow"])).toBe(false);
    expect(can_reverse(["none", "arrow"])).toBe(true);
  });
});
