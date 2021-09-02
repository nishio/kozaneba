import { State } from "reactn/default";
import { GroupItem } from "../src/Group/GroupItem";

export const make_get_group_func = (id: string): ((g: State) => GroupItem) => {
  return (g: State) => g.itemStore[id] as GroupItem;
};
