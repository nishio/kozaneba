import { useEffect } from "reactn";
import { hotKey } from "./hotKey";

export const KeyboardShortcut = () => {
  useEffect(() => {
    document.getElementById("root")!.addEventListener("keydown", hotKey);
  });
  return null;
};
