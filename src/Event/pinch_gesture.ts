import { getGlobal } from "reactn";
import { updateGlobal } from "../Global/updateGlobal";
import { TScreenCoord, TWorldCoord } from "../dimension/world_to_screen";
import { clear_drop_group_highlight } from "./drop_target";
import { get_client_pos } from "./get_client_pos";
import {
  capture_pointer_id_on_canvas,
  is_draggeing,
  release_pointer_capture,
  reset_target,
} from "./fast_drag_manager";
import { TInputEvent } from "./input_event";
import { pinch_transform } from "./pinch_transform";

// Two-finger pinch (zoom) + pan on the canvas. One finger keeps the existing
// behavior (select / drag); a second finger on the canvas switches to a pinch:
// the world point under the fingers' midpoint stays under the (moving) midpoint,
// and spreading/pinching zooms. `#canvas` has `touch-action: none`, so the
// browser does not also page-zoom. See QUEUE K12.

const activePointers = new Map<number, TScreenCoord>();
let pinchActive = false;
// Once two fingers have been down, the whole touch sequence belongs to the
// gesture until every finger is up: the finger that stays down must not go
// on as a selection or drag (or a stray "click on nothing").
let gestureLocked = false;
let prevDist = 0;
let prevMid: TScreenCoord = [0, 0] as TScreenCoord;

const isPrimary = (event: TInputEvent<Element>): boolean =>
  (event as { isPrimary?: boolean }).isPrimary === true;

const isTouchLike = (event: TInputEvent<Element>): boolean => {
  const t = (event as { pointerType?: string }).pointerType;
  // Only touch/pen can produce a genuine two-finger gesture. Mouse is single.
  return t === undefined ? false : t !== "mouse";
};

const pointerId = (event: TInputEvent<Element>): number | null => {
  const id = (event as { pointerId?: number }).pointerId;
  return typeof id === "number" ? id : null;
};

const distance = (a: TScreenCoord, b: TScreenCoord) =>
  Math.hypot(a[0] - b[0], a[1] - b[1]);

const midpoint = (a: TScreenCoord, b: TScreenCoord) =>
  [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as TScreenCoord;

const firstTwo = (): [TScreenCoord, TScreenCoord] | null => {
  const pts = Array.from(activePointers.values());
  if (pts.length < 2) return null;
  return [pts[0]!, pts[1]!];
};

export const is_pinching = () => pinchActive;

// Ends whatever the first finger started (a drag of a kozane, group or the
// selection, or a selection rectangle) so the pinch owns the fingers.
const abort_single_pointer_action = () => {
  clear_drop_group_highlight();
  if (is_draggeing()) {
    reset_target(); // restores the dragged element and releases capture
  } else {
    release_pointer_capture();
  }
  updateGlobal((g) => {
    g.mouseState = "";
    g.drag_target = "";
    g.selectionRange = { top: 0, left: 0, width: 0, height: 0 };
    g.is_selected = false;
  });
};

// Call first from every pointerdown handler that a finger can land on
// (#canvas, kozane/group, the selection). Returns true if the event is
// consumed by the pinch gesture (the caller must then skip its own handling).
export const pinch_pointer_down = (event: TInputEvent<Element>): boolean => {
  if (!isTouchLike(event)) return false;
  const id = pointerId(event);
  if (id === null) return false;
  if (isPrimary(event)) {
    // A primary pointer starts a new touch sequence: nothing else is down,
    // whatever we still hold is left over from an up we never received.
    activePointers.clear();
    pinchActive = false;
    gestureLocked = false;
  }
  activePointers.set(id, get_client_pos(event));

  const two = firstTwo();
  if (two !== null) {
    // Second finger down: enter pinch and abort any single-finger selection/drag.
    prevDist = distance(two[0], two[1]);
    prevMid = midpoint(two[0], two[1]);
    if (!pinchActive) {
      pinchActive = true;
      gestureLocked = true;
      abort_single_pointer_action();
      // Every finger's move/up must reach #canvas, wherever it went down.
      activePointers.forEach((_, pid) => capture_pointer_id_on_canvas(pid));
    }
    return true;
  }
  return false;
};

// Call from onCanvasMouseMove. Returns true if consumed.
export const pinch_pointer_move = (event: TInputEvent<Element>): boolean => {
  if (!gestureLocked) return false;
  const id = pointerId(event);
  if (id === null || !activePointers.has(id)) return false;
  activePointers.set(id, get_client_pos(event));
  // a finger left over after the pinch: consume, do nothing
  if (!pinchActive) return true;

  const two = firstTwo();
  if (two === null) return true;
  const newDist = distance(two[0], two[1]);
  const newMid = midpoint(two[0], two[1]);
  if (prevDist > 0) {
    const ratio = newDist / prevDist;
    const center = [
      document.body.clientWidth / 2,
      document.body.clientHeight / 2,
    ] as TScreenCoord;
    const g = getGlobal();
    const { scale, trans } = pinch_transform(
      center,
      prevMid,
      newMid,
      g.scale,
      [g.trans_x, g.trans_y] as TWorldCoord,
      ratio
    );
    updateGlobal((g) => {
      g.scale = scale;
      g.trans_x = trans[0];
      g.trans_y = trans[1];
    });
  }
  prevDist = newDist;
  prevMid = newMid;
  return true;
};

// Call from onCanvasMouseUp / onCanvasPointerCancel. Returns true if this
// pointer was part of an active pinch (caller should skip drop/selection-finish).
export const pinch_pointer_up = (event: TInputEvent<Element>): boolean => {
  const id = pointerId(event);
  if (id === null) return false;
  const had = activePointers.delete(id);
  const consumed = gestureLocked && had;
  if (activePointers.size < 2) {
    pinchActive = false;
    prevDist = 0;
  }
  if (activePointers.size === 0) gestureLocked = false;
  // Consume every up of a pinched sequence, so no lifted finger triggers a
  // drop or finish-selecting.
  return consumed;
};
