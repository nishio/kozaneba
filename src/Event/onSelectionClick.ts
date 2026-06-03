import { updateGlobal } from "../Global/updateGlobal";
import { show_menu } from "../utils/show_menu";
import { reset_target } from "./fast_drag_manager";
import { TInputEvent } from "./input_event";

export const onSelectionClick = (event: TInputEvent<HTMLDivElement>) => {
  show_menu("Selection", event);
  updateGlobal((g) => {
    g.drag_target = "";
  });
  reset_target();
};
