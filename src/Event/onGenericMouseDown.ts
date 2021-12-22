import React from "react";
import { getGlobal } from "reactn";
import { V2 } from "../dimension/V2";
import { screen_to_world, TWorldCoord } from "../dimension/world_to_screen";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { highlight_parent } from "../Group/highlight_group";
import { reset_selection } from "../Selection/reset_selection";
import { dev_log } from "../utils/dev";
import { set_target } from "./fast_drag_manager";
import { get_client_pos } from "./get_client_pos";

export const onGenericMouseDown = (
  event: React.MouseEvent<HTMLDivElement>,
  value: { id: TItemId; position: V2 }
) => {
  dev_log(`onGenericMouseDown type:${value.id} id:${value.id}`);
  if (getGlobal().is_selected) {
    reset_selection();
    // if is_selected is true, then we should not start dragging
    // because reset_selection trigger rerendering and it breaks fast_drag_manager
    return;
  }
  set_target(event);
  updateGlobal((g) => {
    const [x, y] = value.position;
    const [cx, cy] = screen_to_world(get_client_pos(event));
    g.dragstart_position = [cx - x, cy - y] as TWorldCoord;
    g.drag_target = value.id;
    dev_log("drag_target", value.id);
  });

  highlight_parent(value.id, true);

  event.stopPropagation();
};
