import { getGlobal } from "reactn";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem, TGroupItem } from "../Group/GroupItem";
import { remove_item_from } from "../utils/remove_item";
import { normalize_group_position } from "./normalize_group_position";

export const make_items_into_new_group = (
  items: ItemId[],
  value: Partial<TGroupItem>
): ItemId => {
  const g = getGlobal();
  const group = new GroupItem(value?.id);
  group.items = [...items];

  let new_drawOrder = g.drawOrder;
  items.forEach((id) => {
    new_drawOrder = remove_item_from(new_drawOrder, id);
  });
  new_drawOrder.push(group.id);
  Object.assign(group, value);
  updateGlobal((g) => {
    g.drawOrder = new_drawOrder;
    g.itemStore[group.id] = group;
  });
  normalize_group_position(group.id);
  return group.id;
};
