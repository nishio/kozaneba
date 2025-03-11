import { State } from "../Global/initializeGlobalState";
import { setGlobal } from "../Global/ReactnCompat";
import { produce } from "immer";

export const updateGlobal = (update: (draft: State) => void) => {
  // update global variable in destructive manner using immer
  setGlobal((current_state: State) => {
    const new_state = produce(current_state, update);
    const update_delta: { [key: string]: unknown } = {};
    Object.entries(current_state).forEach(([key, ref]) => {
      // @ts-ignore
      if (current_state[key] !== new_state[key]) {
        // @ts-ignore
        update_delta[key] = new_state[key];
      }
    });
    return update_delta;
  });
};
