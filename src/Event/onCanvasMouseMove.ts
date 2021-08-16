import React from "react";
import { getGlobal } from "reactn";
import { sub_v2 } from "../dimension/V2";
import { screen_to_world } from "../dimension/world_to_screen";
import { updateGlobal } from "../Global/updateGlobal";
import { get_client_pos } from "./get_client_pos";

export const onCanvasMouseMove = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  const g = getGlobal();
  if (g.mouseState === "selecting") {
    updateGlobal((g) => {
      g.selectionRange.width = event.pageX - g.selectionRange.left;
      g.selectionRange.height = event.pageY - g.selectionRange.top;
    });
  } else if (g.drag_target !== "") {
    updateGlobal((g) => {
      const target = g.itemStore[g.drag_target];
      target.position = sub_v2(
        screen_to_world(get_client_pos(event)),
        g.dragstart_position
      );
    });
  }
};
