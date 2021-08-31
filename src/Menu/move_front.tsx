import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "../Group/find_parent";
import { TGroupItem } from "../Group/GroupItem";
import { remove_item_from } from "../utils/remove_item";

export const move_front = (id: ItemId) => {
  let parent = null;
  updateGlobal((g) => {
    parent = find_parent(id);
    if (parent !== null) {
      const p = g.itemStore[parent] as TGroupItem;
      p.items = remove_item_from(p.items, id);
      p.items.push(id);
    } else {
      g.drawOrder = remove_item_from(g.drawOrder, id);
      g.drawOrder.push(id);
    }
  });
  if (parent !== null) {
    move_front(parent);
  }
};
