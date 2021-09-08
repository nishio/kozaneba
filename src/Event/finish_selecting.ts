import React from "react";
import { convert_bounding_box_screen_to_world } from "../dimension/convert_bounding_box_screen_to_world";
import { get_item_bounding_box } from "../dimension/get_bounding_box";
import { isOverlap } from "../dimension/isOverlap";
import { selection_range_to_bounding_box } from "../dimension/selection_range_to_bounding_box";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";

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
