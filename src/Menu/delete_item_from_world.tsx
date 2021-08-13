import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "../Group/find_parent";
import { TGroupItem } from "../Group/GroupItem";
import { remove_item_from } from "../utils/remove_item";

export const delete_item_from_world = (id: ItemId) => {
  updateGlobal((g) => {
    const parent = find_parent(id);
    if (parent !== null) {
      const p = g.itemStore[parent] as TGroupItem;
      p.items = remove_item_from(p.items, id);
    } else {
      g.drawOrder = remove_item_from(g.drawOrder, id);
    }
    delete g.itemStore[id];
  });
};
