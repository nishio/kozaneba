import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { remove_item_from } from "../utils/remove_item";

export const delete_item_from_world = (id: ItemId) => {
  updateGlobal((g) => {
    delete g.itemStore[id];
    g.drawOrder = remove_item_from(g.drawOrder, id);
  });
};
