import { getGlobal } from "reactn";
import { ItemId } from "../Global/ItemId";
import { TItem } from "../Global/TItem";
import { get_item as system_get_item } from "../utils/get_item";

export const get_item = (id: ItemId): TItem => {
  return system_get_item(getGlobal(), id);
};
