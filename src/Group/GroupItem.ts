import { create_new_itemid } from "../Kozane/create_new_itemid";
import { ItemId } from "../Global/initializeGlobalState";
import { TWorldCoord } from "../dimension/world_to_screen";
import { CSSProperties } from "react";

export type TGroupItem = {
  type: "group";
  text: string;
  position: TWorldCoord;
  items: ItemId[];
  id: ItemId;
  scale: number; // scale of Nameplate Kozane
  isOpen: boolean;
  custom?: { style?: CSSProperties };
};

export class GroupItem {
  type: "group" = "group";
  text = "";
  position = [0, 0] as TWorldCoord;
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
