import { getGlobal } from "reactn";
import { TItem } from "../Global/TItem";

export const get_clicked_item = (): TItem | undefined => {
  const g = getGlobal();
  return g.itemStore[g.clicked_target];
};
