import { getGlobal } from "../Global/ReactnCompat";
import { TItemId } from "../Global/TItemId";
import { TItem } from "../Global/TItem";
import { get_item as system_get_item } from "../utils/get_item";

export const get_item = (id: TItemId): TItem => {
  return system_get_item(getGlobal(), id);
};
