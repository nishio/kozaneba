import React from "react";
import { GroupItem } from "./initializeGlobalState";
import { updateGlobal } from "./updateGlobal";
import { screen_to_world } from "./world_to_screen";

export const onDragStartGroup = (
  event: React.DragEvent<HTMLDivElement>,
  value: GroupItem
) => {
  if (event.dataTransfer !== undefined) {
    event.dataTransfer.effectAllowed = "move";
  }
  updateGlobal((g) => {
    const [x, y] = value.position;
    const [cx, cy] = screen_to_world([event.clientX, event.clientY]);
    g.dragstart_position = [cx - x, cy - y];
    g.drag_target = value.id;
  });
};

export const allowDrop = (event: React.DragEvent<HTMLDivElement>) => {
  event.dataTransfer.dropEffect = "move";
  event.preventDefault();
};
export const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
  updateGlobal((g) => {
    const [dsx, dsy] = g.dragstart_position;
    const [x, y] = screen_to_world([event.clientX, event.clientY]);
    g.itemStore[g.drag_target].position = [x - dsx, y - dsy];
  });
  event.preventDefault();
};
