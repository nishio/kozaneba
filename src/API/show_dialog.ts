import { setGlobal } from "reactn";
import { TDialog } from "../Global/TDialog";

export const show_dialog = (dialog: TDialog) => {
  setGlobal({ dialog });
};
