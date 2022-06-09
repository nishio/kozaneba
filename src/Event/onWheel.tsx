import { add_v2, mul_v2, sub_v2, V2 } from "../dimension/V2";
import { screen_to_world, TWorldCoord } from "../dimension/world_to_screen";
import { updateGlobal } from "../Global/updateGlobal";
import { constants } from "../API/constants";
import { get_last_mouse_position } from "./onCanvasMouseMove";
import { kozaneba } from "../API/KozanebaAPI";

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

const zoom = (e: WheelEvent, v: number) => {
  let speed = constants.wheel_scale_speed;
  if (kozaneba.is_touchpad(e)) {
    speed = constants.touchpad_scale_speed;
  }

  const scale = Math.exp((-v * speed) / 10000);
  zoom_around_pointer(scale);
};

let count = 0;
let prevCount = 0;
let prevTiming = Date.now();
let pendingTask: number | null = null;
let deltaY = 0;
let deltaX = 0;
const toRequestIC = false;
export const onWheel = (e: WheelEvent) => {
  e.preventDefault();
  count++;
  const now = Date.now();
  if (now > prevTiming + 1000) {
    console.log(`count: ${count - prevCount}, time: ${now - prevTiming}`);
    prevCount = count;
    prevTiming = now;
  }
  const speed = constants.wheel_move_speed;

  if (toRequestIC) {
    deltaX += e.deltaX;
    deltaY += e.deltaY;
    if (pendingTask !== null) {
      cancelIdleCallback(pendingTask);
    }
    pendingTask = requestIdleCallback(
      () => {
        if (e.ctrlKey) {
          zoom(e, deltaY);
        } else if (e.shiftKey) {
          updateGlobal((g) => {
            g.trans_x -= (deltaY / g.scale) * speed;
            g.trans_y -= (deltaX / g.scale) * speed;
          });
        } else {
          updateGlobal((g) => {
            g.trans_x -= (deltaX / g.scale) * speed;
            g.trans_y -= (deltaY / g.scale) * speed;
          });
        }
        pendingTask = null;
        deltaX = 0;
        deltaY = 0;
      },
      {
        timeout: 100,
      }
    );
  } else {
    if (e.ctrlKey) {
      zoom(e, e.deltaY);
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
  }
};
