import { updateGlobal } from "../Global/updateGlobal";
import { db, docdate_to_state, DocSnap } from "./FirestoreIO";
import { setGlobal } from "reactn";

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

      console.log(data);
      const server = docdate_to_state(data);
      console.log(server);
      // TODO: add check of last_updated
      setGlobal(server);
      updateGlobal((g) => {
        g.statusBar.type = "done";
      });
    });
  return unsubscribe;
};
