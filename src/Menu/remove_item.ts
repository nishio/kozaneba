import { State } from "reactn/default";
import { get_group } from "../Event/get_group";
import { ItemId } from "../Global/initializeGlobalState";
import { find_parent } from "../Group/find_parent";
import { remove_item_from } from "../utils/remove_item";

export const remove_item = (g: State, id: ItemId): void => {
  let parent = find_parent(id);
  if (parent === null) {
    g.drawOrder = remove_item_from(g.drawOrder, id);
    delete g.itemStore[id];
  } else {
    const new_parent = get_group(g, parent);
    new_parent.items = remove_item_from(new_parent.items, id);
  }
};
