import React from "react";
import { getGlobal } from "../Global/ReactnCompat";
import { screen_to_world, TScreenCoord } from "../dimension/world_to_screen";
import { updateGlobal } from "../Global/updateGlobal";
import { dev_log } from "../utils/dev";
import { onCanvasMouseUp } from "./onCanvasMouseUp";

export const onCanvasMouseDown = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  dev_log("onCanvasMouseDown");
  if (getGlobal().drag_target !== "") {
    dev_log("previous mouseUp was not handled");
    onCanvasMouseUp(event);
  }

  dev_log("onCanvasMouseDown", event.button);
  if (event.button === 1 /* middle mouse button */) {
    updateGlobal((g) => {
      dev_log("middle mouse button");
      if (g.selected_items.length > 0) {
        g.selected_items = [];
      }
      g.selectionRange.left = event.pageX;
      g.selectionRange.top = event.pageY;
      g.selectionRange.width = 0;
      g.selectionRange.height = 0;
      g.mouseState = "middle_dragging";
      g.dragstart_position = screen_to_world([
        event.pageX,
        event.pageY,
      ] as TScreenCoord);
    });
  } else {
    updateGlobal((g) => {
      if (g.selected_items.length > 0) {
        g.selected_items = [];
      }
      g.selectionRange.left = event.pageX;
      g.selectionRange.top = event.pageY;
      g.selectionRange.width = 0;
      g.selectionRange.height = 0;
      g.mouseState = "selecting";
    });
  }
};
