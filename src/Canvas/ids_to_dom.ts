import { id_to_dom } from "./id_to_dom";
import { ItemId } from "../Global/initializeGlobalState";
import { TOffset } from "../dimension/TOffset";

export const ids_to_dom = (ids: ItemId[], offset: TOffset) => {
  return ids.map((id) => id_to_dom(id, offset));
};
