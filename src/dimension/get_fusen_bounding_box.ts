import { TFusenItem } from "../Fusen/FusenItem";
import {
  FUSEN_BORDER,
  FUSEN_HEIGHT,
  FUSEN_WIDTH,
} from "../Fusen/fusen_constants";

export const get_fusen_bounding_box = (item: TFusenItem) => {
  const [x, y] = item.position;
  const scale = item.scale;
  const b = {
    top: y - (FUSEN_HEIGHT / 2) * scale - FUSEN_BORDER,
    left: x - (FUSEN_WIDTH / 2) * scale - FUSEN_BORDER,
    bottom: y + (FUSEN_HEIGHT / 2) * scale + FUSEN_BORDER,
    right: x + (FUSEN_WIDTH / 2) * scale + FUSEN_BORDER,
  };
  return b;
};
