import React from "react";
import { screen_to_world } from "../dimension/world_to_screen";
import { updateGlobal } from "../Global/updateGlobal";
import { dev_log } from "../utils/dev";
import { set_target } from "./fast_drag_manager";
import { get_client_pos } from "./get_client_pos";

export const onSelectionMouseDown = (
  event: React.MouseEvent<HTMLDivElement>
) => {
  dev_log("onSelectionMouseDown");
  set_target(event);
  updateGlobal((g) => {
    g.dragstart_position = screen_to_world(get_client_pos(event));
    g.drag_target = "selection";
  });

  event.stopPropagation();
};
