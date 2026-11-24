import { State } from "reactn/default";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "./find_parent";
import { get_group } from "./get_group";
import { remove_item_from } from "./remove_item_from";
import { move_front } from "./move_front";
import { update_annotation_after_deletion } from "./update_annotation_after_deletion";
import { remove_empty_untitled_groups } from "./remove_empty_untitled_groups";

// remove `id` and everything inside it from itemStore, with their lines
const delete_subtree = (g: State, id: TItemId) => {
  const item = g.itemStore[id];
  if (item === undefined) return;
  if (item.type === "group") {
    item.items.forEach((child) => delete_subtree(g, child));
  }
  delete g.itemStore[id];
  update_annotation_after_deletion(g, id);
};

export const delete_item_from_world = (id: TItemId) => {
  let survivor = null as TItemId | null;
  updateGlobal((g) => {
    const parent = find_parent(id, g);
    if (parent !== null) {
      const p = get_group(g, parent);
      p.items = remove_item_from(p.items, id);
    } else {
      g.drawOrder = remove_item_from(g.drawOrder, id);
    }
    delete_subtree(g, id);
    if (parent !== null) {
      // an untitled group left empty goes too, and so on upwards
      survivor = remove_empty_untitled_groups(g, parent);
    }
  });
  // bring the nearest group that is still there to the front; a removed group
  // must not be passed to move_front, which would push its id into drawOrder
  if (survivor !== null) {
    move_front(survivor);
  }
};
