import React from "react";
import { V2 } from "../dimension/V2";
import { screen_to_world, TWorldCoord } from "../dimension/world_to_screen";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { highlight_parent } from "../Group/highlight_group";
import { reset_selection } from "../Selection/reset_selection";
import { set_target } from "./fast_drag_manager";
import { get_client_pos } from "./get_client_pos";

export const onGenericMouseDown = (
  event: React.MouseEvent<HTMLDivElement>,
  value: { id: TItemId; position: V2 }
) => {
  console.log(`onGenericMouseDown type:${value.id} id:${value.id}`);
  reset_selection();
  set_target(event);
  updateGlobal((g) => {
    const [x, y] = value.position;
    const [cx, cy] = screen_to_world(get_client_pos(event));
    g.dragstart_position = [cx - x, cy - y] as TWorldCoord;
    g.drag_target = value.id;
  });

  highlight_parent(value.id, true);

  event.stopPropagation();
};
