import { GlobalState } from "../Global/ReactnCompat";
import { add_v2, V2 } from "./V2";
import { get_group } from "../utils/get_group";
import { get_item } from "../utils/get_item";
import { TItemId } from "../Global/TItemId";
import { find_parent } from "../utils/find_parent";

export const get_global_position = (id: TItemId, g: GlobalState): V2 => {
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
  if (isNaN(v[0]) || v[0] === undefined || isNaN(v[1]) || v[1] === undefined) {
    throw new Error(
      `invalid V2 found: [${v[0]}, ${v[1]}] when get_global_position id:${id}`
    );
  }
  return v;
};
