import { getGlobal, setGlobal } from "../Global/ReactnCompat";
import { auth, db } from "./init_firebase";
import { DocData, DocSnap } from "./FirebaseShortTypename";
import { state_to_docdate } from "./state_to_docdate";
import { set_status } from "../utils/set_status";
import { collection, doc, getDoc, DocumentSnapshot, DocumentData } from "firebase/firestore";
import { docdate_to_state } from "./docdate_to_state";

// Export a compatibility interface for the old authui
// This is now handled by SimpleAuthUI component
export const authui = {
  start: (containerId: string, config: any): void => {
    console.log('Firebase UI is now handled by SimpleAuthUI component');
  },
  reset: (): void => {}
};

export const get_ba = (ba: string) => {
  const baCollection = collection(db, "ba");
  const docRef = doc(baCollection, ba);
  
  return getDoc(docRef).then((doc: DocumentSnapshot<DocumentData>) => {
    if (doc.exists()) {
      const data = doc.data() as DocData;
      const state = docdate_to_state(data);
      setGlobal(state);
      set_status("loaded from cloud" as any);
      return state;
    } else {
      set_status("ba not found" as any);
      throw new Error("ba not found");
    }
  });
};

export const get_docdate = () => {
  const g = getGlobal();
  return state_to_docdate(g);
};

// Re-export docdate_to_state for backward compatibility
export { docdate_to_state };
