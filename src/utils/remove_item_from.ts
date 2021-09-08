import { ItemId } from "../Global/ItemId";

export const remove_item_from = (items: ItemId[], target: ItemId) => {
  return items.filter((id) => id !== target);
};
