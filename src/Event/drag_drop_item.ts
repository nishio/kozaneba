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

export function drag_drop_item(
  g: State,
  delta: TWorldCoord,
  target_id: TItemId
) {
  const parent = find_parent(target_id);
  if (parent !== null) {
    console.log(`move target ${target_id} out from parent`);
    updateGlobal((g) => {
      const p = get_group(g, parent);
      p.items = remove_item_from(p.items, target_id);
      g.drawOrder.push(target_id);
      const x = get_item(g, target_id);
      x.position = add_v2w(delta, p.position);
      pin[target_id] = x.position;
      g.drag_target = "";

      if (p.items.length === 0 && p.text === "") {
        remove_item(g, parent);
      } else {
        normalize_group_position(parent, g);
      }
    });
  } else {
    console.log(`move target ${target_id} on top level`);
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
