import { TWorldCoord } from "../dimension/world_to_screen";
import { ItemId } from "../Global/initializeGlobalState";
import { create_new_itemid } from "./create_new_itemid";

export type TKozaneItem = {
  type: "kozane";
  text: string;
  position: TWorldCoord;
  id: ItemId;
  scale: number;
};

export class KozaneItem {
  type: "kozane" = "kozane";
  text = "";
  position = [0, 0] as TWorldCoord;
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
