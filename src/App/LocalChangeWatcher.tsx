import { useEffect } from "react";
import { useGlobal } from "reactn";
import { save } from "../Cloud/save";
import { updateGlobal } from "../Global/updateGlobal";
import { is_physics_on } from "../Physics/physics";
import { can_write, is_cloud } from "../utils/can_write";

export const LocalChangeWatcher = () => {
  const [is_local_change] = useGlobal("is_local_change");
  const [cloud_ba] = useGlobal("cloud_ba");

  useEffect(() => {
    if (is_physics_on()) return;
    if (!is_cloud()) return;
    if (is_local_change) {
      if (can_write()) {
        updateGlobal((g) => {
          g.is_local_change = false;
        });
        save();
      }
    }
  }, [cloud_ba, is_local_change]);
  return null;
};
