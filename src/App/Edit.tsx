import { useEffect } from "react";
import { Blank } from "./Blank";
import { updateGlobal } from "../Global/updateGlobal";
import { useGlobal } from "reactn";
import { set_up_read_subscription } from "../Cloud/set_up_read_subscription";
import { save } from "../Cloud/save";

export const Edit: React.FC<{ ba: string }> = ({ ba }) => {
  const [is_loacl_change] = useGlobal("is_local_change");

  useEffect(() => {
    console.log("loading", ba);
    updateGlobal((g) => {
      g.statusBar.type = "downloading";
      g.cloud_ba = ba;
    });
    return set_up_read_subscription(ba);
  }, [ba]);

  useEffect(() => {
    if (is_loacl_change) {
      updateGlobal((g) => {
        g.is_local_change = false;
      });
      save();
    }
  }, [is_loacl_change]);

  return <Blank></Blank>;
};
