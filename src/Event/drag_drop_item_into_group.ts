import { mark_local_changed } from "../utils/mark_local_changed";
import { add_v2w, sub_v2w } from "../dimension/V2";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "../utils/find_parent";
import { TGroupItem } from "../Global/TGroupItem";
import { normalize_group_position } from "../utils/normalize_group_position";
import { remove_item } from "../utils/remove_item";
import { pin } from "../Physics/pin";
import { remove_item_from } from "../utils/remove_item_from";
import { reset_target } from "./fast_drag_manager";
import { get_group } from "../utils/get_group";
import { get_item } from "../utils/get_item";
import { TWorldCoord } from "../dimension/world_to_screen";
import { TItemId } from "../Global/TItemId";

export function drag_drop_item_into_group(
  group_id: TItemId,
  delta: TWorldCoord,
  target_id: TItemId
) {
  console.log("drop on group", group_id);

  updateGlobal((g) => {
    const group_draft = get_group(g, group_id);
    let position = delta;

    const parent = find_parent(target_id);
    if (parent !== null) {
      const p = g.itemStore[parent] as TGroupItem;
      // `p` may equals to `group`, it's OK
      p.items = remove_item_from(p.items, target_id);
      group_draft.items.push(target_id);
      position = sub_v2w(add_v2w(position, p.position), group_draft.position);

      if (p.items.length === 0 && p.text === "") {
        remove_item(g, parent);
      } else {
        normalize_group_position(parent, g);
      }
    } else {
      g.drawOrder = remove_item_from(g.drawOrder, target_id);
      group_draft.items.push(target_id);
      position = sub_v2w(position, group_draft.position);
    }
    const target = get_item(g, target_id);
    target.position = position;
    pin[target_id] = target.position;
    g.drag_target = "";
  });
  normalize_group_position(group_id);
  mark_local_changed();
  reset_target();
}
