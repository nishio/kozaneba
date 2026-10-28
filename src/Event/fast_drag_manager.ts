// for fast dragging, do not update the ReactN states
import React from "react";
import { add_v2, add_v2s, sub_v2s, sub_v2w } from "../dimension/V2";
import {
  screen_to_world,
  TScreenCoord,
  TWorldCoord,
} from "../dimension/world_to_screen";
import { dev_log } from "../utils/dev";
import { get_client_pos } from "./get_client_pos";
import { TInputEvent } from "./input_event";

let _target: HTMLElement | null;
let _mouse_down_point = [0, 0] as TScreenCoord;
let _first_element_position = [0, 0] as TScreenCoord;
let _is_mousemoved = false;
let _is_dragging = false;
// Pointers captured on #canvas (one per finger during a pinch).
const _captured = new Set<number>();
// A touch or pen that moves less than this is still a tap (a finger jitters).
const TOUCH_SLOP_PX = 8;
let _pointer_type = "mouse";

export const capture_pointer_id_on_canvas = (pointer_id: number) => {
  const canvas = document.getElementById("canvas");
  if (!(canvas instanceof HTMLDivElement)) return;
  try {
    canvas.setPointerCapture(pointer_id);
    _captured.add(pointer_id);
  } catch {
    // The pointer may already be released by the browser, e.g. after cancel.
  }
};

export const capture_pointer_on_canvas = (event: TInputEvent<Element>) => {
  if (!("pointerId" in event)) return;
  capture_pointer_id_on_canvas(event.pointerId);
};

// Releases the given pointer, or every captured pointer when none is given.
// With two fingers down, lifting one must not release the other.
export const release_pointer_capture = (pointer_id?: number) => {
  const ids = pointer_id === undefined ? [..._captured] : [pointer_id];
  const canvas = document.getElementById("canvas");
  for (const id of ids) {
    if (!_captured.has(id)) continue;
    if (canvas instanceof HTMLDivElement) {
      try {
        canvas.releasePointerCapture(id);
      } catch {
        // It is valid for capture to have been lost before explicit release.
      }
    }
    _captured.delete(id);
  }
};

export const pointer_id_of = (event: TInputEvent<Element>) =>
  "pointerId" in event ? event.pointerId : undefined;

const is_within_touch_slop = (event: TInputEvent<Element>) => {
  if (_is_mousemoved || _pointer_type === "mouse") return false;
  const [x, y] = get_client_pos(event);
  return (
    Math.hypot(x - _mouse_down_point[0], y - _mouse_down_point[1]) <
    TOUCH_SLOP_PX
  );
};

export const set_target = <T extends HTMLElement>(event: TInputEvent<T>) => {
  dev_log("set_target", event);
  capture_pointer_on_canvas(event);
  _target = event.currentTarget;
  dev_log("_target", _target);
  _mouse_down_point = get_client_pos(event);
  const style = window.getComputedStyle(_target);
  _first_element_position = [
    Number.parseFloat(style.left),
    Number.parseFloat(style.top),
  ] as TScreenCoord;

  _target.style.pointerEvents = "none";
  _target.style.zIndex = "100";

  _is_mousemoved = false;
  _is_dragging = true;
  _pointer_type =
    "pointerType" in event && event.pointerType ? event.pointerType : "mouse";
};

export const reset_target = () => {
  if (_target === null) {
    throw new Error("try to move element:null");
  }

  _target.style.pointerEvents = "auto";
  _target.style.zIndex = "0";

  if (_is_mousemoved) {
    // it is drag, need to reset temporary style
    _target.style.top = "";
    _target.style.left = "";
  } // else, it is click

  _target = null;
  _is_dragging = false;
  release_pointer_capture();
};

export const move_target = (event: TInputEvent<Element>) => {
  if (_target === null) {
    throw new Error("try to move element:null");
  }
  if (is_within_touch_slop(event)) return;
  const delta = sub_v2w(
    screen_to_world(get_client_pos(event)),
    screen_to_world(_mouse_down_point)
  );
  const pos = add_v2(_first_element_position, delta) as TWorldCoord;
  const style = {
    left: pos[0] + "px",
    top: pos[1] + "px",
  };
  Object.assign(_target.style, style);
  _is_mousemoved = true;
};

export const move_target_on_screen = (event: TInputEvent<Element>) => {
  // for SelectionView, it is not under `world` transform
  if (_target === null) {
    throw new Error("try to move element:null");
  }
  if (is_within_touch_slop(event)) return;
  const delta = sub_v2s(get_client_pos(event), _mouse_down_point);
  const pos = add_v2s(_first_element_position, delta);
  const style = {
    left: pos[0] + "px",
    top: pos[1] + "px",
  };
  Object.assign(_target.style, style);
  _is_mousemoved = true;
};

export const is_dragged = () => {
  return _is_mousemoved;
};

export const is_draggeing = () => {
  return _is_dragging;
};

// The element being dragged (an item or the selection) while a drag is active
export const get_dragging_element = (): HTMLElement | null => {
  return _is_dragging ? _target ?? null : null;
};

// currently not used but may useful for refactoring
export const get_delta = (event: TInputEvent<HTMLElement>) => {
  const delta = sub_v2w(
    screen_to_world(get_client_pos(event)),
    screen_to_world(_mouse_down_point)
  );
  return delta;
};

// not used
export const get_target = (): HTMLElement => {
  if (_target === null) {
    throw new Error("did get_target but target is null");
  }
  return _target;
};
