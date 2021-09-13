import {
  KOZANE_BORDER,
  KOZANE_HEIGHT,
  KOZANE_WIDTH,
} from "../utils/kozane_constants";
import { TWorldCoord } from "./world_to_screen";

export const create_squared_position = (
  items: unknown[],
  UNIT_WIDTH: number = KOZANE_WIDTH + KOZANE_BORDER,
  UNIT_HEIGHT: number = KOZANE_HEIGHT + KOZANE_BORDER,
  MARGIN: number = -KOZANE_BORDER
): TWorldCoord[] => {
  const num = items.length;
  const area = num * UNIT_WIDTH * UNIT_HEIGHT;
  const numX = Math.ceil(Math.sqrt(area) / UNIT_WIDTH);
  const width = numX * UNIT_WIDTH;
  const height = Math.ceil(num / numX) * UNIT_HEIGHT;
  return items.map((_, index) => {
    let x = index % numX;
    let y = Math.floor(index / numX);
    x *= UNIT_WIDTH - MARGIN;
    y *= UNIT_HEIGHT - MARGIN;

    x += -width / 2 + UNIT_WIDTH / 2;
    y += -height / 2 + UNIT_HEIGHT / 2;
    return [x, y] as TWorldCoord;
  });
};
