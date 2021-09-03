import { getGlobal } from "reactn";
import { kozaneba } from "../API/KozanebaAPI";
import { db, DocData, state_to_docdate } from "./FirestoreIO";
import {
  if_not_in_writer_add_self,
  not_login_then_show_dialog,
  set_status,
} from "./initial_save";
import { local_db } from "./LocalBackup";

export const save = () => {
  console.log("update save");
  if (not_login_then_show_dialog()) return;
  set_status("uploading");
  if_not_in_writer_add_self();

  const ba = getGlobal().cloud_ba;
  const doc = state_to_docdate(getGlobal());
  local_save(ba, doc);
  db.collection("ba")
    .doc(ba)
    .set(doc)
    .then(() => {
      set_status("done");
    });
};

const local_save = (ba: string, doc: DocData) => {
  if (kozaneba.constants.to_make_local_backup) {
    local_db.backup.add({
      cloud_ba: ba,
      last_updated: doc.last_updated,
      json: JSON.stringify(doc),
    });
  }
};
