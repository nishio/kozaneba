import { TKozaneItem } from "../Global/TKozaneItem";
import {
  KOZANE_BORDER,
  KOZANE_HEIGHT,
  KOZANE_WIDTH,
} from "../utils/kozane_constants";

export const get_kozane_bounding_box = (item: TKozaneItem) => {
  const [x, y] = item.position;
  const scale = item.scale;
  const b = {
    top: y - (KOZANE_HEIGHT / 2) * scale - KOZANE_BORDER,
    left: x - (KOZANE_WIDTH / 2) * scale - KOZANE_BORDER,
    bottom: y + (KOZANE_HEIGHT / 2) * scale + KOZANE_BORDER,
    right: x + (KOZANE_WIDTH / 2) * scale + KOZANE_BORDER,
  };
  return b;
};
