import React from "react";
import { V2 } from "../dimension/V2";
import { screen_to_world, TWorldCoord } from "../dimension/world_to_screen";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { reset_selection } from "../Selection/reset_selection";
import { set_target } from "./fast_drag_manager";
import { get_client_pos } from "./get_client_pos";

// almost same with onKozaneMouseDown
export const onGroupMouseDown = (
  event: React.MouseEvent<HTMLDivElement>,
  value: { id: ItemId; position: V2 }
) => {
  console.log(`onGroupMouseDown id:${value.id}`);
  reset_selection();
  set_target(event);
  updateGlobal((g) => {
    const [x, y] = value.position;
    const [cx, cy] = screen_to_world(get_client_pos(event));
    g.dragstart_position = [cx - x, cy - y] as TWorldCoord;
    g.drag_target = value.id;
  });

  event.stopPropagation();
};
