import React from "react";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { show_menu } from "../Menu/show_menu";
import { is_dragged, reset_target } from "./fast_drag_manager";

export const onKozaneClick = (
  kozane_id: ItemId,
  event: React.MouseEvent<HTMLDivElement>
) => {
  if (is_dragged()) return;
  console.log("onKozaneClick");
  updateGlobal((g) => {
    g.clicked_kozane = kozane_id;
    g.drag_target = "";
  });
  show_menu("Kozane", event);
  reset_target();
};
