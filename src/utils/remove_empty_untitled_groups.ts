import { State } from "reactn/default";
import { TItemId } from "../Global/TItemId";
import { find_parent } from "./find_parent";
import { remove_item } from "./remove_item";

// Call this right after an item was taken out of group `gid` (moved out or
// deleted). A group left with no items and no title has nothing to show, so it
// is removed, and since that takes an item out of its own parent, the same
// check runs again one level up. It stops at the first group that still has
// items or a title, or at the top (drawOrder).
//
// Returns the nearest group that survived (`gid` itself when it was not
// removed), or null when the whole chain up to the top was removed. Callers
// use it to re-center or bring to front only groups that still exist.
//
// `g` is the immer draft of the update that took the item out; parents are
// looked up in it, not in getGlobal(), so the chain follows the current tree.
export const remove_empty_untitled_groups = (
  g: State,
  gid: TItemId
): TItemId | null => {
  let current: TItemId | null = gid;
  while (current !== null) {
    const item = g.itemStore[current];
    if (item === undefined) return null;
    if (item.type !== "group" || item.items.length > 0 || item.text !== "") {
      return current;
    }
    const parent = find_parent(current, g);
    remove_item(g, current);
    current = parent;
  }
  return null;
};
