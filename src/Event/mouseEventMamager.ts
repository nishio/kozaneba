import React from "react";
import { getGlobal, setGlobal } from "reactn";
import { convert_bounding_box_screen_to_world } from "../dimension/convert_bounding_box_screen_to_world";
import { isOverlap } from "../dimension/isOverlap";
import { get_item_bounding_box } from "../dimension/get_bounding_box";
import { ItemId } from "../Global/initializeGlobalState";
import { TGroupItem } from "../Group/GroupItem";
import { selection_range_to_bounding_box } from "../dimension/selection_range_to_bounding_box";
import { updateGlobal } from "../Global/updateGlobal";
import {
  screen_to_world,
  TScreenCoord,
  TWorldCoord,
  world_to_screen,
} from "../dimension/world_to_screen";
import { add_v2, add_v2w, sub_v2w } from "../dimension/V2";
import { find_parent } from "../Group/find_parent";
import { remove_item_from } from "../utils/remove_item";
import { get_client_pos } from "./get_client_pos";
import { reset_target } from "./fast_drag_manager";

export const onGroupDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  value: TGroupItem
) => {
  console.log("onGroupDragStart");
  event.stopPropagation();

  if (event.dataTransfer !== undefined) {
    event.dataTransfer.effectAllowed = "move";
  }
  updateGlobal((g) => {
    const [x, y] = value.position;
    const [cx, cy] = screen_to_world(get_client_pos(event));
    g.dragstart_position = [cx - x, cy - y] as TWorldCoord;
    g.drag_target = value.id;
  });
};

export const onKozaneDragStart = (
  event: React.DragEvent<HTMLDivElement>,
  value: { id: ItemId; position: number[] }
) => {
  console.log("onKozaneDragStart");
  if (event.dataTransfer !== undefined) {
    event.dataTransfer.effectAllowed = "move";
  }
  // updateGlobal((g) => {
  //   const [x, y] = value.position;
  //   const [cx, cy] = screen_to_world([event.clientX, event.clientY]);
  //   g.dragstart_position = [cx - x, cy - y];
  //   g.drag_target = value.id;
  // });
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
    g.dragstart_position = screen_to_world(get_client_pos(event));
    g.drag_target = "selection";
  });
};

export const onCanvasDrop = (event: React.DragEvent<HTMLDivElement>) => {
  console.log("onCanvasDrop");
  updateGlobal((g) => {
    console.log(g.drag_target);
    if (g.drag_target === "selection") {
      const delta = sub_v2w(
        screen_to_world(get_client_pos(event)),
        g.dragstart_position
      );
      g.selected_items.forEach((id) => {
        g.itemStore[id].position = add_v2w(g.itemStore[id].position, delta);
      });
      const sr = g.selectionRange;
      const [qx, qy] = world_to_screen(
        add_v2(
          screen_to_world([sr.left, sr.top] as TScreenCoord),
          delta
        ) as TWorldCoord
      );
      g.selectionRange.left = qx;
      g.selectionRange.top = qy;
      g.drag_target = "";
      g.is_local_change = true;
      g.last_updated = Date.now();
    } else if (g.drag_target !== "") {
      let position = sub_v2w(
        screen_to_world(get_client_pos(event)),
        g.dragstart_position
      );

      // find parent
      const parent = find_parent(g.drag_target);
      if (parent !== null) {
        const p = g.itemStore[parent] as TGroupItem;
        p.items = remove_item_from(p.items, g.drag_target);
        g.drawOrder.push(g.drag_target);
        position = add_v2w(position, p.position);
      } else {
        g.drawOrder = remove_item_from(g.drawOrder, g.drag_target);
        g.drawOrder.push(g.drag_target);
      }
      g.itemStore[g.drag_target].position = position;
      g.drag_target = "";
      g.is_local_change = true;
      g.last_updated = Date.now();
    } else {
      throw new Error();
    }
  });
  event.preventDefault();
  console.log(getGlobal().selectionRange);
};

export const onGroupDrop = (
  event: React.DragEvent<HTMLDivElement>,
  group: TGroupItem
) => {
  console.log("onGroupDrop");
  event.preventDefault();
  event.stopPropagation();

  const target_id = getGlobal().drag_target;
  const group_id = group.id;
  if (group_id === target_id) {
    // drop a group on itself
    onCanvasDrop(event);
    return;
  }
  updateGlobal((g) => {
    const group = g.itemStore[group_id] as TGroupItem;
    console.log(g.drag_target);
    if (g.drag_target === "selection") {
      const delta = sub_v2w(
        screen_to_world(get_client_pos(event)),
        g.dragstart_position
      );
      g.selected_items.forEach((id) => {
        g.itemStore[id].position = sub_v2w(
          add_v2w(g.itemStore[id].position, delta),
          group.position
        );
        g.drawOrder = remove_item_from(g.drawOrder, id);
        group.items.push(id);
      });
      // const sr = g.selectionRange;
      // const [qx, qy] = world_to_screen(
      //   add_v2(screen_to_world([sr.left, sr.top]), delta)
      // );
      // g.selectionRange.left = qx;
      // g.selectionRange.top = qy;
      g.drag_target = "";

      // reset selection
      g.selected_items = [];
      g.selectionRange = { top: 0, left: 0, width: 0, height: 0 };
      g.is_selected = false;
      g.is_local_change = true;
      g.last_updated = Date.now();
    } else if (g.drag_target !== "") {
      let position = sub_v2w(
        screen_to_world(get_client_pos(event)),
        g.dragstart_position
      );

      const parent = find_parent(g.drag_target);
      if (parent !== null) {
        const p = g.itemStore[parent] as TGroupItem;
        // `p` may equals to `group`, it's OK
        p.items = remove_item_from(p.items, g.drag_target);
        group.items.push(g.drag_target);
        position = sub_v2w(add_v2w(position, p.position), group.position);
      } else {
        g.drawOrder = remove_item_from(g.drawOrder, g.drag_target);
        group.items.push(g.drag_target);
        position = sub_v2w(position, group.position);
      }
      g.itemStore[g.drag_target].position = position;
      g.drag_target = "";
      g.is_local_change = true;
      g.last_updated = Date.now();
    } else {
      throw new Error();
    }
  });
};

export const onSelectionMouseDown = (
  event: React.MouseEvent<HTMLDivElement>
) => {
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
  } else if (g.drag_target !== "") {
    reset_target(event);
  }
  console.log(getGlobal().selectionRange);
};
