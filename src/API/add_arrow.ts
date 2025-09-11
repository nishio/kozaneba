import { TItemId } from "../Global/TItemId";
import { TArrowHead } from "../Global/TAnnotation";
import { updateGlobal } from "../Global/updateGlobal";
import { mark_local_changed } from "../utils/mark_local_changed";

export const THICK_ARROW = {
  stroke_width: 10,
  arrow_head_size: 30,
  opacity: 1,
  is_clickable: true,
};

export const add_arrow = (
  ids: TItemId[],
  heads: TArrowHead[],
  is_doubled = false,
  custom = THICK_ARROW,
  label = ""
) => {
  const annotation = {
    type: "line" as const,
    items: ids,
    heads,
    is_doubled,
    custom,
    label: label || undefined,
  };
  updateGlobal((g) => {
    g.annotations.push(annotation);
  });
  mark_local_changed();
};
