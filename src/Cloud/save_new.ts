import { getGlobal } from "reactn";
import { updateGlobal } from "../Global/updateGlobal";
import { db } from "./init_firebase";
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
      // Local state must match the doc just written: make_copy writes
      // writers: [me] and a new title, initial_save writes writers: [me].
      // The first snapshot has the same last_updated and does not replace
      // local state, so without this the next whole-doc save would resend
      // the original's writers (rejected by firestore.rules: writers may only
      // grow by the requesting user) and the old title.
      g.writers = [...doc.writers];
      g.anyone_writable = doc.anyone_writable;
      g.title = doc.title;
      window.location.hash = `edit=${docRef.id}`;
      set_up_read_subscription(g.cloud_ba);
    });
  });
};
