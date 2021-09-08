import { TBoundingBox } from "./TBoundingBox";
import { TRect } from "./TRect";

export const bounding_box_to_rect = (bb: TBoundingBox): TRect => {
  const { left, top, right, bottom } = bb;
  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  };
};
