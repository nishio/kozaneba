import { State } from "reactn/default";
import { ItemId } from "../Global/initializeGlobalState";
import { TGroupItem } from "../Global/TGroupItem";

export const get_group = (g: State, id: ItemId): TGroupItem => {
  const item = g.itemStore[id];
  if (item?.type !== "group") {
    throw new Error(`tried to get group id=${id} but its type=${item?.type}`);
  }
  return item;
};
