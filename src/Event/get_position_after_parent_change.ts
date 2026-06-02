import { State } from "reactn/default";
import { add_v2w, sub_v2w } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";
import { TItemId } from "../Global/TItemId";
import { get_total_offset_of_parents } from "./get_total_offset_of_parents";

export const get_position_after_parent_change = (
  position: TWorldCoord,
  previous_parent: TItemId | null,
  next_parent: TItemId,
  g: State
): TWorldCoord => {
  const next_offset = get_total_offset_of_parents(next_parent, g);
  if (previous_parent === null) {
    return sub_v2w(position, next_offset);
  }

  const previous_offset = get_total_offset_of_parents(previous_parent, g);
  return sub_v2w(add_v2w(position, previous_offset), next_offset);
};
