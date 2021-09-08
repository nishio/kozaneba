import { getGlobal } from "reactn";
import { get_kozane_bounding_box } from "./get_kozane_bounding_box";
import { get_group_bounding_box } from "./get_group_bounding_box";
import { ItemId } from "../Global/initializeGlobalState";
import { get_item } from "../utils/get_item";
import { get_scrapbox_bounding_box } from "../Scrapbox/Scrapbox";
import { get_gyazo_bounding_box } from "../Canvas/Gyazo";

export const get_item_bounding_box = (id: ItemId) => {
  const g = getGlobal();
  const x = get_item(g, id);
  if (x.type === "kozane") {
    return get_kozane_bounding_box(x);
  } else if (x.type === "group") {
    return get_group_bounding_box(x);
  } else if (x.type === "scrapbox") {
    return get_scrapbox_bounding_box(x);
  } else if (x.type === "gyazo") {
    return get_gyazo_bounding_box(x);
  }
  // @ts-ignore
  throw Error(`unknown type: ${x.type} of id:${id}}`);
};
