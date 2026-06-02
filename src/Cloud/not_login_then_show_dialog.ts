import { updateGlobal } from "../Global/updateGlobal";
import { dev_log } from "../utils/dev";
import { auth } from "./init_firebase";

export const not_login_then_show_dialog = () => {
  if (auth.currentUser === null) {
    updateGlobal((g) => {
      g.dialog = "CloudSave";
    });
    dev_log(`not login. show dialog.`);
    return true;
  }
  dev_log(`save as ${auth.currentUser.displayName ?? "Anonymous"}`);
  return false;
};
