import { mark_local_changed } from "../utils/mark_local_changed";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "../utils/find_parent";
import { TGroupItem } from "../Global/TGroupItem";
import { normalize_group_position } from "../utils/normalize_group_position";
import { remove_empty_untitled_groups } from "../utils/remove_empty_untitled_groups";
import { pin } from "../Physics/pin";
import { remove_item_from } from "../utils/remove_item_from";
import { reset_target } from "./fast_drag_manager";
import { get_group } from "../utils/get_group";
import { get_item } from "../utils/get_item";
import { TWorldCoord } from "../dimension/world_to_screen";
import { TItemId } from "../Global/TItemId";
import { dev_log } from "../utils/dev";
import { Sentry } from "../initSentry";
import { drag_drop_item } from "./drag_drop_item";
import { getGlobal } from "reactn";
import { get_position_after_parent_change } from "./get_position_after_parent_change";
import { is_self_or_descendant_group } from "./drop_validity";

export function drag_drop_item_into_group(
  group_id: TItemId,
  delta: TWorldCoord,
  target_id: TItemId
) {
  dev_log(`drop item:${target_id} into group:${group_id}`);

  // Dropping a group into itself or into one of its own descendants would
  // make a cycle that is saved but no longer drawn. onCanvasMouseUp already
  // filters these drops; onGroupMouseUp calls this directly, so guard here too
  // and fall back to a plain move, as onCanvasMouseUp does.
  if (is_self_or_descendant_group(group_id, target_id)) {
    Sentry.captureMessage(
      target_id === group_id
        ? "drag_drop_item_into_group: target_id === group_id"
        : "drag_drop_item_into_group: group_id is a descendant of target_id"
    );
    drag_drop_item(getGlobal() /* not used */, delta, target_id);
    return;
  }

  updateGlobal((g) => {
    const group_draft = get_group(g, group_id);
    let position = delta;

    const previous_parent = find_parent(target_id);
    if (previous_parent !== null) {
      const p = g.itemStore[previous_parent] as TGroupItem;
      // `p` may equals to `group`, it's OK
      p.items = remove_item_from(p.items, target_id);
      group_draft.items.push(target_id);
      position = get_position_after_parent_change(
        position,
        previous_parent,
        group_id,
        g
      );
    } else {
      g.drawOrder = remove_item_from(g.drawOrder, target_id);
      group_draft.items.push(target_id);
      position = get_position_after_parent_change(position, null, group_id, g);
    }
    // Set the target's position before any group is re-centered. Re-centering
    // shifts a group's anchor and subtracts the same shift from each child's
    // local position; a child whose position is assigned afterwards loses
    // that share and lands off by it. That happened when the old parent was
    // `group_id` itself (K2) or inside it (a drop onto an outer group), since
    // re-centering the old parent walks up through `group_id`.
    const target = get_item(g, target_id);
    target.position = position;
    pin[target_id] = target.position;
    g.drag_target = "";

    if (previous_parent !== null) {
      // the nearest group still there whose children changed: the old parent,
      // or, when it was left empty and untitled and removed, its ancestor
      const survivor = remove_empty_untitled_groups(g, previous_parent);
      if (survivor !== null) {
        normalize_group_position(survivor, g);
      }
    }
    normalize_group_position(group_id, g);
  });
  mark_local_changed();
  reset_target();
}
