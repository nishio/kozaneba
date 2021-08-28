import { getGlobal } from "reactn";
import { show_dialog } from "../API/show_dialog";
import { save_new, set_status } from "../Cloud/initial_save";
import { stop_current_subscription } from "../Cloud/set_up_read_subscription";

export const make_copy = () => {
  set_status("uploading");
  show_dialog("Loading");
  stop_current_subscription();
  const g = getGlobal();
  const new_state = {
    ...g,
    title: g.title + " (copy)",
  };
  save_new(new_state);
};
