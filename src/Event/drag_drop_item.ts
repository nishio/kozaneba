import { mark_local_changed } from "../utils/mark_local_changed";
import { add_v2w } from "../dimension/V2";
import { TItemId } from "../Global/TItemId";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "../utils/find_parent";
import { move_front } from "../utils/move_front";
import { normalize_group_position } from "../utils/normalize_group_position";
import { remove_item } from "../utils/remove_item";
import { pin } from "../Physics/pin";
import { remove_item_from } from "../utils/remove_item_from";
import { reset_target } from "./fast_drag_manager";
import { get_group } from "../utils/get_group";
import { get_item } from "../utils/get_item";
import { TWorldCoord } from "../dimension/world_to_screen";
import { State } from "reactn/default";
import { dev_log } from "../utils/dev";

const get_total_offset_of_parents = (parent_id: TItemId, g: State) => {
  let offset = [0, 0] as TWorldCoord;
  let current_parent = parent_id;
  while (current_parent) {
    const parent = get_item(g, current_parent);
    offset = add_v2w(offset, parent.position);
    const next_parent = find_parent(current_parent);
    if (!next_parent) {
      break;
    }
    current_parent = next_parent;
  }
  return offset;
};

export function drag_drop_item(
  g: State,
  delta: TWorldCoord,
  target_id: TItemId
) {
  dev_log("drag_drop_item", target_id, delta);
  const parent = find_parent(target_id);
  if (parent !== null) {
    console.log(`move target ${target_id} out from parent ${parent} to top`);
    updateGlobal((g) => {
      const p = get_group(g, parent);
      p.items = remove_item_from(p.items, target_id);
      g.drawOrder.push(target_id);
      const x = get_item(g, target_id);
      // x.position = add_v2w(delta, p.position);
      x.position = add_v2w(delta, get_total_offset_of_parents(parent, g));

      pin[target_id] = x.position;
      g.drag_target = "";

      if (p.items.length === 0 && p.text === "") {
        remove_item(g, parent);
      } else {
        normalize_group_position(parent, g);
      }
    });
  } else {
    console.log(`move target ${target_id} from top to top`);
    move_front(target_id);
    updateGlobal((g) => {
      const x = get_item(g, target_id);
      x.position = delta;
      pin[target_id] = x.position;
      g.drag_target = "";
    });
  }

  mark_local_changed();
  reset_target();
}
