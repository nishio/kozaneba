import React from "react";
import { getGlobal } from "reactn";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { show_menu } from "../utils/show_menu";
import { reset_target } from "./fast_drag_manager";
import { get_item } from "../utils/get_item";
import { dev_log } from "../utils/dev";
import { kozaneba } from "../API/KozanebaAPI";

export const onGenericClick = (
  event: React.MouseEvent<HTMLDivElement>,
  id: TItemId
) => {
  const g = getGlobal();
  const target = get_item(g, id);

  dev_log("onGenelicClick", `g.mouseState=${g.mouseState}`);

  //
  // add line
  if (g.mouseState === "making_line") {
    updateGlobal((g) => {
      g.mouseState = "";
    });
    dev_log("add line", g.line_start, id, g.line_type);
    if (g.line_start !== "" && g.line_start !== id) {
      switch (g.line_type) {
        case "line":
          kozaneba.add_arrow([g.line_start, id], ["none", "none"]);
          break;
        case "arrow":
          kozaneba.add_arrow([g.line_start, id], ["none", "arrow"]);
          break;
        case "double_heads":
          kozaneba.add_arrow([g.line_start, id], ["arrow", "arrow"]);
          break;
        case "double_lines":
          kozaneba.add_arrow([g.line_start, id], ["none", "none"], true);
          break;
      }
    }
    return;
  }

  //
  // show context menu
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
