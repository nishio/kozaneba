import { redraw } from "../API/redraw";
import { close_menu } from "../AppBar/close_menu";
import { mark_local_changed } from "../Cloud/mark_local_changed";
import { add_v2w, sub_v2w } from "../dimension/V2";
import { get_group } from "../Event/get_group";
import { get_item } from "../Event/get_item";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "../Group/find_parent";
import { remove_item_from } from "../utils/remove_item";

export function ungroup(gid: ItemId) {
  updateGlobal((g) => {
    const group = get_group(g, gid);
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
    } else {
      g.drawOrder = remove_item_from(g.drawOrder, gid);
      delete g.itemStore[gid];
    }
    g.clicked_target = "";
  });
  close_menu();
  mark_local_changed();
  redraw();
}
