import { ItemId } from "../Global/initializeGlobalState";
import { create_new_itemid } from "./create_new_itemid";

export type TFusenItem = {
  type: "piece";
  text: string;
  position: number[];
  id: ItemId;
  scale: number;
};

export class FusenItem {
  type: "piece" = "piece";
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
