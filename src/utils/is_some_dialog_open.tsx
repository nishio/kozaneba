import { getGlobal } from "../Global/ReactnCompat";

export const is_some_dialog_open = (): boolean => {
  const g = getGlobal();
  return g.dialog !== "";
};
