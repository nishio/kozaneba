import React from "react";
import { updateGlobal } from "../Global/updateGlobal";

export const onCanvasMouseDown = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  console.log("onCanvasMouseDown");

  updateGlobal((g) => {
    if (g.selected_items.length > 0) {
      g.selected_items = [];
    }
    g.selectionRange.left = event.pageX;
    g.selectionRange.top = event.pageY;
    g.selectionRange.width = 0;
    g.selectionRange.height = 0;
    g.mouseState = "selecting";
  });
};
