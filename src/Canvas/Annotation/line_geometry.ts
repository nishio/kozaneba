import { State } from "reactn/default";
import { add_v2 } from "../../dimension/V2";
import { bounding_box_to_rect } from "../../dimension/bounding_box_to_rect";
import { get_item_bounding_box } from "../../dimension/get_bounding_box";
import { TRect } from "../../dimension/TRect";
import { get_total_offset_of_parents } from "../../Event/get_total_offset_of_parents";
import { TItemId } from "../../Global/TItemId";
import { find_parent } from "../../utils/find_parent";

export const get_global_item_rect = (id: TItemId, g: State): TRect => {
  const parent = find_parent(id, g);
  if (parent === null) {
    return bounding_box_to_rect(get_item_bounding_box(id));
  }
  const offset = get_total_offset_of_parents(parent, g);
  const { top, left, width, height } = bounding_box_to_rect(
    get_item_bounding_box(id)
  );
  const [left2, top2] = add_v2([left, top], offset);
  return { top: top2, left: left2, width, height };
};
