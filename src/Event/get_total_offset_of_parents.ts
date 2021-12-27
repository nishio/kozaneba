import { add_v2w } from "../dimension/V2";
import { TItemId } from "../Global/TItemId";
import { find_parent } from "../utils/find_parent";
import { get_item } from "../utils/get_item";
import { TWorldCoord } from "../dimension/world_to_screen";
import { State } from "reactn/default";

export const get_total_offset_of_parents = (parent_id: TItemId, g: State) => {
  let offset = [0, 0] as TWorldCoord;
  let current_parent = parent_id;
  while (current_parent) {
    const parent = get_item(g, current_parent);
    offset = add_v2w(offset, parent.position);
    const next_parent = find_parent(current_parent);
    if (!next_parent) {
      break;
    }
    current_parent = next_parent;
  }
  return offset;
};
