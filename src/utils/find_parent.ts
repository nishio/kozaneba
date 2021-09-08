import { getGlobal } from "reactn";
import { State } from "reactn/default";
import { get_item } from "./get_item";
import { ItemId } from "../Global/ItemId";

export const find_parent = (
  target: ItemId,
  state?: State | undefined
): null | ItemId => {
  let g: State;
  if (state === undefined) {
    g = getGlobal();
  } else {
    g = state;
  }
  let result: null | ItemId = null;
  const visit = (id: ItemId) => {
    const x = get_item(g, id);
    if (x.type === "group") {
      if (x.items.includes(target)) {
        result = id;
      }
      x.items.forEach((id) => visit(id));
    }
  };
  g.drawOrder.forEach((id) => visit(id));
  return result;
};
