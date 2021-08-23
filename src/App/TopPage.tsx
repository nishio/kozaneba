import { useEffect } from "react";
import { Blank } from "./Blank";
import { kozaneba } from "../API/KozanebaAPI";

export const TopPage = () => {
  useEffect(() => {
    kozaneba.after_render_toppage();
  });
  return <Blank />;
};
