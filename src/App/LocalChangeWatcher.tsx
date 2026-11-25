import { useEffect } from "react";
import { useGlobal } from "reactn";
import { save } from "../Cloud/save";
import { not_login_then_show_dialog } from "../Cloud/not_login_then_show_dialog";
import { updateGlobal } from "../Global/updateGlobal";
import { is_physics_on } from "../Physics/physics";
import { can_write, is_cloud } from "../utils/can_write";

export const LocalChangeWatcher = () => {
  const [is_local_change] = useGlobal("is_local_change");
  const [cloud_ba] = useGlobal("cloud_ba");
  // mark_local_changed always bumps last_updated. Watching it re-runs the
  // effect when is_local_change was left true (physics on, or not writable
  // at that time), which would otherwise never save again.
  const [last_updated] = useGlobal("last_updated");
  // signing in re-runs the effect, so that edits made before it are saved
  const [user] = useGlobal("user");

  useEffect(() => {
    if (is_physics_on()) return;
    if (!is_cloud()) return;
    if (is_local_change) {
      if (can_write()) {
        // Not signed in (an anyone_writable Ba opened without an account):
        // save() would only show the sign-in dialog. Keep is_local_change set,
        // so that the listener still sees unsaved changes here and does not
        // replace them with a save from another device.
        if (not_login_then_show_dialog()) return;
        updateGlobal((g) => {
          g.is_local_change = false;
        });
        save();
      }
    }
  }, [cloud_ba, is_local_change, last_updated, user]);
  return null;
};
