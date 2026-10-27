import { Alert, Button, Snackbar } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { getGlobal, setGlobal } from "reactn";
import { docdate_to_state } from "../Cloud/FirestoreIO";
import {
  clear_local_draft,
  has_unsaved_work,
  is_local_ba_with_items,
  read_local_draft,
  TLocalDraft,
  write_local_draft,
} from "../Cloud/LocalDraft";
import { updateGlobal } from "../Global/updateGlobal";
import { date_to_str } from "../utils/date_to_str";
import { fit_to_contents } from "../utils/fit_to_contents";

export const LOCAL_DRAFT_INTERVAL = 5000;

// Keeps a not-yet-cloud-saved Ba in localStorage, offers to restore it on the
// next start, and asks before the page is closed while something would be
// lost (a local Ba with items, or a cloud save not acknowledged / failed).
export const LocalDraftKeeper = () => {
  // only on the top page: #edit / #view / #new open a cloud Ba
  const [offer, setOffer] = useState<TLocalDraft | null>(() =>
    window.location.hash === "" ? read_local_draft() : null
  );
  // While the offer is open, the old draft is not overwritten by the new
  // (e.g. tutorial) canvas: the user has not decided yet.
  const pending = useRef(offer !== null);

  useEffect(() => {
    let wrote = false;
    const keep = () => {
      if (pending.current) return;
      const g = getGlobal();
      if (is_local_ba_with_items(g)) {
        if (write_local_draft(g)) wrote = true;
      } else if (wrote) {
        // Cloud Saved, or emptied: the draft is not needed any more
        clear_local_draft();
        wrote = false;
      }
    };
    const on_visibilitychange = () => {
      if (document.visibilityState === "hidden") keep();
    };
    const on_beforeunload = (e: BeforeUnloadEvent) => {
      keep();
      if (!has_unsaved_work()) return;
      e.preventDefault();
      e.returnValue = ""; // Chrome and older Safari need this
      return "";
    };

    const timer = window.setInterval(keep, LOCAL_DRAFT_INTERVAL);
    document.addEventListener("visibilitychange", on_visibilitychange);
    window.addEventListener("pagehide", keep);
    window.addEventListener("beforeunload", on_beforeunload);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", on_visibilitychange);
      window.removeEventListener("pagehide", keep);
      window.removeEventListener("beforeunload", on_beforeunload);
    };
  }, []);

  if (offer === null) return null;

  const close_offer = () => {
    pending.current = false;
    setOffer(null);
  };
  const onRestore = () => {
    updateGlobal((g) => {
      // the tutorial opens on the top page; the user wants the old Ba instead
      g.dialog = "";
      g.in_tutorial = false;
    });
    setGlobal(docdate_to_state(offer.doc));
    setGlobal(fit_to_contents());
    close_offer();
  };
  const onDiscard = () => {
    clear_local_draft();
    close_offer();
  };
  const n = Object.keys(offer.doc.itemStore).length;
  const when = date_to_str(offer.saved_at);
  const ja = getGlobal().language.startsWith("ja");
  return (
    <Snackbar
      open={true}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      data-testid="local-draft-offer"
    >
      <Alert
        severity="info"
        variant="filled"
        action={
          <>
            <Button color="inherit" size="small" onClick={onRestore}>
              {ja ? "復元する" : "Restore"}
            </Button>
            <Button color="inherit" size="small" onClick={onDiscard}>
              {ja ? "破棄する" : "Discard"}
            </Button>
          </>
        }
      >
        {ja
          ? `クラウドに保存されていない前回の場があります（${n} 個、${when}）`
          : `A Ba from last time was not saved to the cloud (${n} item${n === 1 ? "" : "s"}, ${when}).`}
      </Alert>
    </Snackbar>
  );
};
