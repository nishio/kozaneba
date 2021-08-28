import { getGlobal } from "reactn";
import { db, state_to_docdate } from "./FirestoreIO";
import {
  if_not_in_writer_add_self,
  not_login_then_show_dialog,
  set_status,
} from "./initial_save";

export const save = () => {
  console.log("update save");
  if (not_login_then_show_dialog()) return;
  set_status("uploading");
  if_not_in_writer_add_self();

  const ba = getGlobal().cloud_ba;
  const doc = state_to_docdate(getGlobal());
  db.collection("ba")
    .doc(ba)
    .set(doc)
    .then(() => {
      set_status("done");
    });
};
