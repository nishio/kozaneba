import { State } from "reactn/default";
import { add_v2w, sub_v2w } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";
import { get_group } from "./get_group";
import { get_item } from "./get_item";
import { TItemId } from "../Global/TItemId";
import { update_global_with_optional_draft } from "../Global/update_global_with_optional_draft";
import { get_middle_point } from "../Canvas/Annotation/get_middle_point";
import { find_parent } from "./find_parent";

export const normalize_group_position = (gid: TItemId, draft?: State) => {
  update_global_with_optional_draft(draft, (g) => {
    const group = get_group(g, gid);
    if (group.items.length === 0) return;
    const positions = group.items.map((id) => {
      const item = get_item(g, id);
      return item.position;
    });
    const middle_point = get_middle_point(positions) as TWorldCoord;
    group.items.forEach((id) => {
      const item = get_item(g, id);
      item.position = sub_v2w(item.position, middle_point);
    });
    group.position = add_v2w(group.position, middle_point);

    // Walk up inside this same update: pass `g`, not `draft`. Without a draft
    // `draft` is undefined, and the recursive call would run a second
    // updateGlobal that reads the state from before this update and is then
    // overwritten by it, so the ancestors were never re-centered.
    const parent = find_parent(gid, g);
    if (parent !== null) {
      normalize_group_position(parent, g);
    }
  });
};
