import { TRect } from "./TRect";

export const selection_range_to_bounding_box = (sr: TRect) => {
  const bottom = sr.top + sr.height;
  const right = sr.left + sr.width;
  return {
    top: Math.min(sr.top, bottom),
    left: Math.min(sr.left, right),
    bottom: Math.max(sr.top, bottom),
    right: Math.max(sr.left, right),
  };
};
