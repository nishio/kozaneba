import { getGlobal } from "reactn";
import { TItemId } from "../Global/TItemId";
import { TGroupItem } from "../Global/TGroupItem";
import { updateGlobal } from "../Global/updateGlobal";
import { get_group_bounding_box } from "../dimension/get_group_bounding_box";
import { TWorldCoord } from "../dimension/world_to_screen";
import { add_v2w, sub_v2w } from "../dimension/V2";
import { get_item } from "../utils/get_item";

export const closeGroup = (id: TItemId) => {
  const g = getGlobal();
  const target = g.itemStore[id];
  if (target === undefined) {
    throw new Error(`try closeGroup(id=${id}) but target does not exist`);
  }
  if (target.type !== "group") {
    throw new Error(`try closeGroup(id=${id}) but target is not a group`);
  }
  if (!target.isOpen) {
    throw new Error(`try closeGroup(id=${id}) but target is already closed`);
  }
  const b = get_group_bounding_box(target);
  const center_shift_x = (b.left + b.right) / 2;
  const center_shift_y = (b.top + b.bottom) / 2;
  const center_shift = [center_shift_x, center_shift_y] as TWorldCoord;
  updateGlobal((g) => {
    const target = g.itemStore[id] as TGroupItem;
    target.isOpen = false;
    target.position = add_v2w(target.position, center_shift);
  });
  target.items.forEach((id) => {
    updateGlobal((g) => {
      const target = get_item(g, id);
      target.position = sub_v2w(target.position, center_shift);
    });
  });
};
