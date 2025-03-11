import { getGlobal } from "../Global/ReactnCompat";
import { State } from "../Global/initializeGlobalState";
import { get_item } from "./get_item";
import { TItemId } from "../Global/TItemId";

// potential time-consuming function
export const find_parent = (
  target: TItemId,
  state?: State | undefined
): null | TItemId => {
  let g: State;
  if (state === undefined) {
    g = getGlobal();
  } else {
    g = state;
  }
  let result: null | TItemId = null;
  const visit = (id: TItemId) => {
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
