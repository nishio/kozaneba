import { add_v2, mul_v2, sub_v2, V2 } from "../dimension/V2";
import { screen_to_world, TWorldCoord } from "../dimension/world_to_screen";
import { updateGlobal } from "../Global/updateGlobal";
import { constants } from "../UserCustomize/UserCustomize";
import { get_last_mouse_position } from "./onCanvasMouseMove";

function zoomAroundMousePointer(
  initZoom: number,
  initCenter: TWorldCoord,
  zoomCenter: TWorldCoord,
  scale: number
): [number, V2] {
  const v = sub_v2(initCenter, zoomCenter);
  let newZoom = initZoom * scale;
  let newCenter = add_v2(initCenter, mul_v2((1 - scale) / scale, v));
  return [newZoom, newCenter];
}

export const zoom_around_pointer = (delta_scale: number) => {
  updateGlobal((g) => {
    const [newZoom, newCenter] = zoomAroundMousePointer(
      g.scale,
      [-g.trans_x, -g.trans_y] as TWorldCoord,
      screen_to_world(get_last_mouse_position()),
      delta_scale
    );
    g.scale = newZoom;
    g.trans_x = -newCenter[0];
    g.trans_y = -newCenter[1];
  });
};

const is_touchpad = (event: WheelEvent): boolean => {
  // distinguish touchpad and mouse-wheel
  // ref. https://stackoverflow.com/a/62415754/3651086
  var isTrackpad = false;
  const e = event as any;
  if (e.wheelDeltaY) {
    if (e.wheelDeltaY === e.deltaY * -3) {
      isTrackpad = true;
    }
  } else if (e.deltaMode === 0) {
    isTrackpad = true;
  }
  return isTrackpad;
};

const zoom = (e: WheelEvent) => {
  let speed = constants.wheel_scale_speed;
  if (is_touchpad(e)) {
    speed = constants.touchpad_scale_speed;
  }
  let v = e.deltaY;
  const scale = Math.exp((-v * speed) / 10000);
  zoom_around_pointer(scale);
};

export const onWheel = (e: WheelEvent) => {
  e.preventDefault();
  const speed = constants.wheel_move_speed;
  if (e.ctrlKey) {
    zoom(e);
  } else if (e.shiftKey) {
    updateGlobal((g) => {
      g.trans_x -= (e.deltaY / g.scale) * speed;
      g.trans_y -= (e.deltaX / g.scale) * speed;
    });
  } else {
    updateGlobal((g) => {
      g.trans_x -= (e.deltaX / g.scale) * speed;
      g.trans_y -= (e.deltaY / g.scale) * speed;
    });
  }
};
