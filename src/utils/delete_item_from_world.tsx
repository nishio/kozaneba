import { getGlobal } from "reactn";
import { State } from "reactn/default";
import { get_item } from "./get_item";
import { ItemId } from "../Global/ItemId";
import { TAnnotation } from "../Global/TAnnotation";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "./find_parent";
import { TGroupItem } from "../Global/TGroupItem";
import { remove_item_from } from "./remove_item_from";
import { move_front } from "./move_front";

export const delete_item_from_world = (id: ItemId) => {
  let parent = null;
  const item = get_item(getGlobal(), id);
  if (item.type === "group") {
    item.items.forEach(delete_item_from_world);
  }

  updateGlobal((g) => {
    parent = find_parent(id);
    if (parent !== null) {
      const p = g.itemStore[parent] as TGroupItem;
      p.items = remove_item_from(p.items, id);
    } else {
      g.drawOrder = remove_item_from(g.drawOrder, id);
    }
    delete g.itemStore[id];
    update_annotation_after_deletion(g, id);
  });
  if (parent !== null) {
    move_front(parent);
  }
};

const update_annotation_after_deletion = (g: State, id: ItemId) => {
  const new_annotation: TAnnotation[] = [];
  g.annotations.forEach((a) => {
    a.items = remove_item_from(a.items, id);
    if (a.type === "line" && a.items.length < 2) {
      // delete
      return;
    }
    new_annotation.push(a);
  });
  g.annotations = new_annotation;
};
