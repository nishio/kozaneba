import { getGlobal } from "reactn";
import { State } from "reactn/default";
import { close_menu } from "../utils/close_menu";
import { TStatusType } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { auth, db, DocData, DocRef, state_to_docdate } from "./FirestoreIO";
import { set_up_read_subscription } from "./set_up_read_subscription";

export const get_user_id = (): string => {
  const uid = auth.currentUser?.uid;
  if (uid === undefined) {
    throw new Error("Assertion: user should be signed in");
  }
  return uid;
};

export const if_not_in_writer_add_self = () => {
  // if not in writer, add self
  const uid = get_user_id();
  updateGlobal((g) => {
    if (!g.writers.includes(uid)) {
      g.writers.push(uid);
    }
  });
};

export const set_status = (status: TStatusType) => {
  updateGlobal((g) => {
    g.statusBar.type = status;
  });
};

export const not_login_then_show_dialog = () => {
  if (auth.currentUser === null) {
    updateGlobal((g) => {
      g.dialog = "CloudSave";
    });
    console.log(`not login. show dialog.`);
    return true;
  }
  console.log(`save as ${auth.currentUser.displayName ?? "Anonymous"}`);
  return false;
};

export const initial_save = () => {
  console.log("initial save");
  if (not_login_then_show_dialog()) return;
  close_menu();
  set_status("uploading");
  const g = getGlobal();
  const docdata: State = {
    ...g,
    writers: [get_user_id()],
    anyone_writable: true,
  };
  save_new(state_to_docdate(docdata));
};

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
