import { getGlobal } from "reactn";
import { State } from "reactn/default";
import { redraw } from "../../API/redraw";
import { mark_local_changed } from "../../Cloud/mark_local_changed";
import { TWorldCoord } from "../../dimension/world_to_screen";
import { get_item } from "../../Event/get_item";
import { ItemId, TItem } from "../../Global/initializeGlobalState";
import { updateGlobal } from "../../Global/updateGlobal";
import { find_parent } from "../../Group/find_parent";
import { GroupItem, TGroupItem } from "../../Group/GroupItem";
import { KozaneItem } from "../../Kozane/KozaneItem";
import {
  KOZANE_BORDER,
  KOZANE_HEIGHT,
  KOZANE_WIDTH,
} from "../../Kozane/kozane_constants";
import { move_front } from "../../Menu/move_front";
import { remove_item_from } from "../../utils/remove_item";
import { get_center_of_screen } from "./get_center_of_screen";
import { multiline_to_lines } from "./multiline_to_lines";

export const create_squared_position = (
  items: unknown[],
  UNIT_WIDTH: number,
  UNIT_HEIGHT: number,
  MARGIN: number
): TWorldCoord[] => {
  const N = items.length;
  const area = N * UNIT_WIDTH * UNIT_HEIGHT;
  const numX = Math.ceil(Math.sqrt(area) / UNIT_WIDTH);
  const width = numX * UNIT_WIDTH;
  const height = Math.ceil(N / numX) * UNIT_HEIGHT;
  return items.map((line, index) => {
    let x = index % numX;
    let y = Math.floor(index / numX);
    x *= UNIT_WIDTH - MARGIN;
    y *= UNIT_HEIGHT - MARGIN;

    x += -width / 2 + UNIT_WIDTH / 2;
    y += -height / 2 + UNIT_HEIGHT / 2;
    return [x, y] as TWorldCoord;
  });
};

export const create_squared_group = (items: string[]) => {
  const positions = create_squared_position(
    items,
    KOZANE_WIDTH + KOZANE_BORDER,
    KOZANE_HEIGHT + KOZANE_BORDER,
    -KOZANE_BORDER
  );
  const group = new GroupItem();
  const kozane_list = [] as TItem[];
  items.forEach((line, index) => {
    if (line === "") return;
    const kozane = new KozaneItem();
    kozane.text = line;
    kozane.position = positions[index]!;
    kozane_list.push(kozane);
  });

  updateGlobal((g) => {
    kozane_list.forEach((kozane) => {
      g.itemStore[kozane.id] = kozane;
      group.items.push(kozane.id);
    });
  });
  return group;
};

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

const get_group = (g: State, id: ItemId): TGroupItem => {
  const item = g.itemStore[id];
  if (item?.type !== "group") {
    throw new Error(`tried to get group id=${id} but its type=${item?.type}`);
  }
  return item;
};
