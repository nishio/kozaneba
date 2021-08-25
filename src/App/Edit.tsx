import { useEffect } from "react";
import { updateGlobal } from "../Global/updateGlobal";
import { Blank } from "./Blank";

export const Edit: React.FC<{ ba: string }> = ({ ba }) => {
  useEffect(() => {
    console.log("loading", ba);
    updateGlobal((g) => {
      g.statusBar.type = "downloading";
      g.dialog = "Loading";
      g.cloud_ba = ba;
    });
  }, [ba]);
  return <Blank />;
};
