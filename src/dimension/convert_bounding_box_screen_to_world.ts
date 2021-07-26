import { TBoundingBox } from "./TBoundingBox";
import { screen_to_world } from "./world_to_screen";

export const convert_bounding_box_screen_to_world = (b: TBoundingBox) => {
  const [left, top] = screen_to_world([b.left, b.top]);
  const [right, bottom] = screen_to_world([b.right, b.bottom]);
  return { left, right, top, bottom };
};
