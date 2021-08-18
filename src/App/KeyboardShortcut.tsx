import { useEffect } from "reactn";
import { hotKey } from "./hotKey";

export const KeyboardShortcut = () => {
  useEffect(() => {
    document.body.addEventListener("keydown", hotKey);
  });
  return null;
};
