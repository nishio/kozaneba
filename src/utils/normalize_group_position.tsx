import { State } from "reactn/default";
import { add_v2w, sub_v2w } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";
import { get_group } from "./get_group";
import { get_item } from "./get_item";
import { ItemId } from "../Global/initializeGlobalState";
import { get_gravity_point } from "../dimension/get_gravity_point";
import { update_global_with_optional_draft } from "../Global/update_global_with_optional_draft";

export const normalize_group_position = (gid: ItemId, draft?: State) => {
  update_global_with_optional_draft(draft, (g) => {
    const group = get_group(g, gid);
    if (group.items.length === 0) return;
    const positions = group.items.map((id) => {
      const item = get_item(g, id);
      return item.position;
    });
    const gravity_point = get_gravity_point(positions) as TWorldCoord;
    group.items.forEach((id) => {
      const item = get_item(g, id);
      item.position = sub_v2w(item.position, gravity_point);
    });
    group.position = add_v2w(group.position, gravity_point);
  });
};
