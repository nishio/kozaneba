import { updateGlobal } from "../Global/updateGlobal";

export const close_context_menu = () => {
  updateGlobal((g) => {
    g.menu = "";
    g.clicked_target = "";
  });
};
