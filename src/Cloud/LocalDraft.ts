import { getGlobal } from "reactn";
import { State } from "reactn/default";
import { DocData } from "./FirebaseShortTypename";
import { state_to_docdate } from "./state_to_docdate";

// A Ba that is not saved to the cloud (before sign-in, before Cloud Save, or
// after the cloud doc disappeared) lives only in memory. Keep a copy in
// localStorage so that a reload, closing the tab, or a discarded background
// tab (iPad Safari) does not lose it.
// localStorage (not IndexedDB) because it is synchronous: it still works in
// pagehide / visibilitychange, right before the page goes away.
export const LOCAL_DRAFT_KEY = "kozaneba_local_draft";

export type TLocalDraft = { saved_at: number; doc: DocData };

export const is_local_ba_with_items = (g: State = getGlobal()) =>
  g.cloud_ba === "" && Object.keys(g.itemStore).length > 0;

// Writes the Ba when it differs from what was last written by this page.
// Returns false when it could not be written (e.g. quota exceeded; the
// beforeunload warning still applies).
let last_written_doc = "";
export const write_local_draft = (
  g: State = getGlobal(),
  now = Date.now()
): boolean => {
  try {
    const doc = JSON.stringify(state_to_docdate(g));
    if (
      doc === last_written_doc &&
      window.localStorage.getItem(LOCAL_DRAFT_KEY) !== null
    ) {
      return true;
    }
    window.localStorage.setItem(
      LOCAL_DRAFT_KEY,
      `{"saved_at":${now},"doc":${doc}}`
    );
    last_written_doc = doc;
    return true;
  } catch (e) {
    console.warn("could not keep a local draft", e);
    return false;
  }
};

export const read_local_draft = (): TLocalDraft | null => {
  try {
    const s = window.localStorage.getItem(LOCAL_DRAFT_KEY);
    if (s === null) return null;
    const x = JSON.parse(s);
    if (
      typeof x !== "object" ||
      x === null ||
      typeof x.saved_at !== "number" ||
      typeof x.doc !== "object" ||
      x.doc === null ||
      typeof x.doc.itemStore !== "object" ||
      x.doc.itemStore === null
    ) {
      return null;
    }
    return x as TLocalDraft;
  } catch (e) {
    return null;
  }
};

export const clear_local_draft = () => {
  last_written_doc = "";
  try {
    window.localStorage.removeItem(LOCAL_DRAFT_KEY);
  } catch (e) {
    // ignore
  }
};

// Something would be lost if the page went away now.
export const has_unsaved_work = (g: State = getGlobal()) => {
  if (is_local_ba_with_items(g)) return true;
  if (g.cloud_ba === "") return false;
  // a write the server has not acknowledged yet, or a failed one
  if (g.statusBar.type === "uploading") return true;
  if (g.save_error !== "") return true;
  return false;
};
