import { getGlobal } from "reactn";
import { handle_if_is_click } from "./handle_if_is_click";
import { get_delta } from "./get_delta";
import { finish_selecting } from "./finish_selecting";
import { drag_drop_selection } from "./drag_drop_selection";
import { drag_drop_item } from "./drag_drop_item";
import { dev_log } from "../utils/dev";
import { moveCenter } from "../utils/moveCenter";
import { handle_making_line } from "./handle_making_line";
import { get_drop_group_id, clear_drop_group_highlight } from "./drop_target";
import { drag_drop_selection_into_group } from "./drag_drop_selection_into_group";
import { drag_drop_item_into_group } from "./drag_drop_item_into_group";
import { move_front } from "../utils/move_front";
import { updateGlobal } from "../Global/updateGlobal";
import {
  release_pointer_capture,
  reset_target,
  is_draggeing,
} from "./fast_drag_manager";
import {
  should_ignore_compat_mouse_event,
  TInputEvent,
} from "./input_event";
import { TItemId } from "../Global/TItemId";
import { find_parent } from "../utils/find_parent";

const is_self_or_descendant_group = (
  group_id: TItemId,
  target_id: string
): boolean => {
  if (group_id === target_id) return true;
  let parent = find_parent(group_id);
  while (parent !== null) {
    if (parent === target_id) return true;
    parent = find_parent(parent);
  }
  return false;
};

const get_valid_drop_group_id = (
  event: TInputEvent<HTMLDivElement>,
  target_id: string
) => {
  const group_id = get_drop_group_id(event);
  if (group_id === null) return null;
  if (is_self_or_descendant_group(group_id, target_id)) return null;
  return group_id;
};

export const onCanvasMouseUp = (
  event: TInputEvent<HTMLDivElement>
) => {
  if (should_ignore_compat_mouse_event(event)) return;
  dev_log("onCanvasMouseUp");
  clear_drop_group_highlight();
  if (handle_if_is_click(event)) {
    release_pointer_capture();
    return;
  }

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
    const group_id = get_drop_group_id(event);
    if (group_id !== null) {
      move_front(group_id);
      drag_drop_selection_into_group(group_id, delta);
    } else {
      drag_drop_selection(delta);
    }
  } else if (g.drag_target !== "") {
    const group_id = get_valid_drop_group_id(event, g.drag_target);
    if (group_id !== null) {
      move_front(group_id);
      drag_drop_item_into_group(group_id, delta, g.drag_target);
    } else {
      drag_drop_item(g, delta, g.drag_target);
    }
  } else {
    throw new Error();
  }
  release_pointer_capture();
  event.preventDefault();
};

export const onCanvasPointerCancel = (
  event: TInputEvent<HTMLDivElement>
) => {
  if (should_ignore_compat_mouse_event(event)) return;
  clear_drop_group_highlight();
  updateGlobal((g) => {
    g.mouseState = "";
    g.drag_target = "";
    g.selectionRange = { top: 0, left: 0, width: 0, height: 0 };
    g.is_selected = false;
  });
  if (is_draggeing()) {
    reset_target();
  } else {
    release_pointer_capture();
  }
};
