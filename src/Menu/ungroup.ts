import { redraw } from "../API/redraw";
import { close_menu } from "../utils/close_menu";
import { mark_local_changed } from "../utils/mark_local_changed";
import { get_group_bounding_box } from "../dimension/get_group_bounding_box";
import { add_v2w, sub_v2w } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";
import { get_group } from "../utils/get_group";
import { get_item } from "../utils/get_item";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "../utils/find_parent";
import { remove_item } from "../utils/remove_item";

export function ungroup(gid: TItemId) {
  updateGlobal((g) => {
    const group = get_group(g, gid);
    const boundingbox = get_group_bounding_box(group);
    let parent = find_parent(gid);
    if (parent === null) {
      group.items.forEach((id) => {
        g.drawOrder.push(id);
        const item = get_item(g, id);
        item.position = add_v2w(item.position, group.position);
      });
    } else {
      const new_parent = get_group(g, parent);
      group.items.forEach((id) => {
        new_parent.items.push(id);
        const item = get_item(g, id);
        item.position = sub_v2w(
          add_v2w(item.position, group.position),
          new_parent.position
        );
      });
    }
    if (group.text !== "") {
      group.items = [];
      group.position = [boundingbox.left, boundingbox.top] as TWorldCoord;
    } else {
      remove_item(g, gid);
    }
    g.clicked_target = "";
  });
  close_menu();
  mark_local_changed();
  redraw();
}
