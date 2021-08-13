import { State } from "reactn/default";
import { ItemId } from "../src/Global/initializeGlobalState";
import { GroupItem } from "../src/Group/GroupItem";

export const get_group = (id: ItemId): ((g: State) => GroupItem) => {
  return (g: State) => g.itemStore[id] as GroupItem;
};
