import React from "react";
import { getGlobal } from "reactn";
import {
  convert_bounding_box_screen_to_world,
  isOverlapBox,
} from "./BoundingBox";
import { getItemBoundingBox } from "./get_bounding_box";
import { GroupItem, ItemId } from "./initializeGlobalState";
import { reset_selection } from "./reset_selection";
import { selectionRange_to_boundingBox } from "./TRect";
import { updateGlobal } from "./updateGlobal";
import { screen_to_world, world_to_screen } from "./world_to_screen";

export const onGroupDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  value: GroupItem
) => {
  console.log("onGroupDragStart");
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

export const onFusenDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  value: {id: ItemId, position: number[]}
) => {
  console.log("onFusenDragStart");
  if (event.dataTransfer !== undefined) {
    event.dataTransfer.effectAllowed = "move";
  }
  updateGlobal((g) => {
    const [x, y] = value.position;
    const [cx, cy] = screen_to_world([event.clientX, event.clientY]);
    g.dragstart_position = [cx - x, cy - y];
    g.drag_target = value.id;
  });
  event.stopPropagation(); // stop dragstart of parent group
};


export const allowDrop = (event: React.DragEvent<HTMLDivElement>) => {
  event.dataTransfer.dropEffect = "move";
  event.preventDefault();
};

export const onSelectionDragStart = (
  event: React.DragEvent<HTMLDivElement>
) => {
  console.log("onDragStartSelection");
  if (event.dataTransfer !== undefined) {
    event.dataTransfer.effectAllowed = "move";
  }
  updateGlobal((g) => {
    g.dragstart_position = screen_to_world([event.clientX, event.clientY]);
    g.drag_target = "selection";
  });
};


export const onCanvasDrop = (event: React.DragEvent<HTMLDivElement>) => {
  console.log("onCanvasDrop");
  updateGlobal((g) => {
    console.log(g.drag_target);
    if (g.drag_target === "selection") {
      const [x, y] = screen_to_world([event.clientX, event.clientY]);
      const [dsx, dsy] = g.dragstart_position;
      const [dx, dy] = [x - dsx, y - dsy];
      g.selected_items.forEach((id) => {
        const [px, py] = g.itemStore[id].position;
        g.itemStore[id].position = [px + dx, py + dy];
      });
      const sr = g.selectionRange;
      const [sx, sy] = screen_to_world([sr.left, sr.top]);
      const [qx, qy] = world_to_screen([sx + dx, sy + dy]);
      g.selectionRange.left = qx;
      g.selectionRange.top = qy;
      g.drag_target = "";
    } else if (g.drag_target !== "") {
      const [dsx, dsy] = g.dragstart_position;
      const [x, y] = screen_to_world([event.clientX, event.clientY]);
      g.itemStore[g.drag_target].position = [x - dsx, y - dsy];
      g.drag_target = "";
    } else {
      throw new Error();
    }
  });
  event.preventDefault();
};

export const onGroupDrop = (event: React.DragEvent<HTMLDivElement>, value:GroupItem) => {
  console.log("onGroupDrop");
  updateGlobal((g) => {
    console.log(g.drag_target);
    if (g.drag_target === "selection") {
      // const [x, y] = screen_to_world([event.clientX, event.clientY]);
      // const [dsx, dsy] = g.dragstart_position;
      // const [dx, dy] = [x - dsx, y - dsy];
      // g.selected_items.forEach((id) => {
      //   const [px, py] = g.itemStore[id].position;
      //   g.itemStore[id].position = [px + dx, py + dy];
      // });
      // const sr = g.selectionRange;
      // const [sx, sy] = screen_to_world([sr.left, sr.top]);
      // const [qx, qy] = world_to_screen([sx + dx, sy + dy]);
      // g.selectionRange.left = qx;
      // g.selectionRange.top = qy;
      // g.drag_target = "";
    } else if (g.drag_target !== "") {
      const [dsx, dsy] = g.dragstart_position;
      const [x, y] = screen_to_world([event.clientX, event.clientY]);
      g.itemStore[g.drag_target].position = [x - dsx, y - dsy];
      g.drag_target = "";
    } else {
      throw new Error();
    }
  });
  event.preventDefault();
  event.stopPropagation();
};


export const onGroupMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
  reset_selection()
  event.stopPropagation();
};

export const onSelectionMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
  event.stopPropagation();
};

export const onFusenMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
  reset_selection()
  event.stopPropagation();
};

export const onCanvasMouseDown = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  console.log("onCanvasMouseDown");
  updateGlobal((g) => {
    g.selected_items = [];
    g.selectionRange.left = event.pageX;
    g.selectionRange.top = event.pageY;
    g.selectionRange.width = 0;
    g.selectionRange.height = 0;
    g.mouseState = "selecting";
  });
};
export const onCanvasMouseMove = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  const g = getGlobal();
  if (g.mouseState === "selecting") {
    updateGlobal((g) => {
      g.selectionRange.width = event.pageX - g.selectionRange.left;
      g.selectionRange.height = event.pageY - g.selectionRange.top;
    });
  }
};
export const onCanvasMouseUp = (
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  console.log("onCanvasMouseUp");
  const g = getGlobal();
  if (g.mouseState === "selecting") {    
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
        selectionRange_to_boundingBox(g.selectionRange)
      );
      const selected_items = [] as ItemId[];
      g.drawOrder.forEach((id) => {
        if (isOverlapBox(sr, getItemBoundingBox(id))) {
          selected_items.push(id);
        }
      });
      g.selected_items = selected_items;
      g.mouseState = "";
      g.is_selected = true;
    });
  }
};
