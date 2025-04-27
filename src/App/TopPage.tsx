import { useEffect } from "react";
import { Blank } from "./Blank";
import { kozaneba } from "../API/KozanebaAPI";

export const TopPage = () => {
  useEffect(() => {
    kozaneba.after_render_toppage();
  }, []); // 空の依存配列を追加して初回レンダリング時のみ実行
  return <Blank />;
};
