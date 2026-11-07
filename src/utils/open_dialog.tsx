import { TDialog } from "../Global/TDialog";
import { commitLineEdit } from "../Global/line_edit_actions";
import { updateGlobal } from "../Global/updateGlobal";

export const open_dialog = (name: TDialog) => {
  commitLineEdit();
  updateGlobal((g) => {
    g.dialog = name;
    g.menu = "";
  });
};
