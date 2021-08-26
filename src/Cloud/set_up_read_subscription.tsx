import { getGlobal, setGlobal } from "reactn";
import { fit_to_contents } from "../App/toggle_fit_to_contents";
import { db, docdate_to_state, DocSnap } from "./FirestoreIO";
import { set_status } from "./initial_save";

export const set_up_read_subscription = (ba: string) => {
  console.log("set_up_read_subscription", ba);
  let unsubscribe = db
    .collection("ba")
    .doc(ba)
    .onSnapshot((doc: DocSnap) => {
      const data = doc.data();
      if (data === undefined) {
        throw new TypeError("doc.data() is undefined");
      }

      console.log("new data from server");
      const server = docdate_to_state(data);
      const local_latest = getGlobal().last_updated;
      if (data.last_updated > local_latest) {
        console.log("update local with data from server", server);
        setGlobal(server);
        setGlobal(fit_to_contents());
      } else if (data.last_updated < local_latest) {
        throw new Error("received old data from server (warning)"); // it happens?
      }
      set_status("done");
    });
  return unsubscribe;
};
