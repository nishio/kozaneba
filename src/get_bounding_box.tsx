import { getGlobal } from "reactn";
import { getFusenBoundingBox } from "./fusen_dimension";
import { GroupItem, ItemId } from "./initializeGlobalState";

type TBoundingBox = { left: number; top: number; right: number; bottom: number; };

export const PADDING = 25;
export const BORDER = 5;
export const TITLE_HEIGHT = 25;

export const getGroupBoundingBox = (g: GroupItem): TBoundingBox => {
  const { left, top, right, bottom } = getItemsBoundingBox(g.items);
  const [x, y] = g.position;
  return {
    left: x + left - PADDING,
    top: y + top - PADDING,
    right: x + right + PADDING,
    bottom: y + bottom + PADDING,
  };
};

export const getItemBoundingBox = (id: ItemId) => {
  const g = getGlobal();
  const x = g.itemStore[id];
  if (x.type === "piece") {
    return getFusenBoundingBox(x);
  } else if (x.type === "group") {
    return getGroupBoundingBox(x);
  }
  throw Error("not here");
};
const getItemsBoundingBox = (items: ItemId[]): TBoundingBox => {
  if (items.length === 0) {
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    };
  }
  const [car, ...cdr] = items;
  let { left, right, top, bottom } = getItemBoundingBox(car);
  cdr.forEach((id) => {
    const b = getItemBoundingBox(id);
    if (b.left < left) {
      left = b.left;
    }
    if (b.top < top) {
      top = b.top;
    }
    if (b.right > right) {
      right = b.right;
    }
    if (b.bottom > bottom) {
      bottom = b.bottom;
    }
  });
  const r = { left, right, top, bottom };
  // console.log("group bounding box", r);
  return r;
};
