import { getGlobal } from "reactn";
import { get_kozane_bounding_box } from "./get_kozane_bounding_box";
import { get_group_bounding_box } from "./get_group_bounding_box";
import { ItemId } from "../Global/initializeGlobalState";
import { get_item } from "../Event/get_item";

export const PADDING = 25;
export const BORDER = 5;
export const TITLE_HEIGHT = 25;

export const get_item_bounding_box = (id: ItemId) => {
  const g = getGlobal();
  const x = get_item(g, id);
  if (x.type === "kozane") {
    return get_kozane_bounding_box(x);
  } else if (x.type === "group") {
    return get_group_bounding_box(x);
  }
  // @ts-ignore
  throw Error(`unknown type: ${x.type} of id:${id}}`);
};
