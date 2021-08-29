import { TItem } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";

export const add_item = (item: TItem) => {
  updateGlobal((g) => {
    if (item.id in g.itemStore) {
      throw new Error(`add_item: dupricated id: ${item.id}`);
    }
    g.itemStore[item.id] = item;
    g.drawOrder.push(item.id);
  });
};
