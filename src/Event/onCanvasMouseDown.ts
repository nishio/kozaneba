import { getGlobal } from "reactn";
import { screen_to_world, TScreenCoord } from "../dimension/world_to_screen";
import { updateGlobal } from "../Global/updateGlobal";
import { dev_log } from "../utils/dev";
import { capture_pointer_on_canvas } from "./fast_drag_manager";
import {
  get_button,
  get_client_pos,
  should_ignore_compat_mouse_event,
  TInputEvent,
} from "./input_event";
import { onCanvasMouseUp } from "./onCanvasMouseUp";

export const onCanvasMouseDown = (
  event: TInputEvent<HTMLDivElement>
) => {
  if (should_ignore_compat_mouse_event(event)) return;
  dev_log("onCanvasMouseDown");
  if (getGlobal().drag_target !== "") {
    dev_log("previous mouseUp was not handled");
    onCanvasMouseUp(event);
  }

  capture_pointer_on_canvas(event);
  const [x, y] = get_client_pos(event);
  dev_log("onCanvasMouseDown", get_button(event));
  if (get_button(event) === 1 /* middle mouse button */) {
    updateGlobal((g) => {
      dev_log("middle mouse button");
      if (g.selected_items.length > 0) {
        g.selected_items = [];
      }
      g.selectionRange.left = x;
      g.selectionRange.top = y;
      g.selectionRange.width = 0;
      g.selectionRange.height = 0;
      g.mouseState = "middle_dragging";
      g.dragstart_position = screen_to_world([x, y] as TScreenCoord);
    });
  } else {
    updateGlobal((g) => {
      if (g.selected_items.length > 0) {
        g.selected_items = [];
      }
      g.selectionRange.left = x;
      g.selectionRange.top = y;
      g.selectionRange.width = 0;
      g.selectionRange.height = 0;
      g.mouseState = "selecting";
    });
  }
};
