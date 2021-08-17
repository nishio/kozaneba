import React from "react";
import { getGlobal } from "reactn";
import { updateGlobal } from "../Global/updateGlobal";
import { move_target } from "./fast_drag_manager";

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
    // updateGlobal((g) => {
    //   const target = g.itemStore[g.drag_target];
    //   target.position = sub_v2(
    //     screen_to_world(get_client_pos(event)),
    //     g.dragstart_position
    //   );
    // });
    move_target(event);
  }
};
