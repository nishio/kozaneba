import React from "react";
import { getGlobal } from "../Global/ReactnCompat";
import { handle_if_is_click } from "./handle_if_is_click";
import { get_delta } from "./get_delta";
import { finish_selecting } from "./finish_selecting";
import { drag_drop_selection } from "./drag_drop_selection";
import { drag_drop_item } from "./drag_drop_item";
import { moveCenter } from "../utils/moveCenter";
import { handle_making_line } from "./handle_making_line";

export const onCanvasMouseUp = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  console.log("onCanvasMouseUp");
  if (handle_if_is_click(event)) return;

  const g = getGlobal();
  const delta = get_delta(event);

  if (g.mouseState === "selecting") {
    finish_selecting(event);
  } else if (g.mouseState === "middle_dragging") {
    moveCenter(delta[0], delta[1]);
  } else if (g.mouseState === "making_line") {
    // // when clicked on nothing, cancel making line
    // updateGlobal((g) => {
    //   g.mouseState = "";
    // });
    if (g.drag_target !== "" && g.drag_target !== "selection") {
      handle_making_line(g.drag_target);
      drag_drop_item(g, delta, g.drag_target);
    }
  } else if (g.drag_target === "selection") {
    drag_drop_selection(delta);
  } else if (g.drag_target !== "") {
    drag_drop_item(g, delta, g.drag_target);
  } else {
    throw new Error();
  }
  event.preventDefault();
};
