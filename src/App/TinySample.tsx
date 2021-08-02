import { useEffect } from "react";
import { updateGlobal } from "../Global/updateGlobal";
import { FusenItem } from "../Fusen/FusenItem";
import { Blank } from "./Blank";

export const TinySample = () => {
  useEffect(() => {
    updateGlobal((g) => {
      const obj = new FusenItem();
      obj.text = "Tiny Sample";
      g.itemStore[obj.id] = obj;
      g.drawOrder.push(obj.id);
    });
  });
  return <Blank />;
};
