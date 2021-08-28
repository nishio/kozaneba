import { useEffect } from "react";
import { getGlobal, useGlobal } from "reactn";
import { save } from "../Cloud/save";
import { updateGlobal } from "../Global/updateGlobal";
import { can_write } from "./can_write";

export const LocalChangeWatcher = () => {
  const [is_local_change] = useGlobal("is_local_change");
  const [cloud_ba] = useGlobal("cloud_ba");

  useEffect(() => {
    if (cloud_ba !== "" && is_local_change) {
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

export const is_user_in_writers = () => {
  const g = getGlobal();
  if (g.user === null) return false;
  if (g.writers === undefined) return false;
  return g.writers.includes(g.user.uid);
};
