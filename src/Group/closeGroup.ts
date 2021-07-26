import { getGlobal } from "reactn";
import { ItemId } from "../Global/initializeGlobalState";
import { TGroupItem } from "./GroupItem";
import { updateGlobal } from "../Global/updateGlobal";
import { get_group_bounding_box } from "../dimension/get_group_bounding_box";

export const closeGroup = (id: ItemId) => {
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

  updateGlobal((g) => {
    const target = g.itemStore[id] as TGroupItem;
    const [x, y] = target.position;
    target.isOpen = false;
    target.position = [x + center_shift_x, y + center_shift_y];
  });
  target.items.forEach((id) => {
    updateGlobal((g) => {
      const target = g.itemStore[id];
      const [x, y] = target.position;
      target.position = [x - center_shift_x, y - center_shift_y];
    });
  });
};
