import { getGlobal } from "reactn";
import { add_item } from "../../API/add_item";
import { redraw } from "../../API/redraw";
import { get_center_of_screen } from "../../dimension/get_center_of_screen";
import { RTAnnotation, TAnnotation } from "../../Global/TAnnotation";
import { RTItem, TItem } from "../../Global/TItem";
import { updateGlobal } from "../../Global/updateGlobal";
import { GroupItem } from "../../Group/GroupItem";
import { create_new_itemid } from "../create_new_itemid";
import { normalize_group_position } from "../normalize_group_position";
import { check_all_items } from "./check_all_items";
import { isString } from "../is_string";
import { TItemId } from "../../Global/TItemId";

export const do_kozaneba_v4 = (j: JSON_KozanebaV4) => {
  if (!Array.isArray(j.drawOrder)) {
    console.error("drawOrder should be an Array", j.drawOrder);
    return false;
  }
  if (
    !check_all_items(
      j.drawOrder,
      isString,
      "an item of drawOrder should be string"
    )
  ) {
    return false;
  }
  if (typeof j.itemStore !== "object") {
    console.error("itemStore should be an Object", typeof j.itemStore);
    return false;
  }

  const id_map: { [old_id: string]: TItemId } = {};
  const current = getGlobal();
  const to_add: TItem[] = [];
  const visit = (old_id: string): TItemId => {
    let id: TItemId;
    if (current.itemStore[old_id] !== undefined) {
      id = create_new_itemid();
    } else {
      id = old_id as TItemId;
    }
    id_map[old_id] = id;
    const item = j.itemStore[old_id]!;
    const new_item = { ...item, id };
    if (new_item.type === "group") {
      new_item.items = new_item.items.map(visit);
    }
    to_add.push(new_item);
    return id;
  };
  const new_items = j.drawOrder.map(visit);

  // veryfy
  if (!check_all_items(to_add, RTItem.guard, "invalid item:")) {
    return false; // not succeeded
  }

  // update
  updateGlobal((g) => {
    to_add.forEach((item) => {
      g.itemStore[item.id] = item;
    });
  });

  if (j.annotation !== undefined) {
    if (!Array.isArray(j.annotation)) {
      console.error("annotation should be an Array", j.annotation);
      return false;
    }
    if (
      !check_all_items(j.annotation, RTAnnotation.guard, "invalid annotation:")
    ) {
      return false; // not succeeded
    }
  } else {
    j.annotation = [];
  }
  const annotation = j.annotation.map((a) => {
    return {
      ...a,
      items: a.items.map((old_id) => id_map[old_id]!),
    };
  });
  const group = new GroupItem();
  group.items = new_items;
  add_item(group);
  normalize_group_position(group.id);
  updateGlobal((g) => {
    g.itemStore[group.id]!.position = get_center_of_screen();
    g.annotations.push(...annotation);
  });
  redraw();
  return true;
};

type JSON_KozanebaV4 = {
  format: string;
  version: 4;
  itemStore: { [key: string]: TItem };
  drawOrder: TItemId[];
  annotation: TAnnotation[];
};
