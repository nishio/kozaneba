import { KozaneItem } from "../../Kozane/KozaneItem";
import {
  KOZANE_BORDER,
  KOZANE_HEIGHT,
  KOZANE_WIDTH,
} from "../../Kozane/kozane_constants";
import { updateGlobal } from "../../Global/updateGlobal";
import { GroupItem, TGroupItem } from "../../Group/GroupItem";
import { multiline_to_lines } from "./multiline_to_lines";
import { TWorldCoord } from "../../dimension/world_to_screen";
import { getGlobal } from "reactn";
import { get_item } from "../../Event/get_item";
import { find_parent } from "../../Group/find_parent";
import { remove_item_from } from "../../utils/remove_item";
import { ItemId, TItem } from "../../Global/initializeGlobalState";
import { State } from "reactn/default";
import { get_center_of_screen } from "./get_center_of_screen";

export const create_squared_group = (items: string[]) => {
  const N = items.length;
  const area = N * KOZANE_WIDTH * KOZANE_HEIGHT;
  const numX = Math.ceil(Math.sqrt(area) / KOZANE_WIDTH);
  const width = numX * KOZANE_WIDTH;
  const height = Math.ceil(N / numX) * KOZANE_HEIGHT;
  const [cx, cy] = [0, 0];
  const group = new GroupItem();
  const kozane_list = [] as TItem[];
  items.forEach((line, index) => {
    if (line === "") return;
    let x = index % numX;
    let y = Math.floor(index / numX);
    x *= KOZANE_WIDTH + KOZANE_BORDER;
    y *= KOZANE_HEIGHT + KOZANE_BORDER;

    x += cx - width / 2 + KOZANE_WIDTH / 2;
    y += cy - height / 2 + KOZANE_HEIGHT / 2;

    const kozane = new KozaneItem();
    kozane.text = line;
    kozane.position = [x, y] as TWorldCoord;
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

    g.is_local_change = true;
    g.last_updated = Date.now();
  });
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
