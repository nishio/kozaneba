import React from "react";
import { getGlobal } from "reactn";
import { TScreenCoord } from "../dimension/world_to_screen";
import { updateGlobal } from "../Global/updateGlobal";
import { move_target } from "./fast_drag_manager";
import { get_client_pos } from "./get_client_pos";

let last_mouse_position = [0, 0] as TScreenCoord;
export const get_last_mouse_position = () => {
  return last_mouse_position;
};

export const onCanvasMouseMove = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  last_mouse_position = get_client_pos(event);
  const g = getGlobal();
  if (g.mouseState === "selecting") {
    updateGlobal((g) => {
      g.selectionRange.width = last_mouse_position[0] - g.selectionRange.left;
      g.selectionRange.height = last_mouse_position[1] - g.selectionRange.top;
    });
  } else if (g.drag_target !== "") {
    move_target(event);
  }
};
