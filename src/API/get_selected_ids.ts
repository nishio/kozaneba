import { getGlobal } from "reactn";
import { ItemId } from "../Global/ItemId";

export const get_selected_ids = (): ItemId[] => {
  return getGlobal().selected_items;
};
