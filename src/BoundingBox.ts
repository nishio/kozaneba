import { screen_to_world } from "./world_to_screen";

type BoundingBox = { left: number; top: number; right: number; bottom: number };

export const isOverlapBox = (a: BoundingBox, b: BoundingBox): boolean => {
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

export const convert_bounding_box_screen_to_world = (b: BoundingBox) => {
  const [left, top] = screen_to_world([b.left, b.top]);
  const [right, bottom] = screen_to_world([b.right, b.bottom]);
  return { left, right, top, bottom };
};
