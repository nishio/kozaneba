import { getGlobal, setGlobal } from "reactn";
import { fit_to_contents } from "../utils/fit_to_contents";
import { mark_local_changed } from "../utils/mark_local_changed";
import { add_backup, get_backup_doc } from "./backup_store";
import { docdate_to_state } from "./FirestoreIO";
import { state_to_docdate } from "./state_to_docdate";

// Loads a local backup into the canvas. It does not write the cloud doc
// itself: the restored contents are an ordinary local change, so the usual
// save path (LocalChangeWatcher -> save) writes them, with the current
// title / writers / sharing of the Ba.
// The current contents are backed up first, so a restore can be undone from
// the same list.
export const restore_backup = async (id: number): Promise<boolean> => {
  const doc = await get_backup_doc(id);
  if (doc === null) return false;
  const restored = docdate_to_state(doc);
  const g = getGlobal();
  await add_backup(g.cloud_ba, state_to_docdate(g));
  await setGlobal({
    itemStore: restored.itemStore ?? {},
    drawOrder: restored.drawOrder ?? [],
    annotations: restored.annotations ?? [],
  });
  setGlobal(fit_to_contents());
  mark_local_changed();
  return true;
};
