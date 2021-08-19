import { useEffect } from "react";
import { updateGlobal } from "../Global/updateGlobal";
import { KozaneItem } from "../Kozane/KozaneItem";
import { Blank } from "./Blank";

export const Edit: React.FC<{ ba: string }> = ({ ba }) => {
  useEffect(() => {
    console.log("loading", ba);
    updateGlobal((g) => {
      const loading = new KozaneItem();
      loading.text = "loading...";
      g.itemStore[loading.id] = loading;
      g.drawOrder = [loading.id];
      g.statusBar.type = "downloading";
      g.cloud_ba = ba;
    });
  }, [ba]);
  return <Blank />;
};
