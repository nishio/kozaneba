import { GlobalState } from "../Global/GlobalContext";
import { TGroupItem } from "../Global/TGroupItem";

export const get_group = (g: GlobalState, id: string): TGroupItem => {
  if (id === "") {
    throw new Error(`tried get_item {id: ""}`);
  }
  const x = g.itemStore[id];
  if (x === undefined) {
    throw new Error(`id:${id} not in itemStore`);
  }
  if (x.type !== "group") {
    throw new Error(`id:${id} not group, ${x.type}`);
  }
  return x;
};
