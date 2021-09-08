import { create_new_itemid } from "../utils/create_new_itemid";
import { ItemId } from "../Global/ItemId";
import { TWorldCoord } from "../dimension/world_to_screen";

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
