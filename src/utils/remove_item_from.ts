import { TItemId } from "../Global/TItemId";

export const remove_item_from = (items: TItemId[], target: TItemId) => {
  return items.filter((id) => id !== target);
};
