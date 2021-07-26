import { getGlobal } from "reactn";
import { get_fusen_bounding_box } from "./get_fusen_bounding_box";
import { get_group_bounding_box } from "./get_group_bounding_box";
import { ItemId } from "../Global/initializeGlobalState";

export const PADDING = 25;
export const BORDER = 5;
export const TITLE_HEIGHT = 25;

export const get_item_bounding_box = (id: ItemId) => {
  const g = getGlobal();
  const x = g.itemStore[id];
  if (x.type === "piece") {
    return get_fusen_bounding_box(x);
  } else if (x.type === "group") {
    return get_group_bounding_box(x);
  }
  throw Error("not here");
};
