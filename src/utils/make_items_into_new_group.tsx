import { getGlobal } from "reactn";
import { redraw } from "../API/redraw";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { TGroupItem } from "../Global/TGroupItem";
import { remove_item_from } from "./remove_item_from";
import { normalize_group_position } from "./normalize_group_position";

export const make_items_into_new_group = (
  items: TItemId[],
  value: Partial<TGroupItem>
): TItemId => {
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
  redraw();
  return group.id;
};
