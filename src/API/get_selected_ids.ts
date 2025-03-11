import { getGlobal } from "../Global/ReactnCompat";
import { TItemId } from "../Global/TItemId";

export const get_selected_ids = (): TItemId[] => {
  return getGlobal().selected_items;
};
