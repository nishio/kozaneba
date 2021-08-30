import { TDialog } from "../Global/TDialog";
import { updateGlobal } from "../Global/updateGlobal";

export const open_dialog = (name: TDialog) => {
  updateGlobal((g) => {
    g.dialog = name;
    g.menu = "";
  });
};
