import { getGlobal } from "reactn";
import { ItemId } from "../Global/initializeGlobalState";

export const get_selected_ids = (): ItemId[] => {
  return getGlobal().selected_items;
};
