import { TWorldCoord } from "./world_to_screen";

export const create_squared_position = (
  items: unknown[],
  UNIT_WIDTH: number,
  UNIT_HEIGHT: number,
  MARGIN: number
): TWorldCoord[] => {
  const N = items.length;
  const area = N * UNIT_WIDTH * UNIT_HEIGHT;
  const numX = Math.ceil(Math.sqrt(area) / UNIT_WIDTH);
  const width = numX * UNIT_WIDTH;
  const height = Math.ceil(N / numX) * UNIT_HEIGHT;
  return items.map((line, index) => {
    let x = index % numX;
    let y = Math.floor(index / numX);
    x *= UNIT_WIDTH - MARGIN;
    y *= UNIT_HEIGHT - MARGIN;

    x += -width / 2 + UNIT_WIDTH / 2;
    y += -height / 2 + UNIT_HEIGHT / 2;
    return [x, y] as TWorldCoord;
  });
};
