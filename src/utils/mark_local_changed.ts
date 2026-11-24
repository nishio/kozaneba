import { updateGlobal } from "../Global/updateGlobal";

export const mark_local_changed = () => {
  updateGlobal((g) => {
    g.is_local_change = true;
    // last_updated is also the save version (sync_version). It must grow with
    // every edit of this tab, even when two edits fall in the same millisecond
    // or the clock moves back (NTP): two saves of the same version with
    // different contents, or a newer save with a smaller version, would let an
    // older save overwrite a newer one or end as "done" without writing.
    g.last_updated = Math.max(Date.now(), g.last_updated + 1);
  });
};
