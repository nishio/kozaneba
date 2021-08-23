import { setGlobal } from "reactn";
import { TDialog } from "../Global/initializeGlobalState";

export const show_dialog = (dialog: TDialog) => {
  setGlobal({ dialog });
};
