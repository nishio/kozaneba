import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { fit_to_contents } from "../utils/fit_to_contents";
import { updateGlobal } from "../Global/updateGlobal";
import { docdate_to_state } from "./FirestoreIO";
import { db } from "./init_firebase";
import { DocSnap } from "./FirebaseShortTypename";
import { set_status } from "../utils/set_status";
import { dev_log } from "../utils/dev";
import { has_pending_retry, on_save_conflict } from "./save";
import { state_to_docdate } from "./state_to_docdate";
import {
  as_version,
  has_write_in_flight,
  is_own_version,
  note_server_version,
} from "./sync_version";
import { can_write } from "../utils/can_write";
import { backup_if_enabled } from "./backup_store";

let unsubscribe = null as null | (() => void);

export const set_up_read_subscription = (ba: string) => {
  dev_log("set_up_read_subscription", ba);
  // save_new and Blank's effect both subscribe; keep only one live listener,
  // otherwise the old ba keeps writing into the current one (Make Copy).
  stop_current_subscription();
  unsubscribe = db.collection("ba").doc(ba).onSnapshot((doc: DocSnap) => {
      if (getGlobal().cloud_ba !== ba) {
        // This subscription is for a ba the client no longer shows. Applying
        // it would mix that ba into the current one.
        dev_log("ignore snapshot of", ba, "current is", getGlobal().cloud_ba);
        return;
      }
      const data = doc.data();
      if (data === undefined) {
        // throw new TypeError("doc.data() is undefined");
        dev_log("doc.data() is undefined. disconnecting");
        updateGlobal((g) => {
          g.cloud_ba = "";
          g.statusBar.type = "no-connection";
          g.statusBar.text = "not found";
        });
        return;
      }

      dev_log("new data from server");
      const server = docdate_to_state(data);
      const local_latest = getGlobal().last_updated;
      const server_latest = server.last_updated;
      // the version as stored (docdate_to_state may clamp last_updated)
      const version = as_version(data.last_updated);
      if (server_latest === undefined) {
        dev_log("no valid last_updated in server data");
      } else if (server_latest === local_latest) {
        adopt_server_permissions(server);
        note_server_version(ba, version);
        dev_log("no need to update");
      } else if (is_own_version(ba, version)) {
        adopt_server_permissions(server);
        // the ack of an older save of this tab; a newer edit is being saved
        dev_log("ack of an older own save");
        return;
      } else if (has_unsaved_local_changes(ba)) {
        adopt_server_permissions(server);
        // Someone else saved while this tab has changes not on the server.
        // Replacing the local state would drop them silently (D3).
        console.warn("the server has a version from elsewhere; keeping local changes");
        on_save_conflict(ba, state_to_docdate(getGlobal()));
        return;
      } else {
        // A version from elsewhere and nothing unsaved here: follow the
        // server, whether its client clock was ahead or behind ours (D14).
        dev_log("update local with data from server", server);
        setGlobal(server);
        setGlobal(fit_to_contents());
        note_server_version(ba, version);
        // the state before the first local edit, so that it can be restored
        if (can_write()) backup_if_enabled(ba, data);
      }
      // a local write not yet acknowledged by the server is not "done"
      if (!doc.metadata.hasPendingWrites) {
        set_status("done");
      }
    });
  return unsubscribe;
};

// The local items are kept when the server data is not newer, but writers
// (and, for non-owners, anyone_writable) must follow the server: saves resend
// the whole doc, and firestore.rules rejects a save that drops a writer (e.g.
// someone who joined with a lower last_updated, such as a clock running
// behind) or that a non-owner sends with a different anyone_writable. Without
// this, every later save would be rejected until reload. Server writers only
// ever grow, so taking them as-is is safe; if_not_in_writer_add_self adds the
// current user again on the next save.
const adopt_server_permissions = (server: Partial<State>) => {
  updateGlobal((g) => {
    if (Array.isArray(server.writers)) {
      const changed =
        server.writers.length !== g.writers.length ||
        server.writers.some((w, i) => w !== g.writers[i]);
      if (changed) g.writers = [...server.writers];
    }
    const is_owner = g.user !== null && g.writers[0] === g.user.uid;
    if (!is_owner && typeof server.anyone_writable === "boolean") {
      g.anyone_writable = server.anyone_writable;
    }
  });
};

// Changes of this tab that are not (yet) on the server: an edit not yet
// handed to save(), a save in flight or waiting for a retry, a failed save,
// or a conflict already shown.
const has_unsaved_local_changes = (ba: string) => {
  const g = getGlobal();
  return (
    g.is_local_change ||
    has_write_in_flight(ba) ||
    has_pending_retry(ba) ||
    g.save_error !== "" ||
    g.save_conflict === ba
  );
};

export const stop_current_subscription = () => {
  dev_log("stop_current_subscription");
  if (unsubscribe === null) {
    dev_log("no current subscription");
  } else {
    unsubscribe();
    unsubscribe = null;
  }
};
