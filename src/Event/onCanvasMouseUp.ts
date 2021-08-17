import React from "react";
import { getGlobal } from "reactn";
import { convert_bounding_box_screen_to_world } from "../dimension/convert_bounding_box_screen_to_world";
import { isOverlap } from "../dimension/isOverlap";
import { get_item_bounding_box } from "../dimension/get_bounding_box";
import { ItemId } from "../Global/initializeGlobalState";
import { selection_range_to_bounding_box } from "../dimension/selection_range_to_bounding_box";
import { updateGlobal } from "../Global/updateGlobal";
import { add_v2w, sub_v2w } from "../dimension/V2";
import { remove_item_from } from "../utils/remove_item";
import { reset_target } from "./fast_drag_manager";
import { get_client_pos } from "./get_client_pos";
import {
  screen_to_world,
  TScreenCoord,
  world_to_screen,
} from "../dimension/world_to_screen";
import { find_parent } from "../Group/find_parent";
import { TGroupItem } from "../Group/GroupItem";
import { handle_if_is_click } from "./handle_if_is_click";

export const onCanvasMouseUp = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  console.log("onCanvasMouseUp");
  if (handle_if_is_click(event)) return;

  const g = getGlobal();

  if (g.mouseState === "selecting") {
    finish_selecting(event);
  } else if (g.drag_target === "selection") {
    updateGlobal((g) => {
      const delta = sub_v2w(
        screen_to_world(get_client_pos(event)),
        g.dragstart_position
      );
      g.selected_items.forEach((id) => {
        g.itemStore[id].position = add_v2w(g.itemStore[id].position, delta);
      });
      const sr = g.selectionRange;
      const [qx, qy] = world_to_screen(
        add_v2w(screen_to_world([sr.left, sr.top] as TScreenCoord), delta)
      );
      g.selectionRange.left = qx;
      g.selectionRange.top = qy;
      g.drag_target = "";
      g.is_local_change = true;
      g.last_updated = Date.now();
    });
    reset_target();
  } else if (g.drag_target !== "") {
    const target_id: ItemId = g.drag_target;
    updateGlobal((g) => {
      let position = sub_v2w(
        screen_to_world(get_client_pos(event)),
        g.dragstart_position
      );

      // find parent
      const parent = find_parent(target_id);
      if (parent !== null) {
        const p = g.itemStore[parent] as TGroupItem;
        p.items = remove_item_from(p.items, target_id);
        g.drawOrder.push(target_id);
        position = add_v2w(position, p.position);
      } else {
        g.drawOrder = remove_item_from(g.drawOrder, target_id);
        g.drawOrder.push(target_id);
      }
      g.itemStore[target_id].position = position;
      g.drag_target = "";
      g.is_local_change = true;
      g.last_updated = Date.now();

      // const target = g.itemStore[g.drag_target];
      // const delta = get_delta(event);
      // target.position = add_v2w(target.position, delta);
    });

    reset_target();
  } else {
    throw new Error();
  }
  event.preventDefault();
};

function finish_selecting(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
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
