import { updateGlobal } from "../Global/updateGlobal";
import { auth } from "./init_firebase";

export const not_login_then_show_dialog = () => {
  if (auth.currentUser === null) {
    updateGlobal((g) => {
      g.dialog = "CloudSave";
    });
    console.log(`not login. show dialog.`);
    return true;
  }
  console.log(`save as ${auth.currentUser.displayName ?? "Anonymous"}`);
  return false;
};
