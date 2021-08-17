import React from "react";
import { TScreenCoord } from "../dimension/world_to_screen";

export const get_client_pos = (
  event: React.MouseEvent | React.DragEvent
): TScreenCoord => {
  return [event.clientX, event.clientY] as TScreenCoord;
};
