import React from "react";
import { getGlobal } from "reactn";
import { Sentry } from "../initSentry";
import { is_dragged } from "./fast_drag_manager";
import { onGenericClick } from "./onGenericClick";
import { onSelectionClick } from "./onSelectionClick";

export const handle_if_is_click = (event: React.MouseEvent<HTMLDivElement>) => {
  // if the event is click, return true to prevent drag handling
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
      // throw new Error("Click on nothing");
      Sentry.captureMessage("Click on nothing");
      return;
    }
    return onGenericClick(event, g.drag_target);
  }
  return false;
};
