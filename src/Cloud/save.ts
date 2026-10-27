import { getGlobal } from "reactn";
import { kozaneba } from "../API/KozanebaAPI";
import { db } from "./init_firebase";
import { DocData } from "./FirebaseShortTypename";
import { state_to_docdate } from "./state_to_docdate";
import { if_not_in_writer_add_self } from "./if_not_in_writer_add_self";
import { not_login_then_show_dialog } from "./not_login_then_show_dialog";
import { set_status } from "../utils/set_status";
import { local_db } from "./LocalBackup";
import { dev_log } from "../utils/dev";
import { updateGlobal } from "../Global/updateGlobal";


export const save = () => {
  dev_log("update save");
  if (not_login_then_show_dialog()) return;
  set_status("uploading");
  if_not_in_writer_add_self();

  const ba = getGlobal().cloud_ba;
  const doc = state_to_docdate(getGlobal());
  local_save(ba, doc);
  db.collection("ba").doc(ba).set(doc)
    .then(() => {
      // an older save's ack must not mark a newer edit as saved
      if (doc.last_updated !== getGlobal().last_updated) return;
      updateGlobal((g) => {
        g.statusBar.type = "done";
        g.save_error = "";
      });
    })
    .catch((e: { code?: string; message?: string }) => {
      // Do not re-mark is_local_change here: the watcher would retry at once
      // and loop on a permanent error. The next edit retries.
      local_save(ba, doc, true);
      updateGlobal((g) => {
        g.statusBar.type = "text";
        g.statusBar.text = "not saved";
        g.save_error = save_error_message(e);
      });
    });
};

const save_error_message = (e: { code?: string; message?: string }) => {
  if (e.code === "invalid-argument") {
    return "Could not save: the Ba is too large (over 1 MiB). Remove some items or export it as JSON.";
  }
  if (e.code === "permission-denied") {
    return "Could not save: you do not have permission to write this Ba.";
  }
  return `Could not save: ${e.message ?? e.code ?? "unknown error"}`;
};

const local_save = (ba: string, doc: DocData, force = false) => {
  if (force || kozaneba.constants.to_make_local_backup) {
    local_db.backup.add({
      cloud_ba: ba,
      last_updated: doc.last_updated,
      json: JSON.stringify(doc),
    });
  }
};
