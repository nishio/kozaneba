import { getGlobal } from "reactn";
import { V2 } from "./V2";

enum WorldBrand {
  _ = "",
}
enum ScreenBrand {
  _ = "",
}
export type TScreenCoord = ScreenBrand & V2;
export type TWorldCoord = WorldBrand & V2;

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
