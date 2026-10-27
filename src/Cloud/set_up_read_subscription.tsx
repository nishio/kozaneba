import { getGlobal, setGlobal } from "reactn";
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
      if (data.last_updated > local_latest) {
        dev_log("update local with data from server", server);
        setGlobal(server);
        setGlobal(fit_to_contents());
      } else if (data.last_updated < local_latest) {
        // e.g. the server rolled back a rejected save; keep the local state
        // (save() reports the failure)
        console.warn("received old data from server");
        return;
      } else {
        dev_log("no need to update");
      }
      // a local write not yet acknowledged by the server is not "done"
      if (!doc.metadata.hasPendingWrites) {
        set_status("done");
      }
    });
  return unsubscribe;
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
