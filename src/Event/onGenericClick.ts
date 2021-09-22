import React from "react";
import { getGlobal } from "reactn";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { show_menu } from "../utils/show_menu";
import { reset_target } from "./fast_drag_manager";
import { get_item } from "../utils/get_item";

export const onGenericClick = (
  event: React.MouseEvent<HTMLDivElement>,
  id: TItemId
) => {
  const target = get_item(getGlobal(), id);
  updateGlobal((g) => {
    g.clicked_target = id;
    g.drag_target = "";
  });
  reset_target();

  console.log(`onGenericClick type:${target.type} id:${id}`);
  if (target.type === "kozane") {
    show_menu("Kozane", event);
    return true;
  } else if (target.type === "group") {
    show_menu("Group", event);
    return true;
  } else if (target.type === "scrapbox") {
    show_menu("Scrapbox", event);
    return true;
  } else if (target.type === "gyazo") {
    show_menu("Gyazo", event);
    return true;
  }
  return false;
};
