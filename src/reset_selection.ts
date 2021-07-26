import { updateGlobal } from "./updateGlobal";

export const reset_selection = () => {
  updateGlobal((g) => {
    g.selected_items = [];
    g.selectionRange = { top: 0, left: 0, width: 0, height: 0 };
    g.is_selected = false;
  });
};
