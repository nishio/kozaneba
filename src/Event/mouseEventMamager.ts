import React from "react";
import { add_v2w, sub_v2w } from "../dimension/V2";
import { screen_to_world } from "../dimension/world_to_screen";
import { ItemId } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "../Group/find_parent";
import { TGroupItem } from "../Group/GroupItem";
import { show_menu } from "../Menu/show_menu";
import { remove_item_from } from "../utils/remove_item";
import { is_dragged, reset_target, set_target } from "./fast_drag_manager";
import { get_client_pos } from "./get_client_pos";
import { get_item } from "./get_item";
import { handle_if_is_click } from "./handle_if_is_click";

export const onKozaneClick = (
  kozane_id: ItemId,
  event: React.MouseEvent<HTMLDivElement>
) => {
  if (is_dragged()) return;
  console.log("onKozaneClick");
  updateGlobal((g) => {
    g.clicked_kozane = kozane_id;
    g.drag_target = "";
  });
  show_menu("Kozane", event);
  reset_target();
};

export const onGroupClick = (
  group_id: ItemId,
  event: React.MouseEvent<HTMLDivElement, MouseEvent>
) => {
  if (is_dragged()) return;
  console.log("onGroupClick");
  updateGlobal((g) => {
    g.clicked_group = group_id;
    g.drag_target = "";
  });
  show_menu("Group", event);
  reset_target();
};

export const onGroupMouseUp = (
  event: React.MouseEvent<HTMLDivElement>,
  group: TGroupItem
) => {
  console.log("onGroupMouseUp");
  event.preventDefault();
  event.stopPropagation();
  if (handle_if_is_click(event)) return;

  const group_id = group.id;
  // if (group_id === target_id) {
  //   // drop a group on itself
  //   onCanvasDrop(event);
  //   return;
  // }
  updateGlobal((g) => {
    const group = g.itemStore[group_id] as TGroupItem;
    console.log(g.drag_target);
    if (g.drag_target === "selection") {
      const delta = sub_v2w(
        screen_to_world(get_client_pos(event)),
        g.dragstart_position
      );
      g.selected_items.forEach((id) => {
        const x = get_item(g, id);
        x.position = sub_v2w(add_v2w(x.position, delta), group.position);
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
      console.log("drop on group", group.id);
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
      const target = get_item(g, g.drag_target);
      target.position = position;
      g.drag_target = "";
      g.is_local_change = true;
      g.last_updated = Date.now();
      reset_target();
    } else {
      throw new Error();
    }
  });
};

export const onSelectionMouseDown = (
  event: React.MouseEvent<HTMLDivElement>
) => {
  console.log("onSelectionMouseDown");
  set_target(event);
  updateGlobal((g) => {
    g.dragstart_position = screen_to_world(get_client_pos(event));
    g.drag_target = "selection";
  });

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
