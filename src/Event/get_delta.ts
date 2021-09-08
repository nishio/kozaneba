import React from "react";
import { getGlobal } from "reactn";
import { sub_v2w } from "../dimension/V2";
import { screen_to_world } from "../dimension/world_to_screen";
import { get_client_pos } from "./get_client_pos";

export const get_delta = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  const g = getGlobal();
  return sub_v2w(screen_to_world(get_client_pos(event)), g.dragstart_position);
};
