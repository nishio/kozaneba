import { getGlobal } from "reactn";
import { get_item } from "./get_item";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "./find_parent";
import { TGroupItem } from "../Global/TGroupItem";
import { remove_item_from } from "./remove_item_from";
import { move_front } from "./move_front";
import { update_annotation_after_deletion } from "./update_annotation_after_deletion";

export const delete_item_from_world = (id: TItemId) => {
  let parent = null;
  const item = get_item(getGlobal(), id);
  if (item.type === "group") {
    item.items.forEach(delete_item_from_world);
  }

  updateGlobal((g) => {
    parent = find_parent(id);
    if (parent !== null) {
      const p = g.itemStore[parent] as TGroupItem;
      p.items = remove_item_from(p.items, id);
    } else {
      g.drawOrder = remove_item_from(g.drawOrder, id);
    }
    delete g.itemStore[id];
    update_annotation_after_deletion(g, id);
  });
  if (parent !== null) {
    move_front(parent);
  }
};
