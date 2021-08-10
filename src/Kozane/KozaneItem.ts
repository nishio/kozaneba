import { ItemId } from "../Global/initializeGlobalState";
import { create_new_itemid } from "./create_new_itemid";

export type TKozaneItem = {
  type: "kozane";
  text: string;
  position: number[];
  id: ItemId;
  scale: number;
};

export class KozaneItem {
  type: "kozane" = "kozane";
  text = "";
  position = [0, 0];
  id: ItemId;
  scale = 1;
  constructor(id?: ItemId) {
    if (id === undefined) {
      this.id = create_new_itemid();
    } else {
      this.id = id;
    }
  }
}
