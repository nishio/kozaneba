import { TWorldCoord } from "../dimension/world_to_screen";

export const position_to_left_top = (
  position: TWorldCoord
): { left: string; top: string } => {
  const [x, y] = position;
  return {
    left: x.toFixed(2) + "px",
    top: y.toFixed(2) + "px",
  };
};
