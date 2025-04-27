import { useEffect } from "react";
import { updateGlobal } from "../Global/updateGlobal";
import { KozaneItem } from "../Kozane/KozaneItem";
import { Blank } from "./Blank";

export const TinySample = () => {
  useEffect(() => {
    updateGlobal((g) => {
      const obj = new KozaneItem();
      obj.text = "Tiny Sample";
      g.itemStore[obj.id] = obj;
      g.drawOrder.push(obj.id);
    });
  }, []); // 空の依存配列を追加して初回レンダリング時のみ実行
  return <Blank />;
};
