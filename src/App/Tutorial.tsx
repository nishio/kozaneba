import { useEffect } from "react";
import { updateGlobal } from "../Global/updateGlobal";
import { Blank } from "./Blank";

export const Tutorial = () => {
  useEffect(() => {
    updateGlobal((g) => {
      g.dialog = "Tutorial";
      g.in_tutorial = true;
      g.tutorial_page = 0;
    });
  });
  return <Blank />;
};
