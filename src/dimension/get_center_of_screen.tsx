import { TWorldCoord } from "./world_to_screen";
import { getGlobal } from "reactn";

export const get_center_of_screen = (): TWorldCoord => {
  const g = getGlobal();
  return [-g.trans_x, -g.trans_y] as TWorldCoord;
};
