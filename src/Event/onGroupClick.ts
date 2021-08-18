import React from "react";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { show_menu } from "../Menu/show_menu";
import { is_dragged, reset_target } from "./fast_drag_manager";

export const onGroupClick = (
  group_id: ItemId,
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  if (is_dragged()) return;
  console.log("onGroupClick");
  updateGlobal((g) => {
    g.clicked_group = group_id;
    g.drag_target = "";
  });
  show_menu("Group", event);
  reset_target();
};
