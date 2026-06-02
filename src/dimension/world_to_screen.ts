import { getGlobal } from "reactn";
import { Static } from "runtypes";
import { RT_V2 } from "./V2";

export const RTScreenCoord = RT_V2.withBrand("Screen");
export type TScreenCoord = Static<typeof RTScreenCoord>;
export const RTWorldCoord = RT_V2.withBrand("World");
export type TWorldCoord = Static<typeof RTWorldCoord>;

export type TViewportTransform = {
  width: number;
  height: number;
  scale: number;
  trans_x: number;
  trans_y: number;
};

export const world_to_screen_with_viewport = (
  [x, y]: TWorldCoord,
  viewport: TViewportTransform
): TScreenCoord => {
  return [
    viewport.width / 2 + (x + viewport.trans_x) * viewport.scale,
    viewport.height / 2 + (y + viewport.trans_y) * viewport.scale,
  ] as TScreenCoord;
};

export const screen_to_world_with_viewport = (
  [x, y]: TScreenCoord,
  viewport: TViewportTransform
): TWorldCoord => {
  return [
    (x - viewport.width / 2) / viewport.scale - viewport.trans_x,
    (y - viewport.height / 2) / viewport.scale - viewport.trans_y,
  ] as TWorldCoord;
};

const get_current_viewport = (): TViewportTransform => {
  const g = getGlobal();
  return {
    width: document.body.clientWidth,
    height: document.body.clientHeight,
    scale: g.scale,
    trans_x: g.trans_x,
    trans_y: g.trans_y,
  };
};

export const world_to_screen = (point: TWorldCoord): TScreenCoord => {
  return world_to_screen_with_viewport(point, get_current_viewport());
};

export const screen_to_world = (point: TScreenCoord): TWorldCoord => {
  return screen_to_world_with_viewport(point, get_current_viewport());
};
