import { TFusenItem } from "../Fusen/FusenItem";
import { FUSEN_HEIGHT, FUSEN_WIDTH } from "../Fusen/fusen_constants";

export const get_fusen_bounding_box = (item: TFusenItem) => {
  const [x, y] = item.position;
  const scale = item.scale;
  const b = {
    top: y - (FUSEN_HEIGHT / 2) * scale,
    left: x - (FUSEN_WIDTH / 2) * scale,
    bottom: y + (FUSEN_HEIGHT / 2) * scale,
    right: x + (FUSEN_WIDTH / 2) * scale,
  };
  return b;
};
