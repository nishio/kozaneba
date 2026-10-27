import { TItemId } from "../Global/TItemId";
import { find_parent } from "../utils/find_parent";

export const is_self_or_descendant_group = (
  group_id: TItemId,
  target_id: string
): boolean => {
  if (group_id === target_id) return true;
  let parent = find_parent(group_id);
  while (parent !== null) {
    if (parent === target_id) return true;
    parent = find_parent(parent);
  }
  return false;
};

// A selection must not be dropped into one of its own items or their descendants
export const get_valid_selection_drop_group_id = (
  group_id: TItemId | null,
  selected_items: TItemId[]
): TItemId | null => {
  if (group_id === null) return null;
  if (selected_items.some((id) => is_self_or_descendant_group(group_id, id))) {
    return null;
  }
  return group_id;
};
