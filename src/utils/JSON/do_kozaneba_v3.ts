import { add_item } from "../../API/add_item";
import { redraw } from "../../API/redraw";
import { get_center_of_screen } from "../../dimension/get_center_of_screen";
import { TItemId } from "../../Global/TItemId";
import { TItem } from "../../Global/TItem";
import { updateGlobal } from "../../Global/updateGlobal";
import { GroupItem } from "../../Group/GroupItem";
import { create_new_itemid } from "../create_new_itemid";
import { normalize_group_position } from "../normalize_group_position";

export const do_kozaneba_v3 = (j: JSON_KozanebaV3) => {
  const to_add: TItem[] = [];
  const visit = (old_id: string): TItemId => {
    const id = create_new_itemid();
    const item = j.itemStore[old_id]!;
    const new_item = { ...item, id };
    if (new_item.type === "group") {
      new_item.items = new_item.items.map(visit);
    }
    to_add.push(new_item);
    return id;
  };
  const new_items = j.drawOrder.map(visit);
  updateGlobal((g) => {
    to_add.forEach((item) => {
      g.itemStore[item.id] = item;
    });
  });
  const group = new GroupItem();
  group.items = new_items;
  add_item(group);
  normalize_group_position(group.id);
  updateGlobal((g) => {
    g.itemStore[group.id]!.position = get_center_of_screen();
  });
  redraw();
};

type JSON_KozanebaV3 = {
  format: string;
  version: 3;
  itemStore: { [key: string]: TItem };
  drawOrder: TItemId[];
};
