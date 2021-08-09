import { useEffect } from "react";
import { Blank } from "./Blank";
import { updateGlobal } from "../Global/updateGlobal";

export const Edit: React.FC<{ ba: string }> = ({ ba }) => {
  useEffect(() => {
    console.log("loading", ba);
    updateGlobal((g) => {
      g.statusBar.type = "downloading";
      g.cloud_ba = ba;
    });
  }, [ba]);
  return <Blank />;
};
