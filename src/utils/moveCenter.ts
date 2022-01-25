import { updateGlobal } from "../Global/updateGlobal";

// dx, dy is world coordinates
export const moveCenter = (dx: number, dy: number) => {
  updateGlobal((g) => {
    g.trans_x += dx;
    g.trans_y += dy;
  });
};
