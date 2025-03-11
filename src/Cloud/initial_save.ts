import { getGlobal } from "../Global/ReactnCompat";
import { State } from "../Global/initializeGlobalState";
import { close_menu } from "../utils/close_menu";
import { state_to_docdate } from "./state_to_docdate";
import { set_status } from "../utils/set_status";
import { save_new } from "./save_new";
import { not_login_then_show_dialog } from "./not_login_then_show_dialog";
import { get_user_id } from "./get_user_id";

export const initial_save = () => {
  console.log("initial save");
  if (not_login_then_show_dialog()) return;
  close_menu();
  set_status("uploading");
  const g = getGlobal();
  const docdata: State = {
    ...g,
    writers: [get_user_id()],
    anyone_writable: true,
  };
  save_new(state_to_docdate(docdata));
};
