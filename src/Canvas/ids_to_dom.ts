import { TOffset } from "../dimension/TOffset";
import { TItemId } from "../Global/TItemId";
import { id_to_dom } from "./id_to_dom";

export const ids_to_dom = (ids: TItemId[], offset: TOffset) => {
  return ids.map((id) => id_to_dom(id, offset));
};
