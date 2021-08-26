import { constants } from "../API/constants";
import { ItemId } from "../Global/initializeGlobalState";
import { TGroupItem } from "../Group/GroupItem";
import { KOZANE_HEIGHT, KOZANE_WIDTH } from "../Kozane/kozane_constants";
import { get_item_bounding_box, TITLE_HEIGHT } from "./get_bounding_box";
import { TBoundingBox } from "./TBoundingBox";

export const get_group_bounding_box = (g: TGroupItem): TBoundingBox => {
  const [x, y] = g.position;
  const PADDING = constants.group_padding;
  if (g.isOpen) {
    const { left, top, right, bottom } = get_items_bounding_box(g.items);
    const title_height = g.text.length !== 0 ? TITLE_HEIGHT : 0;

    return {
      left: x + left - PADDING,
      top: y + top - PADDING - title_height,
      right: x + right + PADDING,
      bottom: y + bottom + PADDING,
    };
  }
  const width = KOZANE_WIDTH * g.scale + PADDING * 2;
  const height = KOZANE_HEIGHT * g.scale + PADDING * 2;

  return {
    left: x - width / 2,
    top: y - height / 2,
    right: x + width / 2,
    bottom: y + height / 2,
  };
};

export const get_items_bounding_box = (items: ItemId[]): TBoundingBox => {
  if (items.length === 0) {
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
    };
  }
  const [car, ...cdr] = items;
  let { left, right, top, bottom } = get_item_bounding_box(car!);
  cdr.forEach((id) => {
    const b = get_item_bounding_box(id);
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
