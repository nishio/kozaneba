import { getGlobal } from "reactn";
import { add_v2w, mul_v2w, sub_v2w } from "../dimension/V2";
import { TWorldCoord } from "../dimension/world_to_screen";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem, TGroupItem } from "../Group/GroupItem";
import { remove_item_from } from "../utils/remove_item";

export const make_items_into_new_group = (
  items: ItemId[],
  value: Partial<TGroupItem>
): ItemId => {
  const g = getGlobal();
  const group = new GroupItem(value?.id);
  group.items = [...items];
  let new_drawOrder = g.drawOrder;
  const N = items.length;
  let v = [0, 0] as TWorldCoord;
  items.forEach((id) => {
    v = add_v2w(v, g.itemStore[id].position);
  });
  const gravity_point = mul_v2w(1 / N, v);

  items.forEach((id) => {
    new_drawOrder = remove_item_from(new_drawOrder, id);
  });
  updateGlobal((g) => {
    items.forEach((id) => {
      g.itemStore[id].position = sub_v2w(
        g.itemStore[id].position,
        gravity_point
      );
    });

    group.position = gravity_point;
    Object.assign(group, value);
    g.drawOrder = new_drawOrder;
    g.itemStore[group.id] = group;
    g.drawOrder.push(group.id);
  });
  return group.id;
};
