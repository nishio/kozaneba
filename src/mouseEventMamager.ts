import React from "react";
import {
  convert_bounding_box_screen_to_world,
  isOverlapBox,
} from "./BoundingBox";
import { getItemBoundingBox } from "./Group";
import { GroupItem, ItemId } from "./initializeGlobalState";
import { selectionRange_to_boundingBox } from "./TRect";
import { updateGlobal } from "./updateGlobal";
import { screen_to_world } from "./world_to_screen";

export const onDragStartGroup = (
  event: React.DragEvent<HTMLDivElement>,
  value: GroupItem
) => {
  console.log("onDragStartGroup");
  if (event.dataTransfer !== undefined) {
    event.dataTransfer.effectAllowed = "move";
  }
  updateGlobal((g) => {
    const [x, y] = value.position;
    const [cx, cy] = screen_to_world([event.clientX, event.clientY]);
    g.dragstart_position = [cx - x, cy - y];
    g.drag_target = value.id;
  });
};

export const allowDrop = (event: React.DragEvent<HTMLDivElement>) => {
  event.dataTransfer.dropEffect = "move";
  event.preventDefault();
};

export const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
  console.log("onDrop");
  updateGlobal((g) => {
    if (g.drag_target !== "") {
      const [dsx, dsy] = g.dragstart_position;
      const [x, y] = screen_to_world([event.clientX, event.clientY]);
      g.itemStore[g.drag_target].position = [x - dsx, y - dsy];
      g.drag_target = "" as ItemId;
    }
  });
  event.preventDefault();
};

let isDragging = false;
export const onMouseDown = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  console.log("onMouseDown");
  isDragging = true;
  updateGlobal((g) => {
    g.selectionRange.left = event.pageX;
    g.selectionRange.top = event.pageY;
    g.selectionRange.width = 0;
    g.selectionRange.height = 0;
  });
};
export const onMouseMove = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  if (isDragging) {
    console.log("onMouseMove");
    updateGlobal((g) => {
      g.selectionRange.width = event.pageX - g.selectionRange.left;
      g.selectionRange.height = event.pageY - g.selectionRange.top;
    });
  }
};
export const onMouseUp = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  console.log("onMouseUp");
  if (isDragging) {
    updateGlobal((g) => {
      g.selectionRange.width = event.pageX - g.selectionRange.left;
      g.selectionRange.height = event.pageY - g.selectionRange.top;

      const sr = convert_bounding_box_screen_to_world(
        selectionRange_to_boundingBox(g.selectionRange)
      );
      const selected_items = [] as ItemId[];
      g.drawOrder.forEach((id) => {
        if (isOverlapBox(sr, getItemBoundingBox(id))) {
          selected_items.push(id);
        }
      });
      g.selected_items = selected_items;
    });
    isDragging = false;
  }
};
