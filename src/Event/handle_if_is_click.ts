import React from "react";
import { getGlobal } from "reactn";
import { is_dragged } from "./fast_drag_manager";
import { get_item } from "./get_item";
import { onGroupClick } from "./onGroupClick";
import { onKozaneClick } from "./onKozaneClick";
import { onSelectionClick } from "./onSelectionClick";

export const handle_if_is_click = (event: React.MouseEvent<HTMLDivElement>) => {
  const g = getGlobal();
  if (!is_dragged()) {
    // is click
    if (g.mouseState === "selecting") {
      return false;
    }
    if (g.drag_target === "selection") {
      onSelectionClick(event);
      return true;
    }
    if (g.drag_target === "") {
      throw new Error("Click on nothing");
    }
    const target = get_item(g, g.drag_target);
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
