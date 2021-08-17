import { CSSProperties } from "styled-components";
import { TWorldCoord } from "../dimension/world_to_screen";

export const position_to_left_top = (position: TWorldCoord): CSSProperties => {
  const [x, y] = position;
  return {
    left: x + "px",
    top: y + "px",
  };
};
