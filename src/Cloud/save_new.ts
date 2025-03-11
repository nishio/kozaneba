import { getGlobal } from "../Global/ReactnCompat";
import { updateGlobal } from "../Global/updateGlobal";
import { db } from "./init_firebase";
import { collection, doc, setDoc, addDoc } from "firebase/firestore";
import { DocData, DocRef } from "./FirebaseShortTypename";
import { set_up_read_subscription } from "./set_up_read_subscription";

export const save_new = (docData: DocData) => {
  const g = getGlobal();

  let p;
  if (g.fix_ba_for_test === "") {
    p = addDoc(collection(db, "ba"), docData);
  } else {
    const docRef = doc(collection(db, "ba"), g.fix_ba_for_test);
    p = setDoc(docRef, docData).then(() => docRef);
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
