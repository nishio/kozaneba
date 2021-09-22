import { TItemId } from "../Global/TItemId";
import { TArrowHead } from "../Global/TAnnotation";
import { updateGlobal } from "../Global/updateGlobal";
import { mark_local_changed } from "../utils/mark_local_changed";

const THICK_ARROW = {
  stroke_width: 10,
  arrow_head_size: 30,
  opacity: 1,
  is_clickable: true,
};

export const add_arrow = (ids: TItemId[], heads: TArrowHead[], custom = {}) => {
  updateGlobal((g) => {
    g.annotations.push({
      type: "line",
      items: ids,
      heads: heads,
      custom: THICK_ARROW,
    });
  });
  mark_local_changed();
};
