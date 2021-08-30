import React from "react";
import { getGlobal } from "reactn";
import { is_dragged } from "./fast_drag_manager";
import { onGenericClick } from "./onGenericClick";
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
    return onGenericClick(event, g.drag_target);
  }
  return false;
};
