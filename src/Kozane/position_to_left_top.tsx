import { TWorldCoord } from "../dimension/world_to_screen";

export const position_to_left_top = (
  position: TWorldCoord
): { left: string; top: string } => {
  const [x, y] = position;
  return {
    left: x + "px",
    top: y + "px",
  };
};
