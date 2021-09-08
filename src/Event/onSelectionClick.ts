import React from "react";
import { updateGlobal } from "../Global/updateGlobal";
import { show_menu } from "../utils/show_menu";
import { reset_target } from "./fast_drag_manager";

export const onSelectionClick = (event: React.MouseEvent<HTMLDivElement>) => {
  show_menu("Selection", event);
  updateGlobal((g) => {
    g.drag_target = "";
  });
  reset_target();
};
