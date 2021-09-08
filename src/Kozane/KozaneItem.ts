import { TWorldCoord } from "../dimension/world_to_screen";
import { ItemId } from "../Global/ItemId";
import { create_new_itemid } from "../utils/create_new_itemid";

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
