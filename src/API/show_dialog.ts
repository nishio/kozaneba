import { setGlobal } from "../Global/ReactnCompat";
import { TDialog } from "../Global/TDialog";

export const show_dialog = (dialog: TDialog) => {
  setGlobal({ dialog });
};
