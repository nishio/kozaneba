import { useEffect } from "react";
import { updateGlobal } from "../Global/updateGlobal";
import { dev_log } from "../utils/dev";
import { Blank } from "./Blank";

export const Edit: React.FC<{ ba: string }> = ({ ba }) => {
  useEffect(() => {
    dev_log("loading", ba);
    updateGlobal((g) => {
      g.statusBar.type = "downloading";
      g.dialog = "Loading";
      g.cloud_ba = ba;
    });
  }, [ba]);
  return <Blank />;
};
