import { getGlobal } from "reactn";

enum WorldBrand {
  _ = "",
}
enum ScreenBrand {
  _ = "",
}
export type TScreenCoord = ScreenBrand & number[];
export type TWorldCoord = WorldBrand & number[];

export const world_to_screen = ([x, y]: TWorldCoord): TScreenCoord => {
  const g = getGlobal();
  return [
    document.body.clientWidth / 2 + (x + g.trans_x) * g.scale,
    document.body.clientHeight / 2 + (y + g.trans_y) * g.scale,
  ] as TScreenCoord;
};

export const screen_to_world = ([x, y]: TScreenCoord): TWorldCoord => {
  const g = getGlobal();
  return [
    (x - document.body.clientWidth / 2) / g.scale - g.trans_x,
    (y - document.body.clientHeight / 2) / g.scale - g.trans_y,
  ] as TWorldCoord;
};
