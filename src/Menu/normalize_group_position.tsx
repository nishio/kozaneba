import { add_v2w, sub_v2w } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";
import { get_group } from "../Event/get_group";
import { get_item } from "../Event/get_item";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { get_gravity_point } from "./get_gravity_point";

export const normalize_group_position = (gid: ItemId) => {
  updateGlobal((g) => {
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
