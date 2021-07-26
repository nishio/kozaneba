import { getGlobal } from "reactn";

export const world_to_screen = ([x, y]: number[]) => {
  const g = getGlobal();
  return [
    document.body.clientWidth / 2 + (x + g.trans_x) * g.scale,
    document.body.clientHeight / 2 + (y + g.trans_y) * g.scale,
  ];
};

export const screen_to_world = ([x, y]: number[]) => {
  const g = getGlobal();
  return [
    (x - document.body.clientWidth / 2) / g.scale - g.trans_x,
    (y - document.body.clientHeight / 2) / g.scale - g.trans_y,
  ];
};
