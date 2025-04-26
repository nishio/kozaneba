import { useEffect } from "reactn";
import { hotKey } from "./hotKey";

export const KeyboardShortcut = () => {
  useEffect(() => {
    document.addEventListener("keydown", hotKey);
    
    return () => {
      document.removeEventListener("keydown", hotKey);
    };
  }, []); // 空の依存配列を追加して初回レンダリング時のみ実行
  
  return null;
};
