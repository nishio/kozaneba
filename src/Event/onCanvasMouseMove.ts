import { getGlobal } from "reactn";
import { TScreenCoord } from "../dimension/world_to_screen";
import { updateGlobal } from "../Global/updateGlobal";
import { dev_log } from "../utils/dev";
import { clear_drop_group_highlight, update_drop_group_highlight } from "./drop_target";
import { move_target, move_target_on_screen } from "./fast_drag_manager";
import { get_client_pos } from "./get_client_pos";
import { should_ignore_compat_mouse_event, TInputEvent } from "./input_event";

let last_mouse_position = [0, 0] as TScreenCoord;
export const get_last_mouse_position = () => {
  return last_mouse_position;
};

export const onCanvasMouseMove = (
  event: TInputEvent<HTMLDivElement>
) => {
  if (should_ignore_compat_mouse_event(event)) return;
  last_mouse_position = get_client_pos(event);
  const g = getGlobal();
  if (g.mouseState === "selecting") {
    clear_drop_group_highlight();
    dev_log(`g.mouseState === "selecting"`);
    updateGlobal((g) => {
      g.selectionRange.width = last_mouse_position[0] - g.selectionRange.left;
      g.selectionRange.height = last_mouse_position[1] - g.selectionRange.top;
    });
  } else if (g.drag_target === "selection") {
    dev_log(`g.drag_target === "selection"`);
    move_target_on_screen(event);
    update_drop_group_highlight(event);
  } else if (g.drag_target !== "") {
    dev_log(`g.drag_target === ${g.drag_target}`);
    move_target(event);
    if (g.mouseState !== "middle_dragging" && g.mouseState !== "making_line") {
      update_drop_group_highlight(event);
    }
  } else {
    clear_drop_group_highlight();
  }
};
