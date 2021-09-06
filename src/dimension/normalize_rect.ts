import { TRect } from "./TRect";

export const normalize_rect = (sr: TRect): TRect => {
  // given rect, assure width >= 0 and height >= 0
  const { top, left, width, height } = sr;
  return {
    top: Math.min(top, top + height),
    left: Math.min(left, left + width),
    width: Math.abs(width),
    height: Math.abs(height),
  };
};
