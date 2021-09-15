import { getGlobal } from "reactn";
import { updateGlobal } from "../Global/updateGlobal";
import { db } from "./FirestoreIO";
import { DocData, DocRef } from "./FirebaseShortTypename";
import { set_up_read_subscription } from "./set_up_read_subscription";

export const save_new = (doc: DocData) => {
  const g = getGlobal();

  let p;
  if (g.fix_ba_for_test === "") {
    p = db.collection("ba").add(doc);
  } else {
    const docRef = db.collection("ba").doc(g.fix_ba_for_test);
    p = docRef.set(doc).then(() => docRef);
  }

  p.then((docRef: DocRef) => {
    updateGlobal((g) => {
      g.statusBar.type = "done";
      g.cloud_ba = docRef.id;
      window.location.hash = `edit=${docRef.id}`;
      set_up_read_subscription(g.cloud_ba);
    });
  });
};
