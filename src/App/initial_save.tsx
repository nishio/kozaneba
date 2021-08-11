import { getGlobal } from "reactn";
import { auth, db, DocRef, state_to_docdate } from "../Cloud/FirestoreIO";
import { updateGlobal } from "../Global/updateGlobal";
import { set_up_read_subscription } from "../Cloud/set_up_read_subscription";

export const initial_save = () => {
  console.log("initial save");
  console.log("auth.currentUser", auth.currentUser);
  if (auth.currentUser === null) {
    updateGlobal((g) => {
      g.dialog = "CloudSave";
    });
    return;
  }
  updateGlobal((g) => {
    g.menu = "";
  });
  console.log(`save as ${auth.currentUser.displayName ?? "Anonymous"}`);
  updateGlobal((g) => {
    g.statusBar.type = "uploading";
  });

  const g = getGlobal();
  const doc = state_to_docdate(g);
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
