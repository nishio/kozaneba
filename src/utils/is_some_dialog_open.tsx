import { getGlobal } from "reactn";

export const is_some_dialog_open = (): boolean => {
  const g = getGlobal();
  return g.dialog !== "";
};
