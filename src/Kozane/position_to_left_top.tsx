import { TWorldCoord } from "../dimension/world_to_screen";
import { to_rounded_px } from "./to_rounded_px";

export const position_to_left_top = (
  position: TWorldCoord
): { left: string; top: string } => {
  const [x, y] = position;
  return {
    left: to_rounded_px(x),
    top: to_rounded_px(y),
  };
};
