import React from "react";
import { getGlobal } from "reactn";
import { handle_if_is_click } from "./handle_if_is_click";
import { get_delta } from "./get_delta";
import { finish_selecting } from "./finish_selecting";
import { drag_drop_selection } from "./drag_drop_selection";
import { drag_drop_item } from "./drag_drop_item";

export const onCanvasMouseUp = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  console.log("onCanvasMouseUp");
  if (handle_if_is_click(event)) return;

  const g = getGlobal();
  const delta = get_delta(event);

  if (g.mouseState === "selecting") {
    finish_selecting(event);
  } else if (g.drag_target === "selection") {
    drag_drop_selection(delta);
  } else if (g.drag_target !== "") {
    drag_drop_item(g, delta, g.drag_target);
  } else {
    throw new Error();
  }
  event.preventDefault();
};
