import { updateGlobal } from "../Global/updateGlobal";

export const moveCenter = (dx: number, dy: number) => {
  updateGlobal((g) => {
    g.trans_x += dx;
    g.trans_y += dy;
  });
};
