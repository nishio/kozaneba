import { create_new_itemid } from "../Fusen/create_new_itemid";
import { ItemId } from "../Global/initializeGlobalState";

export type TGroupItem = {
  type: "group";
  title: string;
  position: number[];
  items: ItemId[];
  id: ItemId;
  scale: number; // scale of Nameplate Fusen
  isOpen: boolean;
};

export class GroupItem {
  type: "group" = "group";
  title = "";
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
