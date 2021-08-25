// for fast dragging, do not update the ReactN states
import React from "react";
import { add_v2, add_v2s, sub_v2s, sub_v2w } from "../dimension/V2";
import {
  screen_to_world,
  TScreenCoord,
  TWorldCoord,
} from "../dimension/world_to_screen";
import { get_client_pos } from "./get_client_pos";

let _target: HTMLDivElement | null;
let _mouse_down_point = [0, 0] as TScreenCoord;
let _first_element_position = [0, 0] as TScreenCoord;
let _is_mousemoved = false;
let _is_dragging = false;

export const set_target = (event: React.MouseEvent<HTMLDivElement>) => {
  _target = event.currentTarget;
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
};

export const reset_target = () => {
  if (_target === null) {
    throw new Error("try to move element:null");
  }

  _target.style.pointerEvents = "auto";
  _target.style.zIndex = "0";
  if (_is_mousemoved) {
    _target.style.top = "";
    _target.style.left = "";
  }
  
  _target = null;
  _is_dragging = false;
};

export const move_target = (event: React.MouseEvent) => {
  if (_target === null) {
    throw new Error("try to move element:null");
  }
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

export const move_target_on_screen = (event: React.MouseEvent) => {
  // for SelectionView, it is not under `world` transform
  if (_target === null) {
    throw new Error("try to move element:null");
  }
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

// currently not used but may useful for refactoring
export const get_delta = (event: React.MouseEvent<HTMLDivElement>) => {
  const delta = sub_v2w(
    screen_to_world(get_client_pos(event)),
    screen_to_world(_mouse_down_point)
  );
  return delta;
};

// not used
export const get_target = (): HTMLDivElement => {
  if (_target === null) {
    throw new Error("did get_target but target is null");
  }
  return _target;
};
