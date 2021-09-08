import { getGlobal } from "reactn";
import { redraw } from "../API/redraw";
import { mark_local_changed } from "../Cloud/mark_local_changed";
import { get_item } from "./get_item";
import { updateGlobal } from "../Global/updateGlobal";
import { find_parent } from "./find_parent";
import { move_front } from "./move_front";
import { remove_item_from } from "./remove_item_from";
import { create_squared_group } from "../dimension/create_squared_group";
import { get_center_of_screen } from "../dimension/get_center_of_screen";
import { get_group } from "./get_group";
import { multiline_to_lines } from "./multiline_to_lines";

export const add_multiple_kozane = (multiline: string) => {
  const items = multiline_to_lines(multiline);
  if (items.length === 0) return;
  updateGlobal((g) => {
    if (g.title === "") {
      g.title = items[0]!;
    }
  });

  const group = create_squared_group(items);
  updateGlobal((g) => {
    group.position = get_center_of_screen();
    g.itemStore[group.id] = group;
    g.drawOrder.push(group.id);
  });
  finish();
};

const finish = () => {
  updateGlobal((g) => {
    g.dialog = "";
    g.add_kozane_text = "";
  });
  redraw();
  mark_local_changed();
};

export const replace_multiple_kozane = (multiline: string) => {
  const g = getGlobal();
  const target_id = g.clicked_target;
  if (target_id === "") {
    // no replacce target specified
    add_multiple_kozane(multiline);
    return;
  }
  const target = get_item(g, target_id);

  const items = multiline_to_lines(multiline);
  if (items.length === 0) return;

  if (items.length === 1) {
    // result is single kozane, just replace text
    updateGlobal((g) => {
      g.itemStore[target_id] = { ...target, text: items[0]! };
    });
    move_front(target_id);
    finish();
    return;
  }

  const group = create_squared_group(items);

  group.position = target.position;
  const parent_id = find_parent(target_id);
  updateGlobal((g) => {
    g.itemStore[group.id] = group;
    if (parent_id === null) {
      g.drawOrder = remove_item_from(g.drawOrder, target_id);
      g.drawOrder.push(group.id);
    } else {
      const parent = get_group(g, parent_id);
      parent.items = remove_item_from(parent.items, target_id);
      parent.items.push(group.id);
    }
  });
  finish();
};
