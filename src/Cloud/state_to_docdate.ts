import { State } from "reactn/default";
import { DocData } from "./FirebaseShortTypename";
import { item_to_object } from "./item_to_object";

export const state_to_docdate = (state: State): DocData => {
  const itemStore = {} as { [key: string]: object };
  Object.entries(state.itemStore).forEach(([key, value]) => {
    itemStore[key] = item_to_object(value);
  });

  const {
    drawOrder,
    last_updated,
    anyone_writable = true,
    title = "",
    writers = [],
    annotations,
  } = state;
  return {
    version: 3,
    itemStore,
    drawOrder,
    last_updated,
    anyone_writable,
    title,
    writers,
    annotations,
  };
};
