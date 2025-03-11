import { getGlobal } from "../Global/ReactnCompat";
import { Static } from "runtypes";
import { RT_V2 } from "./V2";

export const RTScreenCoord = RT_V2.withBrand("Screen");
export type TScreenCoord = Static<typeof RTScreenCoord>;
export const RTWorldCoord = RT_V2.withBrand("World");
export type TWorldCoord = Static<typeof RTWorldCoord>;

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
