import React from "react";
import { getGlobal } from "reactn";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { show_menu } from "../utils/show_menu";
import { reset_target } from "./fast_drag_manager";
import { get_item } from "../utils/get_item";
import { dev_log } from "../utils/dev";
import { kozaneba } from "../API/KozanebaAPI";
import { TAnnotation } from "../Global/TAnnotation";
import { mark_local_changed } from "../utils/mark_local_changed";

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
        case "delete":
          const start = g.line_start,
            end = id;
          const new_annot = g.annotations.filter((a: TAnnotation) => {
            if (a.items.length != 2) {
              return true;
            }
            const [v1, v2] = a.items;
            if ((v1 === start && v2 === end) || (v2 === start && v1 === end)) {
              return false;
            }
            return true;
          });
          updateGlobal((g) => {
            g.annotations = new_annot;
          });
          mark_local_changed();
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
