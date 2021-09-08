import React from "react";
import { getGlobal } from "reactn";
import { mark_local_changed } from "../Cloud/mark_local_changed";
import { convert_bounding_box_screen_to_world } from "../dimension/convert_bounding_box_screen_to_world";
import { get_item_bounding_box } from "../dimension/get_bounding_box";
import { isOverlap } from "../dimension/isOverlap";
import { selection_range_to_bounding_box } from "../dimension/selection_range_to_bounding_box";
import { add_v2w, sub_v2w } from "../dimension/V2";
import {
  screen_to_world,
  TScreenCoord,
  world_to_screen,
} from "../dimension/world_to_screen";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "../utils/find_parent";
import { move_front } from "../utils/move_front";
import { normalize_group_position } from "../utils/normalize_group_position";
import { remove_item } from "../utils/remove_item";
import { pin } from "../Physics/pin";
import { remove_item_from } from "../utils/remove_item_from";
import { reset_target } from "./fast_drag_manager";
import { get_client_pos } from "./get_client_pos";
import { get_group } from "./get_group";
import { get_item } from "./get_item";
import { handle_if_is_click } from "./handle_if_is_click";

export const get_delta = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  const g = getGlobal();
  return sub_v2w(screen_to_world(get_client_pos(event)), g.dragstart_position);
};

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
    updateGlobal((g) => {
      g.selected_items.forEach((id) => {
        const x = get_item(g, id);
        x.position = add_v2w(x.position, delta);
        pin[id] = x.position;
      });
      const sr = g.selectionRange;
      const [qx, qy] = world_to_screen(
        add_v2w(screen_to_world([sr.left, sr.top] as TScreenCoord), delta)
      );
      g.selectionRange.left = qx;
      g.selectionRange.top = qy;
      g.drag_target = "";
    });
    mark_local_changed();
    reset_target();
  } else if (g.drag_target !== "") {
    const target_id: ItemId = g.drag_target;

    const parent = find_parent(target_id);
    if (parent !== null) {
      console.log(`move target ${target_id} out from parent`);
      updateGlobal((g) => {
        const p = get_group(g, parent);
        p.items = remove_item_from(p.items, target_id);
        g.drawOrder.push(target_id);
        const x = get_item(g, target_id);
        x.position = add_v2w(delta, p.position);
        pin[target_id] = x.position;
        g.drag_target = "";

        if (p.items.length === 0 && p.text === "") {
          remove_item(g, parent);
        } else {
          normalize_group_position(parent, g);
        }
      });
    } else {
      console.log(`move target ${target_id} on top level`);
      move_front(target_id);
      updateGlobal((g) => {
        const x = get_item(g, target_id);
        x.position = delta;
        pin[target_id] = x.position;
        g.drag_target = "";
      });
    }

    mark_local_changed();
    reset_target();
  } else {
    throw new Error();
  }
  event.preventDefault();
};

export function finish_selecting(
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) {
  updateGlobal((g) => {
    g.selectionRange.width = event.pageX - g.selectionRange.left;
    g.selectionRange.height = event.pageY - g.selectionRange.top;

    if (g.selectionRange.width === 0 && g.selectionRange.height === 0) {
      // not selected
      g.is_selected = false;
      g.mouseState = "";
      return;
    }
    const sr = convert_bounding_box_screen_to_world(
      selection_range_to_bounding_box(g.selectionRange)
    );
    const selected_items = [] as ItemId[];
    g.drawOrder.forEach((id) => {
      if (isOverlap(sr, get_item_bounding_box(id))) {
        selected_items.push(id);
      }
    });
    g.selected_items = selected_items;
    g.mouseState = "";
    g.is_selected = true;
  });
}
