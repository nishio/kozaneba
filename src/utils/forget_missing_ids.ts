import { State } from "reactn/default";

// After a load replaced itemStore / drawOrder (a snapshot from elsewhere, a
// backup, a local draft), the per-tab state may still point at items that are
// gone: deleted by the other client, or deleted by repair_nest. get_item
// throws on them (the selection is drawn with ids_to_dom). Called in an
// updateGlobal right after the load; assigns only what changes.
export const forget_missing_ids = (g: State) => {
  const exists = (id: string) =>
    Object.prototype.hasOwnProperty.call(g.itemStore, id);
  if (g.selected_items.length > 0) {
    // the selection holds top-level items only (finish_selecting)
    const top = new Set<string>(g.drawOrder);
    const kept = g.selected_items.filter((id) => top.has(id));
    if (kept.length !== g.selected_items.length) {
      g.selected_items = kept;
      if (kept.length === 0) {
        g.is_selected = false;
        g.selectionRange = { top: 0, left: 0, width: 0, height: 0 };
      }
    }
  }
  if (g.clicked_target !== "" && !exists(g.clicked_target)) {
    // the menu / edit dialog of the item that is gone (close_context_menu)
    g.clicked_target = "";
    g.menu = "";
    if (g.dialog === "EditKozane" || g.dialog === "EditGroupTitle") {
      g.dialog = "";
    }
  }
  if (
    g.drag_target !== "" &&
    g.drag_target !== "selection" &&
    !exists(g.drag_target)
  ) {
    g.drag_target = "";
  }
  if (g.line_start !== "" && !exists(g.line_start)) {
    g.line_start = "";
  }
};
