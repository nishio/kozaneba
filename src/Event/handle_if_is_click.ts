import React from "react";
import { getGlobal } from "reactn";
import { show_menu } from "../Menu/show_menu";
import { is_dragged } from "./fast_drag_manager";
import { onKozaneClick, onGroupClick } from "./mouseEventMamager";

export const handle_if_is_click = (event: React.MouseEvent<HTMLDivElement>) => {
  const g = getGlobal();
  if (!is_dragged()) {
    // is click
    if (g.mouseState === "selecting") {
      return false;
    }
    if (g.drag_target === "selection") {
      show_menu("Selection", event);
      return true;
    }
    if (g.drag_target === "") {
      throw new Error("Click on nothing");
    }
    const target = g.itemStore[g.drag_target];
    if (target.type === "kozane") {
      onKozaneClick(g.drag_target, event);
      return true;
    } else if (target.type === "group") {
      onGroupClick(g.drag_target, event);
      return true;
    }
  }
  return false;
};
