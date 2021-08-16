import React from "react";
import { add_v2, add_v2w, sub_v2w } from "../dimension/V2";
import {
  screen_to_world,
  TScreenCoord,
  TWorldCoord,
} from "../dimension/world_to_screen";
import { updateGlobal } from "../Global/updateGlobal";
import { get_client_pos } from "./get_client_pos";

let _target: HTMLDivElement | null;
let _mouse_down_point = [0, 0] as TScreenCoord;
let _first_element_position = [0, 0] as TScreenCoord;
let _is_mousemoved = false;

export const set_target = (event: React.MouseEvent<HTMLDivElement>) => {
  _target = event.currentTarget;
  _mouse_down_point = get_client_pos(event);
  _first_element_position = [
    Number.parseFloat(_target.style.left),
    Number.parseFloat(_target.style.top),
  ] as TScreenCoord;
  _is_mousemoved = false;
};

export const reset_target = (event: React.MouseEvent<HTMLDivElement>) => {
  updateGlobal((g) => {
    const target = g.itemStore[g.drag_target];
    const delta = sub_v2w(
      screen_to_world(get_client_pos(event)),
      screen_to_world(_mouse_down_point)
    );
    target.position = add_v2w(target.position, delta);
    g.drag_target = "";
  });

  _target = null;
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

export const is_dragged = () => {
  return _is_mousemoved;
};
