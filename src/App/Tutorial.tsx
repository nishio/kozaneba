import { useEffect } from "react";
import { updateGlobal } from "../Global/updateGlobal";
import { Blank } from "./Blank";

export const Tutorial = () => {
  useEffect(() => {
    updateGlobal((g) => {
      g.dialog = "AddFusen";
    });
  });
  return <Blank />;
};
