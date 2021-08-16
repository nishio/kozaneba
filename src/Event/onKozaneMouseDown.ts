import React from "react";
import { ItemId, KozaneViewId } from "../Global/initializeGlobalState";
import { reset_selection } from "../Selection/reset_selection";
import { updateGlobal } from "../Global/updateGlobal";
import { screen_to_world, TWorldCoord } from "../dimension/world_to_screen";
import { get_client_pos } from "./get_client_pos";

export const onKozaneMouseDown = (
  event: React.MouseEvent<HTMLDivElement>,
  value: { id: ItemId; position: number[] }
) => {
  console.log("onKozaneMouseDown");
  reset_selection();

  updateGlobal((g) => {
    const [x, y] = value.position;
    const [cx, cy] = screen_to_world(get_client_pos(event));
    g.dragstart_position = [cx - x, cy - y] as TWorldCoord;
    g.drag_target = value.id;
  });

  event.stopPropagation();
};
