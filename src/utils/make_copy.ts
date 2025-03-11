import { getGlobal } from "../Global/ReactnCompat";
import { State } from "../Global/initializeGlobalState";
import { show_dialog } from "../API/show_dialog";
import { state_to_docdate } from "../Cloud/state_to_docdate";
import { save_new } from "../Cloud/save_new";
import { set_status } from "../utils/set_status";
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
