import { TAnnotation } from "../Global/TAnnotation";
import { TItemId } from "../Global/TItemId";

// Annotations have no id, and their array index shifts when another client's
// save arrives or a line is deleted. A reference keeps the index together with
// the connected items, and is resolved again every time it is used.
export type TAnnotationRef = { index: number; items: TItemId[] };

export const ref_of_annotation = (
  a: TAnnotation,
  index: number
): TAnnotationRef => ({ index, items: [...a.items] });

const has_items = (a: TAnnotation | undefined, items: TItemId[]) =>
  a !== undefined &&
  a.items.length === items.length &&
  a.items.every((id, i) => id === items[i]);

// The current index of the referenced annotation, or null when it is gone.
// When it moved, the first annotation with the same items is taken.
export const resolve_annotation_ref = (
  annotations: TAnnotation[],
  ref: TAnnotationRef | null
): number | null => {
  if (ref === null) return null;
  if (has_items(annotations[ref.index], ref.items)) return ref.index;
  const index = annotations.findIndex((a) => has_items(a, ref.items));
  return index === -1 ? null : index;
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
