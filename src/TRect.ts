type TRect = { left: number; top: number; width: number; height: number };

export const selectionRange_to_boundingBox = (sr: TRect) => {
  const bottom = sr.top + sr.height;
  const right = sr.left + sr.width;
  return {
    top: Math.min(sr.top, bottom),
    left: Math.min(sr.left, right),
    bottom: Math.max(sr.top, bottom),
    right: Math.max(sr.left, right),
  };
};

export const normalize_rect = (sr: TRect) => {
  // given rect, assure width >= 0 and height >= 0
  const { top, left, width, height } = sr;
  return {
    top: Math.min(top, top + height),
    left: Math.min(left, left + width),
    width: Math.abs(width),
    height: Math.abs(height),
  };
};
