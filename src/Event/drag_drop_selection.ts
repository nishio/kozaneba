import { mark_local_changed } from "../utils/mark_local_changed";
import { add_v2w } from "../dimension/V2";
import {
  screen_to_world,
  TScreenCoord,
  TWorldCoord,
  world_to_screen,
} from "../dimension/world_to_screen";
import { updateGlobal } from "../Global/updateGlobal";
import { pin } from "../Physics/pin";
import { reset_target } from "./fast_drag_manager";
import { get_item } from "../utils/get_item";

export function drag_drop_selection(delta: TWorldCoord) {
  updateGlobal((g) => {
    g.selected_items.forEach((id) => {
      const x = get_item(g, id);
      x.position = add_v2w(x.position, delta);
      pin[id] = x.position;
    });
    const sr = g.selectionRange;
    const [qx, qy] = world_to_screen(
      add_v2w(screen_to_world([sr.left, sr.top] as TScreenCoord), delta)
    );
    g.selectionRange.left = qx;
    g.selectionRange.top = qy;
    g.drag_target = "";
  });
  mark_local_changed();
  reset_target();
}
