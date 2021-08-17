import { TBoundingBox } from "./TBoundingBox";
import { screen_to_world, TScreenCoord } from "./world_to_screen";

export const convert_bounding_box_screen_to_world = (b: TBoundingBox) => {
  const [left, top] = screen_to_world([b.left, b.top] as TScreenCoord);
  const [right, bottom] = screen_to_world([b.right, b.bottom] as TScreenCoord);
  return { left, right, top, bottom };
};
