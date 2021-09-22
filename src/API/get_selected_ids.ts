import { getGlobal } from "reactn";
import { TItemId } from "../Global/TItemId";

export const get_selected_ids = (): TItemId[] => {
  return getGlobal().selected_items;
};
