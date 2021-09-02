import { add_item } from "../API/add_item";
import { redraw } from "../API/redraw";
import { get_center_of_screen } from "../Dialog/AddKozaneDialog/get_center_of_screen";
import { ItemId, TItem } from "../Global/initializeGlobalState";
import { updateGlobal } from "../Global/updateGlobal";
import { GroupItem } from "../Group/GroupItem";
import { create_new_itemid } from "../Kozane/create_new_itemid";
import { normalize_group_position } from "../Menu/normalize_group_position";

export const try_to_import_json = (text: string) => {
  try {
    const j: JSON_KozanebaV3 = JSON.parse(text);

    if (j.format === "Kozaneba" && j.version === 3) {
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
  version: number;
  itemStore: { [key: string]: TItem };
  drawOrder: ItemId[];
};
