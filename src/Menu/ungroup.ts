import { getGlobal } from "reactn";
import { redraw } from "../API/redraw";
import { close_menu } from "../AppBar/close_menu";
import { mark_local_changed } from "../Cloud/mark_local_changed";
import { get_group_bounding_box } from "../dimension/get_group_bounding_box";
import { add_v2w, sub_v2w } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";
import { get_group } from "../Event/get_group";
import { get_item } from "../Event/get_item";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "../Group/find_parent";
import { remove_item } from "./remove_item";

export function ungroup(gid: ItemId) {
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
