import { getGlobal, setGlobal } from "../Global/ReactnCompat";
import { fit_to_contents } from "../utils/fit_to_contents";
import { updateGlobal } from "../Global/updateGlobal";
import { docdate_to_state } from "./FirestoreIO";
import { db } from "./init_firebase";
import { DocSnap } from "./FirebaseShortTypename";
import { set_status } from "../utils/set_status";
import { collection, doc, onSnapshot, DocumentSnapshot, DocumentData } from "firebase/firestore";

let unsubscribe = null as null | (() => void);

export const set_up_read_subscription = (ba: string) => {
  console.log("set_up_read_subscription", ba);
  const baCollection = collection(db, "ba");
  const docRef = doc(baCollection, ba);
  
  unsubscribe = onSnapshot(docRef, (doc: DocumentSnapshot<DocumentData>) => {
      const data = doc.data();
      if (data === undefined) {
        // throw new TypeError("doc.data() is undefined");
        console.log("doc.data() is undefined. disconnecting");
        updateGlobal((g) => {
          g.cloud_ba = "";
          g.statusBar.type = "no-connection";
          g.statusBar.text = "not found";
        });
        return;
      }

      console.log("new data from server");
      const server = docdate_to_state(data);
      const local_latest = getGlobal().last_updated;
      if (data.last_updated > local_latest) {
        console.log("update local with data from server", server);
        setGlobal(server);
        // Cast fit_to_contents result to avoid type errors
        const fitResult = fit_to_contents();
        if (fitResult) {
          setGlobal(fitResult as any);
        }
      } else if (data.last_updated < local_latest) {
        throw new Error("received old data from server (warning)"); // it happens?
      } else {
        console.log("no need to update");
      }
      set_status("done");
    });
  return unsubscribe;
};

export const stop_current_subscription = () => {
  console.log("stop_current_subscription");
  if (unsubscribe === null) {
    console.log("no current subscription");
  } else {
    unsubscribe();
  }
};
