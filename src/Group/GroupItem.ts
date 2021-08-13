import { create_new_itemid } from "../Kozane/create_new_itemid";
import { ItemId } from "../Global/initializeGlobalState";

export type TGroupItem = {
  type: "group";
  text: string;
  position: number[];
  items: ItemId[];
  id: ItemId;
  scale: number; // scale of Nameplate Kozane
  isOpen: boolean;
};

export class GroupItem {
  type: "group" = "group";
  text = "";
  position = [0, 0];
  items: ItemId[] = [];
  id: ItemId;
  scale = 1;
  isOpen = true;
  constructor(id?: ItemId) {
    if (id === undefined) {
      this.id = create_new_itemid();
    } else {
      this.id = id;
    }
  }
}
