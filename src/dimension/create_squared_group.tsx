import { TItem } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { KozaneItem } from "../Kozane/KozaneItem";
import {
  KOZANE_BORDER,
  KOZANE_HEIGHT,
  KOZANE_WIDTH,
} from "../utils/kozane_constants";
import { create_squared_position } from "./create_squared_position";

export const create_squared_group = (items: string[]) => {
  const positions = create_squared_position(
    items,
    KOZANE_WIDTH + KOZANE_BORDER,
    KOZANE_HEIGHT + KOZANE_BORDER,
    -KOZANE_BORDER
  );
  const group = new GroupItem();
  const kozane_list = [] as TItem[];
  items.forEach((line, index) => {
    if (line === "") return;
    const kozane = new KozaneItem();
    kozane.text = line;
    kozane.position = positions[index]!;
    kozane_list.push(kozane);
  });

  updateGlobal((g) => {
    kozane_list.forEach((kozane) => {
      g.itemStore[kozane.id] = kozane;
      group.items.push(kozane.id);
    });
  });
  return group;
};
