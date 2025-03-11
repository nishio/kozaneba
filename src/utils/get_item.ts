import { TItem } from "../Global/TItem";
import { GlobalState } from "../Global/GlobalContext";

export const get_item = (g: GlobalState, id: string): TItem => {
  if (id === "") {
    throw new Error(`tried get_item {id: ""}`);
  }
  const x = g.itemStore[id];
  if (x === undefined) {
    throw new Error(`id:${id} not in itemStore`);
  }
  return x;
};
