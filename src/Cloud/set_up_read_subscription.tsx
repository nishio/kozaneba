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
        throw new Error("received old data from server (warning)"); // it happens?
      } else {
        dev_log("no need to update");
      }
      set_status("done");
    });
  return unsubscribe;
};

export const stop_current_subscription = () => {
  dev_log("stop_current_subscription");
  if (unsubscribe === null) {
    dev_log("no current subscription");
  } else {
    unsubscribe();
  }
};
