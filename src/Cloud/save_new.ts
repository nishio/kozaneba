import { getGlobal } from "reactn";
import { updateGlobal } from "../Global/updateGlobal";
import { db } from "./init_firebase";
import { DocData, DocRef } from "./FirebaseShortTypename";
import { set_up_read_subscription } from "./set_up_read_subscription";
import { collection, doc as firestoreDoc, addDoc, setDoc } from "firebase/firestore";

export const save_new = (doc: DocData) => {
  const g = getGlobal();

  let p;
  if (g.fix_ba_for_test === "") {
    p = addDoc(collection(db, "ba"), doc);
  } else {
    const docRef = firestoreDoc(collection(db, "ba"), g.fix_ba_for_test);
    p = setDoc(docRef, doc).then(() => docRef);
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
