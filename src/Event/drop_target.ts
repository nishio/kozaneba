import { TItemId } from "../Global/TItemId";
import { highlight_group, highlight_parent } from "../Group/highlight_group";
import { get_client_pos } from "./get_client_pos";
import { TInputEvent } from "./input_event";

const GROUP_ID_PREFIX = "group-";
let highlighted_group_id: TItemId | null = null;

const group_id_from_element = (element: Element | null): TItemId | null => {
  const groupElement = element?.closest<HTMLElement>(`[id^="${GROUP_ID_PREFIX}"]`);
  if (groupElement === undefined || groupElement === null) return null;
  return groupElement.id.substring(GROUP_ID_PREFIX.length) as TItemId;
};

const group_id_from_screen_point = ([x, y]: [number, number]): TItemId | null => {
  const groups = Array.from(
    document.querySelectorAll<HTMLElement>(`[id^="${GROUP_ID_PREFIX}"]`)
  );
  const hitGroups = groups.filter((group) => {
    const rect = group.getBoundingClientRect();
    return rect.left <= x && x <= rect.right && rect.top <= y && y <= rect.bottom;
  });
  const topmost = hitGroups.at(-1);
  if (topmost === undefined) return null;
  return topmost.id.substring(GROUP_ID_PREFIX.length) as TItemId;
};

export const get_drop_group_id = (
  event: TInputEvent<Element>
): TItemId | null => {
  const [x, y] = get_client_pos(event);
  const elementGroupId = group_id_from_element(document.elementFromPoint(x, y));
  if (elementGroupId !== null) return elementGroupId;
  return group_id_from_screen_point([x, y]);
};

export const update_drop_group_highlight = (
  event: TInputEvent<Element>
) => {
  const next = get_drop_group_id(event);
  if (next === highlighted_group_id) return;
  clear_drop_group_highlight();
  if (next === null) return;
  highlight_group(next, true);
  highlight_parent(next, false);
  highlighted_group_id = next;
};

export const clear_drop_group_highlight = () => {
  if (highlighted_group_id === null) return;
  highlight_group(highlighted_group_id, false);
  highlight_parent(highlighted_group_id, true);
  highlighted_group_id = null;
};
