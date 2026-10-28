import { getGlobal, setGlobal } from "reactn";
import { State } from "reactn/default";
import { fit_to_contents } from "../utils/fit_to_contents";
import { updateGlobal } from "../Global/updateGlobal";
import { docdate_to_state } from "./FirestoreIO";
import { db } from "./init_firebase";
import { DocSnap } from "./FirebaseShortTypename";
import { set_status } from "../utils/set_status";
import { dev_log } from "../utils/dev";

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
      if (server_latest === undefined) {
        dev_log("no valid last_updated in server data");
      } else if (server_latest > local_latest) {
        dev_log("update local with data from server", server);
        setGlobal(server);
        setGlobal(fit_to_contents());
      } else if (server_latest < local_latest) {
        adopt_server_permissions(server);
        // e.g. the server rolled back a rejected save; keep the local state
        // (save() reports the failure)
        console.warn("received old data from server");
        return;
      } else {
        adopt_server_permissions(server);
        dev_log("no need to update");
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

export const stop_current_subscription = () => {
  dev_log("stop_current_subscription");
  if (unsubscribe === null) {
    dev_log("no current subscription");
  } else {
    unsubscribe();
    unsubscribe = null;
  }
};
