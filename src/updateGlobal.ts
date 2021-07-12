import { State } from "reactn/default";
import { setGlobal } from "reactn";
import { produce } from "immer";

export const updateGlobal = (update: (g: State) => void) => {
  // update global variable in destructive manner using immer
  setGlobal((g: State) => {
    return produce(g, update);
  });
};
