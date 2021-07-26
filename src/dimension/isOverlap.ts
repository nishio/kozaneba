import { TBoundingBox } from "./TBoundingBox";

export const isOverlap = (a: TBoundingBox, b: TBoundingBox): boolean => {
  if (
    a.left < b.right &&
    a.right > b.left &&
    a.top < b.bottom &&
    a.bottom > b.top
  ) {
    return true;
  }
  return false;
};
