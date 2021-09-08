import { getGlobal } from "reactn";
import { add_item } from "../API/add_item";
import { redraw } from "../API/redraw";
import { get_center_of_screen } from "../dimension/get_center_of_screen";
import { ItemId, TItem } from "../Global/initializeGlobalState";
import { TAnnotation } from "../Global/TAnnotation";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { create_new_itemid } from "../utils/create_new_itemid";
import { normalize_group_position } from "../Menu/normalize_group_position";

const do_kozaneba_v3 = (j: JSON_KozanebaV3) => {
  const to_add: TItem[] = [];
  const visit = (old_id: string): ItemId => {
    const id = create_new_itemid();
    const item = j.itemStore[old_id]!;
    const new_item = { ...item, id };
    if (new_item.type === "group") {
      new_item.items = new_item.items.map(visit);
    }
    to_add.push(new_item);
    return id;
  };
  const new_items = j.drawOrder.map(visit);
  updateGlobal((g) => {
    to_add.forEach((item) => {
      g.itemStore[item.id] = item;
    });
  });
  const group = new GroupItem();
  group.items = new_items;
  add_item(group);
  normalize_group_position(group.id);
  updateGlobal((g) => {
    g.itemStore[group.id]!.position = get_center_of_screen();
  });
  redraw();
};

const do_kozaneba_v4 = (j: JSON_KozanebaV4) => {
  const id_map: { [old_id: string]: ItemId } = {};
  const current = getGlobal();
  const to_add: TItem[] = [];
  const visit = (old_id: string): ItemId => {
    let id: ItemId;
    if (current.itemStore[old_id] !== undefined) {
      id = create_new_itemid();
    } else {
      id = old_id as ItemId;
    }
    id_map[old_id] = id;
    const item = j.itemStore[old_id]!;
    const new_item = { ...item, id };
    if (new_item.type === "group") {
      new_item.items = new_item.items.map(visit);
    }
    to_add.push(new_item);
    return id;
  };
  const new_items = j.drawOrder.map(visit);

  updateGlobal((g) => {
    to_add.forEach((item) => {
      g.itemStore[item.id] = item;
    });
  });

  const annotation = j.annotation.map((a) => {
    return {
      ...a,
      items: a.items.map((old_id) => id_map[old_id]!),
    };
  });
  const group = new GroupItem();
  group.items = new_items;
  add_item(group);
  normalize_group_position(group.id);
  updateGlobal((g) => {
    g.itemStore[group.id]!.position = get_center_of_screen();
    g.annotations.push(...annotation);
  });
  redraw();
};

export const try_to_import_json = (text: string) => {
  try {
    const j: any = JSON.parse(text);

    if (j.format === "Kozaneba" && j.version === 3) {
      do_kozaneba_v3(j);
    } else if (j.format === "Kozaneba" && j.version === 4) {
      do_kozaneba_v4(j);
    } else {
      // from Regroup?
      throw new Error("not implemented yet");
    }
    return true;
  } catch {
    return false;
  }
};
type JSON_KozanebaV3 = {
  format: string;
  version: 3;
  itemStore: { [key: string]: TItem };
  drawOrder: ItemId[];
};

type JSON_KozanebaV4 = {
  format: string;
  version: 4;
  itemStore: { [key: string]: TItem };
  drawOrder: ItemId[];
  annotation: TAnnotation[];
};
