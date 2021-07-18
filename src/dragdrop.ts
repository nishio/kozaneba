import React from "react";
import { updateGlobal } from "./updateGlobal";
import { screen_to_world } from "./world_to_screen";

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
