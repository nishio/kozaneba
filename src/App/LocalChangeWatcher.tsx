import { useEffect } from "react";
import { updateGlobal } from "../Global/updateGlobal";
import { useGlobal } from "reactn";
import { save } from "../Cloud/save";

export const LocalChangeWatcher = () => {
  const [is_local_change] = useGlobal("is_local_change");
  const [cloud_ba] = useGlobal("cloud_ba");

  useEffect(() => {
    if (cloud_ba !== "" && is_local_change) {
      updateGlobal((g) => {
        g.is_local_change = false;
      });
      save();
    }
  }, [cloud_ba, is_local_change]);
  return null;
};
