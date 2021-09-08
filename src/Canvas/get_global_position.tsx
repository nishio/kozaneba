import { State } from "reactn/default";
import { add_v2, V2 } from "../dimension/V2";
import { get_group } from "../Event/get_group";
import { get_item } from "../Event/get_item";
import { ItemId } from "../Global/initializeGlobalState";
import { find_parent } from "../Group/find_parent";

export const get_global_position = (id: ItemId, g: State): V2 => {
  // potential time-consuming function
  let v: V2 = get_item(g, id).position;
  let p = find_parent(id);
  while (p !== null) {
    const group = get_group(g, p);
    if (group.isOpen) {
      v = add_v2(v, get_item(g, p).position);
    } else {
      v = group.position;
    }
    p = find_parent(p);
  }
  return v;
};