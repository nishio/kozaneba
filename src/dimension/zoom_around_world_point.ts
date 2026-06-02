import { add_v2, mul_v2, sub_v2, V2 } from "./V2";
import { TWorldCoord } from "./world_to_screen";

export function zoom_around_world_point(
  initZoom: number,
  initCenter: TWorldCoord,
  zoomCenter: TWorldCoord,
  scale: number
): [number, V2] {
  const v = sub_v2(initCenter, zoomCenter);
  const newZoom = initZoom * scale;
  const newCenter = add_v2(initCenter, mul_v2((1 - scale) / scale, v));
  return [newZoom, newCenter];
}
