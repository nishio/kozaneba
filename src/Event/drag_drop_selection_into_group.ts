import { mark_local_changed } from "../utils/mark_local_changed";
import { add_v2w, sub_v2w } from "../dimension/V2";
import { updateGlobal } from "../Global/updateGlobal";
import { normalize_group_position } from "../utils/normalize_group_position";
import { pin } from "../Physics/pin";
import { remove_item_from } from "../utils/remove_item_from";
import { get_group } from "../utils/get_group";
import { get_item } from "../utils/get_item";
import { TWorldCoord } from "../dimension/world_to_screen";
import { TItemId } from "../Global/TItemId";
import { dev_log } from "../utils/dev";
import { Sentry } from "../initSentry";
import { getGlobal } from "reactn";
import { get_valid_selection_drop_group_id } from "./drop_validity";
import { drag_drop_selection } from "./drag_drop_selection";

export function drag_drop_selection_into_group(
  group_id: TItemId,
  delta: TWorldCoord
) {
  dev_log("selection drop on group", group_id);
  // A selection must not go into one of its own groups or their descendants
  // (that makes a cycle that is saved but no longer drawn). onCanvasMouseUp
  // already filters these drops; onGroupMouseUp calls this directly, so guard
  // here too and fall back to a plain move that keeps the selection, as
  // onCanvasMouseUp does.
  if (
    get_valid_selection_drop_group_id(group_id, getGlobal().selected_items) ===
    null
  ) {
    Sentry.captureMessage(
      "drag_drop_selection_into_group: group_id is in the selection or its descendants"
    );
    drag_drop_selection(delta);
    return;
  }
  updateGlobal((g) => {
    const group_draft = get_group(g, group_id);
    g.selected_items.forEach((id) => {
      const x = get_item(g, id);
      x.position = sub_v2w(add_v2w(x.position, delta), group_draft.position);
      pin[id] = x.position;
      g.drawOrder = remove_item_from(g.drawOrder, id);
      group_draft.items.push(id);
    });
    g.drag_target = "";

    // reset selection
    g.selected_items = [];
    g.selectionRange = { top: 0, left: 0, width: 0, height: 0 };
    g.is_selected = false;
  });
  normalize_group_position(group_id);
  mark_local_changed();
}
