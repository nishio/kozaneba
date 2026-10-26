import { getGlobal } from "reactn";
import { State } from "reactn/default";
import { show_dialog } from "../API/show_dialog";
import { state_to_docdate } from "../Cloud/state_to_docdate";
import { save_new } from "../Cloud/save_new";
import { set_status } from "../utils/set_status";
import { stop_current_subscription } from "../Cloud/set_up_read_subscription";
import { not_login_then_show_dialog } from "../Cloud/not_login_then_show_dialog";
import { get_user_id } from "../Cloud/get_user_id";

export const make_copy = () => {
  if (not_login_then_show_dialog()) return;
  set_status("uploading");
  show_dialog("Loading");
  stop_current_subscription();
  const g = getGlobal();
  const docdata: State = {
    ...g,
    title: g.title + " (copy)",
    // the copy belongs to whoever made it (firestore.rules: create needs writers == [uid])
    writers: [get_user_id()],
  };
  save_new(state_to_docdate(docdata));
};
