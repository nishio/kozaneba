import React from "react";
import { getGlobal } from "reactn";
import { TGroupItem } from "../Global/TGroupItem";
import { move_front } from "../utils/move_front";
import { handle_if_is_click } from "./handle_if_is_click";
import { finish_selecting } from "./finish_selecting";
import { get_delta } from "./get_delta";
import { drag_drop_selection_into_group } from "./drag_drop_selection_into_group";
import { drag_drop_item_into_group } from "./drag_drop_item_into_group";
import { dev_log } from "../utils/dev";

export const onGroupMouseUp = (
  event: React.MouseEvent<HTMLDivElement>,
  group: TGroupItem
) => {
  dev_log("onGroupMouseUp");
  event.preventDefault();
  event.stopPropagation();
  if (handle_if_is_click(event)) return;
  const g = getGlobal();

  if (g.mouseState === "selecting") {
    dev_log(`g.mouseState === "selecting"`);
    finish_selecting(event);
    return;
  }

  const group_id = group.id;
  move_front(group_id);

  const target_id = g.drag_target;
  const delta = get_delta(event);
  if (target_id === "selection") {
    dev_log(`target_id === "selection"`);
    drag_drop_selection_into_group(group_id, delta);
  } else if (target_id !== "") {
    dev_log(`target_id === ${target_id}`);
    drag_drop_item_into_group(group_id, delta, target_id);
  } else {
    console.log("unexpected behavior", group_id);

    throw new Error();
  }
};
