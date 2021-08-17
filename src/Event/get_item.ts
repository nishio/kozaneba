import { TItem } from "../Global/initializeGlobalState";
import { State } from "reactn/default";

export const get_item = (g: State, id: string): TItem => {
  if (id === "") {
    throw new Error(`tried get_item {id: ""}`);
  }
  const x = g.itemStore[id];
  if (x === undefined) {
    throw new Error(`id:${id} not in itemStore`);
  }
  return x;
};
