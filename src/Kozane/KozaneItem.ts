import { TWorldCoord } from "../dimension/world_to_screen";
import { TItemId } from "../Global/TItemId";
import { create_new_itemid } from "../utils/create_new_itemid";

export class KozaneItem {
  type: "kozane" = "kozane";
  text = "";
  position = [0, 0] as TWorldCoord;
  id: TItemId;
  scale = 1;
  constructor(id?: TItemId) {
    if (id === undefined) {
      this.id = create_new_itemid();
    } else {
      this.id = id;
    }
  }
}
