import React from "react";
import { screen_to_world, TWorldCoord } from "../dimension/world_to_screen";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { reset_selection } from "../Selection/reset_selection";
import { get_client_pos } from "./get_client_pos";

// almost same with onKozaneMouseDown
export const onGroupMouseDown = (
  event: React.MouseEvent<HTMLDivElement>,
  value: { id: ItemId; position: number[] }
) => {
  console.log("onGroupMouseDown");
  reset_selection();

  updateGlobal((g) => {
    const [x, y] = value.position;
    const [cx, cy] = screen_to_world(get_client_pos(event));
    g.dragstart_position = [cx - x, cy - y] as TWorldCoord;
    g.drag_target = value.id;
  });

  event.stopPropagation();
};
