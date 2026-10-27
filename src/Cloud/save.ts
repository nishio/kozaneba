import { getGlobal } from "reactn";
import { kozaneba } from "../API/KozanebaAPI";
import { db } from "./init_firebase";
import { DocData } from "./FirebaseShortTypename";
import { state_to_docdate } from "./state_to_docdate";
import { if_not_in_writer_add_self } from "./if_not_in_writer_add_self";
import { not_login_then_show_dialog } from "./not_login_then_show_dialog";
import { set_status } from "../utils/set_status";
import { local_db } from "./LocalBackup";
import { dev_log } from "../utils/dev";
import { updateGlobal } from "../Global/updateGlobal";
import {
  as_version,
  begin_write,
  end_write,
  is_own_version,
  may_overwrite,
  note_own_write,
} from "./sync_version";

// Thrown inside the transaction: the server doc is not the version this tab
// is based on, so writing would overwrite someone else's work.
class SaveConflict extends Error {}

// Retry for errors that are about the connection, not the data. A
// transaction needs the server (it is not queued offline like set()).
export const SAVE_RETRY = { first_ms: 2000, max_ms: 60000 };
const TRANSIENT = new Set(["unavailable", "deadline-exceeded", "aborted"]);
let retry: { ba: string; timer: ReturnType<typeof setTimeout> } | null = null;
let retry_count = 0;

export const has_pending_retry = (ba: string) => retry !== null && retry.ba === ba;

export const save = () => {
  dev_log("update save");
  if (not_login_then_show_dialog()) return;
  const ba = getGlobal().cloud_ba;
  if (getGlobal().save_conflict === ba) {
    // Do not write while in conflict; keep what this tab has.
    local_save(ba, state_to_docdate(getGlobal()), true);
    return;
  }
  set_status("uploading");
  if_not_in_writer_add_self();

  const doc = state_to_docdate(getGlobal());
  local_save(ba, doc);
  write_if_not_changed(ba, doc);
};

const write_if_not_changed = (ba: string, doc: DocData) => {
  const version = doc.last_updated as number;
  note_own_write(ba, version);
  begin_write(ba);
  const ref = db.collection("ba").doc(ba);
  db.runTransaction(async (t) => {
    const snap = await t.get(ref);
    if (!snap.exists) throw new SaveConflict("the Ba is not on the server");
    const server_version = as_version(snap.data()?.last_updated);
    if (!may_overwrite(ba, server_version)) {
      throw new SaveConflict(`server has ${server_version}`);
    }
    if (is_own_version(ba, server_version) && server_version! > version) {
      // a newer save of this tab is already there (commits out of order)
      return;
    }
    t.set(ref, doc);
  })
    .then(() => {
      end_write(ba);
      retry_count = 0;
      // an older save's ack must not mark a newer edit as saved
      if (doc.last_updated !== getGlobal().last_updated) return;
      updateGlobal((g) => {
        g.statusBar.type = "done";
        g.save_error = "";
      });
    })
    .catch((e: { code?: string; message?: string }) => {
      end_write(ba);
      if (e instanceof SaveConflict) {
        dev_log("save conflict", e.message);
        on_save_conflict(ba, doc);
        return;
      }
      if (e.code !== undefined && TRANSIENT.has(e.code)) {
        schedule_retry(ba);
        updateGlobal((g) => {
          g.statusBar.type = "text";
          g.statusBar.text = "offline: not saved yet, retrying";
        });
        return;
      }
      // Do not re-mark is_local_change here: the watcher would retry at once
      // and loop on a permanent error. The next edit retries.
      local_save(ba, doc, true);
      updateGlobal((g) => {
        g.statusBar.type = "text";
        g.statusBar.text = "not saved";
        g.save_error = save_error_message(e);
      });
    });
};

const schedule_retry = (ba: string) => {
  if (retry !== null) clearTimeout(retry.timer);
  const ms = Math.min(SAVE_RETRY.first_ms * 2 ** retry_count, SAVE_RETRY.max_ms);
  retry_count++;
  retry = {
    ba,
    timer: setTimeout(() => {
      retry = null;
      if (getGlobal().cloud_ba !== ba) return;
      save(); // writes the latest state, not the failed one
    }, ms),
  };
};

// Back online: retry now instead of waiting for the timer.
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    if (retry === null) return;
    const ba = retry.ba;
    clearTimeout(retry.timer);
    retry = null;
    if (getGlobal().cloud_ba === ba) save();
  });
}

// The server has a version this tab did not see (another device or tab saved
// in between). Keep this tab's state locally and let the user choose; see
// SaveConflictAlert.
export const on_save_conflict = (ba: string, doc: DocData) => {
  local_save(ba, doc, true);
  updateGlobal((g) => {
    if (g.cloud_ba !== ba) return;
    g.save_conflict = ba;
    g.statusBar.type = "text";
    g.statusBar.text = "not saved (conflict)";
  });
};

const save_error_message = (e: { code?: string; message?: string }) => {
  if (e.code === "invalid-argument") {
    return "Could not save: the Ba is too large (over 1 MiB). Remove some items or export it as JSON.";
  }
  if (e.code === "permission-denied") {
    return "Could not save: you do not have permission to write this Ba.";
  }
  return `Could not save: ${e.message ?? e.code ?? "unknown error"}`;
};

const local_save = (ba: string, doc: DocData, force = false) => {
  if (force || kozaneba.constants.to_make_local_backup) {
    local_db.backup.add({
      cloud_ba: ba,
      last_updated: doc.last_updated,
      json: JSON.stringify(doc),
    });
  }
};
