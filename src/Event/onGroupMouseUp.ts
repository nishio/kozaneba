import React from "react";
import { getGlobal } from "reactn";
import { mark_local_changed } from "../Cloud/mark_local_changed";
import { add_v2w, sub_v2w } from "../dimension/V2";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "../Group/find_parent";
import { TGroupItem } from "../Group/GroupItem";
import { move_front } from "../Menu/move_front";
import { normalize_group_position } from "../Menu/normalize_group_position";
import { remove_item_from } from "../utils/remove_item";
import { reset_target } from "./fast_drag_manager";
import { get_group } from "./get_group";
import { get_item } from "./get_item";
import { handle_if_is_click } from "./handle_if_is_click";
import { finish_selecting, get_delta } from "./onCanvasMouseUp";

export const onGroupMouseUp = (
  event: React.MouseEvent<HTMLDivElement>,
  group: TGroupItem
) => {
  console.log("onGroupMouseUp");
  event.preventDefault();
  event.stopPropagation();
  if (handle_if_is_click(event)) return;
  const g = getGlobal();

  if (g.mouseState === "selecting") {
    finish_selecting(event);
    return;
  }

  const group_id = group.id;
  move_front(group_id);

  const target_id = g.drag_target;
  const delta = get_delta(event);
  if (target_id === "selection") {
    console.log("selection drop on group", group_id);
    updateGlobal((g) => {
      const group_draft = get_group(g, group_id);
      g.selected_items.forEach((id) => {
        const x = get_item(g, id);
        x.position = sub_v2w(add_v2w(x.position, delta), group_draft.position);
        g.drawOrder = remove_item_from(g.drawOrder, id);
        group_draft.items.push(id);
      });
      g.drag_target = "";

      // reset selection
      g.selected_items = [];
      g.selectionRange = { top: 0, left: 0, width: 0, height: 0 };
      g.is_selected = false;
    });
    normalize_group_position(group_id);
    mark_local_changed();
  } else if (target_id !== "") {
    console.log("drop on group", group_id);

    updateGlobal((g) => {
      const group_draft = get_group(g, group_id);
      let position = delta;

      const parent = find_parent(target_id);
      if (parent !== null) {
        const p = g.itemStore[parent] as TGroupItem;
        // `p` may equals to `group`, it's OK
        p.items = remove_item_from(p.items, target_id);
        group_draft.items.push(target_id);
        position = sub_v2w(add_v2w(position, p.position), group_draft.position);
      } else {
        g.drawOrder = remove_item_from(g.drawOrder, target_id);
        group_draft.items.push(target_id);
        position = sub_v2w(position, group_draft.position);
      }
      const target = get_item(g, target_id);
      target.position = position;
      g.drag_target = "";
    });
    normalize_group_position(group_id);
    mark_local_changed();
    reset_target();
  } else {
    console.log("unexpected behavior", group_id);

    throw new Error();
  }
};
