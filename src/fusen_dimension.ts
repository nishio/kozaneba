import { FusenItem } from "./initializeGlobalState";

export const FUSEN_WIDTH = 130;
export const FUSEN_HEIGHT = 100;
export const FUSEN_BORDER = 1;

export const getBoundingBox = (item: FusenItem) => {
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
