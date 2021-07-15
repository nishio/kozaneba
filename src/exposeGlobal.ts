import { getGlobal, setGlobal } from "reactn";
import { getGroupBoundingBox } from "./Group";
import { importRegroupJSON } from "./importRegroupJSON";
import { GroupItem, ItemId } from "./initializeGlobalState";
import { updateGlobal } from "./updateGlobal";
import { world_to_screen, screen_to_world } from "./world_to_screen";

const closeGroup = (id: ItemId) => {
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

const movidea = {
  getGlobal,
  setGlobal,
  updateGlobal,
  importRegroupJSON,
  closeGroup,
  world_to_screen,
  screen_to_world,
};
export type TMovidea = typeof movidea;
const debug = {};

declare global {
  interface Window {
    debug: any;
    movidea: TMovidea;
  }
}

export const exposeGlobal = () => {
  window.movidea = movidea;
  window.debug = debug;
};
