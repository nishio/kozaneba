import { getGlobal } from "reactn";
import { State } from "reactn/default";
import { show_dialog } from "../API/show_dialog";
import { state_to_docdate } from "../Cloud/FirestoreIO";
import { save_new, set_status } from "../Cloud/initial_save";
import { stop_current_subscription } from "../Cloud/set_up_read_subscription";

export const make_copy = () => {
  set_status("uploading");
  show_dialog("Loading");
  stop_current_subscription();
  const g = getGlobal();
  const docdata: State = {
    ...g,
    title: g.title + " (copy)",
  };
  save_new(state_to_docdate(docdata));
};
