import { updateGlobal } from "../Global/updateGlobal";
import { auth, db, state_to_docdate } from "./FirestoreIO";
import { getGlobal } from "reactn";
import { if_not_in_writer_add_self } from "./initial_save";

export const save = () => {
  console.log("update save");
  if (auth.currentUser === null) {
    updateGlobal((g) => {
      g.dialog = "CloudSave";
    });
    return;
  }
  console.log(`save as ${auth.currentUser.displayName ?? "Anonymous"}`);
  updateGlobal((g) => {
    g.statusBar.type = "uploading";
  });

  if_not_in_writer_add_self();

  const ba = getGlobal().cloud_ba;
  const doc = state_to_docdate(getGlobal());
  db.collection("ba")
    .doc(ba)
    .set(doc)
    .then(() => {
      updateGlobal((g) => {
        g.statusBar.type = "done";
      });
    });
};