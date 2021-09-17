import { State } from "reactn/default";
import { get_group } from "./get_group";
import { ItemId } from "../Global/ItemId";
import { find_parent } from "./find_parent";
import { remove_item_from } from "./remove_item_from";
import { update_annotation_after_deletion } from "./update_annotation_after_deletion";

export const remove_item = (g: State, id: ItemId): void => {
  let parent = find_parent(id);
  if (parent === null) {
    g.drawOrder = remove_item_from(g.drawOrder, id);
    delete g.itemStore[id];
    update_annotation_after_deletion(g, id);
  } else {
    const new_parent = get_group(g, parent);
    new_parent.items = remove_item_from(new_parent.items, id);
  }
};
