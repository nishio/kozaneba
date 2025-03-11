import { useEffect } from "react";
import { hotKey } from "./hotKey";

export const KeyboardShortcut = () => {
  useEffect(() => {
    document.addEventListener("keydown", hotKey);
  });
  return null;
};
