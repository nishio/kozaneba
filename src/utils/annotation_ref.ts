import { TAnnotation } from "../Global/TAnnotation";
import { TItemId } from "../Global/TItemId";

// Annotations have no id, and their array index shifts when another client's
// save arrives or a line is deleted. A reference keeps the connected items,
// which of the lines with these items it is (`nth`, from the front) and how
// many there were (`count`), and is resolved again every time it is used.
//
// Two lines between the same kozane (a plain line and an arrow from A to B)
// have the same items. The app never reorders lines (a new line goes to the
// end, a deleted one is filtered out), so while the lines with these items
// are the same ones, the referenced line is still the nth of them. When their
// number changes we cannot tell which one is gone or new, and the reference
// resolves to null (the dialog / editor closes) instead of taking another
// line. See verification/lean-annotation-ref.
export type TAnnotationRef = { items: TItemId[]; nth: number; count: number };

const has_items = (a: TAnnotation | undefined, items: TItemId[]) =>
  a !== undefined &&
  a.items.length === items.length &&
  a.items.every((id, i) => id === items[i]);

// the indexes of the lines with these items, from the front
const indexes_with_items = (
  annotations: TAnnotation[],
  items: TItemId[]
): number[] => {
  const result: number[] = [];
  annotations.forEach((a, i) => {
    if (has_items(a, items)) result.push(i);
  });
  return result;
};

// A reference to annotations[index].
export const ref_of_annotation = (
  annotations: TAnnotation[],
  index: number
): TAnnotationRef => {
  const items = [...(annotations[index]?.items ?? [])];
  const same = indexes_with_items(annotations, items);
  return { items, nth: same.indexOf(index), count: same.length };
};

// The current index of the referenced annotation, or null when it is gone or
// a line with the same items was added or removed.
export const resolve_annotation_ref = (
  annotations: TAnnotation[],
  ref: TAnnotationRef | null
): number | null => {
  if (ref === null) return null;
  const same = indexes_with_items(annotations, ref.items);
  if (same.length !== ref.count) return null;
  return same[ref.nth] ?? null;
};

// Flip the direction of a line: ends with an arrow lose it and ends without
// one get it. With two items this moves the arrow to the other end. When all
// ends are alike (no arrows, or arrows on every end) the line has no
// direction and the same array is returned.
export const reversed_heads = (
  heads: TAnnotation["heads"]
): TAnnotation["heads"] => {
  const has_arrow = heads.some((h) => h === "arrow");
  const has_plain = heads.some((h) => h !== "arrow");
  if (!has_arrow || !has_plain) return heads;
  return heads.map((h) => (h === "arrow" ? "none" : "arrow"));
};

export const can_reverse = (heads: TAnnotation["heads"]): boolean =>
  reversed_heads(heads) !== heads;
