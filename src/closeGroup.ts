import { getGlobal } from "reactn";
import { getGroupBoundingBox } from "./get_bounding_box";
import { GroupItem, ItemId } from "./initializeGlobalState";
import { updateGlobal } from "./updateGlobal";

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
  const b = getGroupBoundingBox(target);
  const center_shift_x = (b.left + b.right) / 2;
  const center_shift_y = (b.top + b.bottom) / 2;

  updateGlobal((g) => {
    const target = g.itemStore[id] as GroupItem;
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
