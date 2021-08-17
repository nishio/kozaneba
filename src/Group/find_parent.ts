import { getGlobal } from "reactn";
import { get_item } from "../Event/get_item";
import { ItemId } from "../Global/initializeGlobalState";

export const find_parent = (target: ItemId): null | ItemId => {
  const g = getGlobal();
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
