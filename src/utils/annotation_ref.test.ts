import { TAnnotation } from "../Global/TAnnotation";
import { TItemId } from "../Global/TItemId";
import {
  can_reverse,
  ref_of_annotation,
  resolve_annotation_ref,
  reversed_heads,
} from "./annotation_ref";

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
    const ref = ref_of_annotation(annotations[1]!, 1);
    expect(resolve_annotation_ref(annotations, ref)).toBe(1);
  });

  it("follows the line when an earlier one is removed", () => {
    const before = [line(["A", "B"]), line(["B", "C"])];
    const ref = ref_of_annotation(before[1]!, 1);
    expect(resolve_annotation_ref([line(["B", "C"])], ref)).toBe(0);
  });

  it("returns null when the line is gone", () => {
    const before = [line(["A", "B"]), line(["B", "C"])];
    const ref = ref_of_annotation(before[1]!, 1);
    expect(resolve_annotation_ref([line(["A", "B"])], ref)).toBeNull();
  });

  it("does not take a different line at the same index", () => {
    const before = [line(["A", "B"])];
    const ref = ref_of_annotation(before[0]!, 0);
    expect(resolve_annotation_ref([line(["X", "Y"])], ref)).toBeNull();
  });

  it("copies the items so later edits do not change the ref", () => {
    const a = line(["A", "B"]);
    const ref = ref_of_annotation(a, 0);
    a.items.push("C" as TItemId);
    expect(ref.items).toEqual(["A", "B"]);
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
