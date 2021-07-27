import { getGlobal } from "reactn";
import { ItemId } from "../Global/initializeGlobalState";

export const find_parent = (target: ItemId) => {
  const g = getGlobal();
  let result: null | ItemId = null;
  const visit = (id: ItemId) => {
    const x = g.itemStore[id];
    if (x.type === "group") {
      console.log(x.items, target, x.items.includes(target));
      if (x.items.includes(target)) {
        result = id;
      }
      x.items.forEach((id) => visit(id));
    }
  };
  g.drawOrder.forEach((id) => visit(id));
  return result;
};
